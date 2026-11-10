/**
 * ============================================================================
 * SCRIPT.JS - LOGIKA LOGIN & FIREBASE AUTHENTICATION (SDK MODULAR v9+)
 * ============================================================================
 * 
 * CATATAN KEAMANAN PENTING:
 * 1. Sifat Publik apiKey Firebase Web:
 *    apiKey Firebase untuk aplikasi web memang dirancang publik oleh Google dan aman
 *    disertakan di sisi klien (browser). apiKey ini hanya mengidentifikasi proyek Anda.
 * 2. Keamanan Sebenarnya Ditentukan di Firebase Console & Cloud Console:
 *    - Authorized Domains: Batasi domain yang diizinkan untuk login di Firebase Console
 *      (Authentication -> Settings -> Authorized domains).
 *    - Security Rules: Atur hak akses dokumen di Firestore atau Cloud Storage secara ketat.
 *    - API Restrictions di Google Cloud Console: Batasi apiKey agar hanya dapat memanggil
 *      Identity Toolkit API dan layanan yang relevan.
 *    - Firebase App Check: Gunakan reCAPTCHA Enterprise / Cloudflare Turnstile untuk mencegah bot.
 * 3. JANGAN PERNAH MENYIMPAN KUNCI RAHASIA (SECRET KEYS) DI SISI KLIEN:
 *    Kunci rahasia seperti Service Account Private Key atau Admin SDK Credentials
 *    HANYA boleh disimpan di server backend yang aman, BUKAN di JavaScript browser.
 * 4. Password Tidak Boleh Disimpan di Penyimpanan Klien:
 *    Hanya alamat email yang disimpan di localStorage jika pengguna mencentang "Ingat saya".
 * ============================================================================
 */

import { auth, googleProvider, getFirebaseErrorMessage } from './firebase-config.js';
import {
  signInWithEmailAndPassword,
  signInWithPopup,
  onAuthStateChanged,
  setPersistence,
  browserLocalPersistence,
  browserSessionPersistence,
  sendPasswordResetEmail
} from "https://www.gstatic.com/firebasejs/10.14.0/firebase-auth.js";

