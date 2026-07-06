/* ════════════════════════════════════════════════════════════════════
   app.js — صفحه اصلی رزرو نوبت / Main booking page
   ════════════════════════════════════════════════════════════════════ */

const API = {
  base: '/api',
  async get(path) {
    const res = await fetch(this.base + path);
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },
  async post(path, data) {
    const res = await fetch(this.base + path, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ message: t('serverError') }));
      throw new Error(err.message || t('serverError'));
    }
    return res.json();
  }
};

/* ── Translations ────────────────────────────────────────────────── */
const I18N = {
  fa: {
    pageTitle: 'دکتر حسین ابراهیمی مقدم | رزرو نوبت',
    brandTitle: 'دکتر حسین ابراهیمی مقدم',
    brandSub: 'روانشناس بالینی',
    navBook: 'رزرو نوبت',
    navAdmin: 'پنل مدیریت',
    heroBadge: '✦ مشاوره تخصصی روانشناسی',
    heroTitleLine1: 'نوبت آنلاین',
    heroTitleAccent: 'مطب دکتر ابراهیمی',
    heroDesc: 'از راحتی خانه‌تان، نوبت مشاوره خود را رزرو کنید. بدون انتظار، بدون تماس تلفنی.',
    statYearsVal: '+۲۰', statYears: 'سال تجربه',
    statPatientsVal: '+۵۰۰۰', statPatients: 'بیمار موفق',
    statSatisfactionVal: '۹۸٪', statSatisfaction: 'رضایت بیماران',
    profileName: 'دکتر حسین ابراهیمی مقدم',
    profileSpec: 'PhD روانشناسی بالینی',
    profileBadge: '✓ عضو سازمان نظام روانشناسی',
    bookingTitle: 'انتخاب نوبت',
    bookingDesc: 'یک بازه زمانی مناسب را انتخاب کنید',
    prevWeek: 'هفته قبل',
    nextWeek: 'هفته بعد',
    loadingWeek: 'در حال بارگذاری...',
    loadingSlots: 'در حال بارگذاری نوبت‌ها...',
    errorLoading: 'خطا در بارگذاری: ',
    noSlotsWeek: 'نوبتی برای این هفته تعریف نشده است.',
    noSlotsDay: 'نوبتی تعریف نشده',
    slotsAvailable: n => `${n} نوبت خالی`,
    slotsFull: 'تکمیل',
    slotsNone: 'بدون نوبت',
    modalTitle: 'تکمیل اطلاعات رزرو',
    labelName: 'نام و نام خانوادگی *', placeholderName: 'مثال: علی احمدی',
    labelAge: 'سن *', placeholderAge: '۲۵',
    labelPhone: 'شماره موبایل *', placeholderPhone: '۰۹۱۲۳۴۵۶۷۸۹',
    labelEmail: 'ایمیل (اختیاری)', placeholderEmail: 'example@email.com',
    labelNotes: 'توضیحات (اختیاری)', placeholderNotes: 'مختصری از دلیل مراجعه بنویسید...',
    cancel: 'انصراف',
    submit: 'تأیید و رزرو نوبت',
    submitting: 'در حال ثبت...',
    successTitle: 'نوبت شما با موفقیت ثبت شد!',
    successClose: 'متوجه شدم',
    successMsg: (name, date, time) => `${name} عزیز، نوبت شما برای ${date} ساعت ${time} ثبت شد.`,
    errorPrefix: 'خطا: ',
    serverError: 'خطای سرور',
    feature1Title: 'روانشناسی بالینی', feature1Desc: 'تخصص در درمان اضطراب، افسردگی و اختلالات خلقی',
    feature2Title: 'مشاوره زوجین', feature2Desc: 'بهبود روابط زناشویی و حل تعارضات خانوادگی',
    feature3Title: 'مشاوره خانواده', feature3Desc: 'رشد سالم فرزندان و بهبود روابط خانوادگی',
    feature4Title: 'روانشناسی مثبت', feature4Desc: 'ارتقای کیفیت زندگی و توسعه فردی',
    footerAddress: '📍 تهران، خیابان ولیعصر',
    footerPhone: '📞 ۰۲۱-XXXXXXXX',
    footerCopy: year => `© ${year} تمامی حقوق محفوظ است`,
    weekJoiner: ' تا ',
    locale: 'fa-IR'
  },
  en: {
    pageTitle: 'Dr. Hossein Ebrahimi Moghaddam | Book an Appointment',
    brandTitle: 'Dr. Hossein Ebrahimi Moghaddam',
    brandSub: 'Clinical Psychologist',
    navBook: 'Book Appointment',
    navAdmin: 'Admin Panel',
    heroBadge: '✦ Specialized Psychology Consultation',
    heroTitleLine1: 'Book Your Online',
    heroTitleAccent: 'Appointment Today',
    heroDesc: 'Book your consultation appointment from the comfort of your home. No waiting, no phone calls.',
    statYearsVal: '+20', statYears: 'Years of Experience',
    statPatientsVal: '+5000', statPatients: 'Successful Patients',
    statSatisfactionVal: '98%', statSatisfaction: 'Patient Satisfaction',
    profileName: 'Dr. Hossein Ebrahimi Moghaddam',
    profileSpec: 'PhD in Clinical Psychology',
    profileBadge: '✓ Member of the Psychology Organization',
    bookingTitle: 'Choose an Appointment',
    bookingDesc: 'Select a suitable time slot',
    prevWeek: 'Previous Week',
    nextWeek: 'Next Week',
    loadingWeek: 'Loading...',
    loadingSlots: 'Loading appointments...',
    errorLoading: 'Loading error: ',
    noSlotsWeek: 'No appointments are defined for this week.',
    noSlotsDay: 'No appointments',
    slotsAvailable: n => `${n} available`,
    slotsFull: 'Fully booked',
    slotsNone: 'No slots',
    modalTitle: 'Complete Booking Details',
    labelName: 'Full Name *', placeholderName: 'e.g. John Smith',
    labelAge: 'Age *', placeholderAge: '25',
    labelPhone: 'Mobile Number *', placeholderPhone: '0912 345 6789',
    labelEmail: 'Email (optional)', placeholderEmail: 'example@email.com',
    labelNotes: 'Notes (optional)', placeholderNotes: 'Briefly describe the reason for your visit...',
    cancel: 'Cancel',
    submit: 'Confirm Booking',
    submitting: 'Submitting...',
    successTitle: 'Your appointment was booked successfully!',
    successClose: 'Got it',
    successMsg: (name, date, time) => `Dear ${name}, your appointment on ${date} at ${time} has been confirmed.`,
    errorPrefix: 'Error: ',
    serverError: 'Server error',
    feature1Title: 'Clinical Psychology', feature1Desc: 'Expertise in treating anxiety, depression and mood disorders',
    feature2Title: 'Couples Counseling', feature2Desc: 'Improving marital relationships and resolving family conflicts',
    feature3Title: 'Family Counseling', feature3Desc: 'Healthy child development and improved family relationships',
    feature4Title: 'Positive Psychology', feature4Desc: 'Enhancing quality of life and personal development',
    footerAddress: '📍 Tehran, Valiasr Street',
    footerPhone: '📞 021-XXXXXXXX',
    footerCopy: year => `© ${year} All rights reserved`,
    weekJoiner: ' – ',
    locale: 'en-US'
  }
};

