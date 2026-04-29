# SIWA (Sistem Informasi Warga) 🏘️

SIWA adalah sistem manajemen administrasi lingkungan perumahan elit yang dirancang untuk memudahkan Ketua RT atau pengelola dalam mendata warga, rumah, pembayaran iuran, serta pengeluaran kas.

Dibuat menggunakan **Laravel 11** (Backend) dan **React 18** (Frontend).

---

## 🚀 Fitur Utama
- **Manajemen Rumah & Penghuni**: Lacak siapa tinggal di mana, status rumah (dihuni/kosong), dan histori penghuni sebelumnya.
- **Sistem Iuran Otomatis**: Logika tagihan pintar untuk penghuni Tetap (setiap bulan) dan penghuni Kontrak (hanya jika dihuni).
- **Laporan Tagihan Real-time**: Pantau siapa yang sudah Lunas dan siapa yang menunggak dengan status "Lunas/Belum".
- **Ekspor Data Excel**: Unduh laporan tagihan bulanan langsung ke format Excel.
- **Manajemen Keuangan**: Pencatatan pemasukan (iuran satpam & kebersihan) serta pengeluaran rutin/non-rutin.
- **Dashboard Statistik**: Visualisasi arus kas (Income vs Expense) menggunakan grafik interaktif.

---

## 🛠️ Tech Stack
- **Backend**: Laravel 11 (REST API)
- **Frontend**: React 18 (Vite, Lucide Icons, Recharts)
- **Database**: MySQL
- **Library Tambahan**: SweetAlert2 (Notifikasi), XLSX (Export Excel), Axios (API Client).

---

## 📥 Panduan Instalasi

Ikuti langkah-langkah di bawah ini untuk menjalankan project di komputer lokal Anda:

### 1. Persiapan Awal
Pastikan Anda sudah menginstal:
- PHP >= 8.2
- Composer
- Node.js & NPM
- MySQL Server (XAMPP/Laragon)

### 2. Setup Backend (Laravel)
1. Buka terminal dan masuk ke folder backend:
   ```bash
   cd backend
   ```
2. Instal dependensi PHP:
   ```bash
   composer install
   ```
3. Salin file konfigurasi environment:
   ```bash
   cp .env.example .env
   ```
4. Buat database baru di MySQL dengan nama `siwa_db`.
5. Atur koneksi database di file `.env`:
   ```env
   DB_DATABASE=siwa_db
   DB_USERNAME=root
   DB_PASSWORD=
   ```
6. Generate App Key dan jalankan migrasi database beserta data awal (seeder):
   ```bash
   php artisan key:generate
   php artisan migrate --seed
   php artisan storage:link
   ```
7. Jalankan server backend:
   ```bash
   php artisan serve
   ```
   *Server akan berjalan di: `http://127.0.0.1:8000`*

### 3. Setup Frontend (React)
1. Buka terminal baru dan masuk ke folder frontend:
   ```bash
   cd frontend
   ```
2. Instal dependensi JavaScript:
   ```bash
   npm install
   ```
3. Jalankan server frontend:
   ```bash
   npm run dev
   ```
   *Aplikasi dapat diakses di: `http://localhost:5173`*

---

## 📂 Struktur Folder Utama
```text
siwa/
├── backend/              # Aplikasi Laravel (API)
│   ├── app/Http/         # Controller & Logic
│   ├── app/Models/       # Struktur Data Database
│   └── database/         # Migrasi & Seeder (Data Awal)
└── frontend/             # Aplikasi React (UI)
    ├── src/pages/        # Halaman-halaman UI
    ├── src/services/     # Koneksi ke API Backend
    └── src/styles/       # Styling CSS (Vanilla)
```

---

## 📝 Catatan Penting
- **Login**: Untuk saat ini sistem langsung masuk ke Dashboard RT (Simulasi login sebagai RT).
- **Foto KTP**: Pastikan folder `storage` sudah di-link agar foto KTP warga dapat muncul di dashboard.
- **Iuran**: Biaya iuran standar adalah Satpam (Rp 100.000) dan Kebersihan (Rp 15.000).

---
**SIWA - Elite Residential Management System**
