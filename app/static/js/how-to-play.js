// SPDX-License-Identifier: LicenseRef-CityLegends-Proprietary-Software

// Логіка для сторінки how-to-play:
// кнопка "назад" у вікні повинна закривати модалку на home-start,
// не змінюючи URL (користувач залишається на головній).
(function () {
  const backBtn = document.querySelector('.back-button');
  if (!backBtn) return;

  function closeParentOverlay() {
    // Якщо сторінка відкрита в iframe всередині home-start
    try {
      if (window.parent && window.parent !== window) {
        const api = window.parent.CityLegends;
        if (api && typeof api.closeHowToOverlay === 'function') {
          api.closeHowToOverlay();
          return true;
        }
      }
    } catch (e) {
      // На всяк випадок, якщо раптом інший origin — просто ігноруємо
    }
    return false;
  }

  backBtn.addEventListener('click', function () {
    if (closeParentOverlay()) return;

    // Фолбек: якщо відкрито напряму, працюємо як звичайна сторінка назад/на головну
    if (window.history.length > 1) {
      window.history.back();
    } else {
      window.location.href = '/';
    }
  });

  // Esc усередині iframe теж закриває модалку / сторінку
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
      if (closeParentOverlay()) return;
      if (window.history.length > 1) {
        window.history.back();
      } else {
        window.location.href = '/';
      }
    }
  });
})();
