const { chromium } = require('/Users/sameer/.npm/_npx/9833c18b2d85bc59/node_modules/playwright');
const fs = require('node:fs');
const out = process.cwd()+'/docs/qa/v14-library/';
(async()=>{
 const browser=await chromium.launch({headless:true, executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'});
 const context=await browser.newContext({viewport:{width:390,height:844},deviceScaleFactor:2});
 const page=await context.newPage();
 const errors=[]; const metrics=[];
 page.on('pageerror',e=>errors.push(e.message));
 page.on('console',m=>{if(m.type()==='error')errors.push(m.text())});
 async function ready(){await page.getByRole('button',{name:/^Back to /}).or(page.getByRole('heading',{name:'Wisdom',exact:true})).first().waitFor();await page.evaluate(()=>document.fonts.ready);await page.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));}
 async function capture(name,url){
  await page.setViewportSize({width:390,height:844});
  if(url)await page.goto('http://127.0.0.1:8764'+url);
  await ready();
  await page.evaluate(()=>{for(const e of document.querySelectorAll('div'))if(getComputedStyle(e).overflowY==='auto')e.scrollTop=0});
  await page.screenshot({path:out+name+'-viewport.png'});
  const height=await page.evaluate(()=>Math.ceil(Math.max(innerHeight,...Array.from(document.querySelectorAll('div')).filter(e=>e.scrollHeight>e.clientHeight+2&&getComputedStyle(e).overflowY==='auto').map(e=>e.scrollHeight+innerHeight-e.clientHeight))));
  await page.setViewportSize({width:390,height});
  await page.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));
  await page.screenshot({path:out+name+'.png',fullPage:true});
  metrics.push({name,width:390,initialHeight:844,fullHeight:height,scale:2}); console.log(name,height);
 }
 await page.goto('http://127.0.0.1:8764/welcome');
 await page.getByRole('button',{name:'Look around first',exact:true}).click();
 await page.getByRole('tab',{name:'Wisdom',exact:true}).click();
 await capture('Wisdom');
 await capture('Words','/teachings');
 await capture('Search','/search?q=staying%20calm%20when%20work%20is%20stressful');
 await capture('Series','/series/ramayana');
 await capture('Pashupata','/series/pashupata');
 await capture('Mahabharata','/series/mahabharata');
 await capture('IKS','/series/iks');
 await page.getByRole('button',{name:'Get access to the full series',exact:true}).click();
 await page.getByRole('heading',{name:'Access to the full series',exact:true}).waitFor();
 await page.setViewportSize({width:390,height:844});
 await page.screenshot({path:out+'IKS-access-sheet.png'});
 await capture('Episode','/episode/adi-e3');
 await capture('Vakyam','/vakyam/vk-001');
 await capture('Lineage','/parampara');
 await capture('Theme-work','/wisdom-theme/work');
 fs.writeFileSync(out+'screenshots.json',JSON.stringify({metrics,errors},null,2));
 if(errors.length)throw new Error(JSON.stringify(errors));
 await browser.close();
})().catch(e=>{console.error(e);process.exit(1)});
