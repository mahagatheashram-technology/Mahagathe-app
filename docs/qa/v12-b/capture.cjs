/* Reproducible zero-key browser QA. Requires an installed Playwright module and Google Chrome.
 * V12_PLAYWRIGHT=/path/to/playwright node docs/qa/v12-b/capture.cjs
 * Export first to V12_WORK/web. All raw artifacts stay outside the repository.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const http = require('node:http');
const path = require('node:path');
const work = process.env.V12_WORK || '/Volumes/NithinSameer/Personal/Mahagathe/.agent-work/v12b';
const { chromium } = require(process.env.V12_PLAYWRIGHT || 'playwright');
const raw = path.join(work, 'screenshots');
fs.mkdirSync(raw, { recursive: true });
const types = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.ttf': 'font/ttf',
  '.otf': 'font/otf',
  '.svg': 'image/svg+xml',
};
const server = http.createServer((req, res) => {
  let file = path.join(work, 'web', decodeURIComponent(new URL(req.url, 'http://localhost').pathname));
  if (!fs.existsSync(file) || fs.statSync(file).isDirectory()) file = path.join(work, 'web', 'index.html');
  res.setHeader('Content-Type', types[path.extname(file)] || 'application/octet-stream');
  res.setHeader('Cache-Control', 'no-store');
  fs.createReadStream(file).pipe(res);
});
const errors = [];
const results = [];
let browser;
let page;
const pause = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
async function shot(name) {
  await page.evaluate(() => document.fonts.ready);
  await pause(350);
  await page.screenshot({ path: path.join(raw, `${name}.png`), animations: 'disabled' });
  console.log(`Captured ${name}`);
}
async function closeSheet() {
  await page.getByRole('button', { name: 'Close', exact: true }).last().click();
  await pause(350);
}
async function clickBack(name) {
  await page.getByRole('button', { name: `Back to ${name}`, exact: true }).click();
  await pause(350);
}
async function signIn() {
  await page.getByRole('button', { name: 'Begin your practice', exact: true }).click();
  await page.getByRole('textbox', { name: 'Mobile number', exact: true }).fill('9876543210');
  await page.getByRole('button', { name: 'Send code', exact: true }).click();
  await page.getByRole('textbox', { name: '6-digit code', exact: true }).fill('123456');
  await page.getByRole('button', { name: 'Verify and continue', exact: true }).click();
  await page.getByRole('textbox', { name: 'What should we call you?', exact: true }).waitFor();
}
(async () => {
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  const origin = `http://127.0.0.1:${server.address().port}`;
  browser = await chromium.launch({
    executablePath: process.env.V12_CHROME || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    headless: true,
  });
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true,
  });
  page = await context.newPage();
  page.on('pageerror', (e) => errors.push(e.message));
  const cdp = await context.newCDPSession(page);
  await cdp.send('Emulation.setDeviceMetricsOverride', {
    width: 390,
    height: 844,
    deviceScaleFactor: 2,
    mobile: true,
    screenWidth: 390,
    screenHeight: 844,
  });
  await cdp.send('Emulation.setTouchEmulationEnabled', { enabled: true });
  await page.goto(`${origin}/welcome`);
  await page.getByRole('button', { name: 'Begin your practice', exact: true }).waitFor();
  assert.deepEqual(await page.evaluate(() => [innerWidth, innerHeight, devicePixelRatio]), [390, 844, 2]);
  results.push('CDP mobile viewport 390×844, DPR 2');
  await shot('Welcome');
  await signIn();
  await page.getByRole('textbox', { name: 'What should we call you?', exact: true }).fill('Arjun');
  await page.getByRole('radio', { name: '25–44', exact: true }).click();
  await page.getByRole('textbox', { name: 'What should we call you?', exact: true }).blur();
  await shot('Setup');
  await clickBack('Welcome');
  await page.getByRole('button', { name: 'Begin your practice', exact: true }).click();
  await page.getByRole('textbox', { name: 'What should we call you?', exact: true }).fill('Arjun');
  await page.getByRole('radio', { name: 'Prefer not to say', exact: true }).click();
  await page.getByRole('button', { name: 'Continue', exact: true }).click();
  await page.getByRole('tab', { name: 'Wisdom', exact: true }).waitFor();
  results.push('Setup back to Welcome; unspecified age completes without guardian flow');

  await page.getByRole('tab', { name: 'Wisdom', exact: true }).click();
  await page.getByRole('link', { name: /^The Churning of the Ocean\. Continue reading$/ }).click();
  await page.getByRole('button', { name: 'All episodes', exact: true }).click();
  await page.getByRole('button', { name: /^Episode 1: The Bard/ }).click();
  await page.getByRole('heading', { name: 'The Bard at Naimiṣa', exact: true }).waitFor();
  await shot('Episode');
  await page.getByRole('heading', { name: 'The Bard at Naimiṣa', exact: true }).evaluate((el) => {
    for (let parent = el.parentElement; parent; parent = parent.parentElement) {
      if (
        parent.scrollHeight > parent.clientHeight &&
        /auto|scroll/.test(getComputedStyle(parent).overflowY)
      ) {
        parent.scrollTop = (parent.scrollHeight - parent.clientHeight) * 0.35;
        break;
      }
    }
  });
  await pause(1000);
  await clickBack('Wisdom');
  await shot('Wisdom');
  await page.getByRole('link', { name: /^The Bard at Naimiṣa\./ }).click();
  await pause(700);
  const restored = await page.evaluate(() =>
    Math.max(...Array.from(document.querySelectorAll('div')).map((e) => e.scrollTop)),
  );
  assert(restored > 20, 'Reading position should restore after reopening an unfinished episode');
  await page
    .getByText('From the BORI critical edition · Ādi 1.1–15', { exact: true })
    .scrollIntoViewIfNeeded();
  await shot('Episode-end');
  await page.getByRole('button', { name: 'Two more questions', exact: true }).click();
  await page.getByRole('radio', { name: 'Naimiṣa forest', exact: true }).click();
  await page.getByRole('button', { name: 'Next question', exact: true }).click();
  await shot('Episode-questions');
  await closeSheet();
  await page.getByRole('button', { name: 'Text size', exact: true }).click();
  await page.getByRole('radio', { name: 'Large text', exact: true }).click();
  await page.getByRole('button', { name: 'Text size', exact: true }).click();
  await page.getByRole('radio', { name: 'Default text', exact: true }).click();
  await clickBack('Wisdom');
  await page.getByRole('link', { name: /^The Bard at Naimiṣa\./ }).click();
  await page.getByRole('button', { name: 'Next: The Serpent Sacrifice', exact: true }).click();
  await page.getByRole('heading', { name: 'The Serpent Sacrifice', exact: true }).waitFor();
  await clickBack('Wisdom');
  results.push('All episodes, questions sheet, text sizing, reading restoration, and Next navigation');

  await page.getByRole('link', { name: /^Today's teaching:/ }).click();
  await shot('Vakyam');
  await page.getByRole('button', { name: 'Save', exact: true }).click();
  await page.getByRole('button', { name: 'Remove from saved', exact: true }).waitFor();
  await page.getByRole('button', { name: 'Source', exact: true }).click();
  await page.getByRole('button', { name: 'Report a wrong source or text', exact: true }).waitFor();
  await shot('Vakyam-source');
  await page.getByRole('button', { name: 'Report a wrong source or text', exact: true }).click();
  await page.getByRole('radio', { name: 'The source is wrong', exact: true }).click();
  await page.getByRole('button', { name: 'Send report', exact: true }).click();
  await page.getByRole('button', { name: 'Done', exact: true }).waitFor();
  await shot('Vakyam-report');
  await page.getByRole('button', { name: 'Done', exact: true }).click();
  await pause(350);
  results.push('Save, Source details, and existing report sheet submission');
  await page.getByRole('button', { name: 'Sit with it · 7 minutes', exact: true }).click();
  await page.waitForURL('**/player/**');
  // Close the existing player using its accessible close/back control.
  await page
    .getByRole('button', { name: /close|back/i })
    .first()
    .click();
  await clickBack('Home');
  await page.getByRole('tab', { name: 'Wisdom', exact: true }).click();
  await page.getByRole('button', { name: /^Our lineage\./ }).click();
  await shot('Parampara');
  await page.getByRole('button', { name: /^The full lineage\./ }).click();
  await shot('Parampara-lineage');
  await closeSheet();
  await page.getByRole('button', { name: /^Dīkṣā milestones\./ }).click();
  await closeSheet();
  await clickBack('Wisdom');
  await page.getByRole('button', { name: /^Past teachings\./ }).click();
  await shot('Past-teachings');
  await clickBack('Wisdom');
  results.push('Lineage and milestone sheets, Past teachings hub');

  await page.getByRole('tab', { name: 'Sangha', exact: true }).click();
  await shot('Sangha');
  await page.getByRole('button', { name: /^View gathering:/ }).click();
  await page.getByRole('button', { name: /^Register for Abhyudaya/ }).click();
  await page.getByRole('button', { name: /^Going to Abhyudaya/ }).waitFor();
  await shot('Sangha-gathering');
  await closeSheet();
  await page.getByRole('button', { name: /^All gatherings\./ }).click();
  await shot('Gatherings');
  await clickBack('Sangha');
  await page.getByRole('button', { name: /^Offer seva\./ }).click();
  await shot('Seva');
  await clickBack('Sangha');
  results.push('Gathering registration, gatherings list, Offer seva hub');
  await page.getByRole('button', { name: /^Give dāna\./ }).click();
  assert(await page.getByRole('button', { name: 'Choose an amount to continue', exact: true }).isDisabled());
  await shot('Donate');
  await page.getByRole('button', { name: /^For:/ }).click();
  await page.getByRole('radio', { name: /Bhaṇḍāra/ }).click();
  await pause(350);
  await page.getByRole('button', { name: /^Giving from outside India\?/ }).click();
  await shot('Donate-abroad');
  await closeSheet();
  await page.getByRole('button', { name: 'Other amount', exact: true }).click();
  await page.getByRole('textbox', { name: 'Other amount in rupees', exact: true }).fill('0');
  assert(await page.getByRole('button', { name: 'Choose an amount to continue', exact: true }).isDisabled());
  await page.getByRole('textbox', { name: 'Other amount in rupees', exact: true }).fill('251');
  await page.getByRole('button', { name: 'Give ₹251 with UPI', exact: true }).waitFor();
  await page.getByRole('button', { name: '₹101', exact: true }).click();
  await shot('Donate-selected');
  await page.getByRole('button', { name: 'Give ₹101 with UPI', exact: true }).click();
  await page.getByRole('heading', { name: 'Thank you', exact: true }).waitFor();
  await shot('Donate-success');
  await page.getByRole('button', { name: 'Give again', exact: true }).click();
  await page.getByRole('button', { name: 'Give ₹101 with UPI', exact: true }).waitFor();
  results.push(
    'Donation starts disabled; purpose picker; abroad sheet; custom amount validation; preset payment; Give again',
  );

  // A fresh page is a fresh mock session: check guest guards without mutating app internals.
  const guest = await context.newPage();
  await guest.goto(`${origin}/donate`);
  await guest.getByRole('button', { name: 'Look around first', exact: true }).waitFor();
  await guest.getByRole('button', { name: 'Look around first', exact: true }).click();
  await guest.getByRole('tab', { name: 'Wisdom', exact: true }).click();
  await guest.getByRole('link', { name: /^Today's teaching:/ }).click();
  await guest.getByRole('button', { name: 'Sit with it · 7 minutes', exact: true }).click();
  await guest.getByRole('button', { name: 'Begin your practice', exact: true }).waitFor();
  await guest.close();
  results.push('Guest can read Wisdom; Give and sitting actions require sign-in');
  assert.deepEqual(errors, [], 'No browser runtime errors');
  fs.writeFileSync(
    path.join(work, 'browser-results.json'),
    JSON.stringify({ viewport: { width: 390, height: 844, dpr: 2 }, results, errors }, null, 2),
  );
  console.log(JSON.stringify({ results, errors }, null, 2));
})()
  .catch(async (e) => {
    console.error(e);
    if (page) {
      console.error((await page.locator('body').innerText()).slice(-6500));
      await shot('failure').catch(() => {});
    }
    process.exitCode = 1;
  })
  .finally(async () => {
    if (browser) await browser.close();
    server.close();
  });