/* ── Language state ──────────────────────────────────────────────── */
let LANG = localStorage.getItem('site-lang') || 'fa';
function t(key) { return I18N[LANG][key]; }
function locale() { return I18N[LANG].locale; }

/* ── State ───────────────────────────────────────────────────────── */
let currentWeekStart = getSaturday(new Date());
let selectedSlotId   = null;

/* ── Helpers ─────────────────────────────────────────────────────── */
function getSaturday(date) {
  const d    = new Date(date);
  const diff = (d.getDay() + 1) % 7;
  d.setDate(d.getDate() - diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

// تخمین سال شمسی، فقط برای متن کپی‌رایت فوتر فارسی
function getJalaliYear(date) {
  const gy = date.getFullYear();
  const m  = date.getMonth() + 1;
  const d  = date.getDate();
  return (m > 3 || (m === 3 && d >= 21)) ? gy - 621 : gy - 622;
}

function formatTime(dateStr) {
  return new Date(dateStr).toLocaleTimeString(locale(), { hour: '2-digit', minute: '2-digit' });
}

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString(locale(), { month: 'long', day: 'numeric' });
}

function formatWeekday(dateStr) {
  return new Date(dateStr).toLocaleDateString(locale(), { weekday: 'long' });
}

function formatWeekLabel(start) {
  const end = new Date(start);
  end.setDate(end.getDate() + 6);
  return `${formatDate(start)}${t('weekJoiner')}${formatDate(end)}`;
}

/* ── i18n apply ──────────────────────────────────────────────────── */
function applyTranslations() {
  const dict = I18N[LANG];

  document.documentElement.lang = LANG;
  document.documentElement.dir  = LANG === 'fa' ? 'rtl' : 'ltr';
  document.body.classList.toggle('ltr', LANG === 'en');
  document.title = dict.pageTitle;

  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.dataset.i18n;
    if (dict[key] !== undefined) el.textContent = dict[key];
  });

  document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
    const key = el.dataset.i18nPlaceholder;
    if (dict[key] !== undefined) el.placeholder = dict[key];
  });

  const footerCopy = document.getElementById('footerCopy');
  if (footerCopy) {
    const year = LANG === 'fa' ? getJalaliYear(new Date()) : new Date().getFullYear();
    footerCopy.textContent = dict.footerCopy(year);
  }

  document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.lang === LANG);
  });
}

