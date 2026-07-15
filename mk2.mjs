import { chromium } from 'playwright';
import { appendFileSync, readFileSync } from 'fs';
const b=await chromium.connectOverCDP('http://localhost:9222');
const ctx=b.contexts()[0];
const p=ctx.pages().find(x=>x.url().includes('supabase.com'))||ctx.pages()[0];

if (readFileSync('.env.local','utf8').includes('SUPABASE_SERVICE_ROLE_KEY')) { console.log('ALREADY_PRESENT'); await b.close(); process.exit(0); }

const dlg = p.getByRole('dialog').first();
const inp = dlg.locator('input:visible').first();
if (await inp.count()) { await inp.fill('wisply-site-server'); await p.waitForTimeout(500); }
await dlg.getByRole('button',{name:/^Create API key$/i}).click();
await p.waitForTimeout(7000);

// The key is shown once; reveal if masked.
for (const rx of [/Reveal/i,/Show/i,/Copy/i]) {
  const btns=p.getByRole('button',{name:rx}); const n=await btns.count();
  for(let i=0;i<n && i<3;i++){ try{ await btns.nth(i).click({timeout:1500}); await p.waitForTimeout(1000);}catch{} }
}
await p.waitForTimeout(1500);

let key=null;
const body = await p.locator('body').innerText();
const m = body.match(/\bsb_secret_[A-Za-z0-9_\-]{15,}\b/);
if (m) key = m[0];
if (!key) { // maybe it went to the clipboard
  try { key = (await p.evaluate(() => navigator.clipboard.readText()))?.trim(); } catch {}
  if (key && !/^sb_secret_/.test(key)) key = null;
}
if (!key) { console.log('KEY_NOT_CAPTURED'); await b.close(); process.exit(1); }

appendFileSync('.env.local', `\n# Service-role (secret) key — bypasses RLS. Used ONLY by /api/update + /api/download.\nSUPABASE_SERVICE_ROLE_KEY=${key}\n`);
console.log('WROTE_OK len=' + key.length + ' prefix=' + key.slice(0,10) + '…');
await b.close();
