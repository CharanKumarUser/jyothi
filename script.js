/* ==========================================================================
   Dr. N. Jyothi, MBBS — "The Clinical Dossier" interactions
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  const $ = (s, root = document) => root.querySelector(s);
  const $$ = (s, root = document) => Array.from(root.querySelectorAll(s));
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (window.lucide) window.lucide.createIcons();
  const yearEl = $('#year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------- Theme ---------- */
  $('#theme-toggle-btn')?.addEventListener('click', () => {
    const next = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('theme', next);
  });

  /* ---------- Typing roles ---------- */
  const roles = [
    'General Physician',
    'Duty Medical Officer',
    'Emergency & Casualty Clinician',
    'Inpatient & ICU Physician',
    'Maternal & Child Health Advocate'
  ];
  const roleEl = $('#dynamic-role');
  if (roleEl && !reduceMotion) {
    let r = 0, c = roles[0].length, deleting = false;
    const tick = () => {
      const word = roles[r];
      c += deleting ? -1 : 1;
      roleEl.textContent = word.slice(0, c);
      let delay = deleting ? 35 : 70;
      if (!deleting && c === word.length) { deleting = true; delay = 2200; }
      else if (deleting && c === 0) { deleting = false; r = (r + 1) % roles.length; delay = 350; }
      setTimeout(tick, delay);
    };
    setTimeout(() => { deleting = true; tick(); }, 2600);
  }

  /* ---------- Monitor waveforms ---------- */
  const wavePeriod = {
    ecg: (x0) => `L${x0 + 40} 24 Q${x0 + 48} 18 ${x0 + 56} 24 L${x0 + 70} 24 L${x0 + 74} 28 L${x0 + 80} 4 L${x0 + 86} 36 L${x0 + 90} 24 L${x0 + 110} 24 Q${x0 + 124} 14 ${x0 + 138} 24 L${x0 + 200} 24`,
    pleth: (x0) => `L${x0 + 30} 30 C${x0 + 50} 30 ${x0 + 58} 6 ${x0 + 72} 6 C${x0 + 86} 6 ${x0 + 92} 20 ${x0 + 100} 22 C${x0 + 106} 24 ${x0 + 110} 16 ${x0 + 118} 18 C${x0 + 140} 22 ${x0 + 170} 30 ${x0 + 200} 30`,
    resp: (x0) => `C${x0 + 50} 6 ${x0 + 50} 6 ${x0 + 100} 20 C${x0 + 150} 34 ${x0 + 150} 34 ${x0 + 200} 20`,
    abp: (x0) => `L${x0 + 40} 32 C${x0 + 52} 32 ${x0 + 56} 6 ${x0 + 66} 6 C${x0 + 76} 6 ${x0 + 80} 18 ${x0 + 86} 20 L${x0 + 90} 17 C${x0 + 100} 20 ${x0 + 150} 32 ${x0 + 200} 32`
  };
  $$('.wave').forEach((svg) => {
    const fn = wavePeriod[svg.dataset.type] || wavePeriod.ecg;
    const startY = svg.dataset.type === 'resp' ? 20 : svg.dataset.type === 'ecg' ? 24 : svg.dataset.type === 'pleth' ? 30 : 32;
    let d = `M0 ${startY} `;
    for (let i = 0; i < 3; i++) d += fn(i * 200) + ' ';
    svg.querySelector('path')?.setAttribute('d', d.trim());
  });

  /* ---------- Header, progress, back-to-top ---------- */
  const header = $('#site-header');
  const progress = $('#scroll-progress-bar');
  const backTop = $('#back-to-top');
  let ticking = false;
  const onScroll = () => {
    const y = window.scrollY;
    const max = document.documentElement.scrollHeight - window.innerHeight;
    header?.classList.toggle('scrolled', y > 20);
    backTop?.classList.toggle('visible', y > 700);
    if (progress) progress.style.width = `${max > 0 ? (y / max) * 100 : 0}%`;
    ticking = false;
  };
  window.addEventListener('scroll', () => { if (!ticking) { requestAnimationFrame(onScroll); ticking = true; } }, { passive: true });
  onScroll();
  backTop?.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

  /* ---------- Scroll spy (top nav + side index) ---------- */
  const navLinks = $$('.nav-link');
  const sideLinks = $$('.side-index a');
  const sideIndex = $('.side-index');
  const spy = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      const id = `#${e.target.id}`;
      navLinks.forEach((l) => l.classList.toggle('active', l.getAttribute('href') === id));
      sideLinks.forEach((l) => l.classList.toggle('active', l.getAttribute('href') === id));
      sideIndex?.classList.toggle('on-dark', e.target.id === 'contact');
    });
  }, { rootMargin: '-45% 0px -50% 0px' });
  $$('main section[id]').forEach((s) => spy.observe(s));

  /* ---------- Mobile menu ---------- */
  const overlay = $('#mobile-drawer');
  const toggle = $('#mobile-toggle');
  const setMenu = (open) => {
    overlay?.classList.toggle('active', open);
    overlay?.setAttribute('aria-hidden', String(!open));
    header?.classList.toggle('menu-open', open);
    toggle?.setAttribute('aria-expanded', String(open));
    toggle?.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    document.body.style.overflow = open ? 'hidden' : '';
  };
  toggle?.addEventListener('click', () => setMenu(!overlay?.classList.contains('active')));
  $$('.drawer-link, .menu-foot a').forEach((a) => a.addEventListener('click', () => setMenu(false)));
  window.addEventListener('resize', () => { if (window.innerWidth > 1060) setMenu(false); });

  /* ---------- Reveal on scroll ---------- */
  const reveals = $$('.reveal');
  if (reduceMotion || !('IntersectionObserver' in window)) {
    reveals.forEach((el) => el.classList.add('in'));
  } else {
    const groups = new Map();
    reveals.forEach((el) => {
      const p = el.parentElement;
      const i = groups.get(p) || 0;
      el.style.setProperty('--d', `${Math.min(i * 0.07, 0.35)}s`);
      groups.set(p, i + 1);
    });
    const ro = new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('in'); ro.unobserve(e.target); } });
    }, { threshold: 0.1, rootMargin: '0px 0px -30px 0px' });
    reveals.forEach((el) => ro.observe(el));
  }

  /* ---------- Count-up ---------- */
  const animateCount = (el) => {
    const target = parseInt(el.dataset.target || '0', 10);
    if (reduceMotion) { el.textContent = target.toLocaleString(); return; }
    const dur = 1800, start = performance.now();
    const step = (now) => {
      const t = Math.min((now - start) / dur, 1);
      el.textContent = Math.round(target * (1 - Math.pow(1 - t, 4))).toLocaleString();
      if (t < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };
  const co = new IntersectionObserver((entries) => {
    entries.forEach((e) => { if (e.isIntersecting) { animateCount(e.target); co.unobserve(e.target); } });
  }, { threshold: 0.6 });
  $$('.count-up').forEach((c) => co.observe(c));

  /* ---------- Department directory / accordion ---------- */
  const deptBtns = $$('.dept-btn');
  const mobileDir = window.matchMedia('(max-width: 900px)');
  deptBtns.forEach((btn) => btn.addEventListener('click', () => {
    const panel = document.getElementById(btn.getAttribute('aria-controls'));
    const wasActive = btn.classList.contains('active');
    deptBtns.forEach((b) => {
      b.classList.remove('active');
      b.setAttribute('aria-expanded', 'false');
      document.getElementById(b.getAttribute('aria-controls'))?.classList.remove('active');
    });
    if (wasActive && mobileDir.matches) return; // allow closing on mobile
    btn.classList.add('active');
    btn.setAttribute('aria-expanded', 'true');
    panel?.classList.add('active');
  }));

  /* ---------- Certificate data ---------- */
  const certificateData = {
    apmc: {
      title: 'Permanent Medical Council Registration',
      authority: 'Andhra Pradesh Medical Council (APMC)',
      regNo: 'APMC/FMR/133000', date: '27 August 2024',
      status: 'Verified · Active State Practitioner',
      image: 'assets/certificates/Andhra_Pradesh_Medical_Council_Permanent_Registration.webp',
      pdf: 'assets/docs/certificates/Andhra_Pradesh_Medical_Council_Permanent_Registration.pdf'
    },
    mbbs: {
      title: 'Bachelor of Medicine & Bachelor of Surgery (M.B.B.S.)',
      authority: 'Dr. YSR University of Health Sciences, Andhra Pradesh',
      regNo: '18M101018087', date: 'Batch 2018 – 2023',
      status: 'Verified · 62.57% Aggregate',
      image: 'assets/certificates/MBBS_Degree_Certificate_Dr_YSR_University.webp',
      pdf: 'assets/docs/certificates/MBBS_Degree_Certificate_Dr_YSR_University.pdf'
    },
    inicet: {
      title: 'INI Combined Entrance Test (INICET)',
      authority: 'All India Institute of Medical Sciences (AIIMS), New Delhi',
      regNo: 'Candidate ID 3323833292', date: 'July 2026 Session',
      status: 'Verified · National MD/MS Examination',
      image: 'assets/certificates/AIIMS_INICET_Summary_Slip.webp',
      pdf: 'assets/docs/certificates/AIIMS_INICET_Summary_Slip.pdf'
    },
    'aiims-admit': {
      title: 'AIIMS Entrance Examination Admit Card',
      authority: 'AIIMS Examination Section, Ansari Nagar, New Delhi',
      regNo: 'Roll No 8079789', date: '16 May 2026',
      status: 'Verified · Examination Candidate',
      image: 'assets/certificates/AIIMS_Admit_Card.webp',
      pdf: 'assets/docs/certificates/AIIMS_Admit_Card.pdf'
    },
    'neet-pg': {
      title: 'National Eligibility cum Entrance Test (NEET-PG)',
      authority: 'National Board of Examinations in Medical Sciences (NBEMS)',
      regNo: 'Application Confirmation', date: 'National PG Session 2024',
      status: 'Verified · PG Medical Application',
      image: 'assets/certificates/NEET_PG_Application_Confirmation.webp',
      pdf: 'assets/docs/certificates/NEET_PG_Application_Confirmation.pdf'
    },
    nativity: {
      title: 'Community, Nativity & Date of Birth Certificate',
      authority: 'Revenue Department, Government of Andhra Pradesh',
      regNo: 'Tahsildar Certified', date: 'Official Government Record',
      status: 'Verified · State Identity Record',
      image: 'assets/certificates/Community_Nativity_DateOfBirth_Certificate.webp',
      pdf: 'assets/docs/certificates/Community_Nativity_DateOfBirth_Certificate.pdf'
    }
  };

  /* ---------- Document vault ---------- */
  const vaultItems = $$('.vault-item');
  const vaultImg = $('#vault-img');
  const vaultFrame = $('#vault-open');
  let currentCert = 'apmc';
  vaultItems.forEach((item, i) => item.addEventListener('click', () => {
    const id = item.dataset.certId;
    if (id === currentCert) { openLightbox(id); return; }
    currentCert = id;
    vaultItems.forEach((v) => { v.classList.toggle('active', v === item); v.setAttribute('aria-selected', String(v === item)); });
    $('#vault-status').textContent = certificateData[id].status;
    $('#vault-index').textContent = String(i + 1).padStart(2, '0');
    vaultFrame?.classList.add('swap');
    const next = new Image();
    next.onload = () => {
      vaultImg.src = item.dataset.thumb;
      vaultImg.alt = `${certificateData[id].title} preview`;
      requestAnimationFrame(() => vaultFrame?.classList.remove('swap'));
    };
    next.src = item.dataset.thumb;
    if (mobileDir.matches) vaultFrame?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }));
  vaultFrame?.addEventListener('click', () => openLightbox(currentCert));

  /* ---------- Lightbox ---------- */
  const lightbox = $('#cert-lightbox');
  let lastFocus = null;
  function openLightbox(key) {
    const d = certificateData[key];
    if (!d || !lightbox) return;
    const img = $('#lightbox-img');
    img.src = d.image;
    img.alt = d.title;
    $('#lightbox-title').textContent = d.title;
    $('#lightbox-authority').textContent = d.authority;
    $('#lightbox-reg').textContent = d.regNo;
    $('#lightbox-date').textContent = d.date;
    $('#lightbox-status').textContent = d.status;
    $('#lightbox-download-pdf').href = d.pdf;
    lastFocus = document.activeElement;
    lightbox.classList.add('active');
    lightbox.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    $('#lightbox-close')?.focus();
  }
  const closeLightbox = () => {
    if (!lightbox?.classList.contains('active')) return;
    lightbox.classList.remove('active');
    lightbox.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    lastFocus?.focus();
  };
  $('#lightbox-close')?.addEventListener('click', closeLightbox);
  lightbox?.addEventListener('click', (e) => { if (e.target === lightbox) closeLightbox(); });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') { closeLightbox(); setMenu(false); }
  });

  /* ---------- Toast & copy ---------- */
  const toast = $('#toast-notice');
  const toastMsg = $('#toast-message');
  let toastTimer;
  const showToast = (msg) => {
    if (!toast || !toastMsg) return;
    toastMsg.textContent = msg;
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('show'), 3000);
  };
  $$('[data-copy]').forEach((btn) => btn.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    const text = btn.dataset.copy;
    navigator.clipboard?.writeText(text)
      .then(() => showToast(`Copied: ${text}`))
      .catch(() => showToast(text));
  }));

  /* ---------- Consultation form ---------- */
  const form = $('#consultation-form');
  const val = (id) => ($(`#${id}`)?.value || '').trim();
  const validate = () => {
    let ok = true;
    ['patient-name', 'patient-phone'].forEach((id) => {
      const bad = !val(id);
      $(`#${id}`)?.closest('.rx-field')?.classList.toggle('invalid', bad);
      if (bad) ok = false;
    });
    if (!ok) showToast('Please add your name and phone number.');
    return ok;
  };
  $$('#consultation-form input').forEach((i) => i.addEventListener('input', () => i.closest('.rx-field')?.classList.remove('invalid')));

  form?.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!validate()) return;
    const subject = encodeURIComponent(`Consultation Request: ${val('patient-name')} (${val('consultation-type')})`);
    const body = encodeURIComponent(
      'Hello Dr. N. Jyothi,\n\nI would like to request a consultation.\n\n' +
      `• Name: ${val('patient-name')}\n` +
      `• Phone: ${val('patient-phone')}\n` +
      `• Email: ${val('patient-email') || 'Not provided'}\n` +
      `• Consultation type: ${val('consultation-type')}\n` +
      `• Preferred date: ${val('appointment-date') || 'Earliest available'}\n` +
      `• Details: ${val('clinical-notes') || '—'}\n\n` +
      'Sent via jyothi.online'
    );
    showToast('Opening your email app…');
    window.location.href = `mailto:kiranjyothi5496@gmail.com?subject=${subject}&body=${body}`;
  });

  $('#book-via-whatsapp')?.addEventListener('click', () => {
    let msg = 'Hello Dr. Jyothi, I am reaching out from your portfolio (jyothi.online).';
    if (val('patient-name')) msg += `\nName: ${val('patient-name')}`;
    if (val('patient-phone')) msg += `\nPhone: ${val('patient-phone')}`;
    msg += `\nRequirement: ${val('consultation-type')}`;
    msg += `\nPreferred date: ${val('appointment-date') || 'Earliest available'}`;
    if (val('clinical-notes')) msg += `\nNotes: ${val('clinical-notes')}`;
    window.open(`https://wa.me/919381925918?text=${encodeURIComponent(msg)}`, '_blank', 'noopener');
  });
});
