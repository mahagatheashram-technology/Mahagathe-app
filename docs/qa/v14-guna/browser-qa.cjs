/* Run with Node 22 --import tsx after the documented export, served on :8087. */
const { chromium } = require('/Users/sameer/.npm/_npx/9833c18b2d85bc59/node_modules/playwright');
const { coreQuestions } = require('../../../src/features/gunometer/lib/questions');
const { computeResult } = require('../../../src/features/gunometer/lib/scoring');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const out = __dirname;
(async () => {
 const browser = await chromium.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: true });
 const context = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
 const page = await context.newPage();
 const errors = []; page.on('pageerror', e => errors.push(e.message));
 const logs = [];
 const log = text => { logs.push(text); console.log(text); };
 const click = label => page.getByRole('button', { name: label, exact: true }).click();
 const ready = async () => { await page.evaluate(() => document.fonts.ready); };
 const shot = async name => { await ready(); if(name!=='GunaQuestionSelected') await page.waitForTimeout(420); await page.screenshot({ path: `${out}/${name}.png`, fullPage: true }); };
 const fullShot = async name => {
  // Expo's ScrollView clips scrolling content: expand only its content height for a full-height capture.
  const h = await page.evaluate(() => Math.max(844, ...Array.from(document.querySelectorAll('div')).filter(e => ['auto','scroll'].includes(getComputedStyle(e).overflowY) && e.clientHeight > 100).map(e => e.scrollHeight)));
  await page.setViewportSize({ width: 390, height: h });
  await shot(name);
  await page.setViewportSize({ width: 390, height: 844 });
 };
 const signIn = async () => {
  await click('Begin your practice');
  await page.getByLabel('Mobile number', { exact: true }).fill('9123456789'); await click('Send code');
  await page.getByLabel('6-digit code', { exact: true }).fill('123456'); await click('Verify and continue');
  await page.getByLabel('What should we call you?', { exact: true }).fill('Arjun');
  await page.getByRole('radio', { name: '25–44', exact: true }).click(); await click('Continue');
 };
 await page.goto('http://localhost:8087/gunometer/quiz');
 await page.waitForURL('**/welcome'); log('PASS guest quiz redirects to sign-in');
 await signIn(); await page.waitForURL('**/gunometer/intro');
 await shot('V131GunaInvite'); log('PASS first setup routes to the Gunometer invite');
 await click('Later, go to Home'); await page.waitForURL('http://localhost:8087/');
 await click('Profile and settings'); await page.waitForURL('**/profile');
 await page.getByRole('button', { name: 'Take the Gunometer', exact: true }).waitFor();
 assert.equal(await page.getByRole('switch', {name:'Gatherings I’m going to',exact:true}).getAttribute('aria-checked'), 'true');
 await fullShot('ProfileNoResult'); log('PASS Later keeps no result, Profile offers quiz, gatherings default on');
 await click('Take the Gunometer'); await click('Begin'); await page.waitForURL('**/gunometer/quiz');
 // Deterministic valid answers with mock proportions, while exercising the actual UI and save hook.
 let seed = 14; let answers;
 for (let n = 0; n < 100000; n++) {
  const candidate = Object.fromEntries(coreQuestions.map(q => { seed = (Math.imul(seed,1664525)+1013904223)>>>0; return [q.id,1+seed%5]; }));
  const r = computeResult(candidate);
  if (candidate.Q12===4 && r.profilePercent.sattva===34 && r.profilePercent.rajas===42 && r.profilePercent.tamas===24) { answers=candidate; break; }
 }
 assert.ok(answers, 'found source answers for reference percentages');
 const labels = ['Never','Rarely','Sometimes','Often','Almost always'];
 for (let i=0;i<coreQuestions.length;i++) {
  await page.getByText(`${i+1} of 24`,{exact:true}).waitFor();
  assert.equal(await page.getByRole('radio').count(),5);
  if (i===1) {
   await click('Previous question');
   await page.getByText('1 of 24',{exact:true}).waitFor();
   assert.equal(await page.getByRole('radio',{name:labels[answers.Q01-1],exact:true}).getAttribute('aria-checked'),'true');
   await page.getByRole('radio',{name:labels[answers.Q01-1],exact:true}).click();
   await page.getByText('2 of 24',{exact:true}).waitFor();
  }
  if (i===11) await shot('GunaQuestionUnanswered');
  await page.getByRole('radio',{name:labels[answers[coreQuestions[i].id]-1],exact:true}).click();
  if (i===11) { await shot('GunaQuestionSelected'); fs.copyFileSync(`${out}/GunaQuestionSelected.png`,`${out}/V131GunaQuestion.png`); }
 }
 await page.waitForURL('**/gunometer');
 await page.getByRole('heading',{name:'Rajas',exact:true}).waitFor();
 await fullShot('V131GunaResult');
 let saved = await page.evaluate(() => JSON.parse(Object.entries(localStorage).find(([k])=>k.startsWith('mg-v14-mock-'))[1]));
 assert.deepEqual(saved.gunaResult.answers, answers); assert.equal(saved.gunaPrompt, 'done');
 assert.deepEqual(saved.gunaResult.percents,{sattva:34,rajas:42,tamas:24});
 log('PASS 24 answers auto-advance; back restores selection; saved result and done prompt persist');
 await click('How it shows up'); assert.equal(await page.getByRole('button',{name:'How it shows up',exact:true}).getAttribute('aria-expanded'),'true');
 await page.getByText('You decide fast and course-correct on the move',{exact:true}).waitFor();
 await click('How it shows up'); log('PASS result recommendation accordion expands/collapses');
 await click('Share your Gunometer'); await click('Close share card');
 await click('Share your Gunometer');
 await page.getByText('My guna',{exact:true}).waitFor(); await shot('GunaSharePreview');
 const shareCard = page.getByText('My guna',{exact:true}).locator('..');
 await shareCard.screenshot({path:`${out}/GunaStory.png`});
 // Reference display: the 9:16 component centred on the mock's 390×844 dark ground.
 await page.evaluate(() => {
  const card=Array.from(document.querySelectorAll('div')).find(e=>e.textContent==='My guna').parentElement;
  const clone=card.cloneNode(true);
  const stage=document.createElement('div'); stage.id='qa-share-stage'; Object.assign(stage.style,{position:'fixed',inset:'0',background:getComputedStyle(card.closest('[aria-modal]')||document.body).backgroundColor,backgroundColor:'rgb(43,38,34)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:'999999'});
  stage.append(clone);document.body.append(stage);
 });
 await shot('V131GunaCard'); await page.evaluate(()=>document.getElementById('qa-share-stage').remove());
 await click('Close share card'); log('PASS share preview renders a 9:16 story card');
 await click('Back to Profile'); await page.waitForURL('**/profile'); await fullShot('V13Profile');
 await page.getByRole('button',{name:/Your guna, Rajas/}).waitFor();
 await page.getByRole('switch',{name:'Gatherings I’m going to',exact:true}).click();
 assert.equal(await page.getByRole('switch',{name:'Gatherings I’m going to',exact:true}).getAttribute('aria-checked'),'false');
 await page.getByRole('switch',{name:'Gatherings I’m going to',exact:true}).click();
 await click('Edit profile'); await page.getByRole('textbox',{name:'Your name',exact:true}).fill('Arjun QA'); await click('Save');
 await page.getByRole('heading',{name:'Arjun QA',exact:true}).waitFor();
 log('PASS Profile displays latest result; notification toggles and name editing save');
 await page.getByRole('button',{name:/Your guna, Rajas/}).click();
 await click('Take it again'); await page.getByText('1 of 24',{exact:true}).waitFor();
 for(let i=0;i<coreQuestions.length;i++) { await page.getByText(`${i+1} of 24`,{exact:true}).waitFor(); await page.getByRole('radio',{name:'Sometimes',exact:true}).click(); }
 await page.waitForURL('**/gunometer');
 const replacement=await page.evaluate(()=>JSON.parse(Object.entries(localStorage).find(([k])=>k.startsWith('mg-v14-mock-'))[1]));
 assert.deepEqual(replacement.gunaResult.percents,{sattva:34,rajas:33,tamas:33});
 assert.ok(replacement.gunaResult.takenAt>saved.gunaResult.takenAt); log('PASS full retake replaces latest result');
 await click('Back to Profile'); await click('Sign out'); await page.waitForURL('**/welcome');
 await signIn(); await page.waitForURL('http://localhost:8087/');
 log('PASS a returning account is not prompted again');
 assert.deepEqual(errors,[]); log('PASS no browser runtime errors');
 fs.writeFileSync(`${out}/browser-results.txt`,logs.join('\n')+'\n');
 await browser.close();
})().catch(e=>{console.error(e);process.exit(1);});
