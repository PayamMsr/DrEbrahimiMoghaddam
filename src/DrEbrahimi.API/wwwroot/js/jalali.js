/**
 * jalali.js — Jalali (Shamsi) Calendar Picker — Pure JS, zero dependencies
 * Globals: JalaliDate, JalaliCal
 */

// ── Jalali ↔ Gregorian conversion ────────────────────────────────────────
function _g2j(gy, gm, gd) {
  var g_y = gy - 1600, g_m = gm - 1, g_d = gd - 1;
  var g_day_no = 365 * g_y + ~~((g_y + 3) / 4) - ~~((g_y + 99) / 100) + ~~((g_y + 399) / 400);
  var g_md = [0,31,59,90,120,151,181,212,243,273,304,334];
  g_day_no += g_md[g_m] + (g_m > 1 && ((g_y % 4 === 0 && g_y % 100 !== 0) || g_y % 400 === 0) ? 1 : 0) + g_d;
  var j_day_no = g_day_no - 79;
  var j_np = ~~(j_day_no / 12053); j_day_no %= 12053;
  var jy = 979 + 33 * j_np + 4 * ~~(j_day_no / 1461); j_day_no %= 1461;
  if (j_day_no >= 366) { jy += ~~((j_day_no - 1) / 365); j_day_no = (j_day_no - 1) % 365; }
  var j_mi = [31,31,31,31,31,31,30,30,30,30,30,29];
  var i = 0;
  for (; i < 11 && j_day_no >= j_mi[i]; i++) j_day_no -= j_mi[i];
  return { jy: jy, jm: i + 1, jd: j_day_no + 1 };
}