document.addEventListener('DOMContentLoaded', () => {
  // --- Selektor Elemen DOM ---
  const form = document.getElementById('login-form');
  const emailInput = document.getElementById('email');
  const passwordInput = document.getElementById('password');
  const emailError = document.getElementById('email-error');
  const passwordError = document.getElementById('password-error');
  const submitBtn = document.getElementById('submit-btn');
  const btnText = document.getElementById('btn-text');
  const btnSpinner = document.getElementById('btn-spinner');
  const togglePasswordBtn = document.getElementById('toggle-password');
  const eyeIcon = document.getElementById('eye-icon');
  const eyeOffIcon = document.getElementById('eye-off-icon');
  const rememberMeCheckbox = document.getElementById('remember-me');
  const forgotPasswordLink = document.getElementById('forgot-password-link');
  const googleLoginBtn = document.getElementById('google-login-btn');
  const googleBtnText = document.getElementById('google-btn-text');
  const alertBox = document.getElementById('alert-box');
  const alertMessage = document.getElementById('alert-message');
  const alertIcon = document.getElementById('alert-icon');

  // Regex standar untuk validasi format email (RFC 5322 compatible)
  const EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;

  // Status interaksi pengguna (apakah input sudah pernah disentuh/diketik)
  const touched = {
    email: false,
    password: false,
  };

  /**
   * Pemeriksaan Status Autentikasi Pengguna
   * Jika pengguna sudah login, langsung arahkan ke dashboard.html
   */
  onAuthStateChanged(auth, (user) => {
    if (user) {
      window.location.href = 'dashboard.html';
    }
  });

  /**
   * Mengambil email tersimpan dari localStorage jika pengguna sebelumnya memilih "Ingat saya".
   * PERHATIAN: Password TIDAK PERNAH disimpan di localStorage demi keamanan.
   */
  const loadSavedEmail = () => {
    try {
      const savedEmail = localStorage.getItem('portal_remembered_email');
      if (savedEmail) {
        emailInput.value = savedEmail;
        rememberMeCheckbox.checked = true;
        touched.email = true;
        validateForm();
      }
    } catch (e) {
      console.warn('localStorage tidak dapat diakses:', e);
    }
  };

  /**
   * Validasi Input Email
   * @returns {boolean} Status validitas email
   */
  const validateEmail = () => {
    const value = emailInput.value.trim();

    if (!value) {
      if (touched.email) {
        setFieldError(emailInput, emailError, 'Alamat email wajib diisi.');
      } else {
        clearFieldError(emailInput, emailError);
      }
      return false;
    }

    if (!EMAIL_REGEX.test(value)) {
      if (touched.email) {
        setFieldError(emailInput, emailError, 'Format email tidak valid (contoh: user@domain.com).');
      }
      return false;
    }

    clearFieldError(emailInput, emailError);
    return true;
  };

  /**
   * Validasi Input Password
   * @returns {boolean} Status validitas password
   */
  const validatePassword = () => {
    const value = passwordInput.value;

    if (!value) {
      if (touched.password) {
        setFieldError(passwordInput, passwordError, 'Password wajib diisi.');
      } else {
        clearFieldError(passwordInput, passwordError);
      }
      return false;
    }

    if (value.length < 8) {
      if (touched.password) {
        setFieldError(passwordInput, passwordError, `Password minimal 8 karakter (saat ini ${value.length} karakter).`);
      }
      return false;
    }

    clearFieldError(passwordInput, passwordError);
    return true;
  };

  /**
   * Menampilkan pesan error dan mengaktifkan border merah pada input
   */
  const setFieldError = (inputEl, errorEl, message) => {
    inputEl.setAttribute('aria-invalid', 'true');
    errorEl.textContent = message;
  };

  /**
   * Menghapus pesan error dan menormalkan border input
   */
  const clearFieldError = (inputEl, errorEl) => {
    inputEl.setAttribute('aria-invalid', 'false');
    errorEl.textContent = '';
  };

  /**
   * Mengecek validitas form secara keseluruhan dan mengatur status tombol Masuk
   */
  const validateForm = () => {
    const isEmailValid = validateEmail();
    const isPasswordValid = validatePassword();
    const isFormValid = isEmailValid && isPasswordValid;

    // Tombol hanya aktif jika kedua input valid
    submitBtn.disabled = !isFormValid;
    return isFormValid;
  };

  // --- Event Listener untuk Input (Validasi Real-time & Blur) ---
  emailInput.addEventListener('input', () => {
    validateForm();
  });

  emailInput.addEventListener('blur', () => {
    touched.email = true;
    validateForm();
  });

  passwordInput.addEventListener('input', () => {
    validateForm();
  });

  passwordInput.addEventListener('blur', () => {
    touched.password = true;
    validateForm();
  });

  // --- Toggle Tampilkan / Sembunyikan Password ---
  togglePasswordBtn.addEventListener('click', () => {
    const isPassword = passwordInput.type === 'password';
    passwordInput.type = isPassword ? 'text' : 'password';

    // Perbarui aksesibilitas ARIA
    togglePasswordBtn.setAttribute('aria-pressed', isPassword ? 'true' : 'false');
    togglePasswordBtn.setAttribute(
      'aria-label',
      isPassword ? 'Sembunyikan password' : 'Tampilkan password'
    );

    // Ganti ikon mata
    if (isPassword) {
      eyeIcon.classList.add('hidden');
      eyeOffIcon.classList.remove('hidden');
    } else {
      eyeIcon.classList.remove('hidden');
      eyeOffIcon.classList.add('hidden');
    }

    passwordInput.focus();
  });

  /**
   * Menampilkan Notifikasi Alert Global (Sukses / Gagal)
   * @param {'success'|'error'} type Tipe pesan
   * @param {string} message Teks pesan yang ingin ditampilkan
   */
  const showAlert = (type, message) => {
    alertBox.hidden = false;
    alertBox.className = `alert-box ${type}`;
    alertMessage.textContent = message;

    if (type === 'success') {
      alertIcon.innerHTML = `
        <svg viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
        </svg>
      `;
    } else {
      alertIcon.innerHTML = `
        <svg viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/>
        </svg>
      `;
    }

    alertBox.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  };

  /**
   * Menyembunyikan Alert Global
   */
  const hideAlert = () => {
    alertBox.hidden = true;
    alertMessage.textContent = '';
  };

  /**
   * Mengatur Tampilan Loading pada Tombol Masuk
   * @param {boolean} isLoading Status apakah sedang mengirim permintaan
   */
  const setLoadingState = (isLoading) => {
    if (isLoading) {
      submitBtn.classList.add('loading');
      submitBtn.disabled = true;
      emailInput.disabled = true;
      passwordInput.disabled = true;
      btnText.textContent = 'Memverifikasi...';
    } else {
      submitBtn.classList.remove('loading');
      emailInput.disabled = false;
      passwordInput.disabled = false;
      btnText.textContent = 'Masuk';
      validateForm();
    }
  };

  // --- Handler Tautan "Lupa password?" (Firebase sendPasswordResetEmail) ---
  if (forgotPasswordLink) {
    forgotPasswordLink.addEventListener('click', async (e) => {
      e.preventDefault();

      const email = emailInput.value.trim();

      // Cek apakah email telah diisi dan valid
      if (!email || !EMAIL_REGEX.test(email)) {
        touched.email = true;
        setFieldError(emailInput, emailError, 'Masukkan alamat email yang valid untuk mengatur ulang password.');
        emailInput.focus();
        showAlert('error', 'Silakan masukkan alamat email yang valid pada kolom di atas terlebih dahulu.');
        return;
      }

      hideAlert();
      setLoadingState(true);
      btnText.textContent = 'Mengirim tautan...';

      try {
        await sendPasswordResetEmail(auth, email);
        showAlert('success', `Tautan reset password berhasil dikirim ke ${email}. Silakan periksa kotak masuk atau folder spam email Anda.`);
      } catch (err) {
        console.error('Firebase Reset Password Error:', err);
        const errorMsg = getFirebaseErrorMessage(err.code);
        showAlert('error', errorMsg);
      } finally {
        setLoadingState(false);
      }
    });
  }

  // --- Handler Masuk dengan Akun Google (signInWithPopup) ---
  if (googleLoginBtn) {
    googleLoginBtn.addEventListener('click', async () => {
      hideAlert();
      googleLoginBtn.disabled = true;
      const originalText = googleBtnText ? googleBtnText.textContent : 'Masuk dengan Google';
      if (googleBtnText) googleBtnText.textContent = 'Menghubungkan ke Google...';

      try {
        // Terapkan persistensi sesi sesuai preferensi checkbox "Ingat saya"
        const rememberMe = rememberMeCheckbox ? rememberMeCheckbox.checked : true;
        const persistence = rememberMe ? browserLocalPersistence : browserSessionPersistence;
        await setPersistence(auth, persistence);

        // Buka jendela popup autentikasi Google resmi
        const result = await signInWithPopup(auth, googleProvider);
        const user = result.user;
        const displayName = user.displayName || user.email.split('@')[0];

        showAlert('success', `Berhasil masuk dengan Google! Selamat datang, ${displayName}. Mengalihkan ke dashboard...`);

        setTimeout(() => {
          window.location.href = 'dashboard.html';
        }, 800);

      } catch (err) {
        console.error('Firebase Google Sign-In Error:', err);
        const errorMsg = getFirebaseErrorMessage(err.code);
        showAlert('error', errorMsg);
      } finally {
        googleLoginBtn.disabled = false;
        if (googleBtnText) googleBtnText.textContent = originalText;
      }
    });
  }

  // --- Handler Pengiriman Form (Firebase signInWithEmailAndPassword & setPersistence) ---
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    touched.email = true;
    touched.password = true;

    if (!validateForm()) {
      return;
    }

    hideAlert();
    setLoadingState(true);

    const email = emailInput.value.trim();
    const password = passwordInput.value;
    const rememberMe = rememberMeCheckbox.checked;

    try {
      // 1. Hubungkan checkbox "Ingat saya" ke setPersistence Firebase
      // browserLocalPersistence: Sesi tetap ada meski browser ditutup
      // browserSessionPersistence: Sesi berakhir saat tab/jendela ditutup
      const persistence = rememberMe ? browserLocalPersistence : browserSessionPersistence;
      await setPersistence(auth, persistence);

      // 2. Autentikasi pengguna menggunakan Firebase Authentication
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // 3. Simpan email untuk kenyamanan pengguna (HANYA EMAIL, TIDAK PERNAH PASSWORD)
      try {
        if (rememberMe) {
          localStorage.setItem('portal_remembered_email', email);
        } else {
          localStorage.removeItem('portal_remembered_email');
        }
      } catch (storageErr) {
        console.warn('Gagal mengakses localStorage:', storageErr);
      }

      // 4. Tampilkan pesan sukses dan arahkan ke dashboard.html
      const displayName = user.displayName || user.email.split('@')[0];
      showAlert('success', `Berhasil masuk! Selamat datang, ${displayName}. Mengalihkan ke dashboard...`);

      passwordInput.value = '';

      setTimeout(() => {
        window.location.href = 'dashboard.html';
      }, 1000);

    } catch (err) {
      console.error('Firebase Auth Login Error:', err);
      // Terjemahkan kode error Firebase ke bahasa Indonesia
      const errorMsg = getFirebaseErrorMessage(err.code);
      showAlert('error', errorMsg);
    } finally {
      setLoadingState(false);
    }
  });

  // Muat email tersimpan saat pertama kali dibuka
  loadSavedEmail();
});
