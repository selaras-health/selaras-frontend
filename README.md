# Selaras Web Frontend

Selaras adalah platform self-awareness untuk kesehatan jantung yang dirancang untuk membantu pengguna memahami kondisi jantung mereka dengan lebih baik melalui analisis data dan teknologi AI.

## Fitur (V1.0.0)
- **Dashboard**: Menyediakan tampilan ringkas dan informatif tentang data kesehatan jantung pengguna.  
- **Analisis & Personalisasi**: Menggunakan teknologi *Gemini* untuk menganalisis data berdasarkan input pengguna dan memberikan rekomendasi yang dipersonalisasi.  
- **Chat AI**: Fitur percakapan berbasis AI untuk menjawab pertanyaan dan memberikan panduan terkait kesehatan jantung.  

## Cara Menjalankan Proyek
Untuk menjalankan proyek frontend Selaras di lokal, ikuti langkah-langkah berikut:

1. Clone repositori ini:
  ```bash
  git clone https://github.com/selaras-health/selaras-frontend.git
  cd selaras-frontend
  ```
2. Instal semua dependensi yang dibutuhkan:
  ```bash
  npm install
  ```
3. Setup Environment Variables: Buat file baru bernama `.env` di root direktori proyek. Salin konten dari file `.env.example` ke dalam file `.env` tersebut, lalu sesuaikan nilainya.

  Contoh isi file `.env.example`:
  ```
  VITE_BASE_URL=
  ```

  Penjelasan variabel:
  - `VITE_BASE_URL`: URL dasar dari API backend yang digunakan untuk interaksi data.

4. Jalankan development server:
  ```bash
  npm run dev
  ```
  Akses aplikasi di `http://localhost:5173` (atau port lain yang ditampilkan di terminal jika 5173 sudah terpakai).