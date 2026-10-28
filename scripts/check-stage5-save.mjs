import fs from 'node:fs';
import assert from 'node:assert/strict';
import {withBrowser} from './browser-session.mjs';

// Read the local Lab token through hidden stdin, never command arguments/files.
if(process.stdin.isTTY)process.stdin.setRawMode(true);
process.stdin.setEncoding('utf8');process.stdin.resume();
console.log('Waiting for Local Lab token on stdin (input hidden).');
const token=await new Promise(resolve=>{let input='';process.stdin.on('data',function read(chunk){input+=chunk;if(/[\r\n]/.test(input)){process.stdin.removeListener('data',read);resolve(input.trim())}})});
if(process.stdin.isTTY)process.stdin.setRawMode(false);process.stdin.pause();
const file='src/data/site-data.json',original=fs.readFileSync(file,'utf8'),source=JSON.parse(original);
const request=async(method,data)=>{
 const r=await fetch('http://127.0.0.1:4174/api/site-data',{method,headers:{Authorization:`Bearer ${token}`,...(data?{'Content-Type':'application/json'}:{})},...(data?{body:JSON.stringify({siteData:data})}:{})});
 assert(r.ok,`Local Lab ${method} failed (${r.status})`);return await r.json();
};
await request('GET');
const edited=structuredClone(source);edited.content.services.items[0].name='Persistence check — demo service';edited.content.faq.items[0].answer='Persistence check — demo answer';edited.content.home.reviews[0].image='/images/tesla.jpg';edited.content.vehicles['porsche-panamera'].interiorColor='Persistence check — unconfirmed demo';
try{
 await request('POST',edited);
 const disk=JSON.parse(fs.readFileSync(file,'utf8'));assert.equal(disk.content.services.items[0].name,edited.content.services.items[0].name);
 const reread=await request('GET');assert.equal(reread.siteData.content.faq.items[0].answer,edited.content.faq.items[0].answer);assert.equal(reread.siteData.content.vehicles['porsche-panamera'].interiorColor,edited.content.vehicles['porsche-panamera'].interiorColor);
 await withBrowser(async({send,evaluate,until,check})=>{
  await send('Page.navigate',{url:'http://127.0.0.1:4174/__fivora_local_preview'});await until("document.querySelector('iframe')?.contentDocument?.documentElement.getAttribute('data-gramm')==='false'");
  check('Saved review image loads from disk in a fresh Lab preview',await evaluate("document.querySelector('iframe').contentDocument.querySelector('.vm-review img').getAttribute('src').endsWith('tesla.jpg')"));
  await evaluate("document.querySelector('iframe').src='/services'");await until("document.querySelector('iframe')?.contentDocument?.querySelector('.service-card-title')?.textContent==='Persistence check — demo service'");
  check('Saved service content survives fresh Lab page navigation',true);
 });
 console.log('PASS: Lab save/read/disk/reload persistence verified for service, FAQ, review and vehicle fields.');
}finally{
 await request('POST',source);fs.writeFileSync(file,original);assert.equal(fs.readFileSync(file,'utf8'),original);console.log('Original source restored byte-for-byte.');
}
