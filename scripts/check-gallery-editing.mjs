import fs from 'node:fs';
import {createRequire} from 'node:module';
import {withBrowser} from './browser-session.mjs';
const require=createRequire(import.meta.url),bridge=require('../node_modules/@deneb-ui/cli/src/tools/template-preview-focus-bridge.cjs');
const data=JSON.parse(fs.readFileSync('src/data/site-data.json','utf8'));
const baseUrl=(process.argv[2]||'http://localhost:4180').replace(/\/$/,'');

// Guard the actual editor hit target, not just the page's total scroll width.
await withBrowser(async({send,navigate,evaluate,until,sleep,check,screenshot,consoleErrors,exceptions})=>{
 await send('Emulation.setDeviceMetricsOverride',{width:1600,height:1000,deviceScaleFactor:1,mobile:false});
 await navigate(baseUrl+'/about','about');
 await evaluate("window.__priceSelections=[];window.addEventListener('message',e=>{if(e.data?.type==='FIVORA_PREVIEW_ELEMENT_CLICKED')window.__priceSelections.push(e.data)});(()=>{const f=document.createElement('iframe');f.id='price-preview';f.src='/cars/bmw-m5';f.style.cssText='width:1342px;height:900px;position:fixed;inset:0;z-index:99999;border:0';document.body.append(f)})()");
 const frame="document.querySelector('#price-preview')",doc=frame+'.contentDocument',win=frame+'.contentWindow';
 await until(doc+"?.querySelector('.vm-car-price')");await sleep(1300);
 await evaluate(`${win}.eval(${JSON.stringify(bridge)})`);
 await evaluate(`${win}.postMessage({type:'FIVORA_PREVIEW_SITE_DATA',siteData:${JSON.stringify(data)}},location.origin)`);await sleep(300);
 const pricePath='cards.vehicles.bmw-m5.price';
 await evaluate(`${win}.postMessage({type:'FIVORA_PREVIEW_EDIT_MODE',editMode:true,fields:[{path:${JSON.stringify(pricePath)},kind:'field',type:'text',value:${JSON.stringify(data.content.cards.vehicles['bmw-m5'].price)}}]},location.origin)`);await sleep(150);
 for(const width of [1440,1342,1280,1200,1100,1000,900,851,850,768,600,390,320]){
  await evaluate(`${frame}.style.width='${width}px'`);await sleep(130);
  check('Gallery stays within its column at '+width+'px',await evaluate(`(()=>{const d=${doc},gallery=d.querySelector('.vm-car-gallery').getBoundingClientRect(),stage=d.querySelector('.vm-gallery-stage').getBoundingClientRect(),card=d.querySelector('.vm-car-inquiry').getBoundingClientRect();return stage.left>=gallery.left-.5&&stage.right<=gallery.right+.5&&(stage.right<=card.left||stage.bottom<=card.top)&&d.documentElement.scrollWidth<=d.defaultView.innerWidth})()`));
  await evaluate(`${doc}.querySelector('.vm-car-price').scrollIntoView({block:'center',behavior:'instant'})`);await sleep(80);
  check('Editable price is not covered by images at '+width+'px',await evaluate(`(()=>{const d=${doc},p=d.querySelector('.vm-car-price'),r=p.getBoundingClientRect(),hits=[d.elementFromPoint(r.left+Math.min(12,r.width*.1),r.top+r.height*.5),d.elementFromPoint(r.left+r.width*.5,r.top+r.height*.5)];return hits.every(hit=>p===hit||p.contains(hit))})()`));
 }
 await evaluate(`${frame}.style.width='1100px'`);await sleep(150);
 await evaluate(`${doc}.querySelector('.vm-car-price').scrollIntoView({block:'center',behavior:'instant'})`);await sleep(150);
 // Negative control: the guard must reject the original overflowing geometry.
 await evaluate(`(()=>{const e=${doc}.querySelector('.vm-gallery-stage');e.style.width='816px';e.style.maxWidth='none'})()`);
 check('Layout check detects an overflowing gallery',await evaluate(`(()=>{const d=${doc};return d.querySelector('.vm-gallery-stage').getBoundingClientRect().right>d.querySelector('.vm-car-inquiry').getBoundingClientRect().left})()`));
 await evaluate(`${doc}.querySelector('.vm-gallery-stage').removeAttribute('style')`);

 const point=await evaluate(`(()=>{const r=${doc}.querySelector('.vm-car-price').getBoundingClientRect(),f=${frame}.getBoundingClientRect();return{x:f.left+r.left+r.width*.5,y:f.top+r.top+r.height*.5}})()`);
 await send('Input.dispatchMouseEvent',{type:'mouseMoved',...point});await send('Input.dispatchMouseEvent',{type:'mousePressed',button:'left',clickCount:1,...point});await send('Input.dispatchMouseEvent',{type:'mouseReleased',button:'left',clickCount:1,...point});
 await until(`window.__priceSelections.some(e=>e.fieldPath==='${pricePath}')`);
 check('Real Fivora editor selects the price instead of the photograph',true);
 await screenshot('car-price-editor-no-overlap-1100.png');
 await evaluate(`${win}.postMessage({type:'FIVORA_PREVIEW_EDIT_MODE',editMode:false},location.origin)`);await sleep(100);
 const edited=structuredClone(data);edited.content.cards.vehicles['bmw-m5'].price='LKR 61,250,000';
 await evaluate(`${win}.postMessage({type:'FIVORA_PREVIEW_SITE_DATA',siteData:${JSON.stringify(edited)}},location.origin)`);await sleep(500);
 check('Edited price updates while both gallery photos stay mounted',await evaluate(`${doc}.querySelector('.vm-car-price').textContent==='LKR 61,250,000'&&${doc}.querySelectorAll('.vm-gallery-stage img').length===2`));
 await evaluate(`${doc}.querySelector('.vm-gallery-fit').click()`);check('Fit image control still works',await evaluate(`${doc}.querySelector('.vm-gallery-stage').dataset.fit==='contain'`));
 await evaluate(`${doc}.querySelectorAll('.vm-gallery-thumbnails button')[1].click()`);await sleep(100);check('Thumbnail navigation still works',await evaluate(`${doc}.querySelectorAll('.vm-gallery-thumbnails button')[1].getAttribute('aria-pressed')==='true'`));
 for(const id of Object.keys(data.content.vehicles)){
  await navigate(baseUrl+'/cars/'+id,'car-'+id);
  await send('Emulation.setDeviceMetricsOverride',{width:1100,height:1000,deviceScaleFactor:1,mobile:false});await sleep(100);
  check(id+': gallery does not cover its price card',await evaluate("(()=>{const a=document.querySelector('.vm-gallery-stage').getBoundingClientRect(),b=document.querySelector('.vm-car-inquiry').getBoundingClientRect();return a.right<=b.left||a.bottom<=b.top})()"));
 }
 console.log('BROWSER_ERRORS',exceptions,consoleErrors);check('No browser exceptions or console errors',exceptions.length===0&&consoleErrors.length===0);
});