function setLanguage(lang) {
  if (lang === LANG) return;
  LANG = lang;
  localStorage.setItem('site-lang', lang);
  applyTranslations();
  loadSlots();
}

/* ── Load & render slots ─────────────────────────────────────────── */
async function loadSlots() {
  const container = document.getElementById('slotsContainer');
  container.innerHTML = `<div class="loading-state"><div class="spinner"></div><p>${t('loadingSlots')}</p></div>`;
  document.getElementById('weekLabel').textContent = formatWeekLabel(currentWeekStart);

  try {
    const z = n => String(n).padStart(2, '0');
    const localDate = `${currentWeekStart.getFullYear()}-${z(currentWeekStart.getMonth() + 1)}-${z(currentWeekStart.getDate())}`;
    const data = await API.get(`/slots/week?weekStart=${localDate}`);
    renderSlots(container, data.days);
  } catch (e) {
    container.innerHTML = `<div class="loading-state"><p style="color:var(--danger)">${t('errorLoading')}${e.message}</p></div>`;
  }
}

function renderSlots(container, days) {
  if (!days || days.length === 0) {
    container.innerHTML = `<div class="loading-state"><p>${t('noSlotsWeek')}</p></div>`;
    return;
  }

  const now      = new Date();
  const isMobile = window.innerWidth < 900;

  container.innerHTML = days.map((day, idx) => {
    const hasSlots    = day.slots.length > 0;
    const available   = day.slots.filter(s => s.isAvailable && new Date(s.startTime) > now).length;
    const countLabel  = hasSlots
      ? (available > 0 ? t('slotsAvailable')(available) : t('slotsFull'))
      : t('slotsNone');

    // اولین روز موبایل به صورت باز نمایش داده می‌شود
    const isOpen = idx === 0 && isMobile;

    const slotsHtml = hasSlots
      ? day.slots.map(slot => {
          const isPast   = new Date(slot.startTime) <= now;
          const isBooked = !slot.isAvailable;
          const disabled = isPast || isBooked;
          const cls      = 'slot-btn' + (isBooked ? ' booked' : '') + (isPast ? ' past' : '');
          const timeStr  = formatTime(slot.startTime);
          const endStr   = formatTime(slot.endTime);

          return `<button
            class="${cls}"
            ${disabled ? 'disabled' : ''}
            data-slot-id="${slot.id}"
            data-start="${slot.startTime}"
            data-end="${slot.endTime}"
          >
            <span class="slot-btn-time">${timeStr}</span>
            <span class="slot-btn-label">${endStr}</span>
            ${timeStr}<br/><small>${endStr}</small>
          </button>`;
        }).join('')
      : `<div class="no-slots">${t('noSlotsDay')}</div>`;

    return `
      <div class="day-column ${isOpen ? 'open' : ''}">
        <div class="day-header">
          <div class="day-header-info">
            <span class="day-name">${formatWeekday(day.date)}</span>
            <span class="day-date">${formatDate(day.date)}</span>
          </div>
          <span class="day-slot-count">${countLabel}</span>
          <svg class="day-toggle-icon" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"/>
          </svg>
        </div>
        <div class="day-slots-body">
          ${slotsHtml}
        </div>
      </div>`;
  }).join('');

  // آکاردئون — toggle روی موبایل
  container.querySelectorAll('.day-header').forEach(header => {
    header.addEventListener('click', () => {
      if (window.innerWidth >= 900) return;
      const col = header.closest('.day-column');
      col.classList.toggle('open');
    });
  });

  // رویداد کلیک نوبت
  container.querySelectorAll('.slot-btn:not(.booked):not(.past)').forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation();
      openBookingModal(
        parseInt(btn.dataset.slotId),
        btn.dataset.start,
        btn.dataset.end
      );
    });
  });
}

