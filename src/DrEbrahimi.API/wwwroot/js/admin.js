/* ════════════════════════════════════════════════════════════════════
   admin.js — پنل مدیریت دکتر ابراهیمی مقدم
   ════════════════════════════════════════════════════════════════════ */

/* Auth guard در <head> اجرا شده — اینجا تکرار نمی‌شود */

/* ── Show username ───────────────────────────────────────────────── */
var _username = localStorage.getItem('admin_username') || 'admin';
var _userLbl  = document.getElementById('adminUserLabel');
if (_userLbl) _userLbl.textContent = 'خوش آمدید، ' + _username;

/* ── Logout ──────────────────────────────────────────────────────── */
function logout() {
  localStorage.removeItem('admin_token');
  localStorage.removeItem('admin_token_exp');
  localStorage.removeItem('admin_username');
  window.location.replace('/login.html');
}
document.getElementById('logoutBtn').addEventListener('click', logout);

/* ── API client ──────────────────────────────────────────────────── */
var API = {
  _token: function () { return localStorage.getItem('admin_token') || ''; },

  _authHeaders: function () {
    return { 'Authorization': 'Bearer ' + this._token() };
  },

  get: async function (path) {
    var res = await fetch('/api' + path, { headers: this._authHeaders() });
    if (res.status === 401) { logout(); return null; }
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },

  post: async function (path, data) {
    var res = await fetch('/api' + path, {
      method: 'POST',
      headers: Object.assign({ 'Content-Type': 'application/json' }, this._authHeaders()),
      body: JSON.stringify(data)
    });
    if (res.status === 401) { logout(); return null; }
    if (!res.ok) {
      var err = await res.json().catch(function () { return { message: 'خطای سرور' }; });
      throw new Error(err.message || 'خطای سرور');
    }
    return res.json();
  },

  del: async function (path) {
    var res = await fetch('/api' + path, { method: 'DELETE', headers: this._authHeaders() });
    if (res.status === 401) { logout(); return null; }
    if (!res.ok) throw new Error(await res.text());
    return res;
  },

  patch: async function (path, data) {
    var res = await fetch('/api' + path, {
      method: 'PATCH',
      headers: Object.assign({ 'Content-Type': 'application/json' }, this._authHeaders()),
      body: JSON.stringify(data)
    });
    if (res.status === 401) { logout(); return null; }
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  }
};

/* ── State ───────────────────────────────────────────────────────── */
var adminWeekStart  = _getSaturday(new Date());
var allAppointments = [];
var currentFilter   = 'all';
var currentDayFilter = null; // Gregorian Date | null
var slotMode        = 'single';

// Calendar instances (created after DOM ready)
var calStart = null, calEnd = null, calBulk = null;

// Selected Gregorian dates from calendars
var pickedStart = null, pickedEnd = null, pickedBulk = null;

