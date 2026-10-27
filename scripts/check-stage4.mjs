import fs from "node:fs";
import { withBrowser } from "./browser-session.mjs";

const base = (process.argv[2] || "http://127.0.0.1:4173").replace(/\/$/, "");
const source = JSON.parse(fs.readFileSync("src/data/site-data.json", "utf8"));
await withBrowser(async ({ send, evaluate, navigate, until, screenshot, value, check, sleep, checks, exceptions, consoleErrors }) => {
  // Observe actual mailto click dispatch, without launching an OS mail app in QA.
  const captureDraft = () => evaluate("window.__drafts=[];document.addEventListener('click',e=>{const a=e.target.closest?.('a[href^=\"mailto:\"]');if(a){window.__drafts.push(a.href);e.preventDefault()}},true)");
  const submit = selector => evaluate(`document.querySelector(${JSON.stringify(selector)}).requestSubmit()`);
  const fillContact = async () => {
    await value('#vm-contact-name','Alex Driver'); await value('#vm-contact-email','alex@example.com');
    await value('#vm-contact-phone','+44 20 7946 0000'); await value('#vm-contact-inquiry','vehicle');
    await value('#vm-contact-message','Please confirm condition & service history.');
  };
  await navigate(`${base}/cars/bmw-m5`, 'car-bmw-m5');
  await evaluate("document.querySelector('.vm-car-enquire').click()");
  await until("document.querySelector('#vm-contact-vehicle')?.value==='bmw-m5'");
  check('Vehicle detail inquiry preselects BMW in the real Contact form', await evaluate("document.querySelector('.vm-selected-vehicle').textContent.includes('BMW M5')"));
  await captureDraft();
  await submit('.vm-contact-form');
  check('Empty Contact form shows field errors and focuses the first invalid field', await evaluate("document.activeElement.id==='vm-contact-name' && document.querySelectorAll('.vm-contact-form [aria-invalid=true]').length===4 && window.__drafts.length===0"));
  check('Form controls have labels and error descriptions', await evaluate("[...document.querySelectorAll('.vm-contact-form fieldset input,.vm-contact-form fieldset select,.vm-contact-form fieldset textarea')].every(e=>document.querySelector('label[for=\"'+e.id+'\"]') && e.getAttribute('aria-describedby')?.split(' ').every(id=>document.getElementById(id)))"));
  await fillContact();
  await value('#vm-contact-email','bad-email'); await submit('.vm-contact-form');
  check('Contact rejects an invalid email without preparing a draft', await evaluate("document.querySelector('#vm-contact-email').getAttribute('aria-invalid')==='true' && window.__drafts.length===0"));
  await value('#vm-contact-email','alex@example.com'); await submit('.vm-contact-form'); await sleep(120);
  check('Contact dispatches a mailto draft with all inquiry and vehicle details', await evaluate("(()=>{const u=new URL(window.__drafts.at(-1));const b=u.searchParams.get('body');return decodeURIComponent(u.pathname)==='hello@vanguardmotors.example'&&u.searchParams.get('subject').includes('BMW M5')&&['Alex Driver','alex@example.com','+44 20 7946 0000','BMW M5','2019','Please confirm condition & service history.'].every(s=>b.includes(s))})()"));
  check('Draft feedback explains visitor sending and dealership confirmation', await evaluate("!document.querySelector('.vm-draft-status').hidden && document.querySelector('.vm-draft-status').textContent.includes('Nothing has been sent') && document.querySelector('.vm-form-notice').textContent.includes('You must send it yourself')"));
  await value('#vm-contact-name','Alex Changed');
  check('Changing an inquiry invalidates its old prepared draft', await evaluate("document.querySelector('.vm-draft-status').hidden"));
  await value('#vm-contact-vehicle','tesla-model-3');
  check('Changing selected vehicle updates the summary', await evaluate("document.querySelector('.vm-selected-vehicle').textContent.includes('Tesla Model 3')"));
  await navigate(`${base}/contact?vehicle=missing`, 'contact');
  check('Unknown vehicle parameters leave a safe empty selection', await evaluate("document.querySelector('#vm-contact-vehicle').value==='' && document.querySelector('.vm-selected-vehicle').hidden"));
  await evaluate("Promise.all([...document.querySelectorAll('.vanguard img')].map(i=>i.decode().catch(()=>null)))");
  await screenshot('contact-desktop.png'); await screenshot('contact-desktop-full.png',true);

  await navigate(`${base}/cars/porsche-panamera`, 'car-porsche-panamera');
  await until("!document.querySelector('.vm-viewing-form fieldset').disabled");
  await evaluate("document.querySelector('.vm-car-viewing').click()");
  await sleep(350);
  check('Viewing CTA opens the inline form without direct email navigation', await evaluate("location.hash==='#request-viewing' && !!document.querySelector('.vm-viewing-form')"));
  check('Viewing summary carries the correct vehicle, model year and specification', await evaluate("['Porsche Panamera Turbo','2018','4.0 V8'].every(s=>document.querySelector('.vm-viewing-vehicle').textContent.includes(s))"));
  await captureDraft(); await submit('.vm-viewing-form');
  check('Viewing validates name/email/phone/date/time before email dispatch', await evaluate("document.querySelectorAll('.vm-viewing-form [aria-invalid=true]').length===5 && window.__drafts.length===0"));
  await value('#vm-viewing-name','Jordan Driver'); await value('#vm-viewing-email','jordan@example.com'); await value('#vm-viewing-phone','+44 20 7946 0000');
  await value('#vm-viewing-date','2020-01-01'); await value('#vm-viewing-time','10:30'); await submit('.vm-viewing-form');
  check('Past viewing dates are blocked by both min and validation', await evaluate("document.querySelector('#vm-viewing-date').min>'2020-01-01' && document.querySelector('#vm-viewing-date').getAttribute('aria-invalid')==='true' && document.querySelector('#vm-viewing-date-error').textContent.includes('future date') && window.__drafts.length===0"));
  const today = await evaluate("document.querySelector('#vm-viewing-date').min");
  await value('#vm-viewing-date',today); await value('#vm-viewing-message','Please confirm access arrangements.'); await submit('.vm-viewing-form'); await sleep(100);
  check('Viewing draft includes preferred date/time, contact information and selected car', await evaluate(`(()=>{const u=new URL(window.__drafts.at(-1));const b=u.searchParams.get('body');return u.searchParams.get('subject').includes('Porsche Panamera Turbo')&&['Jordan Driver','jordan@example.com','+44 20 7946 0000',${JSON.stringify(today)},'10:30','2018','Please confirm access arrangements.'].every(s=>b.includes(s))})()`));
  check('Viewing never claims a reservation or appointment is booked', await evaluate("document.querySelector('.vm-viewing-copy').textContent.includes('No appointment is booked') && document.querySelector('.vm-viewing-form .vm-draft-status').textContent.includes('Nothing has been sent')"));
  await evaluate("document.querySelector('#request-viewing').scrollIntoView({behavior:'instant'})"); await screenshot('viewing-desktop.png');

  await navigate(`${base}/about`, 'about');
  check('About has philosophy, existing values, editorial photos and a three-step journey', await evaluate("document.querySelectorAll('.vm-benefits article').length===4 && document.querySelectorAll('.vm-journey-grid li').length===3 && document.querySelectorAll('.vm-about-page .vm-editorial-photo img').length===1 && document.querySelector('.vm-about-story').textContent.includes('no claim')"));
  check('About CTAs reach Inventory and Contact', await evaluate("document.querySelector('.vm-about-cta a[href=\"/inventory\"]') && !!document.querySelector('.vm-about-cta a[href=\"/contact\"]')"));
  await evaluate("Promise.all([...document.querySelectorAll('.vanguard img')].map(i=>{i.loading='eager';return i.decode().catch(()=>null)}))");
  await screenshot('about-desktop.png'); await screenshot('about-desktop-full.png',true);
  for (const [route,page] of [['/contact','contact'],['/about','about'],['/cars/porsche-panamera','car-porsche-panamera']]) {
    await navigate(base+route,page);
    for (const width of [1440,1024,768,390,320]) {
      await send('Emulation.setDeviceMetricsOverride',{width,height:950,deviceScaleFactor:1,mobile:width<600}); await sleep(80);
      check(`${page} fits ${width}px with bounded icons`, await evaluate("document.documentElement.scrollWidth<=innerWidth && [...document.querySelectorAll('.vanguard svg')].every(s=>{const r=s.getBoundingClientRect();return r.width<=32&&r.height<=32})"));
      if(width===390) {await screenshot(`${page}-stage4-mobile.png`); if(page==='contact'||page==='about')await screenshot(`${page}-stage4-mobile-full.png`,true);}
    }
  }
  await send('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:'reduce'}]});
  check('Page and image motion respect reduced-motion preferences', await evaluate("getComputedStyle(document.querySelector('.vm-page')).animationName==='none' && getComputedStyle(document.querySelector('.vm-gallery-slide img')).animationName==='none'"));
  await send('Emulation.setEmulatedMedia',{features:[]});
  await send('Emulation.setDeviceMetricsOverride',{width:1440,height:1000,deviceScaleFactor:1,mobile:false});

  if(process.argv.includes('--lab')) {
    const frame="document.querySelector('iframe')"; const doc=`${frame}.contentDocument`;
    await send('Page.navigate',{url:'http://127.0.0.1:4174/__fivora_local_preview'});
    await until(`${doc}?.documentElement.getAttribute('data-gramm')==='false'`);
    const route = async (url,key) => {await evaluate(`${frame}.src=${JSON.stringify(url)}`);await until(`!!${doc}?.querySelector('[data-preview-page-key="${key}"]') && ${doc}?.documentElement.getAttribute('data-gramm')==='false'`)};
    const post = async data => {await evaluate(`${frame}.contentWindow.postMessage({type:'FIVORA_PREVIEW_SITE_DATA',siteData:${JSON.stringify(data)}},location.origin)`);await sleep(200)};
    const query = path => `[data-preview-field-path="${path}"]`;
    await route('/contact','contact');
    const edited=structuredClone(source);
    edited.content.contact.formTitle='A live editable invitation'; edited.content.requests.fields.name.label='Customer name'; edited.content.requests.fields.name.placeholder='Your full name here';
    edited.content.requests.submitLabel='Create my email draft'; edited.content.contact.heroImage='/images/bmw.jpg'; edited.content.requests.emailNote='Review and send this draft yourself.';
    edited.styles={'contact.formTitle':{color:'#00ffcc'}};
    await post(edited);
    check('Lab updates Contact headings, form labels/placeholders, helper text, buttons and images',await evaluate(`${doc}.querySelector(${JSON.stringify(query('contact.formTitle'))}).textContent==='A live editable invitation' && ${doc}.querySelector('label[for="vm-contact-name"]').textContent==='Customer name *' && ${doc}.querySelector('#vm-contact-name').placeholder==='Your full name here' && ${doc}.querySelector('.vm-draft-submit').textContent.includes('Create my email draft') && ${doc}.querySelector('.vm-form-notice').textContent==='Review and send this draft yourself.' && ${doc}.querySelector('.vm-editorial-photo img').getAttribute('src').endsWith('bmw.jpg')`));
    check('Contact saved text styles apply through Deneb',await evaluate(`${frame}.contentWindow.getComputedStyle(${doc}.querySelector(${JSON.stringify(query('contact.formTitle'))})).color==='rgb(0, 255, 204)'`));
    await evaluate(`window.__stage4Selection=[];window.addEventListener('message',e=>{if(e.data?.type==='FIVORA_PREVIEW_ELEMENT_CLICKED')window.__stage4Selection.push(e.data)});${frame}.contentWindow.postMessage({type:'FIVORA_PREVIEW_EDIT_MODE',editMode:true},location.origin)`); await sleep(100);
    await evaluate(`${doc}.querySelector(${JSON.stringify(query('requests.fields.name.label'))}).click()`);await sleep(100);
    check('Lab selects a real Deneb editable form label',await evaluate('window.__stage4Selection.length>0'));
    edited.content.requests.fields.name.label='';edited.content.contact.formTitle=0;edited.content.motion.enabled=false;edited.content.motion.durationMs=0;
    await post(edited);
    check('Empty and zero Contact targets stay mounted and false motion settings apply',await evaluate(`!!${doc}.querySelector(${JSON.stringify(query('requests.fields.name.label'))}) && ${doc}.querySelector(${JSON.stringify(query('contact.formTitle'))}).textContent==='0' && ${doc}.documentElement.dataset.vanguardMotion==='false'`));
    await post(source);
    await route('/cars/porsche-panamera','car-porsche-panamera');
    const viewing=structuredClone(source);viewing.content.viewing.title='Your personal viewing';viewing.content.requests.fields.date.label='Choose a day';viewing.content.requests.fields.time.helper='A preferred time only.';viewing.content.viewing.messagePlaceholder='Access or viewing questions';
    await post(viewing);
    check('Lab updates viewing headings, date labels, helper text and message placeholders',await evaluate(`${doc}.querySelector(${JSON.stringify(query('viewing.title'))}).textContent==='Your personal viewing' && ${doc}.querySelector('label[for="vm-viewing-date"]').textContent==='Choose a day *' && ${doc}.querySelector('#vm-viewing-time-help').textContent==='A preferred time only.' && ${doc}.querySelector('#vm-viewing-message').placeholder==='Access or viewing questions'`));
    await post(source);await route('/about','about');
    const about=structuredClone(source);about.content.about.storyTitle='A considered point of view';about.content.about.journey[0].title='Discover together';about.content.about.heroImage='/images/tesla.jpg';about.content.about.inventoryLink='/inventory?brand=porsche';
    await post(about);
    check('Lab updates About story, journey collections, photography and CTA destinations',await evaluate(`${doc}.querySelector(${JSON.stringify(query('about.storyTitle'))}).textContent==='A considered point of view' && ${doc}.querySelector('.vm-journey-grid li h3').textContent==='Discover together' && ${doc}.querySelector('.vm-about-panorama img').getAttribute('src').endsWith('tesla.jpg') && ${doc}.querySelector('.vm-about-cta a').getAttribute('href').includes('brand=porsche')`));
    await post(source);
  }
  check(`No uncaught browser exceptions (${exceptions.join('; ')})`,exceptions.length===0);
  check(`No browser console errors (${consoleErrors.join('; ')})`,consoleErrors.length===0);
  fs.writeFileSync('.qa/stage4-checks.json',JSON.stringify({checks,exceptions,consoleErrors},null,2));
  console.log(`Verified ${checks.length} Stage 4 browser checks.`);
});
