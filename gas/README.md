# GAS — ESTRADA Festival

## Setup 1 menit
1. Buat Google Sheet baru → buka → copy ID dari URL `https://docs.google.com/spreadsheets/d/XXXXXXX/edit` → XXX adalah `SHEET_ID`
2. Extensions → Apps Script → hapus `Code.gs` default → paste `Code.gs` ini → ganti `SHEET_ID`
3. Deploy → New deployment → Web app → Execute as: Me → Who has access: **Anyone** → Deploy → Copy URL `https://script.google.com/macros/s/XXXX/exec`
4. Paste URL ke GAS_URL di daftar.html (`const GAS_URL = '...'`)
## Test
- Apps Script → Run `testPost` → Authorize → cek Sheet muncul baris
- Buka `daftar.html` → isi form → submit → cek Sheet + modal sukses

## Catatan
- `text/plain` fetch menghindari CORS preflight — GAS otomatis allow `Anyone`
- Validasi ada di frontend + backend (mirror)
- Untuk cegah duplikat NIM, uncomment blok dedupe di `doPost`

## Ganti endpoint
Cari `PASTE_ID` di `daftar.html:113`
