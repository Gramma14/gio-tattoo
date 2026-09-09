/* Probe delle foto opzionali (data-img) rimandato a "load": parte solo dopo che
   CSS/font/JS critici sono già a posto, così non compete per banda/connessioni
   col caricamento iniziale (più veloce su LCP/Core Web Vitals). Se i file non
   esistono ancora, i probe falliscono in silenzio e restano i placeholder —
   vedi assets/images/LEGGIMI.md. */
window.addEventListener('load', function () {
  document.querySelectorAll('[data-img]').forEach(function (el) {
    var img = new Image();
    img.onload = function () {
      el.style.backgroundImage = 'url("' + el.getAttribute('data-img') + '")';
      el.classList.add('has-photo');
    };
    img.src = el.getAttribute('data-img');
  });
});

document.addEventListener('DOMContentLoaded', function () {

  /* ---------- Anno footer ---------- */
  var yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------- Nav attiva in base alla pagina (multi-pagina: galleria.html) ---------- */
  var currentPage = document.body.getAttribute('data-page');
  if (currentPage) {
    document.querySelectorAll('.nav-link[data-page="' + currentPage + '"]').forEach(function (link) {
      link.classList.add('is-active');
    });
  }

  /* ---------- Header: sfondo pieno dopo lo scroll ---------- */
  var header = document.getElementById('site-header');
  function onScrollHeader() {
    if (window.scrollY > 40) header.classList.add('scrolled');
    else header.classList.remove('scrolled');
  }
  onScrollHeader();
  window.addEventListener('scroll', onScrollHeader, { passive: true });

  /* ---------- Nav mobile ---------- */
  var navToggle = document.getElementById('nav-toggle');
  var mainNav = document.getElementById('main-nav');
  if (navToggle && mainNav) {
    navToggle.addEventListener('click', function () {
      var isOpen = mainNav.classList.toggle('is-open');
      navToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    });
    mainNav.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        mainNav.classList.remove('is-open');
        navToggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  /* ---------- Nav link attivo in base alla sezione visibile ---------- */
  var navLinks = document.querySelectorAll('.nav-link');
  var sections = ['home', 'work', 'about', 'contact']
    .map(function (id) { return document.getElementById(id); })
    .filter(Boolean);

  if ('IntersectionObserver' in window && sections.length) {
    var navObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          navLinks.forEach(function (link) {
            link.classList.toggle('is-active', link.getAttribute('href') === '#' + entry.target.id);
          });
        }
      });
    }, { rootMargin: '-45% 0px -45% 0px' });
    sections.forEach(function (s) { navObserver.observe(s); });
  }

  /* ---------- Reveal on scroll (+ stagger per griglie: gallery/masonry/process) ---------- */
  var revealEls = document.querySelectorAll('.reveal, .stagger');

  // Delay incrementale per elementi in griglia, calcolato per contenitore (max ~360ms)
  ['#work-gallery', '#gallery-full', '.process-cards', '.contact-details', '.contact-form'].forEach(function (sel) {
    var container = document.querySelector(sel);
    if (!container) return;
    var items = container.querySelectorAll('.stagger, .reveal');
    items.forEach(function (el, i) {
      el.style.transitionDelay = Math.min(i * 55, 360) + 'ms';
    });
  });

  if ('IntersectionObserver' in window && revealEls.length) {
    var revealObserver = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });
    revealEls.forEach(function (el) { revealObserver.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add('in-view'); });
  }

  /* ---------- Alone che segue il mouse ---------- */
  var cursorGlow = document.getElementById('cursor-glow');
  var canHoverFine = window.matchMedia && window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  var prefersReducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (cursorGlow && canHoverFine && !prefersReducedMotion) {
    var glowTicking = false;
    var lastX = 0, lastY = 0;
    document.addEventListener('mousemove', function (e) {
      lastX = e.clientX; lastY = e.clientY;
      if (!glowTicking) {
        glowTicking = true;
        requestAnimationFrame(function () {
          document.documentElement.style.setProperty('--mx', lastX + 'px');
          document.documentElement.style.setProperty('--my', lastY + 'px');
          cursorGlow.classList.add('is-active');
          glowTicking = false;
        });
      }
    });
    document.addEventListener('mouseleave', function () { cursorGlow.classList.remove('is-active'); });
  }

  /* ---------- Bottoni "magnetici" (si spostano leggermente verso il cursore) ---------- */
  if (canHoverFine && !prefersReducedMotion) {
    document.querySelectorAll('.btn').forEach(function (btn) {
      btn.addEventListener('mousemove', function (e) {
        var r = btn.getBoundingClientRect();
        var dx = e.clientX - (r.left + r.width / 2);
        var dy = e.clientY - (r.top + r.height / 2);
        var max = 10;
        var x = Math.max(-max, Math.min(max, dx * 0.18));
        var y = Math.max(-max, Math.min(max, dy * 0.18));
        btn.style.transform = 'translate(' + x.toFixed(1) + 'px,' + (y - 2).toFixed(1) + 'px)';
      });
      btn.addEventListener('mouseleave', function () { btn.style.transform = ''; });
    });
  }

  /* ---------- Work: hover filmstrip (ingrandimento + le altre si scuriscono e si spostano) ---------- */
  var filmStrip = document.getElementById('work-gallery');
  if (filmStrip) {
    var filmItems = Array.from(filmStrip.querySelectorAll('.film-item'));
    filmItems.forEach(function (item, i) {
      item.addEventListener('mouseenter', function () {
        filmItems.forEach(function (other, j) {
          other.classList.remove('is-focused', 'is-dimmed', 'shift-left', 'shift-right');
          if (j === i) {
            other.classList.add('is-focused');
          } else {
            other.classList.add('is-dimmed', j < i ? 'shift-left' : 'shift-right');
          }
        });
      });
    });
    filmStrip.addEventListener('mouseleave', function () {
      filmItems.forEach(function (other) {
        other.classList.remove('is-focused', 'is-dimmed', 'shift-left', 'shift-right');
      });
    });
  }

  /* ---------- FAQ accordion ---------- */
  document.querySelectorAll('.faq-question').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var item = btn.closest('.faq-item');
      var isOpen = item.classList.contains('is-open');
      item.classList.toggle('is-open', !isOpen);
      btn.setAttribute('aria-expanded', String(!isOpen));
    });
  });

  /* ---------- Galleria: filtri ---------- */
  var filterBtns = document.querySelectorAll('.filter-btn');
  var galleryItems = document.querySelectorAll('.gallery-item, .masonry-item, .film-item');
  filterBtns.forEach(function (btn) {
    btn.addEventListener('click', function () {
      filterBtns.forEach(function (b) {
        b.classList.remove('is-active');
        b.setAttribute('aria-selected', 'false');
      });
      btn.classList.add('is-active');
      btn.setAttribute('aria-selected', 'true');

      var filter = btn.getAttribute('data-filter');
      galleryItems.forEach(function (item) {
        var match = filter === 'all' || item.getAttribute('data-category') === filter;
        item.classList.toggle('is-hidden', !match);
      });
    });
  });

  /* ---------- Lightbox ---------- */
  var lightbox = document.getElementById('lightbox');
  var lightboxImage = document.getElementById('lightbox-image');
  var lightboxCaption = document.getElementById('lightbox-caption');
  var lightboxClose = document.getElementById('lightbox-close');

  function openLightbox(item) {
    var label = item.getAttribute('data-label') || '';
    var phClass = item.querySelector('.ph') ? Array.from(item.querySelector('.ph').classList).find(function (c) { return /^ph-\d/.test(c); }) : null;
    lightboxImage.className = 'ph ph-lightbox' + (phClass ? ' ' + phClass : '');
    lightboxCaption.textContent = label;
    lightbox.hidden = false;
    document.body.style.overflow = 'hidden';
  }
  function closeLightbox() {
    lightbox.hidden = true;
    document.body.style.overflow = '';
  }
  galleryItems.forEach(function (item) {
    item.addEventListener('click', function () { openLightbox(item); });
  });
  if (lightboxClose) lightboxClose.addEventListener('click', closeLightbox);
  if (lightbox) {
    lightbox.addEventListener('click', function (e) {
      if (e.target === lightbox) closeLightbox();
    });
  }
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && lightbox && !lightbox.hidden) closeLightbox();
  });

  /* ---------- Form contatto ----------
     Sito statico: non c'è backend. Prima della pubblicazione collegare
     l'attributo action del form (in index.html) a un servizio come
     Formspree / Netlify Forms / Basin, oppure a un endpoint proprio.
     Per ora il submit viene intercettato solo per mostrare un messaggio
     di conferma in demo, senza inviare nulla. */
  var form = document.getElementById('contact-form');
  var formNote = document.getElementById('form-note');
  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!form.checkValidity()) {
        formNote.textContent = 'Controlla i campi obbligatori prima di inviare.';
        formNote.style.color = '#D6A25E';
        return;
      }
      formNote.textContent = 'Demo: form pronto lato interfaccia — va collegato a un servizio di invio (es. Formspree) prima della pubblicazione.';
      formNote.style.color = '#B8823C';
      form.reset();
    });
  }

});
