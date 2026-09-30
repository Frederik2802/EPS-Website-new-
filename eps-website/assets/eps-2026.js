/* EPS GmbH — 2026 header and menu drawer.
   Runs next to the site's own scripts and replaces only the old top bar: the header turns to glass
   after 40px of scroll, and MENU opens a drawer with the sectors and product families.
   Drawer rules: the page behind is inert, focus stays inside, Escape closes it at once and focus
   returns to the button that opened it. */
(function () {
  "use strict";
  var root = document.documentElement;
  root.setAttribute('data-theme', 'dark');

  var top = document.querySelector('header.top');
  var menu = document.getElementById('menu');
  if (!top || !menu) return;

  var plain = root.classList.contains('plain');
  function onScroll() { top.classList.toggle('solid', plain || window.scrollY > 40); }
  addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  var openBtn = top.querySelector('.menu-btn');
  var panel = menu.querySelector('.menu-panel');
  var groups = [].slice.call(menu.querySelectorAll('.has-m2'));
  var fine = matchMedia('(hover: hover) and (pointer: fine)');
  var wide = matchMedia('(min-width: 901px)');
  var outside = [];
  function others() {
    return [].slice.call(document.body.children).filter(function (el) { return el !== menu && el.tagName !== 'SCRIPT'; });
  }
  var closeTimer = 0, lastFocus = null;

  function setGroup(li, on) {
    li.classList.toggle('open', on);
    var b = li.querySelector('.m1-t');
    if (b) b.setAttribute('aria-expanded', on ? 'true' : 'false');
  }
  function only(li) { groups.forEach(function (g) { setGroup(g, g === li); }); }

  function open() {
    clearTimeout(closeTimer);
    lastFocus = document.activeElement;
    menu.hidden = false;
    menu.classList.remove('instant');
    root.classList.add('menu-open');
    outside = others();
    outside.forEach(function (el) { el.inert = true; });
    openBtn.setAttribute('aria-expanded', 'true');
    // desktop opens on the first group so the drawer never shows an empty half
    if (wide.matches && groups.length) only(groups[0]); else only(null);
    void panel.offsetWidth;            // commit the closed state so the slide runs
    menu.classList.add('open');
    var first = menu.querySelector('.m1-t');
    if (first) first.focus({ preventScroll: true });
  }
  function close(instant) {
    if (menu.hidden) return;
    menu.classList.toggle('instant', !!instant);
    menu.classList.remove('open');
    root.classList.remove('menu-open');
    outside.forEach(function (el) { el.inert = false; });
    openBtn.setAttribute('aria-expanded', 'false');
    closeTimer = setTimeout(function () { menu.hidden = true; menu.classList.remove('instant'); }, instant ? 0 : 260);
    if (lastFocus && lastFocus.focus) lastFocus.focus({ preventScroll: true });
  }

  openBtn.addEventListener('click', open);
  menu.querySelectorAll('[data-close]').forEach(function (el) { el.addEventListener('click', function () { close(false); }); });

  groups.forEach(function (li) {
    var t = li.querySelector('.m1-t');
    t.addEventListener('click', function () {
      if (wide.matches) only(li); else setGroup(li, !li.classList.contains('open'));
    });
    // desktop with a real pointer: second level follows the pointer, after a short intent delay
    var hoverT = 0;
    t.addEventListener('pointerenter', function () {
      if (!fine.matches || !wide.matches) return;
      clearTimeout(hoverT); hoverT = setTimeout(function () { only(li); }, 90);
    });
    t.addEventListener('pointerleave', function () { clearTimeout(hoverT); });
    t.addEventListener('focus', function () { if (wide.matches) only(li); });
  });
  // plain first-level links close any open group on desktop hover/focus
  menu.querySelectorAll('.m1-i:not(.has-m2) > .m1-t').forEach(function (a) {
    a.addEventListener('focus', function () { if (wide.matches) only(null); });
  });

  // same-page anchors (home: #sectors, #range) close the drawer before jumping
  menu.querySelectorAll('a[href^="#"]').forEach(function (a) { a.addEventListener('click', function () { close(true); }); });

  document.addEventListener('keydown', function (e) {
    if (menu.hidden) return;
    if (e.key === 'Escape') { e.preventDefault(); close(true); return; }
    if (e.key !== 'Tab') return;
    var f = [].slice.call(panel.querySelectorAll('a[href], button:not([disabled])')).filter(function (el) {
      return el.offsetParent !== null && getComputedStyle(el).visibility !== 'hidden';
    });
    if (!f.length) return;
    var a = f[0], z = f[f.length - 1];
    if (e.shiftKey && document.activeElement === a) { e.preventDefault(); z.focus(); }
    else if (!e.shiftKey && document.activeElement === z) { e.preventDefault(); a.focus(); }
  });
  wide.addEventListener && wide.addEventListener('change', function () { if (!menu.hidden) close(true); });
})();