/* ── Booking Modal ───────────────────────────────────────────────── */
function openBookingModal(slotId, startTime, endTime) {
  selectedSlotId = slotId;
  document.getElementById('slotPreview').textContent =
    `📅 ${formatDate(startTime)}  ·  🕐 ${formatTime(startTime)} – ${formatTime(endTime)}`;
  document.getElementById('modalOverlay').style.display = 'flex';
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  document.getElementById('modalOverlay').style.display = 'none';
  document.getElementById('bookingForm').reset();
  document.body.style.overflow = '';
  selectedSlotId = null;
}

/* ── Submit booking ──────────────────────────────────────────────── */
document.getElementById('bookingForm').addEventListener('submit', async e => {
  e.preventDefault();
  const btn  = document.getElementById('submitBooking');
  const span = btn.querySelector('span');
  btn.disabled = true;
  span.textContent = t('submitting');

  try {
    const result = await API.post('/appointments', {
      patientName:  document.getElementById('patientName').value,
      patientPhone: document.getElementById('patientPhone').value,
      patientEmail: document.getElementById('patientEmail').value || null,
      age:          parseInt(document.getElementById('patientAge').value),
      notes:        document.getElementById('patientNotes').value || null,
      slotId:       selectedSlotId
    });
    closeModal();
    showSuccess(result);
    await loadSlots();
  } catch (err) {
    alert(t('errorPrefix') + err.message);
  } finally {
    btn.disabled = false;
    span.textContent = t('submit');
  }
});

/* ── Success Modal ───────────────────────────────────────────────── */
function showSuccess(appt) {
  document.getElementById('successMsg').textContent =
    t('successMsg')(appt.patientName, formatDate(appt.slotStart), formatTime(appt.slotStart));
  document.getElementById('successOverlay').style.display = 'flex';
  document.body.style.overflow = 'hidden';
}

/* ── Events ──────────────────────────────────────────────────────── */
document.getElementById('modalClose').addEventListener('click', closeModal);
document.getElementById('cancelBooking').addEventListener('click', closeModal);
document.getElementById('successClose').addEventListener('click', () => {
  document.getElementById('successOverlay').style.display = 'none';
  document.body.style.overflow = '';
});

document.getElementById('modalOverlay').addEventListener('click', e => {
  if (e.target === e.currentTarget) closeModal();
});
document.getElementById('successOverlay').addEventListener('click', e => {
  if (e.target === e.currentTarget) {
    document.getElementById('successOverlay').style.display = 'none';
    document.body.style.overflow = '';
  }
});

document.getElementById('prevWeek').addEventListener('click', () => {
  currentWeekStart.setDate(currentWeekStart.getDate() - 7);
  loadSlots();
});
document.getElementById('nextWeek').addEventListener('click', () => {
  currentWeekStart.setDate(currentWeekStart.getDate() + 7);
  loadSlots();
});

document.querySelectorAll('.lang-btn').forEach(btn => {
  btn.addEventListener('click', () => setLanguage(btn.dataset.lang));
});

// rerender on resize (mobile↔desktop)
let resizeTimer;
window.addEventListener('resize', () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(() => loadSlots(), 250);
});

/* ── Init ────────────────────────────────────────────────────────── */
applyTranslations();
loadSlots();
