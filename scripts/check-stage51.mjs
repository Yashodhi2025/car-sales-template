import fs from 'node:fs';
import {withBrowser} from './browser-session.mjs';

// Focused checks for Stage 5.1 only; no inventory/gallery/export suite.
const base=(process.argv[2]||'http://127.0.0.1:4173').replace(/\/$/,'');
const source=JSON.parse(fs.readFileSync('src/data/site-data.json','utf8'));
const schema=JSON.parse(fs.readFileSync('fivora-template.json','utf8'));
await withBrowser(async({send,evaluate,navigate,until,screenshot,sleep,check,checks,exceptions,consoleErrors})=>{
 await navigate(base+'/services','services');
 await evaluate("Promise.all([...document.querySelectorAll('.vm-services-page img')].map(i=>{i.loading='eager';return i.decode()}))");
 check('Six original services reuse Deneb cards and load all photographs',await evaluate("document.querySelectorAll('.editable-service-card').length===6 && [...document.querySelectorAll('.vm-services-page img')].every(i=>i.naturalWidth>0)"));
 check('Higher resolution hero, readable copy, selective light surface and closing CTA',await evaluate("document.querySelector('.vm-services-hero img').naturalWidth===2400 && !!document.querySelector('[data-preview-field-path=\"services.heroDescription\"]') && getComputedStyle(document.querySelector('.vm-services-light')).backgroundColor==='rgb(242, 243, 242)' && document.querySelector('.vm-services-closing a').getAttribute('href')==='/contact'"));
 check('Split, offset and full-image layouts remain distinct',await evaluate("getComputedStyle(document.querySelector('.vm-editorial-service-0')).display==='grid' && getComputedStyle(document.querySelector('.vm-editorial-service-1')).display==='block' && getComputedStyle(document.querySelector('.vm-editorial-service-3 .service-card-image-wrap')).position==='absolute'"));
 await screenshot('stage51-services-desktop.png',true);
 await evaluate("document.querySelector('.vm-services-hero .vm-button').click()");await sleep(600);
 check('Explore services CTA reaches offerings',await evaluate("location.hash==='#offerings' && document.querySelector('#offerings').getBoundingClientRect().top<150"));
 await evaluate("document.querySelector('.vm-editorial-service-2 a').click()");await until("document.querySelector('#vm-contact-inquiry')?.value==='finance'");
 check('Existing service inquiry preselection still works',true);
 await evaluate("document.querySelectorAll('.vm-faq-item summary')[1].focus()");
 await send('Page.bringToFront');
 await send('Input.dispatchKeyEvent',{type:'keyDown',key:'Enter',code:'Enter',windowsVirtualKeyCode:13,text:'\r'});
 await send('Input.dispatchKeyEvent',{type:'keyUp',key:'Enter',code:'Enter',windowsVirtualKeyCode:13});await sleep(450);
 check('Six native FAQ disclosures retain keyboard toggle and true minus state',await evaluate("document.querySelectorAll('.vm-faq-item').length===6 && document.querySelectorAll('.vm-faq-item')[1].open && getComputedStyle(document.querySelectorAll('.vm-faq-plus')[1]).opacity==='0' && getComputedStyle(document.querySelectorAll('.vm-faq-item summary')[1]).outlineStyle!=='none'"));
 await evaluate("document.querySelector('#faq').scrollIntoView({behavior:'instant'})");await screenshot('stage51-faq-desktop.png');
 await navigate(base,'home');await evaluate("document.querySelector('#testimonials').scrollIntoView({behavior:'instant'});Promise.all([...document.querySelectorAll('.vm-review img')].map(i=>{i.loading='eager';return i.decode()}))");
 check('One balanced editorial carousel retains explicit demo labels',await evaluate("document.querySelectorAll('.vm-testimonials-section').length===1 && document.querySelector('.vm-sample-label').textContent.includes('NOT VERIFIED') && !!document.querySelector('.vm-review-navigation .vm-slider-controls') && getComputedStyle(document.querySelector('.vm-review')).backgroundColor==='rgb(240, 242, 242)'"));
 await screenshot('stage51-reviews-desktop.png');
 await evaluate("document.querySelector('.vm-slider-controls button:last-child').click()");await sleep(450);
 check('Carousel arrow navigation works',await evaluate("document.querySelector('.vm-review.is-current').getAttribute('data-preview-item-path')==='home.reviews.1'"));
 await evaluate("document.querySelector('.vm-review-stack').focus()");await send('Input.dispatchKeyEvent',{type:'keyDown',key:'ArrowRight',code:'ArrowRight'});await sleep(450);
 check('Carousel keyboard navigation works',await evaluate("document.querySelector('.vm-review.is-current').getAttribute('data-preview-item-path')==='home.reviews.2'"));
 await evaluate("const e=document.querySelector('.vm-review-stack');e.dispatchEvent(new PointerEvent('pointerdown',{bubbles:true,pointerType:'touch',clientX:250,clientY:100}));e.dispatchEvent(new PointerEvent('pointerup',{bubbles:true,pointerType:'touch',clientX:100,clientY:102}))");await sleep(450);
 check('Carousel touch swipe wraps correctly',await evaluate("document.querySelector('.vm-review.is-current').getAttribute('data-preview-item-path')==='home.reviews.0'"));
 await evaluate("document.querySelector('.vm-story-dots button:nth-child(3)').click()");await sleep(450);
 check('Carousel indicators select a slide and preserve inactive inert state',await evaluate("document.querySelectorAll('.vm-review')[0].inert && !document.querySelectorAll('.vm-review')[2].inert && document.querySelector('.vm-story-dots button:nth-child(3)').getAttribute('aria-pressed')==='true'"));
 for(const[route,key,anchor]of [['/services','services','#offerings'],['/','home','#testimonials'],['/contact','contact','#faq']]){
  await navigate(base+route,key);
  let responsive=true;
  for(const width of [1440,768,390,320]){
   await send('Emulation.setDeviceMetricsOverride',{width,height:950,deviceScaleFactor:1,mobile:width<600});
   await evaluate(`document.querySelector('${anchor}').scrollIntoView({behavior:'instant'})`);await sleep(150);
   responsive&&=await evaluate("document.documentElement.scrollWidth<=innerWidth && [...document.querySelectorAll('.vanguard svg')].every(s=>{const r=s.getBoundingClientRect();return r.width<=32&&r.height<=32})");
   if(width===390)await screenshot(`stage51-${key}-mobile.png`);
  }
  check(`${key}: no overflow or oversized icons at 320/390/768/1440px`,responsive);
 }
 await navigate(base+'/services','services');
 await send('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:'reduce'}]});
 check('Hero and hover effects respect reduced motion',await evaluate("getComputedStyle(document.querySelector('.vm-services-hero-photo img')).animationName==='none'"));
 await send('Emulation.setEmulatedMedia',{features:[]});
 await send('Emulation.setDeviceMetricsOverride',{width:1440,height:1000,deviceScaleFactor:1,mobile:false});
 if(process.argv.includes('--lab')){
  await send('Page.navigate',{url:'http://127.0.0.1:4174/__fivora_local_preview'});
  const f="document.querySelector('iframe')",d=f+'.contentDocument';
  await until(`${d}?.documentElement.getAttribute('data-gramm')==='false'`);
  const route=async(url,key)=>{await evaluate(`${f}.src=${JSON.stringify(url)}`);await until(`!!${d}?.querySelector('[data-preview-page-key="${key}"]') && ${d}?.documentElement.getAttribute('data-gramm')==='false'`)};
  const post=async data=>{await evaluate(`${f}.contentWindow.postMessage({type:'FIVORA_PREVIEW_SITE_DATA',siteData:${JSON.stringify(data)}},location.origin)`);await sleep(220)};
  try{
   await route('/services','services');const live=structuredClone(source);
   live.content.services.heroDescription='Live supporting copy';live.content.services.closingTitle='Live closing title';live.content.services.closingButtonLabel='Live CTA';live.content.services.closingButtonLink='/contact?inquiry=sourcing#contact';live.styles={...source.styles,'services.closingTitle':{color:'#0056aa'}};await post(live);
   check('Lab edits new copy, CTA destination and saved text styles',await evaluate(`${d}.querySelector('.vm-services-hero-description').textContent==='Live supporting copy' && ${d}.querySelector('.vm-services-closing h2').textContent==='Live closing title' && ${d}.querySelector('.vm-services-closing a').getAttribute('href').includes('inquiry=sourcing') && ${f}.contentWindow.getComputedStyle(${d}.querySelector('.vm-services-closing h2')).color==='rgb(0, 86, 170)'`));
   const paths=schema.editorSchema.sections.filter(s=>s.pageKey==='services').flatMap(s=>s.type==='collection'?s.items.flatMap(i=>i.fields.map(v=>s.path+'.'+i.key+'.'+v.key)):s.fields.map(v=>s.path+'.'+v.key)).filter(p=>!schema.visualEditing.controlOnlyPaths.includes(p));
   check(`All ${paths.length} Services on-canvas schema fields retain real targets`,await evaluate(`${JSON.stringify(paths)}.every(p=>${d}.querySelector('[data-preview-field-path="'+p+'"]'))`));
   live.content.services.heroImage='';live.content.services.items[0].imageUrl='';live.content.services.closingTitle=0;live.content.services.closingDescription=false;await post(live);
   await until(`${d}.querySelector('.vm-editorial-service-0 img').naturalWidth>0 && ${d}.querySelector('.vm-editorial-service-0 img').getAttribute('src')==='/placeholder.svg'`);
   check('Cleared images load a local fallback and zero/false text targets remain',await evaluate(`${d}.querySelector('.vm-services-hero img').getAttribute('src')==='/placeholder.svg' && ${d}.querySelector('.vm-services-closing h2').textContent==='0' && ${d}.querySelector('[data-preview-field-path="services.closingDescription"]').textContent==='false'`));
   live.content.services.items[0].imageUrl='/stage51-intentionally-missing-image.jpg';await post(live);
   await until(`${d}.querySelector('.vm-editorial-service-0 img').getAttribute('src')==='/placeholder.svg' && ${d}.querySelector('.vm-editorial-service-0 img').naturalWidth>0`);
   check('Failed image URLs recover without losing their Deneb target',await evaluate(`!!${d}.querySelector('img[data-preview-field-path="services.items.0.imageUrl"]')`));
   live.content.services.items[0].imageUrl=source.content.services.items[0].imageUrl;await post(live);
   await until(`${d}.querySelector('.vm-editorial-service-0 img').getAttribute('src')==='/images/hero-porsche.jpg'`);check('Changing a failed source restores the merchant image',true);await post(source);
   await route('/','home');
   await evaluate(`${f}.contentWindow.postMessage({type:'FIVORA_PREVIEW_FOCUS_PAGE',pageKey:'home',pageRoute:'/',focusOnly:true,fieldPath:'home.reviews[2].quote'},location.origin)`);
   await until(`${d}.querySelector('.vm-review.is-current')?.getAttribute('data-preview-item-path')==='home.reviews.2'`);
   check('Lab focus reveals an inactive slide before selecting its field',await evaluate(`!${d}.querySelector('.vm-review.is-current').inert`));
   live.content.home.reviews[2].quote='Live review copy';live.content.home.reviews[2].image='';await post(live);
   await until(`${d}.querySelector('[data-preview-field-path="home.reviews.2.image"]').naturalWidth>0 && ${d}.querySelector('[data-preview-field-path="home.reviews.2.image"]').getAttribute('src')==='/placeholder.svg'`);
   check('Lab edits carousel quote and safely clears its image',await evaluate(`${d}.querySelector('.vm-review.is-current blockquote').textContent==='Live review copy'`));await post(source);
   await route('/contact','contact');live.content.faq.items[1].answer='Live editable answer';await post(live);
   await evaluate(`${f}.contentWindow.postMessage({type:'FIVORA_PREVIEW_FOCUS_PAGE',pageKey:'contact',focusOnly:true,fieldPath:'faq.items.1.answer'},location.origin)`);await sleep(200);
   check('Lab opens a closed FAQ and updates its answer',await evaluate(`${d}.querySelectorAll('.vm-faq-item')[1].open && ${d}.querySelector('[data-preview-field-path="faq.items.1.answer"]').textContent==='Live editable answer'`));
  }finally{await post(source)}
 }
 check('No browser exceptions',exceptions.length===0);
 // The failed-URL recovery test intentionally requests one nonexistent image.
 const unexpected=consoleErrors.filter(e=>!e.includes('404 (Not Found)'));
 check(`No unexpected console errors: ${unexpected.join('; ')}`,unexpected.length===0);
 fs.writeFileSync('.qa/stage51-checks.json',JSON.stringify({checks,exceptions,consoleErrors},null,2));
 console.log(`Verified ${checks.length} focused Stage 5.1 checks.`);
});
