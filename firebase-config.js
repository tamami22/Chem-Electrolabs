/**
 * ============================================================================
 * FIREBASE-CONFIG.JS - KONFIGURASI FIREBASE WEB SDK MODULAR (v9+)
 * ============================================================================
 * 
 * CATATAN KEAMANAN PENTING:
 * 1. apiKey Web Firebase Memang Bersifat Publik:
 *    apiKey ini berfungsi sebagai identifier proyek Firebase dan secara desain aman
 *    diletakkan di kode sisi klien (browser). Hal ini BUKAN kebocoran keamanan.
 * 2. Keamanan Sebenarnya Bergantung pada Pengaturan di Console:
 *    - Authorized Domains: Batasi domain mana saja yang boleh melakukan autentikasi
 *      (Firebase Console -> Authentication -> Settings -> Authorized Domains).
 *    - Security Rules: Atur izin akses data pada Firestore, Database, dan Cloud Storage.
 *    - API Restrictions di Google Cloud Console: Batasi apiKey hanya untuk API yang
 *      benar-benar digunakan (misal: Identity Toolkit API / Token Service).
 *    - Firebase App Check: Aktifkan untuk memverifikasi bahwa permintaan hanya berasal
 *      dari aplikasi web/domain Anda yang sah dan bukan bot.
 * 3. JANGAN PERNAH MENYIMPAN KUNCI RAHASIA (SECRET KEYS) DI KLIEN:
 *    Kunci rahasia seperti Private Key Service Account atau Secret Token backend
 *    TIDAK BOLEH berada di kode klien/browser, melainkan hanya di server backend aman.
 * ============================================================================
 */

// Gunakan URL CDN gstatic resmi agar browser murni dapat memuat modul ES tanpa bundler
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.0/firebase-app.js";
import { getAuth, GoogleAuthProvider } from "https://www.gstatic.com/firebasejs/10.14.0/firebase-auth.js";

// Konfigurasi Firebase Web Proyek Anda
const firebaseConfig = {
  apiKey: "AIzaSyDuwkfv-IBspvpHPzkk8A6CMDMcY60hWN0",
  authDomain: "chem-electrolabs.firebaseapp.com",
  projectId: "chem-electrolabs",
  storageBucket: "chem-electrolabs.firebasestorage.app",
  messagingSenderId: "258603683823",
  appId: "1:258603683823:web:65d14b9841226b6be6f01a",
  measurementId: "G-E1TBQZB0HK"
};

// Inisialisasi Firebase App
export const app = initializeApp(firebaseConfig);

// Inisialisasi Firebase Authentication (WAJIB di-export untuk script.js, register.html, dashboard.html)
export const auth = getAuth(app);

// Provider Autentikasi Google
export const googleProvider = new GoogleAuthProvider();
// Meminta pengguna selalu memilih akun Google saat klik tombol
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

/**
 * Menerjemahkan kode error Firebase Auth ke dalam pesan bahasa Indonesia yang ramah pengguna
 * @param {string} errorCode - Kode error dari Firebase (misal: 'auth/invalid-credential')
 * @returns {string} Pesan error dalam bahasa Indonesia
 */
export function getFirebaseErrorMessage(errorCode) {
  switch (errorCode) {
    case 'auth/invalid-credential':
    case 'auth/user-not-found':
    case 'auth/wrong-password':
      return 'Email atau password yang Anda masukkan salah.';
    case 'auth/user-disabled':
      return 'Akun ini telah dinonaktifkan. Silakan hubungi administrator.';
    case 'auth/too-many-requests':
      return 'Terlalu banyak percobaan gagal. Akses dibatasi sementara demi keamanan. Silakan coba beberapa saat lagi.';
    case 'auth/network-request-failed':
      return 'Gagal terhubung ke server. Periksa koneksi internet Anda.';
    case 'auth/email-already-in-use':
      return 'Alamat email ini sudah terdaftar. Silakan gunakan email lain atau masuk.';
    case 'auth/weak-password':
      return 'Password terlalu lemah. Gunakan minimal 8 karakter dengan kombinasi yang aman.';
    case 'auth/invalid-email':
      return 'Format alamat email tidak valid.';
    case 'auth/operation-not-allowed':
      return 'Metode login Email/Password belum diaktifkan di Firebase Console. Silakan buka menu Authentication -> Sign-in method lalu aktifkan Email/Password.';
    case 'auth/api-key-not-valid':
      return 'API Key Firebase tidak valid. Periksa kembali apiKey di firebase-config.js.';
    case 'auth/unauthorized-domain':
      return 'Domain ini tidak diizinkan untuk autentikasi. Pastikan domain terdaftar di Firebase Console (Authentication -> Settings -> Authorized domains).';
    case 'auth/popup-closed-by-user':
      return 'Proses login Google dibatalkan karena jendela popup ditutup.';
    case 'auth/popup-blocked':
      return 'Jendela popup Google diblokir oleh browser. Harap izinkan popup pada browser Anda untuk melanjutkan.';
    case 'auth/cancelled-popup-request':
      return 'Permintaan login Google dibatalkan karena ada proses lain yang sedang berjalan.';
    case 'auth/account-exists-with-different-credential':
      return 'Akun dengan email ini sudah terdaftar dengan metode autentikasi lain. Silakan masuk menggunakan metode yang sesuai.';
    default:
      return 'Terjadi kesalahan saat memproses permintaan. Silakan coba lagi.';
  }
}
