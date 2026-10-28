/**
 * Google Sheets backend for the AI Workshop Pass referral engine.
 * Paste into Extensions > Apps Script of a new Google Sheet, then
 * Deploy > New deployment > Web app (Execute as: Me, Who has access: Anyone).
 * Put the web-app URL into CONFIG.sheetsUrl in index.html.
 */
const REG = 'Registrations';
const CLK = 'Clicks';
const HEAD = ['createdAt', 'name', 'phone', 'email', 'college', 'branch', 'year', 'code', 'referredBy', 'source'];
const SOURCES = ['referral', 'whatsapp', 'ambassador', 'club', 'linkedin', 'instagram', 'email', 'other'];

function sheet_(name, head) {
  const ss = SpreadsheetApp.getActive();
  let sh = ss.getSheetByName(name);
  if (!sh) {
    sh = ss.insertSheet(name);
    sh.appendRow(head);
    sh.setFrozenRows(1);
  }
  return sh;
}

function rows_() {
  const values = sheet_(REG, HEAD).getDataRange().getValues();
  const head = values.shift();
  return values.map(function (r) {
    const o = {};
    head.forEach(function (k, i) { o[k] = r[i] instanceof Date ? r[i].toISOString() : String(r[i]); });
    return o;
  });
}

// Public fields only: phone numbers and emails never leave the sheet.
function pub_(r) {
  return { name: r.name, college: r.college, branch: r.branch, year: r.year, code: r.code,
           referredBy: r.referredBy || null, source: r.source, createdAt: r.createdAt };
}

// Strip characters that would make Sheets treat a value as a formula.
function clean_(v, max) {
  return String(v == null ? '' : v).trim().replace(/^[=+\-@]+/, '').slice(0, max || 80);
}

function out_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

function doGet(e) {
  const p = (e && e.parameter) || {};

  if (p.action === 'click' && p.code) {
    sheet_(CLK, ['code', 'at']).appendRow([clean_(p.code, 20).toUpperCase(), new Date()]);
    return out_({ ok: true });
  }

  if (p.action === 'lookup') {
    const q = String(p.q || '').trim().toLowerCase();
    const phone = q.replace(/\D/g, '').slice(-10);
    const r = rows_().find(function (x) {
      return (phone.length === 10 && x.phone === phone) || x.email.toLowerCase() === q || x.code === q.toUpperCase();
    });
    return out_({ reg: r ? pub_(r) : null });
  }

  const clicks = {};
  const c = sheet_(CLK, ['code', 'at']).getDataRange().getValues();
  c.shift();
  c.forEach(function (r) { clicks[r[0]] = (clicks[r[0]] || 0) + 1; });
  return out_({ regs: rows_().map(pub_), clicks: clicks });
}

function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const b = JSON.parse(e.postData.contents);
    const phone = String(b.phone || '').replace(/\D/g, '').replace(/^(91|0)(?=\d{10}$)/, '');
    const email = clean_(b.email).toLowerCase();
    const name = clean_(b.name, 60);
    if (!/^[6-9]\d{9}$/.test(phone) || /^(\d)\1{9}$/.test(phone) || !/^[^\s@]+@[^\s@]+\.[a-z]{2,}$/.test(email) ||
        name.replace(/[^\p{L}]/gu, '').length < 2 || clean_(b.college).length < 3) return out_({ error: 'invalid' });

    const rows = rows_();
    const byPhone = rows.find(function (r) { return r.phone === phone; });
    const byEmail = rows.find(function (r) { return r.email.toLowerCase() === email; });
    // number and email belong to two different people: refuse rather than guess
    if (byPhone && byEmail && byPhone !== byEmail) return out_({ error: 'conflict' });
    const dup = byPhone || byEmail;
    if (dup) return out_({ duplicate: true, reg: pub_(dup), match: byPhone ? 'phone' : 'email' });

    const codes = {};
    rows.forEach(function (r) { codes[r.code] = true; });
    const stem = clean_(b.name).replace(/[^a-z]/gi, '').slice(0, 5).toUpperCase() || 'AI';
    let code;
    do { code = stem + Math.floor(100 + Math.random() * 900); } while (codes[code]);

    const ref = b.referredBy && codes[b.referredBy] ? b.referredBy : '';
    const reg = {
      createdAt: new Date().toISOString(),
      name: clean_(b.name, 60),
      phone: phone,
      email: email,
      college: clean_(b.college),
      branch: clean_(b.branch, 30),
      year: clean_(b.year, 40),
      code: code,
      referredBy: ref,
      source: ref ? 'referral' : (SOURCES.indexOf(b.source) >= 0 ? b.source : 'other'),
    };
    // phone is written as text so Sheets keeps it a 10-digit string
    sheet_(REG, HEAD).appendRow(HEAD.map(function (k) { return k === 'phone' ? "'" + reg[k] : reg[k]; }));
    return out_({ reg: pub_(reg) });
  } finally {
    lock.releaseLock();
  }
}
