/* ════════════════════════════════════════════════════════════════════
   animations.js — Scroll-reveal for elements as they enter the viewport.
   Works alongside the CSS load-in animations already applied to the
   header/hero via style.css. Elements marked with "reveal" or
   "reveal-stagger" fade + slide into place the first time they're seen.
   ════════════════════════════════════════════════════════════════════ */
(function () {
  var targets = document.querySelectorAll('.reveal, .reveal-stagger');
  if (!targets.length) return;

  // If the browser can't do IntersectionObserver, just show everything.
  if (!('IntersectionObserver' in window)) {
    targets.forEach(function (el) { el.classList.add('in-view'); });
    return;
  }

  var observer = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15, rootMargin: '0px 0px -40px 0px' }
  );

  targets.forEach(function (el) { observer.observe(el); });
})();
