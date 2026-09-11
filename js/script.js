/* Probe delle foto opzionali (data-img): se i file non esistono ancora, falliscono
   in silenzio e restano i placeholder — vedi assets/images/LEGGIMI.md.

   Caricamento diviso in due velocità per i Core Web Vitals:
   - la foto hero (probabile elemento LCP della home) parte SUBITO, appena lo script
     gira, senza aspettare altro — è già anche precaricata via <link rel="preload">
     in index.html, quindi qui trova quasi sempre la cache pronta;
   - tutte le altre foto (work, about, galleria) caricano solo quando l'elemento sta
     per entrare nello schermo (IntersectionObserver, con un margine di anticipo),
     invece di scaricarle tutte insieme all'avvio: utile soprattutto per la pagina
     Galleria con tante foto in una volta sola. */
var CATEGORY_LABELS = {
  ritratti: 'ritratto',
  statue: 'statua',
  occhi: 'occhio',
  animali: 'animale'
};

function loadDataImg(el) {
  var img = new Image();
  img.onload = function () {
    el.style.backgroundImage = 'url("' + el.getAttribute('data-img') + '")';
    el.classList.add('has-photo');

    /* Etichetta descrittiva per screen reader / semantica (utile anche in ottica SEO):
       un div con background-image non porta testo alternativo, quindi lo aggiungiamo
       via ARIA. Usa data-alt se presente, altrimenti lo deduce dalla categoria del
       tatuaggio (data-category sul bottone genitore), con un fallback generico. */
    var alt = el.getAttribute('data-alt');
    if (!alt) {
      var parentBtn = el.closest('[data-category]');
      var cat = parentBtn ? CATEGORY_LABELS[parentBtn.getAttribute('data-category')] : null;
      alt = cat
        ? 'Tatuaggio black and grey realism, stile ' + cat + ' — Gio Tattoo, Lecco'
        : 'Tatuaggio black and grey realism — Gio Tattoo, Lecco';
    }
    el.setAttribute('role', 'img');
    el.setAttribute('aria-label', alt);
  };
  img.src = el.getAttribute('data-img');
}

