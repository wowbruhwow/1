// SPDX-License-Identifier: LicenseRef-CityLegends-Proprietary-Software

// Простий слайдер новин для блоку "Що нового" на home-start.
(function () {
  const sliderRoot = document.querySelector('[data-news-slider]');
  if (!sliderRoot) return;

  const titleEl = sliderRoot.querySelector('[data-news-title]');
  const descEl = sliderRoot.querySelector('[data-news-description]');
  const prevBtn = sliderRoot.querySelector('[data-news-prev]');
  const nextBtn = sliderRoot.querySelector('[data-news-next]');
  const dotsRoot = document.querySelector('[data-news-dots]');
  const dots = dotsRoot ? Array.from(dotsRoot.querySelectorAll('.news-dot')) : [];

  // Моки новин — заміниш на реальний контент при потребі
  const slides = [
    {
      title: 'КАРТИНКА ТУТ',
      description: 'ОПИС ТУТ',
    },
    {
      title: 'НОВА КОЛОДА',
      description: 'Додано тестову колоду "Древні часи" для внутрішнього плейтесту.',
    },
    {
      title: 'ОНОВЛЕННЯ ІНТЕРФЕЙСУ',
      description: 'Перероблено екран реєстрації та профілю. Додано нові стани кнопок і полів.',
    },
  ];

  let current = 0;

  function updateDots() {
    if (!dots.length) return;
    dots.forEach((dot) => {
      const idx = Number(dot.dataset.newsIndex || '0');
      dot.classList.toggle('is-active', idx === current);
    });
  }

  function renderSlide(index) {
    if (!titleEl || !descEl || !slides.length) return;
    current = (index + slides.length) % slides.length;
    const slide = slides[current];
    titleEl.textContent = slide.title;
    descEl.textContent = slide.description;
    updateDots();
  }

  if (prevBtn) {
    prevBtn.addEventListener('click', function () {
      renderSlide(current - 1);
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', function () {
      renderSlide(current + 1);
    });
  }

  if (dots.length) {
    dots.forEach((dot) => {
      dot.addEventListener('click', function () {
        const idx = Number(dot.dataset.newsIndex || '0');
        renderSlide(idx);
      });
    });
  }

  // Початковий рендер
  renderSlide(0);

  // Перехід на /auth з кнопки "почати"
  const startBtn = document.querySelector('[data-go-auth]');
  if (startBtn) {
    startBtn.addEventListener('click', function () {
      window.location.href = '/auth';
    });
  }

  // ==================== Допоміжні функції для оверлеїв ====================
  let activeOverlay = null;
  let lastFocusedEl = null;

  function getDialogFromOverlay(overlay) {
    if (!overlay) return null;
    return overlay.querySelector('[role="dialog"]') || overlay;
  }

  function focusFirstInOverlay(overlay) {
    const dialog = getDialogFromOverlay(overlay);
    if (!dialog) return;
    const focusable = dialog.querySelector(
      'a[href], button, textarea, input, select, iframe, [tabindex]:not([tabindex="-1"])'
    );
    (focusable || dialog).focus();
  }

  function openOverlay(overlay) {
    if (!overlay || activeOverlay === overlay) return;
    lastFocusedEl = document.activeElement;
    activeOverlay = overlay;
    overlay.hidden = false;
    overlay.classList.add('is-open');
    focusFirstInOverlay(overlay);
  }

  function closeOverlay(overlay) {
    if (!overlay) return;
    overlay.classList.remove('is-open');
    overlay.hidden = true;
    if (activeOverlay === overlay) {
      activeOverlay = null;
    }
    if (lastFocusedEl && typeof lastFocusedEl.focus === 'function') {
      lastFocusedEl.focus();
      lastFocusedEl = null;
    }
  }

  // Esc + базовий фокус-трап для оверлеїв FAQ / How-to
  document.addEventListener('keydown', function (e) {
    if (!activeOverlay) return;

    if (e.key === 'Escape') {
      e.preventDefault();
      e.stopPropagation();
      if (activeOverlay === faqOverlay) {
        closeFaq();
      } else if (activeOverlay === howToOverlay) {
        closeHowTo();
      } else {
        closeOverlay(activeOverlay);
      }
      return;
    }

    if (e.key === 'Tab') {
      const dialog = getDialogFromOverlay(activeOverlay);
      if (!dialog) return;
      const focusables = Array.from(
        dialog.querySelectorAll(
          'a[href], button, textarea, input, select, iframe, [tabindex]:not([tabindex="-1"])'
        )
      ).filter(function (el) {
        return !el.hasAttribute('disabled') && el.getAttribute('aria-disabled') !== 'true';
      });
      if (!focusables.length) {
        e.preventDefault();
        dialog.focus();
        return;
      }
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  });

  // ========================= Модалка FAQ =========================
  const faqTrigger = document.querySelector('[data-open-faq]');
  const faqOverlay = document.getElementById('faqOverlay');

  function openFaq() {
    if (faqOverlay) openOverlay(faqOverlay);
  }

  function closeFaq() {
    if (faqOverlay) closeOverlay(faqOverlay);
  }

  if (faqTrigger && faqOverlay) {
    faqTrigger.addEventListener('click', openFaq);
  }
  if (faqOverlay) {
    faqOverlay.addEventListener('click', function (e) {
      if (e.target === faqOverlay) closeFaq();
    });
  }

  // ====================== Модалка "Як грати" ======================
  const howToTrigger = document.querySelector('[data-open-how-to-play]');
  const howToOverlay = document.getElementById('howToPlayOverlay');

  function openHowTo() {
    if (howToOverlay) openOverlay(howToOverlay);
  }

  function closeHowTo() {
    if (howToOverlay) closeOverlay(howToOverlay);
  }

  if (howToTrigger && howToOverlay) {
    howToTrigger.addEventListener('click', openHowTo);
  }
  if (howToOverlay) {
    howToOverlay.addEventListener('click', function (e) {
      if (e.target === howToOverlay) closeHowTo();
    });
  }

  // Експортуємо API для iframe (FAQ / How-to), щоб вони могли закривати модалки
  window.CityLegends = window.CityLegends || {};
  window.CityLegends.closeFaqOverlay = closeFaq;
  window.CityLegends.closeHowToOverlay = closeHowTo;
})();
