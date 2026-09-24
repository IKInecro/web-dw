/** ESTRADA Festival 2026 — GAS backend
 *  Setup: buat Google Sheet baru → copy ID dari URL → paste ke SHEET_ID
 *  Deploy: Extensions → Apps Script → paste file ini → Deploy → Web app → Anyone → copy URL → paste ke GAS_URL di daftar.html
 *  Sheet: tab "Pendaftaran" auto-create
 */
const SHEET_ID = '1aJqEeBkk-HNAyWQ6DSnsi0J3FdJu1DL_QeB_BBmpx3M';
const SHEET_NAME = 'Pendaftaran';

function doPost(e) {
  try {
    if (!e || !e.postData || !e.postData.contents) return json_({ ok: false, error: 'Empty body' });
    const data = JSON.parse(e.postData.contents);

    // server validation — mirror frontend
    if (!data.nama || String(data.nama).trim().length < 3) return json_({ ok: false, error: 'Nama minimal 3 karakter' });
    if (!data.nim || !/^[0-9]{8,15}$/.test(String(data.nim).trim())) return json_({ ok: false, error: 'NIM 8-15 digit' });
    if (!data.prodi) return json_({ ok: false, error: 'Prodi wajib' });
    if (!data.lomba || !data.lomba.length) return json_({ ok: false, error: 'Pilih minimal 1 lomba' });
    let wa = String(data.whatsapp || '').replace(/[\s\-]/g, '');
    if(/^08/.test(wa)) wa = '+62'+wa.slice(2); else if(/^62/.test(wa)) wa = '+'+wa;
    if (!/^\+62[0-9]{8,12}$/.test(wa)) return json_({ ok: false, error: 'WhatsApp harus +62xxxxxxxxxx' });

    const allowed = ['FUTSAL','BILLIARD','GALA SUARA','PUBLIC SPEAKING','E-SPORT'];
    const lombaClean = data.lomba.filter(v => allowed.includes(String(v).toUpperCase())).map(v => String(v).toUpperCase());
    if (lombaClean.length === 0) return json_({ ok: false, error: 'Lomba tidak valid' });

    // dedupe by NIM (optional) — uncomment to block duplicate NIM
    // const shCheck = getSheet_();
    // const vals = shCheck.getDataRange().getValues();
    // if (vals.some(r => String(r[2]) === String(data.nim).trim())) return json_({ ok:false, error:'NIM sudah terdaftar' });

    const sh = getSheet_();
    if (sh.getLastRow() === 0) {
      sh.appendRow(['Timestamp','Nama','NIM','Prodi','Lomba','WhatsApp','UserAgent']);
      sh.getRange(1,1,1,7).setFontWeight('bold').setBackground('#0f2042').setFontColor('#ffffff');
      sh.setFrozenRows(1);
    }
    sh.appendRow([new Date(), String(data.nama).trim(), String(data.nim).trim(), String(data.prodi), lombaClean.join(', '), wa, String(data.ua||'').slice(0,300)]);

    return json_({ ok: true });
  } catch (err) {
    return json_({ ok: false, error: String(err) });
  }
}

function doGet(e) {
  try {
    // if ?action=stats or no param, return rows + stats
    const sh = getSheet_();
    if (sh.getLastRow() <= 1) return json_({ ok: true, rows: [], stats: {} });
    const values = sh.getRange(2,1, sh.getLastRow()-1, 7).getValues();
    const rows = values.map(r => ({
      ts: r[0], timestamp: r[0], nama: r[1], nim: r[2], prodi: r[3], lomba: String(r[4]).split(',').map(s=>s.trim()).filter(Boolean), whatsapp: r[5]
    })).filter(r=> r.nama);
    // optional query filters ?prodi= & ?lomba=
    let filtered = rows;
    if (e && e.parameter) {
      if (e.parameter.lomba) filtered = filtered.filter(r=> r.lomba.includes(String(e.parameter.lomba).toUpperCase()));
      if (e.parameter.prodi) filtered = filtered.filter(r=> String(r.prodi).toLowerCase().includes(String(e.parameter.prodi).toLowerCase()));
    }
    return json_({ ok: true, rows: filtered, total: rows.length });
  } catch (err) {
    return json_({ ok: false, error: String(err) });
  }
}

function getSheet_(){
  const ss = SpreadsheetApp.openById(SHEET_ID);
  let sh = ss.getSheetByName(SHEET_NAME);
  if (!sh) sh = ss.insertSheet(SHEET_NAME);
  return sh;
}

function json_(obj){
  const out = ContentService.createTextOutput(JSON.stringify(obj));
  out.setMimeType(ContentService.MimeType.JSON);
  return out;
}

// test in editor
function testPost(){
  const e = { postData:{ contents: JSON.stringify({ nama:'Test Tim', nim:'12345678', prodi:'Sistem Informasi', lomba:['FUTSAL','E-SPORT'], whatsapp:'081234567890', ua:'test' }) } };
  Logger.log(doPost(e).getContent());
}
