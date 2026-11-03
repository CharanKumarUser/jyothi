/* ==========================================================================
   Dr. N. Jyothi, MBBS — site interactions
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (window.lucide) window.lucide.createIcons();
  const year = $('#year');
  if (year) year.textContent = new Date().getFullYear();

  /* Header state */
  const header = $('#header');
  const onScroll = () => header?.classList.toggle('scrolled', window.scrollY > 10);
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* Rotating role */
  const roles = $$('.role-rotator span');
  if (roles.length > 1 && !reduce) {
    let i = 0;
    setInterval(() => {
      roles[i].classList.remove('is-on');
      i = (i + 1) % roles.length;
      const next = roles[i];
      setTimeout(() => next.classList.add('is-on'), 320);
    }, 2800);
  }

  /* Scroll spy */
  const links = $$('.menu a');
  const spy = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) links.forEach((l) => l.classList.toggle('active', l.getAttribute('href') === `#${e.target.id}`));
    });
  }, { rootMargin: '-45% 0px -50% 0px' });
  $$('main section[id]').forEach((s) => spy.observe(s));

  /* Mobile bottom sheet */
  const sheet = $('#sheet');
  const backdrop = $('#sheet-backdrop');
  const toggle = $('#menu-toggle');
  const setSheet = (open) => {
    sheet?.classList.toggle('open', open);
    backdrop?.classList.toggle('open', open);
    sheet?.setAttribute('aria-hidden', String(!open));
    toggle?.setAttribute('aria-expanded', String(open));
    document.body.style.overflow = open ? 'hidden' : '';
  };
  toggle?.addEventListener('click', () => setSheet(!sheet?.classList.contains('open')));
  backdrop?.addEventListener('click', () => setSheet(false));
  $$('#sheet a').forEach((a) => a.addEventListener('click', () => setSheet(false)));
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') setSheet(false); });

  /* Reveal + meters */
  $$('.meter').forEach((m) => m.style.setProperty('--v', m.dataset.v || 0));
  const reveals = $$('.reveal');
  const show = (el) => {
    el.classList.add('in');
    $$('.meter', el).forEach((m) => m.classList.add('on'));
  };
  if (reduce || !('IntersectionObserver' in window)) {
    reveals.forEach(show);
  } else {
    const counts = new Map();
    reveals.forEach((el) => {
      const n = counts.get(el.parentElement) || 0;
      el.style.setProperty('--d', `${Math.min(n * 0.07, 0.35)}s`);
      counts.set(el.parentElement, n + 1);
    });
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting) { show(e.target); io.unobserve(e.target); } });
    }, { threshold: 0.12, rootMargin: '0px 0px -30px 0px' });
    reveals.forEach((el) => io.observe(el));
  }

  /* Count-up */
  const countIO = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      const el = e.target;
      const to = parseInt(el.dataset.to, 10) || 0;
      countIO.unobserve(el);
      if (reduce) { el.textContent = to.toLocaleString(); return; }
      const t0 = performance.now();
      const tick = (t) => {
        const p = Math.min((t - t0) / 1600, 1);
        el.textContent = Math.round(to * (1 - Math.pow(1 - p, 3))).toLocaleString();
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    });
  }, { threshold: 0.5 });
  $$('.count').forEach((c) => countIO.observe(c));

  /* Spotlight cards */
  $$('.x-card').forEach((card) => {
    card.addEventListener('pointermove', (e) => {
      const r = card.getBoundingClientRect();
      card.style.setProperty('--x', `${e.clientX - r.left}px`);
      card.style.setProperty('--y', `${e.clientY - r.top}px`);
    });
    card.addEventListener('pointerleave', () => {
      card.style.setProperty('--x', '-300px');
      card.style.setProperty('--y', '-300px');
    });
  });

  /* Case tabs */
  const tabs = $$('.case-tab');
  tabs.forEach((tab) => tab.addEventListener('click', () => {
    tabs.forEach((t) => {
      const on = t === tab;
      t.classList.toggle('active', on);
      t.setAttribute('aria-selected', String(on));
      document.getElementById(t.getAttribute('aria-controls'))?.classList.toggle('active', on);
    });
    tab.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'nearest', inline: 'center' });
  }));

  /* Toast + copy */
  const toast = $('#toast');
  let tt;
  const notify = (msg) => {
    if (!toast) return;
    toast.textContent = msg;
    toast.classList.add('show');
    clearTimeout(tt);
    tt = setTimeout(() => toast.classList.remove('show'), 2600);
  };
  $$('[data-copy]').forEach((b) => b.addEventListener('click', () => {
    const v = b.dataset.copy;
    if (navigator.clipboard) navigator.clipboard.writeText(v).then(() => notify(`Copied ${v}`), () => notify(v));
    else notify(v);
  }));

  /* Consultation form */
  const val = (id) => ($(`#${id}`)?.value || '').trim();
  const valid = () => {
    let ok = true;
    ['f-name', 'f-phone'].forEach((id) => {
      const bad = !val(id);
      $(`#${id}`)?.closest('.field')?.classList.toggle('invalid', bad);
      if (bad) ok = false;
    });
    if (!ok) notify('Please enter your name and phone number.');
    return ok;
  };
  $$('.form input').forEach((i) => i.addEventListener('input', () => i.closest('.field')?.classList.remove('invalid')));

  $('#consultation-form')?.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!valid()) return;
    const subject = encodeURIComponent(`Consultation request: ${val('f-name')} (${val('f-type')})`);
    const body = encodeURIComponent(
      `Hello Dr. N. Jyothi,\n\nI would like to request a consultation.\n\n` +
      `Name: ${val('f-name')}\nPhone: ${val('f-phone')}\nType: ${val('f-type')}\n` +
      `Preferred date: ${val('f-date') || 'Earliest available'}\nDetails: ${val('f-notes') || '-'}\n\nSent via jyothi.online`
    );
    notify('Opening your email app…');
    window.location.href = `mailto:kiranjyothi5496@gmail.com?subject=${subject}&body=${body}`;
  });

  $('#f-wa')?.addEventListener('click', () => {
    let msg = 'Hello Dr. Jyothi, I am contacting you from jyothi.online.';
    if (val('f-name')) msg += `\nName: ${val('f-name')}`;
    if (val('f-phone')) msg += `\nPhone: ${val('f-phone')}`;
    msg += `\nType: ${val('f-type')}`;
    if (val('f-date')) msg += `\nPreferred date: ${val('f-date')}`;
    if (val('f-notes')) msg += `\nDetails: ${val('f-notes')}`;
    window.open(`https://wa.me/919381925918?text=${encodeURIComponent(msg)}`, '_blank', 'noopener');
  });
});