(function () {
  var allImgEls = Array.from(document.querySelectorAll('[data-img]'));
  var heroEl = document.querySelector('.hero-photo[data-img]');

  if (heroEl) loadDataImg(heroEl);
  var lazyEls = allImgEls.filter(function (el) { return el !== heroEl; });

  if ('IntersectionObserver' in window && lazyEls.length) {
    var imgObserver = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          loadDataImg(entry.target);
          obs.unobserve(entry.target);
        }
      });
    }, { rootMargin: '400px 0px' });
    lazyEls.forEach(function (el) { imgObserver.observe(el); });
  } else if (lazyEls.length) {
    // Browser senza IntersectionObserver: fallback al comportamento precedente.
    window.addEventListener('load', function () { lazyEls.forEach(loadDataImg); });
  }
})();

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
  ['#work-gallery', '#gallery-full', '.process-cards', '.contact-details', '.about-points-v2', '.faq-list'].forEach(function (sel) {
    var container = document.querySelector(sel);
    if (!container) return;
    var items = container.querySelectorAll('.stagger, .reveal');
    items.forEach(function (el, i) {
      var delay = Math.min(i * 55, 360) + 'ms';
      el.style.transitionDelay = delay;
      // Stessa cifra esposta come custom property, per sincronizzare animazioni CSS
      // scollegate dalla classe .reveal/.stagger stessa (es. le icone Process che
      // si disegnano, il "curtain reveal" delle foto).
      el.style.setProperty('--stagger-delay', delay);
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

  /* ---------- Icone Process: si "disegnano" invece di apparire di colpo ----------
     Calcola la lunghezza reale di ogni tratto SVG e la imposta come stroke-dasharray
     + variabile --dash-len (stato "nascosto" di partenza) — il resto lo fa il CSS
     quando la card riceve .in-view dall'observer sopra. */
  document.querySelectorAll('.process-doodle').forEach(function (svg) {
    svg.querySelectorAll('path, circle').forEach(function (shape) {
      if (typeof shape.getTotalLength !== 'function') return;
      var len = shape.getTotalLength();
      shape.style.strokeDasharray = len;
      shape.style.setProperty('--dash-len', len);
    });
  });

  /* ---------- "Tenda" che si ritira sulle foto (Work + Galleria) ----------
     Osservatore dedicato e separato da quello di .reveal/.stagger sopra: i
     .film-item hanno già le loro transform per l'effetto coverflow al passaggio
     del mouse, meglio non farle competere sullo stesso elemento. */
  var curtainEls = document.querySelectorAll('.film-item, .masonry-item, .gallery-item');
  if ('IntersectionObserver' in window && curtainEls.length) {
    var curtainObserver = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-revealed');
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.2 });
    curtainEls.forEach(function (el, i) {
      el.style.setProperty('--stagger-delay', Math.min(i * 55, 360) + 'ms');
      curtainObserver.observe(el);
    });
  } else {
    curtainEls.forEach(function (el) { el.classList.add('is-revealed'); });
  }

  /* ---------- Contatore numeri animati (stats sotto la hero) ---------- */
  var statNumbers = document.querySelectorAll('.stat-number');
  if (statNumbers.length) {
    var reduceMotionForStats = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var animateCount = function (el) {
      var target = parseInt(el.getAttribute('data-count-to'), 10) || 0;
      if (reduceMotionForStats) { el.textContent = target; return; }
      var duration = 1700;
      var start = null;
      function step(ts) {
        if (start === null) start = ts;
        var progress = Math.min((ts - start) / duration, 1);
        var eased = 1 - Math.pow(1 - progress, 3); // decelerazione verso il valore finale
        el.textContent = Math.round(eased * target);
        if (progress < 1) requestAnimationFrame(step);
        else el.textContent = target;
      }
      requestAnimationFrame(step);
    };
    if ('IntersectionObserver' in window) {
      var statsObserver = new IntersectionObserver(function (entries, obs) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) { animateCount(entry.target); obs.unobserve(entry.target); }
        });
      }, { threshold: 0.6 });
      statNumbers.forEach(function (el) { statsObserver.observe(el); });
    } else {
      statNumbers.forEach(function (el) { el.textContent = el.getAttribute('data-count-to'); });
    }
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

  /* ---------- Parallax leggero multi-livello sulla hero ----------
     La foto si "pannella" internamente (background-position, mai transform: con
     background-size:cover non si aprono mai bordi vuoti) più lenta dello scroll
     reale, lo spotlight si sposta a una velocità diversa — due livelli, due
     profondità, coerente con "Depth in every line". Attivo solo mentre la hero è
     a schermo, disattivato con prefers-reduced-motion. */
  var heroSectionEl = document.getElementById('home');
  var heroPhotoEls = document.querySelectorAll('.hero-photo');
  var heroSpotlightEl = document.querySelector('.hero-spotlight');
  if (heroSectionEl && !prefersReducedMotion && (heroPhotoEls.length || heroSpotlightEl)) {
    var parallaxTicking = false;
    var updateParallax = function () {
      var y = window.scrollY;
      var heroH = heroSectionEl.offsetHeight;
      if (y < heroH) {
        var pos = 'center calc(50% + ' + Math.round(y * 0.15) + 'px)';
        heroPhotoEls.forEach(function (el) { el.style.backgroundPosition = pos; });
        if (heroSpotlightEl) heroSpotlightEl.style.transform = 'translateX(-50%) translateY(' + Math.round(y * 0.1) + 'px)';
      }
      parallaxTicking = false;
    };
    window.addEventListener('scroll', function () {
      if (!parallaxTicking) { parallaxTicking = true; requestAnimationFrame(updateParallax); }
    }, { passive: true });
  }

  /* ---------- Carosello crossfade sulla hero (più foto a rotazione) ----------
     Ogni 7s passa alla foto successiva (.is-active), che diventa visibile solo se
     è anche già caricata (.has-photo, gestito dal probe data-img più sopra) — vedi
     css/style.css. Disattivato con prefers-reduced-motion (resta sulla prima foto). */
  if (heroPhotoEls.length > 1 && !prefersReducedMotion) {
    var heroSlideIndex = 0;
    setInterval(function () {
      heroPhotoEls[heroSlideIndex].classList.remove('is-active');
      heroSlideIndex = (heroSlideIndex + 1) % heroPhotoEls.length;
      heroPhotoEls[heroSlideIndex].classList.add('is-active');
    }, 7000);
  }

  /* ---------- Tilt 3D che segue il cursore (card About, Process) ----------
     La card ruota leggermente in base alla posizione del mouse al suo interno,
     dando una sensazione di profondità fisica. Solo con mouse reale (mai touch),
     mai con reduced-motion. Sulle card Process sostituisce il vecchio hover CSS
     statico (translateY+rotate+scale fissi) con un tilt dinamico che include lo
     stesso sollevamento e la stessa scala, ma seguendo davvero il cursore. */
  if (canHoverFine && !prefersReducedMotion) {
    var tiltEls = document.querySelectorAll('.process-card, .about-portrait, .about-secondary');
    tiltEls.forEach(function (card) {
      var isProcessCard = card.classList.contains('process-card');
      var tiltRaf = null;
      card.addEventListener('mouseenter', function () { card.classList.add('tilt-active'); });
      card.addEventListener('mousemove', function (e) {
        if (tiltRaf) return;
        tiltRaf = requestAnimationFrame(function () {
          var r = card.getBoundingClientRect();
          var px = (e.clientX - r.left) / r.width - 0.5;
          var py = (e.clientY - r.top) / r.height - 0.5;
          var rotateY = px * 10;
          var rotateX = -py * 10;
          var t = 'perspective(900px) rotateX(' + rotateX.toFixed(2) + 'deg) rotateY(' + rotateY.toFixed(2) + 'deg)';
          if (isProcessCard) t += ' translateY(-8px) scale(1.03)';
          card.style.transform = t;
          tiltRaf = null;
        });
      });
      card.addEventListener('mouseleave', function () { card.style.transform = ''; });
    });
  }

  /* ---------- Work: filmstrip — hover (mouse) + tap (touch) ---------- */
  var filmStrip = document.getElementById('work-gallery');
  var isTouchLike = window.matchMedia && window.matchMedia('(hover: none), (pointer: coarse)').matches;

  function focusFilmItem(items, i) {
    items.forEach(function (other, j) {
      other.classList.remove('is-focused', 'is-dimmed', 'shift-left', 'shift-right');
      if (j === i) {
        other.classList.add('is-focused');
      } else {
        other.classList.add('is-dimmed', j < i ? 'shift-left' : 'shift-right');
      }
    });
  }
  function clearFilmFocus(items) {
    items.forEach(function (other) {
      other.classList.remove('is-focused', 'is-dimmed', 'shift-left', 'shift-right');
    });
  }

  /* Nasconde l'indizio "scorri" quando si è arrivati alla fine della fila */
  var filmViewport = document.getElementById('film-viewport');
  var filmEdge = document.getElementById('film-edge');
  if (filmViewport && filmEdge) {
    var updateFilmEdge = function () {
      var atEnd = filmViewport.scrollLeft + filmViewport.clientWidth >= filmViewport.scrollWidth - 8;
      filmEdge.classList.toggle('is-end', atEnd);
    };
    updateFilmEdge();
    filmViewport.addEventListener('scroll', updateFilmEdge, { passive: true });
    window.addEventListener('resize', updateFilmEdge);
  }

  if (filmStrip) {
    var filmItems = Array.from(filmStrip.querySelectorAll('.film-item'));

    if (!isTouchLike) {
      /* Desktop: la stessa animazione scatta al passaggio del mouse */
      filmItems.forEach(function (item, i) {
        item.addEventListener('mouseenter', function () { focusFilmItem(filmItems, i); });
      });
      filmStrip.addEventListener('mouseleave', function () { clearFilmFocus(filmItems); });
    } else {
      /* Touch: primo tocco = anteprima (ingrandisce, le altre si scuriscono/spostano);
         se tocchi di nuovo la stessa foto già in anteprima, si apre la lightbox
         (gestita più sotto) — toccando una foto diversa si sposta solo l'anteprima. */
      filmItems.forEach(function (item, i) {
        item.addEventListener('click', function (e) {
          var alreadyFocused = item.classList.contains('is-focused');
          if (!alreadyFocused) {
            e.preventDefault();
            e.stopImmediatePropagation();
            focusFilmItem(filmItems, i);
          }
        });
      });
      document.addEventListener('click', function (e) {
        if (!filmStrip.contains(e.target)) clearFilmFocus(filmItems);
      });
    }
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

  /* ---------- Form contatto: 3 step invece di un blocco unico ----------
     Un passaggio alla volta sembra (ed è) meno impegnativo da completare,
     soprattutto su mobile — principio classico di CRO sui form lunghi.
     Se questo script non gira per qualche motivo, in HTML i tre .form-step
     non hanno l'attributo hidden: restano tutti visibili in sequenza, il
     form resta compilabile e inviabile (nessun vicolo cieco). */
  var form = document.getElementById('contact-form');
  var formNote = document.getElementById('form-note');
  if (form) {
    var formSteps = Array.from(form.querySelectorAll('.form-step'));
    var progressFill = form.querySelector('.form-progress-fill');
    var stepLabelEl = document.getElementById('form-step-label');
    var backBtn = form.querySelector('.form-back');
    var nextBtn = form.querySelector('.form-next');
    var submitBtn = form.querySelector('.form-submit');
    var stepNames = ['Passo 1 di 3 — Tu e il tuo stile', 'Passo 2 di 3 — La tua idea', 'Passo 3 di 3 — Come contattarti'];
    var currentStep = 0;

    function showStep(i) {
      formSteps.forEach(function (step, idx) { step.hidden = idx !== i; });
      if (progressFill) progressFill.style.width = (((i + 1) / formSteps.length) * 100) + '%';
      if (stepLabelEl) stepLabelEl.textContent = stepNames[i] || '';
      if (backBtn) backBtn.hidden = i === 0;
      if (nextBtn) nextBtn.hidden = i === formSteps.length - 1;
      if (submitBtn) submitBtn.hidden = i !== formSteps.length - 1;
      // Sposta il focus sul primo campo del nuovo step: utile per chi naviga da
      // tastiera o con uno screen reader, altrimenti il focus resterebbe sul
      // bottone "Avanti" appena nascosto.
      var firstField = formSteps[i].querySelector('input, select, textarea');
      if (firstField) firstField.focus({ preventScroll: true });
    }

    function validateStep(i) {
      var fields = formSteps[i].querySelectorAll('input, select, textarea');
      for (var j = 0; j < fields.length; j++) {
        if (!fields[j].checkValidity()) {
          fields[j].reportValidity();
          return false;
        }
      }
      return true;
    }

    if (formSteps.length && nextBtn) {
      if (nextBtn) nextBtn.addEventListener('click', function () {
        if (!validateStep(currentStep)) return;
        if (currentStep < formSteps.length - 1) { currentStep++; showStep(currentStep); }
      });
      if (backBtn) backBtn.addEventListener('click', function () {
        if (currentStep > 0) { currentStep--; showStep(currentStep); }
      });
      showStep(0);
    }

    /* Sito statico: non c'è backend. Prima della pubblicazione collegare
       l'attributo action del form (in index.html) a un servizio come
       Formspree / Netlify Forms / Basin, oppure a un endpoint proprio.
       Per ora il submit viene intercettato solo per mostrare un messaggio
       di conferma in demo, senza inviare nulla. */
    form.addEventListener('submit', function (e) {
      e.preventDefault();

      // Honeypot: un utente reale non vede/compila questo campo, i bot spesso sì.
      // Se è pieno, scartiamo in silenzio senza dare feedback (non serve far sapere
      // ai bot che sono stati individuati).
      var honeypot = form.querySelector('#website');
      if (honeypot && honeypot.value.trim() !== '') return;

      if (!form.checkValidity()) {
        formNote.textContent = 'Controlla i campi obbligatori prima di inviare.';
        formNote.style.color = '#D6A25E';
        return;
      }
      formNote.textContent = 'Demo: form pronto lato interfaccia — va collegato a un servizio di invio (es. Formspree o Netlify Forms) prima della pubblicazione.';
      formNote.style.color = '#B8823C';
      form.reset();
      if (formSteps.length) { currentStep = 0; showStep(0); }
    });
  }

});
