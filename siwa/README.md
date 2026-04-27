# SIWA (Sistem Warga)

A neighborhood administration management system for elite residential areas. Built with Laravel (Backend) and React (Frontend).

## Features
- Resident Management (CRUD, Occupancy Status)
- House Management (Occupancy History, Assignment)
- Payment System (Security & Cleaning Fees, Multi-month support)
- Expense Tracking (Routine & Non-routine)
- Dashboard Analytics (Income, Expense, Cashflow Charts)

## Tech Stack
- **Backend**: Laravel 11 (REST API)
- **Frontend**: React 18 (Vite, Vanilla CSS, Recharts)
- **Database**: MySQL

---

## Installation Guide

### Prerequisites
- PHP >= 8.2
- Composer
- Node.js & NPM
- MySQL Server

### 1. Backend Setup
```bash
cd backend
composer install
cp .env.example .env
```
- Configure your `.env` file with your database credentials:
  ```env
  DB_DATABASE=siwa_db
  DB_USERNAME=root
  DB_PASSWORD=
  ```
- Create the database `siwa_db` in MySQL.
- Run migrations and seeders:
  ```bash
  php artisan migrate
  php artisan db:seed --class=HouseSeeder
  php artisan storage:link
  ```
- Start the server:
  ```bash
  php artisan serve
  ```

### 2. Frontend Setup
```bash
cd ../frontend
npm install
```
- Start the development server:
  ```bash
  npm run dev
  ```

---

## API Endpoints
- `GET /api/dashboard` - Dashboard stats and charts
- `GET /api/residents` - List residents
- `POST /api/residents` - Create resident
- `GET /api/houses` - List houses with occupancy status
- `POST /api/houses/{id}/assign` - Assign resident to house
- `POST /api/payments` - Record iuran payment
- `GET /api/expenses` - List expenses

## Folder Structure
```text
siwa/
├── backend/          # Laravel Project
│   ├── app/Services/ # Business Logic
│   └── ...
└── frontend/         # React Project
    ├── src/pages/    # UI Pages
    ├── src/services/ # API Client
    └── ...
```