/* ── Helpers ─────────────────────────────────────────────────────── */
function _getSaturday(date) {
  var d = new Date(date);
  var diff = (d.getDay() + 1) % 7; // Sat=0
  d.setDate(d.getDate() - diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

function _fmtTime(str) {
  return new Date(str).toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' });
}

function _fmtDate(str) {
  return new Date(str).toLocaleDateString('fa-IR', { month: 'long', day: 'numeric' });
}

function _weekLabel(start) {
  var end = new Date(start);
  end.setDate(end.getDate() + 6);
  return _fmtDate(start) + ' تا ' + _fmtDate(end);
}

function _statusLabel(s) {
  var map = { Pending: 'در انتظار', Confirmed: 'تأیید شده', Cancelled: 'لغو شده', Completed: 'تکمیل شده' };
  return map[s] || s;
}

/* ── Sidebar tab switching ───────────────────────────────────────── */
document.querySelectorAll('.sidebar-item').forEach(function (item) {
  item.addEventListener('click', function () {
    document.querySelectorAll('.sidebar-item').forEach(function (i) { i.classList.remove('active'); });
    document.querySelectorAll('.tab-content').forEach(function (t) { t.classList.remove('active'); });
    item.classList.add('active');
    document.getElementById('tab-' + item.dataset.tab).classList.add('active');
    if (item.dataset.tab === 'appointments') loadAppointments();
  });
});

/* ── Week navigation ─────────────────────────────────────────────── */
document.getElementById('adminPrevWeek').addEventListener('click', function () {
  adminWeekStart.setDate(adminWeekStart.getDate() - 7);
  loadAdminSlots();
});
document.getElementById('adminNextWeek').addEventListener('click', function () {
  adminWeekStart.setDate(adminWeekStart.getDate() + 7);
  loadAdminSlots();
});

/* ── Load & render slots ─────────────────────────────────────────── */
async function loadAdminSlots() {
  var grid = document.getElementById('adminSlotsGrid');
  grid.innerHTML = '<div class="loading-state"><div class="spinner"></div><p>در حال بارگذاری...</p></div>';
  document.getElementById('adminWeekLabel').textContent = _weekLabel(adminWeekStart);

  try {
    // از toISOString استفاده نمی‌کنیم چون UTC است و ممکن است روز را عوض کند
    var z = function(n) { return String(n).padStart(2,'0'); };
    var localDate = adminWeekStart.getFullYear() + '-' +
      z(adminWeekStart.getMonth() + 1) + '-' +
      z(adminWeekStart.getDate());
    var res = await fetch('/api/slots/week?weekStart=' + localDate);
    var data = await res.json();
    _renderSlots(grid, data.days);
  } catch (e) {
    grid.innerHTML = '<div class="loading-state"><p style="color:var(--danger)">' + e.message + '</p></div>';
  }
}

function _renderSlots(grid, days) {
  if (!days || days.length === 0) {
    grid.innerHTML = '<div class="loading-state"><p>داده‌ای یافت نشد.</p></div>';
    return;
  }

  grid.innerHTML = days.map(function (day) {
    var slotsHtml = day.slots.length === 0
      ? '<div class="no-slots">بدون نوبت</div>'
      : day.slots.map(function (slot) {
          return '<div class="admin-slot-item' + (slot.isAvailable ? '' : ' booked') + '">' +
            '<span>' + _fmtTime(slot.startTime) + '–' + _fmtTime(slot.endTime) + '</span>' +
            '<div class="slot-actions">' +
              (!slot.isAvailable ? '<span class="slot-booked-label">رزرو</span>' : '') +
              '<button class="slot-delete-btn" data-id="' + slot.id + '" data-booked="' + (!slot.isAvailable) + '" title="حذف نوبت">✕</button>' +
            '</div>' +
          '</div>';
        }).join('');

    return '<div class="day-column">' +
      '<div class="day-header">' +
        '<div class="day-name">' + day.dayName + '</div>' +
        '<div class="day-date">' + _fmtDate(day.date) + '</div>' +
      '</div>' + slotsHtml +
    '</div>';
  }).join('');

  grid.querySelectorAll('.slot-delete-btn').forEach(function (btn) {
    btn.addEventListener('click', async function () {
      var isBooked = btn.dataset.booked === 'true';
      var msg = isBooked
        ? 'این نوبت رزرو شده است. حذف آن باعث لغو رزرو بیمار می‌شود.\nآیا مطمئن هستید؟'
        : 'این نوبت حذف شود؟';
      if (!confirm(msg)) return;
      try {
        await API.del('/slots/' + btn.dataset.id);
        await loadAdminSlots();
      } catch (e) { alert('خطا در حذف: ' + e.message); }
    });
  });
}

/* ── Modal open/close ────────────────────────────────────────────── */
document.getElementById('openAddSlotModal').addEventListener('click', function () {
  // Reset form & dates first
  _resetDates();
  document.getElementById('singleSlotForm').reset();
  document.getElementById('bulkSlotForm').reset();
  // Reset tab to single
  document.querySelectorAll('.tab-pill').forEach(function (p) { p.classList.remove('active'); });
  document.querySelector('.tab-pill[data-mode="single"]').classList.add('active');
  document.getElementById('singleSlotForm').style.display = 'flex';
  document.getElementById('bulkSlotForm').style.display   = 'none';
  slotMode = 'single';
  // Show modal
  document.getElementById('addSlotOverlay').style.display = 'flex';
});

function _closeModal() {
  document.getElementById('addSlotOverlay').style.display = 'none';
  _resetDates();
}

function _resetDates() {
  pickedStart = pickedEnd = pickedBulk = null;
  if (calStart) calStart.clear();
  if (calEnd)   calEnd.clear();
  if (calBulk)  calBulk.clear();
}

document.getElementById('closeAddSlot').addEventListener('click', _closeModal);
document.getElementById('cancelSingleSlot').addEventListener('click', _closeModal);
document.getElementById('cancelBulkSlot').addEventListener('click', _closeModal);
document.getElementById('addSlotOverlay').addEventListener('click', function (e) {
  if (e.target === e.currentTarget) _closeModal();
});

/* ── Mode tabs ───────────────────────────────────────────────────── */
document.querySelectorAll('.tab-pill').forEach(function (pill) {
  pill.addEventListener('click', function () {
    document.querySelectorAll('.tab-pill').forEach(function (p) { p.classList.remove('active'); });
    pill.classList.add('active');
    slotMode = pill.dataset.mode;
    document.getElementById('singleSlotForm').style.display = slotMode === 'single' ? 'flex' : 'none';
    document.getElementById('bulkSlotForm').style.display   = slotMode === 'bulk'   ? 'flex' : 'none';
  });
});

/* ── Single slot submit ──────────────────────────────────────────── */
document.getElementById('singleSlotForm').addEventListener('submit', async function (e) {
  e.preventDefault();
  if (!pickedStart) { alert('لطفاً تاریخ شروع را از تقویم انتخاب کنید.'); return; }
  if (!pickedEnd)   { alert('لطفاً تاریخ پایان را از تقویم انتخاب کنید.');  return; }

  var startTimeStr = document.getElementById('slotStartTime').value;
  var endTimeStr   = document.getElementById('slotEndTime').value;
  if (!startTimeStr || !endTimeStr) { alert('ساعت شروع و پایان را وارد کنید.'); return; }

  // ارسال سال/ماه/روز و ساعت/دقیقه به‌صورت عدد صحیح — بدون هیچ timezone
  try {
    await API.post('/slots', {
      year        : pickedStart.getFullYear(),
      month       : pickedStart.getMonth() + 1,
      day         : pickedStart.getDate(),
      startHour   : parseInt(startTimeStr.split(':')[0], 10),
      startMinute : parseInt(startTimeStr.split(':')[1], 10),
      endHour     : parseInt(endTimeStr.split(':')[0], 10),
      endMinute   : parseInt(endTimeStr.split(':')[1], 10)
    });
    _closeModal();
    await loadAdminSlots();
  } catch (err) { alert('خطا: ' + err.message); }
});

/* ── Bulk slots submit ───────────────────────────────────────────── */
document.getElementById('bulkSlotForm').addEventListener('submit', async function (e) {
  e.preventDefault();
  if (!pickedBulk) { alert('لطفاً تاریخ را از تقویم انتخاب کنید.'); return; }

  var startStr = document.getElementById('bulkStart').value;
  var endStr   = document.getElementById('bulkEnd').value;
  var duration = parseInt(document.getElementById('bulkDuration').value, 10);
  var brk      = parseInt(document.getElementById('bulkBreak').value, 10) || 0;

  if (!startStr || !endStr) { alert('ساعت شروع و پایان را وارد کنید.'); return; }
  if (isNaN(duration) || duration < 1) { alert('مدت نوبت را وارد کنید.'); return; }

  // ارسال همه مقادیر به‌صورت عدد صحیح — بدون هیچ DateTime یا string تاریخ
  try {
    var result = await API.post('/slots/bulk', {
      year            : pickedBulk.getFullYear(),
      month           : pickedBulk.getMonth() + 1,
      day             : pickedBulk.getDate(),
      startHour       : parseInt(startStr.split(':')[0], 10),
      startMinute     : parseInt(startStr.split(':')[1], 10),
      endHour         : parseInt(endStr.split(':')[0],   10),
      endMinute       : parseInt(endStr.split(':')[1],   10),
      durationMinutes : duration,
      breakMinutes    : brk
    });
    _closeModal();
    if (result) alert(result.length + ' نوبت با موفقیت ایجاد شد.');
    await loadAdminSlots();
  } catch (err) { alert('خطا: ' + err.message); }
});

/* ── Appointments ────────────────────────────────────────────────── */
async function loadAppointments() {
  var container = document.getElementById('appointmentsTable');
  container.innerHTML = '<div class="loading-state"><div class="spinner"></div><p>در حال بارگذاری...</p></div>';
  try {
    allAppointments = await API.get('/appointments');
    if (allAppointments) renderAppointments();
  } catch (e) {
    container.innerHTML = '<p style="color:var(--danger);padding:20px">' + e.message + '</p>';
  }
}

function renderAppointments() {
  var container = document.getElementById('appointmentsTable');

  // فیلتر وضعیت
  var filtered = currentFilter === 'all'
    ? allAppointments
    : allAppointments.filter(function (a) { return a.status === currentFilter; });

  // فیلتر روز
  if (currentDayFilter) {
    var yy = currentDayFilter.getFullYear();
    var mm = currentDayFilter.getMonth();
    var dd = currentDayFilter.getDate();
    filtered = filtered.filter(function (a) {
      var d = new Date(a.slotStart);
      return d.getFullYear() === yy && d.getMonth() === mm && d.getDate() === dd;
    });
  }

  if (filtered.length === 0) {
    var msg = currentDayFilter
      ? 'هیچ نوبتی برای روز ' + _fmtDate(currentDayFilter.toISOString()) + ' یافت نشد.'
      : 'نوبتی یافت نشد.';
    container.innerHTML = '<div class="empty-state"><p>' + msg + '</p></div>';
    return;
  }

  // کارت‌ها برای موبایل
  var cards = filtered.map(function (a) {
    return '<div class="appt-card">' +
      '<div class="appt-card-header">' +
        '<span class="appt-card-name">' + a.patientName + '</span>' +
        '<span class="status-badge status-' + a.status + '">' + _statusLabel(a.status) + '</span>' +
      '</div>' +
      '<div class="appt-card-body">' +
        '<div class="appt-card-field"><span class="appt-card-label">موبایل</span><span class="appt-card-value" style="direction:ltr;text-align:right">' + a.patientPhone + '</span></div>' +
        '<div class="appt-card-field"><span class="appt-card-label">سن</span><span class="appt-card-value">' + a.age + ' سال</span></div>' +
        '<div class="appt-card-field"><span class="appt-card-label">تاریخ</span><span class="appt-card-value">' + _fmtDate(a.slotStart) + '</span></div>' +
        '<div class="appt-card-field"><span class="appt-card-label">ساعت</span><span class="appt-card-value">' + _fmtTime(a.slotStart) + ' – ' + _fmtTime(a.slotEnd) + '</span></div>' +
      '</div>' +
      '<div class="appt-card-actions action-btns">' +
        (a.status === 'Pending' ? '<button class="act-btn confirm" data-id="' + a.id + '" data-action="confirm">تأیید</button>' : '') +
        (a.status !== 'Cancelled' && a.status !== 'Completed' ? '<button class="act-btn cancel" data-id="' + a.id + '" data-action="cancel">لغو</button>' : '') +
      '</div>' +
    '</div>';
  }).join('');

  // جدول برای دسکتاپ
  var rows = filtered.map(function (a, i) {
    return '<tr>' +
      '<td>' + (i + 1) + '</td>' +
      '<td><strong>' + a.patientName + '</strong></td>' +
      '<td style="direction:ltr;text-align:right">' + a.patientPhone + '</td>' +
      '<td>' + a.age + ' سال</td>' +
      '<td>' + _fmtDate(a.slotStart) + '</td>' +
      '<td>' + _fmtTime(a.slotStart) + ' – ' + _fmtTime(a.slotEnd) + '</td>' +
      '<td><span class="status-badge status-' + a.status + '">' + _statusLabel(a.status) + '</span></td>' +
      '<td><div class="action-btns">' +
        (a.status === 'Pending' ? '<button class="act-btn confirm" data-id="' + a.id + '" data-action="confirm">تأیید</button>' : '') +
        (a.status !== 'Cancelled' && a.status !== 'Completed' ? '<button class="act-btn cancel" data-id="' + a.id + '" data-action="cancel">لغو</button>' : '') +
      '</div></td>' +
    '</tr>';
  }).join('');

  container.innerHTML =
    '<div class="appt-cards">' + cards + '</div>' +
    '<table class="appt-table">' +
      '<thead><tr><th>#</th><th>نام بیمار</th><th>موبایل</th><th>سن</th><th>تاریخ</th><th>ساعت</th><th>وضعیت</th><th>عملیات</th></tr></thead>' +
      '<tbody>' + rows + '</tbody>' +
    '</table>';

  container.querySelectorAll('.act-btn').forEach(function (btn) {
    btn.addEventListener('click', async function () {
      var id = parseInt(btn.dataset.id, 10);
      try {
        if (btn.dataset.action === 'cancel')
          await API.del('/appointments/' + id + '/cancel');
        else
          await API.patch('/appointments/status', { appointmentId: id, status: 'Confirmed' });
        await loadAppointments();
      } catch (e) { alert('خطا: ' + e.message); }
    });
  });
}

document.querySelectorAll('.filter-chips .chip').forEach(function (chip) {
  chip.addEventListener('click', function () {
    document.querySelectorAll('.filter-chips .chip').forEach(function (c) { c.classList.remove('active'); });
    chip.classList.add('active');
    currentFilter = chip.dataset.filter;
    renderAppointments();
  });
});

/* ── Init calendars (after DOM is ready) ─────────────────────────── */
function initCalendars() {
  var today = new Date();
  today.setHours(0, 0, 0, 0);

  // Single slot — start date
  calStart = new JalaliCal(document.getElementById('slotStartDateDisplay'), { minDate: today });
  calStart.onSelect = function (gDate) {
    pickedStart = gDate;
    // Auto-fill end date with same date if not picked yet
    if (!pickedEnd) {
      pickedEnd = new Date(gDate);
      calEnd.setValue(pickedEnd);
    }
  };

  // Single slot — end date
  calEnd = new JalaliCal(document.getElementById('slotEndDateDisplay'), { minDate: today });
  calEnd.onSelect = function (gDate) { pickedEnd = gDate; };

  // Bulk — date
  calBulk = new JalaliCal(document.getElementById('bulkDateDisplay'), { minDate: today });
  calBulk.onSelect = function (gDate) { pickedBulk = gDate; };

  // Day filter (no minDate — can filter past days too)
  var calDayFilter = new JalaliCal(document.getElementById('dayFilterDisplay'), {});
  calDayFilter.onSelect = function (gDate) {
    currentDayFilter = gDate;
    document.getElementById('clearDayFilter').style.display = '';
    renderAppointments();
  };

  document.getElementById('clearDayFilter').addEventListener('click', function () {
    currentDayFilter = null;
    calDayFilter.clear();
    this.style.display = 'none';
    renderAppointments();
  });
}

/* ── Boot ────────────────────────────────────────────────────────── */
initCalendars();
loadAdminSlots();