function _j2g(jy, jm, jd) {
  var jy2 = jy - 979, jm2 = jm - 1, jd2 = jd - 1;
  var j_day_no = 365 * jy2 + ~~(jy2 / 33) * 8 + ~~(((jy2 % 33) + 3) / 4);
  var j_mi = [31,31,31,31,31,31,30,30,30,30,30,29];
  for (var i = 0; i < jm2; i++) j_day_no += j_mi[i];
  j_day_no += jd2;
  var g_day_no = j_day_no + 79;
  var gy = 1600 + 400 * ~~(g_day_no / 146097); g_day_no %= 146097;
  var leap = true;
  if (g_day_no >= 36525) {
    g_day_no--;
    gy += 100 * ~~(g_day_no / 36524); g_day_no %= 36524;
    if (g_day_no >= 365) g_day_no++; else leap = false;
  }
  gy += 4 * ~~(g_day_no / 1461); g_day_no %= 1461;
  if (g_day_no >= 366) { leap = false; g_day_no--; gy += ~~(g_day_no / 365); g_day_no %= 365; }
  var g_mi = [31, leap ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  var gm = 0;
  for (; gm < 12 && g_day_no >= g_mi[gm]; gm++) g_day_no -= g_mi[gm];
  return { gy: gy, gm: gm + 1, gd: g_day_no + 1 };
}

// ── JalaliDate class ──────────────────────────────────────────────────────
function JalaliDate(jy, jm, jd) {
  this.jy = jy; this.jm = jm; this.jd = jd;
}

JalaliDate.fromGregorian = function(date) {
  var r = _g2j(date.getFullYear(), date.getMonth() + 1, date.getDate());
  return new JalaliDate(r.jy, r.jm, r.jd);
};

JalaliDate.today = function() {
  return JalaliDate.fromGregorian(new Date());
};

JalaliDate.prototype.toGregorianDate = function() {
  var r = _j2g(this.jy, this.jm, this.jd);
  return new Date(r.gy, r.gm - 1, r.gd, 0, 0, 0, 0);
};

JalaliDate.prototype.toFarsiString = function() {
  var f = function(s) { return String(s).replace(/\d/g, function(d) { return '۰۱۲۳۴۵۶۷۸۹'[d]; }); };
  var z = function(n) { return f(String(n).padStart(2, '0')); };
  return f(this.jy) + '/' + z(this.jm) + '/' + z(this.jd);
};

JalaliDate.prototype.firstDayOfWeek = function() {
  // returns 0=Sat, 1=Sun, 2=Mon, 3=Tue, 4=Wed, 5=Thu, 6=Fri
  var r = _j2g(this.jy, this.jm, 1);
  var dow = new Date(r.gy, r.gm - 1, r.gd).getDay(); // 0=Sun..6=Sat
  return (dow + 1) % 7; // Sat=0
};

JalaliDate.prototype.daysInMonth = function() {
  if (this.jm <= 6) return 31;
  if (this.jm <= 11) return 30;
  // Esfand: leap check
  var y = this.jy;
  var a = ((y - (y > 0 ? 474 : 473)) % 2820 + 474 + 38) * 682 % 2816;
  return a < 682 ? 30 : 29;
};

// ── JalaliCal picker ──────────────────────────────────────────────────────
var _calInstances = [];

function JalaliCal(inputEl, opts) {
  this.input    = inputEl;
  this.opts     = opts || {};
  this.selected = null;    // JalaliDate | null
  this.onSelect = null;    // fn(gregorianDate, jalaliDate)
  this._popup   = null;
  this._vJY     = null;
  this._vJM     = null;
  this._open    = false;
  this._bind();
  _calInstances.push(this);
}

JalaliCal.prototype._bind = function() {
  var self = this;
  var toggle = function(e) { e.stopPropagation(); self._toggle(); };

  this.input.addEventListener('click', toggle);

  // Also bind the calendar icon if inside a .jalali-input-wrap
  var wrap = this.input.parentElement;
  if (wrap) {
    var icon = wrap.querySelector('.jalali-icon');
    if (icon) icon.addEventListener('click', toggle);
  }
};

JalaliCal.prototype._toggle = function() {
  if (this._open) { this._close(); return; }
  // close all others
  for (var i = 0; i < _calInstances.length; i++) {
    if (_calInstances[i] !== this) _calInstances[i]._close();
  }
  this._openCal();
};

JalaliCal.prototype._openCal = function() {
  this._open = true;
  var tod = JalaliDate.today();
  if (this.selected) {
    this._vJY = this.selected.jy;
    this._vJM = this.selected.jm;
  } else {
    this._vJY = tod.jy;
    this._vJM = tod.jm;
  }
  this._render();
};

JalaliCal.prototype._close = function() {
  if (this._popup) { this._popup.remove(); this._popup = null; }
  this._open = false;
};

JalaliCal.prototype._render = function() {
  var self = this;
  if (this._popup) { this._popup.remove(); this._popup = null; }

  var MONTHS = ['فروردین','اردیبهشت','خرداد','تیر','مرداد','شهریور','مهر','آبان','آذر','دی','بهمن','اسفند'];
  var DAYS   = ['ش','ی','د','س','چ','پ','ج'];
  var toF = function(s) { return String(s).replace(/\d/g, function(d) { return '۰۱۲۳۴۵۶۷۸۹'[d]; }); };

  var jy = this._vJY, jm = this._vJM;
  var ref = new JalaliDate(jy, jm, 1);
  var fd  = ref.firstDayOfWeek();  // 0=Sat
  var dim = ref.daysInMonth();
  var tod = JalaliDate.today();

  var minJ = this.opts.minDate ? JalaliDate.fromGregorian(this.opts.minDate) : null;
  var maxJ = this.opts.maxDate ? JalaliDate.fromGregorian(this.opts.maxDate) : null;

  // ── Build day headers ────────────────────────────────────────────
  var headerCells = '';
  for (var di = 0; di < DAYS.length; di++) {
    headerCells += '<th>' + DAYS[di] + '</th>';
  }

  // ── Build day cells ──────────────────────────────────────────────
  var cellsHtml = '<tr>';
  var col = 0;

  // Leading empty cells
  for (var e = 0; e < fd; e++) {
    cellsHtml += '<td class="jc-empty"></td>';
    col++;
    if (col % 7 === 0) cellsHtml += '</tr><tr>';
  }

  for (var d = 1; d <= dim; d++) {
    var isToday = (d === tod.jd && jm === tod.jm && jy === tod.jy);
    var isSel   = (self.selected && d === self.selected.jd && jm === self.selected.jm && jy === self.selected.jy);
    var dayCol  = (fd + d - 1) % 7; // 6 = Friday

    var pastMin = minJ && (
      jy < minJ.jy ||
      (jy === minJ.jy && jm < minJ.jm) ||
      (jy === minJ.jy && jm === minJ.jm && d < minJ.jd)
    );
    var pastMax = maxJ && (
      jy > maxJ.jy ||
      (jy === maxJ.jy && jm > maxJ.jm) ||
      (jy === maxJ.jy && jm === maxJ.jm && d > maxJ.jd)
    );
    var disabled = pastMin || pastMax;

    var cls = 'jc-day';
    if (isToday && !isSel) cls += ' jc-today';
    if (isSel)             cls += ' jc-selected';
    if (disabled)          cls += ' jc-disabled';
    if (dayCol === 6 && !isSel) cls += ' jc-friday';

    if (disabled) {
      cellsHtml += '<td class="' + cls + '">' + toF(d) + '</td>';
    } else {
      cellsHtml += '<td class="' + cls + '" data-day="' + d + '">' + toF(d) + '</td>';
    }

    col++;
    if (col % 7 === 0 && d < dim) cellsHtml += '</tr><tr>';
  }

  // Trailing empty cells to complete last row
  while (col % 7 !== 0) {
    cellsHtml += '<td class="jc-empty"></td>';
    col++;
  }
  cellsHtml += '</tr>';

  // ── Create popup DOM ─────────────────────────────────────────────
  var popup = document.createElement('div');
  popup.className = 'jc-popup';

  popup.innerHTML =
    '<div class="jc-header">' +
      '<button type="button" class="jc-nav" data-go="py">«</button>' +
      '<button type="button" class="jc-nav" data-go="pm">‹</button>' +
      '<span class="jc-title">' + MONTHS[jm - 1] + ' ' + toF(jy) + '</span>' +
      '<button type="button" class="jc-nav" data-go="nm">›</button>' +
      '<button type="button" class="jc-nav" data-go="ny">»</button>' +
    '</div>' +
    '<table class="jc-table">' +
      '<thead><tr>' + headerCells + '</tr></thead>' +
      '<tbody>' + cellsHtml + '</tbody>' +
    '</table>' +
    '<div class="jc-footer">' +
      '<button type="button" class="jc-today-btn" data-go="today">امروز</button>' +
    '</div>';

  // ── Attach to DOM (inside the input wrap so position:relative works) ──
  var wrap = this.input.parentElement;
  wrap.appendChild(popup);
  this._popup = popup;

  // ── Keep popup inside the viewport horizontally ────────────────────
  // (mobile uses a full-width bottom sheet via CSS, so only adjust on
  // the desktop/tablet layout where the popup is absolutely positioned
  // next to the input)
  if (window.innerWidth >= 480) {
    var wrapRect  = wrap.getBoundingClientRect();
    var popupRect = popup.getBoundingClientRect();
    var margin    = 10;
    // horizontal: default target is the popup's right edge aligned with the input's right edge
    var desiredLeft = wrapRect.right - popupRect.width;
    var maxLeft = window.innerWidth - popupRect.width - margin;
    var minLeft = margin;
    if (desiredLeft > maxLeft) desiredLeft = maxLeft;
    if (desiredLeft < minLeft) desiredLeft = minLeft;
    popup.style.right = 'auto';
    popup.style.left = (desiredLeft - wrapRect.left) + 'px';

    // vertical: flip above the input if it would overflow the bottom
    if (wrapRect.bottom + popupRect.height + margin > window.innerHeight) {
      popup.style.top = 'auto';
      popup.style.bottom = (wrapRect.height + 5) + 'px';
    }
  }

  // ── Navigation ───────────────────────────────────────────────────
  var navBtns = popup.querySelectorAll('[data-go]');
  for (var ni = 0; ni < navBtns.length; ni++) {
    (function(btn) {
      btn.addEventListener('mousedown', function(ev) {
        ev.preventDefault();
        ev.stopPropagation();
        var go = btn.getAttribute('data-go');
        if (go === 'pm') { self._vJM--; if (self._vJM < 1)  { self._vJM = 12; self._vJY--; } }
        if (go === 'nm') { self._vJM++; if (self._vJM > 12) { self._vJM = 1;  self._vJY++; } }
        if (go === 'py') self._vJY--;
        if (go === 'ny') self._vJY++;
        if (go === 'today') { self._vJY = tod.jy; self._vJM = tod.jm; }
        self._render();
      });
    })(navBtns[ni]);
  }

  // ── Day selection ─────────────────────────────────────────────────
  var dayCells = popup.querySelectorAll('[data-day]');
  for (var ci = 0; ci < dayCells.length; ci++) {
    (function(td) {
      td.addEventListener('mousedown', function(ev) {
        ev.preventDefault();
        ev.stopPropagation();
        var day = parseInt(td.getAttribute('data-day'), 10);
        self.selected = new JalaliDate(self._vJY, self._vJM, day);
        self.input.value = self.selected.toFarsiString();
        self.input.classList.add('jc-has-value');
        var gDate = self.selected.toGregorianDate();
        if (typeof self.onSelect === 'function') self.onSelect(gDate, self.selected);
        self._close();
      });
    })(dayCells[ci]);
  }

  // ── Close on outside mousedown ───────────────────────────────────
  setTimeout(function() {
    var handler = function(ev) {
      if (!popup.contains(ev.target) && ev.target !== self.input) {
        self._close();
        document.removeEventListener('mousedown', handler);
      }
    };
    document.addEventListener('mousedown', handler);
  }, 0);
};

JalaliCal.prototype.setValue = function(gDate) {
  this.selected = JalaliDate.fromGregorian(gDate);
  this.input.value = this.selected.toFarsiString();
  this.input.classList.add('jc-has-value');
};

JalaliCal.prototype.clear = function() {
  this.selected = null;
  this.input.value = '';
  this.input.classList.remove('jc-has-value');
  this._close();
};

JalaliCal.prototype.getDate = function() {
  return this.selected ? this.selected.toGregorianDate() : null;
};

// Close all pickers on Escape
document.addEventListener('keydown', function(e) {
  if (e.key === 'Escape') {
    for (var i = 0; i < _calInstances.length; i++) _calInstances[i]._close();
  }
});
