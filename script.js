/* ==========================================================================
   DR. N. JYOTHI, MBBS — MODERN LUXURY MEDICAL PORTFOLIO
   Interactive Client Engine
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  // Initialize Lucide Icons if available
  if (window.lucide) {
    window.lucide.createIcons();
  }

  /* ------------------------------------------------------------------------
     1. THEME SWITCHER (LIGHT / DARK) WITH PERSISTENCE
     ------------------------------------------------------------------------ */
  const themeToggleBtn = document.getElementById('theme-toggle-btn');
  const prefersDarkScheme = window.matchMedia('(prefers-color-scheme: dark)');
  const savedTheme = localStorage.getItem('theme');

  const setTheme = (theme) => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
    const sunIcon = themeToggleBtn?.querySelector('.sun-icon');
    const moonIcon = themeToggleBtn?.querySelector('.moon-icon');
    if (sunIcon && moonIcon) {
      if (theme === 'dark') {
        sunIcon.style.display = 'block';
        moonIcon.style.display = 'none';
      } else {
        sunIcon.style.display = 'none';
        moonIcon.style.display = 'block';
      }
    }
  };

  if (savedTheme) {
    setTheme(savedTheme);
  } else if (prefersDarkScheme.matches) {
    setTheme('dark');
  } else {
    setTheme('light');
  }

  themeToggleBtn?.addEventListener('click', () => {
    const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
  });

  /* ------------------------------------------------------------------------
     2. DYNAMIC ROTATING TEXT (HERO ROLES)
     ------------------------------------------------------------------------ */
  const roles = [
    "General Physician & Clinician",
    "Emergency & Casualty Medical Officer",
    "Inpatient & Intensive Care Physician",
    "Minor Surgical & Wound Care Practitioner",
    "Maternal & Child Health Care Advocate"
  ];
  const roleElement = document.getElementById('dynamic-role');
  let roleIndex = 0;
  let charIndex = 0;
  let isDeleting = false;
  let typeSpeed = 80;

  function typeRoleEffect() {
    if (!roleElement) return;
    const currentRole = roles[roleIndex];
    if (isDeleting) {
      roleElement.textContent = currentRole.substring(0, charIndex - 1);
      charIndex--;
      typeSpeed = 40;
    } else {
      roleElement.textContent = currentRole.substring(0, charIndex + 1);
      charIndex++;
      typeSpeed = 80;
    }

    if (!isDeleting && charIndex === currentRole.length) {
      isDeleting = true;
      typeSpeed = 1800; // pause at end
    } else if (isDeleting && charIndex === 0) {
      isDeleting = false;
      roleIndex = (roleIndex + 1) % roles.length;
      typeSpeed = 400; // pause before next
    }

    setTimeout(typeRoleEffect, typeSpeed);
  }
  typeRoleEffect();

  /* ------------------------------------------------------------------------
     3. STICKY HEADER & SCROLL SPY & BACK TO TOP
     ------------------------------------------------------------------------ */
  const header = document.querySelector('.main-header');
  const backToTopBtn = document.getElementById('back-to-top');
  const navLinks = document.querySelectorAll('.nav-link');
  const sections = document.querySelectorAll('section[id]');

  window.addEventListener('scroll', () => {
    const scrollPos = window.scrollY;

    // Header shadow
    if (scrollPos > 30) {
      header?.classList.add('scrolled');
    } else {
      header?.classList.remove('scrolled');
    }

    // Back to top button
    if (scrollPos > 400) {
      backToTopBtn?.classList.add('visible');
    } else {
      backToTopBtn?.classList.remove('visible');
    }

    // Scroll spy navigation highlight
    sections.forEach(section => {
      const top = section.offsetTop - 120;
      const height = section.offsetHeight;
      const id = section.getAttribute('id');

      if (scrollPos >= top && scrollPos < top + height) {
        navLinks.forEach(link => {
          link.classList.remove('active');
          if (link.getAttribute('href') === `#${id}`) {
            link.classList.add('active');
          }
        });
      }
    });
  });

  backToTopBtn?.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  /* ------------------------------------------------------------------------
     4. MOBILE DRAWER NAVIGATION
     ------------------------------------------------------------------------ */
  const mobileToggle = document.getElementById('mobile-toggle');
  const mobileDrawer = document.getElementById('mobile-drawer');
  const drawerBackdrop = document.getElementById('drawer-backdrop');
  const drawerClose = document.getElementById('drawer-close');
  const mobileNavLinks = document.querySelectorAll('.mobile-nav-link');

  const openDrawer = () => {
    mobileDrawer?.classList.add('active');
    drawerBackdrop?.classList.add('active');
    document.body.style.overflow = 'hidden';
  };

  const closeDrawer = () => {
    mobileDrawer?.classList.remove('active');
    drawerBackdrop?.classList.remove('active');
    document.body.style.overflow = '';
  };

  mobileToggle?.addEventListener('click', openDrawer);
  drawerClose?.addEventListener('click', closeDrawer);
  drawerBackdrop?.addEventListener('click', closeDrawer);

  mobileNavLinks.forEach(link => {
    link.addEventListener('click', closeDrawer);
  });

  /* ------------------------------------------------------------------------
     5. STATS ANIMATED COUNTER (INTERSECTION OBSERVER)
     ------------------------------------------------------------------------ */
  const statNumbers = document.querySelectorAll('.count-up');
  let statsCounted = false;

  const countUpObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !statsCounted) {
        statsCounted = true;
        statNumbers.forEach(stat => {
          const target = parseInt(stat.getAttribute('data-target') || '0', 10);
          const duration = 1800;
          const stepTime = 20;
          const steps = duration / stepTime;
          const increment = target / steps;
          let current = 0;

          const timer = setInterval(() => {
            current += increment;
            if (current >= target) {
              stat.textContent = target.toLocaleString();
              clearInterval(timer);
            } else {
              stat.textContent = Math.floor(current).toLocaleString();
            }
          }, stepTime);
        });
      }
    });
  }, { threshold: 0.3 });

  const metricsSection = document.querySelector('.hero-metrics');
  if (metricsSection) {
    countUpObserver.observe(metricsSection);
  }

  /* ------------------------------------------------------------------------
     6. CLINICAL SKILL PROGRESS BARS (ANIMATE ON VIEW)
     ------------------------------------------------------------------------ */
  const skillBars = document.querySelectorAll('.progress-fill');
  const skillsObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const bar = entry.target;
        const width = bar.getAttribute('data-pct') || '0%';
        bar.style.width = width;
      }
    });
  }, { threshold: 0.2 });

  skillBars.forEach(bar => skillsObserver.observe(bar));

  /* ------------------------------------------------------------------------
     7. SPECIALTIES FILTER TABS (DYNAMIC ARRANGEMENT)
     ------------------------------------------------------------------------ */
  const specialtyTabs = document.querySelectorAll('.filter-tab');
  const specialtyCards = document.querySelectorAll('.specialty-card');

  specialtyTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      specialtyTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      const filterValue = tab.getAttribute('data-filter');

      specialtyCards.forEach(card => {
        const category = card.getAttribute('data-category');
        if (filterValue === 'all' || category === filterValue) {
          card.classList.remove('hide');
          card.style.opacity = '0';
          card.style.transform = 'translateY(15px)';
          setTimeout(() => {
            card.style.transition = 'all 0.3s ease';
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
          }, 40);
        } else {
          card.classList.add('hide');
        }
      });
    });
  });

  /* ------------------------------------------------------------------------
     8. VERIFIED CERTIFICATES GALLERY FILTER & LIGHTBOX MODAL
     ------------------------------------------------------------------------ */
  const certFilterBtns = document.querySelectorAll('.cert-filter-btn');
  const certCards = document.querySelectorAll('.certificate-card');
  const lightboxModal = document.getElementById('cert-lightbox');
  const lightboxClose = document.getElementById('lightbox-close');
  const lightboxImg = document.getElementById('lightbox-img');
  const lightboxTitle = document.getElementById('lightbox-title');
  const lightboxAuthority = document.getElementById('lightbox-authority');
  const lightboxReg = document.getElementById('lightbox-reg');
  const lightboxDate = document.getElementById('lightbox-date');
  const lightboxStatus = document.getElementById('lightbox-status');
  const lightboxDownloadBtn = document.getElementById('lightbox-download-pdf');

  // Certificate filtering
  certFilterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      certFilterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filter = btn.getAttribute('data-filter');
      certCards.forEach(card => {
        const cat = card.getAttribute('data-category');
        if (filter === 'all' || cat === filter) {
          card.classList.remove('hide');
        } else {
          card.classList.add('hide');
        }
      });
    });
  });

  // Certificate Lightbox Details Data
  const certificateData = {
    "apmc": {
      title: "Permanent Medical Council Registration",
      authority: "Andhra Pradesh Medical Council (APMC)",
      regNo: "APMC/FMR/133000",
      date: "27th August 2024",
      status: "Verified & Active State Practitioner",
      image: "assets/certificates/Andhra_Pradesh_Medical_Council_Permanent_Registration.png",
      pdf: "assets/docs/certificates/Andhra_Pradesh_Medical_Council_Permanent_Registration.pdf"
    },
    "mbbs": {
      title: "Bachelor of Medicine & Bachelor of Surgery (M.B.B.S.)",
      authority: "Dr. YSR University of Health Sciences, Andhra Pradesh",
      regNo: "University Reg: 18M101018087",
      date: "Certified 2024 (Batch 2018 - 2023)",
      status: "First-Class Clinical Pass (62.57% Aggregate)",
      image: "assets/certificates/MBBS_Degree_Certificate_Dr_YSR_University.png",
      pdf: "assets/docs/certificates/MBBS_Degree_Certificate_Dr_YSR_University.pdf"
    },
    "inicet": {
      title: "Institute of National Importance Combined Entrance Test (INICET)",
      authority: "All India Institute of Medical Sciences (AIIMS), New Delhi",
      regNo: "Candidate ID: 3323833292",
      date: "July 2026 Session",
      status: "National MD/MS Examination Confirmed",
      image: "assets/certificates/AIIMS_INICET_Summary_Slip.png",
      pdf: "assets/docs/certificates/AIIMS_INICET_Summary_Slip.pdf"
    },
    "aiims-admit": {
      title: "AIIMS National Entrance Examination Admit Card",
      authority: "AIIMS Examination Section, Ansari Nagar, New Delhi",
      regNo: "Roll No: 8079789",
      date: "16th May 2026",
      status: "Verified Examination Candidate",
      image: "assets/certificates/AIIMS_Admit_Card.png",
      pdf: "assets/docs/certificates/AIIMS_Admit_Card.pdf"
    },
    "neet-pg": {
      title: "National Eligibility cum Entrance Test (NEET-PG)",
      authority: "National Board of Examinations in Medical Sciences (NBEMS)",
      regNo: "Application Confirmation",
      date: "National PG Session 2024",
      status: "Verified Post-Graduate Medical Application",
      image: "assets/certificates/NEET_PG_Application_Confirmation.png",
      pdf: "assets/docs/certificates/NEET_PG_Application_Confirmation.pdf"
    },
    "nativity": {
      title: "Community, Nativity & Date of Birth Certificate",
      authority: "Revenue Department, Government of Andhra Pradesh",
      regNo: "Tahsildar Certified",
      date: "Official Government Record",
      status: "State Authorized Identity & Nativity Verification",
      image: "assets/certificates/Community_Nativity_DateOfBirth_Certificate.png",
      pdf: "assets/docs/certificates/Community_Nativity_DateOfBirth_Certificate.pdf"
    }
  };

  certCards.forEach(card => {
    card.addEventListener('click', () => {
      const certKey = card.getAttribute('data-cert-id');
      const data = certificateData[certKey];
      if (!data) return;

      if (lightboxImg) lightboxImg.src = data.image;
      if (lightboxTitle) lightboxTitle.textContent = data.title;
      if (lightboxAuthority) lightboxAuthority.textContent = data.authority;
      if (lightboxReg) lightboxReg.textContent = data.regNo;
      if (lightboxDate) lightboxDate.textContent = data.date;
      if (lightboxStatus) lightboxStatus.textContent = data.status;
      if (lightboxDownloadBtn) lightboxDownloadBtn.href = data.pdf;

      lightboxModal?.classList.add('active');
      document.body.style.overflow = 'hidden';
    });
  });

  const closeLightbox = () => {
    lightboxModal?.classList.remove('active');
    document.body.style.overflow = '';
  };

  lightboxClose?.addEventListener('click', closeLightbox);
  lightboxModal?.addEventListener('click', (e) => {
    if (e.target === lightboxModal) closeLightbox();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && lightboxModal?.classList.contains('active')) {
      closeLightbox();
    }
  });

  /* ------------------------------------------------------------------------
     9. TOAST NOTIFICATION UTILITY
     ------------------------------------------------------------------------ */
  const toast = document.getElementById('toast-notice');
  const toastMessage = document.getElementById('toast-message');

  const showToast = (message) => {
    if (!toast || !toastMessage) return;
    toastMessage.textContent = message;
    toast.classList.add('show');
    setTimeout(() => {
      toast.classList.remove('show');
    }, 3200);
  };

  /* ------------------------------------------------------------------------
     10. COPY TO CLIPBOARD BUTTONS
     ------------------------------------------------------------------------ */
  const copyButtons = document.querySelectorAll('[data-copy]');
  copyButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const textToCopy = btn.getAttribute('data-copy');
      if (textToCopy) {
        navigator.clipboard.writeText(textToCopy).then(() => {
          showToast(`Copied to clipboard: ${textToCopy}`);
        }).catch(() => {
          showToast(`Selected: ${textToCopy}`);
        });
      }
    });
  });

  /* ------------------------------------------------------------------------
     11. APPOINTMENT / CONSULTATION BOOKING FORM
     ------------------------------------------------------------------------ */
  const bookingForm = document.getElementById('consultation-form');
  const whatsappBookBtn = document.getElementById('book-via-whatsapp');

  bookingForm?.addEventListener('submit', (e) => {
    e.preventDefault();

    const name = document.getElementById('patient-name')?.value;
    const phone = document.getElementById('patient-phone')?.value;
    const email = document.getElementById('patient-email')?.value || 'Not provided';
    const type = document.getElementById('consultation-type')?.value;
    const date = document.getElementById('appointment-date')?.value || 'Earliest available';
    const notes = document.getElementById('clinical-notes')?.value || 'No additional notes';

    if (!name || !phone || !type) {
      showToast('Please fill in Name, Phone, and Consultation Type.');
      return;
    }

    // Construct mailto link
    const subject = encodeURIComponent(`Clinical Consultation Request: ${name} (${type})`);
    const body = encodeURIComponent(
      `Hello Dr. N. Jyothi,\n\n` +
      `I would like to request a clinical consultation / appointment.\n\n` +
      `• Patient / Hospital Contact: ${name}\n` +
      `• Phone: ${phone}\n` +
      `• Email: ${email}\n` +
      `• Consultation Type: ${type}\n` +
      `• Preferred Date: ${date}\n` +
      `• Clinical Details / Notes: ${notes}\n\n` +
      `Sent via jyothi.online portfolio`
    );

    showToast('Redirecting to your email client to send request...');
    window.location.href = `mailto:kiranjyothi5496@gmail.com?subject=${subject}&body=${body}`;
  });

  whatsappBookBtn?.addEventListener('click', () => {
    const name = document.getElementById('patient-name')?.value;
    const phone = document.getElementById('patient-phone')?.value;
    const type = document.getElementById('consultation-type')?.value;
    const date = document.getElementById('appointment-date')?.value || 'Earliest available';
    const notes = document.getElementById('clinical-notes')?.value || 'General consultation request';

    let message = `Hello Dr. Jyothi, I am reaching out from your portfolio (jyothi.online).`;
    if (name) message += `\nName: ${name}`;
    if (phone) message += `\nPhone: ${phone}`;
    if (type) message += `\nRequirement: ${type}`;
    if (date) message += `\nPreferred Date: ${date}`;
    if (notes) message += `\nNotes: ${notes}`;

    const waUrl = `https://wa.me/919381925918?text=${encodeURIComponent(message)}`;
    window.open(waUrl, '_blank');
  });

});
