# FRONTEND MANDIRI — DASH KATALOG AMANAH SAFAR
### Arsitektur: Headless Google Apps Script Backend + External Static Frontend

Direktori ini berisi frontend mandiri untuk aplikasi **Dash Katalog — Amanah Safar**. Frontend ini berjalan 100% terpisah di luar Google Apps Script (bisa di-host di Vercel, Netlify, Cloudflare Pages, atau hosting cPanel biasa), sementara Google Apps Script tetap menjadi backend API dan Google Sheets tetap menjadi database.

---

## 🎯 KEUNGGULAN SETELAH MIGRASI
1. **Pixel-Perfect 100%**: Tidak ada satu piksel pun tampilan, tombol, animasi, font, atau warna yang berubah.
2. **Bebas Banner Google**: Tidak ada lagi banner peringatan *"This application was created by another user"*.
3. **Bisa Pakai Custom Domain**: Dapat diakses melalui domain profesional Anda sendiri (misal: `katalog.amanahsafar.com`).
4. **Loading Awal Instan (< 0.5s)**: File statis dilayani langsung oleh CDN global tercepat di dunia.
5. **Zero-Refactor**: Seluruh 56 titik pemanggilan data di frontend tetap utuh menggunakan jembatan adapter `gasAdapter.js`.

---

## 📁 STRUKTUR DIREKTORI

```text
frontend/
├── config.js               <-- TEMPAT MEMASUKKAN URL DEPLOYMENT GOOGLE APPS SCRIPT
├── build.js                <-- Script bundler otomatis (menggabungkan Views/ modular)
├── package.json            <-- Command build & serve
├── dist/                   <-- FOLDER PRODUKSI (YANG DI-UPLOAD KE HOSTING)
│   ├── index.html          <-- Halaman HTML mandiri lengkap (732 KB)
│   ├── config.js           <-- Konfigurasi runtime
│   └── gasAdapter.js       <-- Jembatan RPC google.script.run -> HTTP POST
└── src/
    └── api/
        └── gasAdapter.js   <-- Source adapter proxy
```

---

## 🚀 PANDUAN PENGGUNAAN & DEPLOYMENT

### LANGKAH 1: Siapkan Backend Google Apps Script
1. Buka project Google Apps Script Anda.
2. Pastikan file `Kode.js` memiliki fungsi `doPost(e)` (sudah otomatis terpasang).
3. Klik tombol **Deploy** (di kanan atas) > **Manage Deployments** / **Kelola Deployment**.
4. Edit versi atau buat **New Deployment** (Jenis: **Web app**).
5. Pastikan pengaturan:
   - **Execute as**: `Me (email akun Anda)`
   - **Who has access**: `Anyone (Siapa saja)`
6. Salin **Web app URL** yang berakhiran `/exec`.
   Contoh: `https://script.google.com/macros/s/AKfycb.../exec`

---

### LANGKAH 2: Konfigurasi URL di Frontend
Buka file `frontend/config.js` (atau `frontend/dist/config.js`), lalu tempelkan URL Web App Anda:

```javascript
window.GAS_CONFIG = {
  API_URL: "https://script.google.com/macros/s/AKfycb.../exec"
};
```

*(Catatan: Anda tidak perlu build ulang setiap kali mengubah URL, cukup ubah file `config.js` di folder dist!)*

---

### LANGKAH 3: Menjalankan di Komputer Lokal (Testing)
Untuk menguji tampilan dan fitur di komputer Anda sendiri:

1. Buka terminal di folder root project:
   ```bash
   cd frontend
   npm run serve
   ```
2. Buka browser di alamat: `http://localhost:3000`

---

### LANGKAH 4: Deploy ke Hosting Pilihan Anda

Folder yang di-upload atau di-deploy adalah folder:
👉 **`frontend/dist/`**

#### Opsi A: Deploy ke Vercel (Paling Cepat & Gratis)
1. Install Vercel CLI jika belum ada: `npm i -g vercel`
2. Masuk ke folder dist:
   ```bash
   cd frontend/dist
   vercel deploy --prod
   ```
3. Web langsung live dan Anda bisa hubungkan domain kustom sendiri.

#### Opsi B: Deploy ke Netlify
1. Seret (*Drag and Drop*) folder `frontend/dist` langsung ke dashboard Netlify Drop: [app.netlify.com/drop](https://app.netlify.com/drop)
2. Selesai! Web langsung online dalam 5 detik.

#### Opsi C: Deploy ke Cloudflare Pages
1. Hubungkan repository GitHub Anda ke Cloudflare Pages.
2. Build command: `node frontend/build.js`
3. Build output directory: `frontend/dist`

#### Opsi D: Hosting cPanel / VPS / Apache / Nginx
1. Upload isi file di dalam folder `frontend/dist/` (`index.html`, `config.js`, `gasAdapter.js`) ke folder `public_html/` atau `var/www/html/`.
2. Web Anda langsung aktif.

---

## 🛠️ CARA REBUILD FRONTEND (Jika Nanti Ada Perubahan Kode di Views/)
Jika di kemudian hari Anda melakukan perubahan pada file-file di folder `Views/`:
Cukup jalankan perintah:
```bash
node frontend/build.js
```
File `frontend/dist/index.html` akan diperbarui secara instan.
