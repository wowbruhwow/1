// SPDX-License-Identifier: LicenseRef-CityLegends-Proprietary-Software

// Логіка для сторінки FAQ:
// кнопка "назад" повинна закривати модалку на home-start,
// а при прямому відкритті сторінки — повертати користувача назад / на головну.
(function () {
  const backBtn = document.querySelector('.back-button');
  if (!backBtn) return;

  function closeParentOverlay() {
    // Якщо сторінка відкрита в iframe всередині home-start
    try {
      if (window.parent && window.parent !== window) {
        const api = window.parent.CityLegends;
        if (api && typeof api.closeFaqOverlay === 'function') {
          api.closeFaqOverlay();
          return true;
        }
      }
    } catch (e) {
      // Якщо інший origin — пропускаємо й працюємо як звичайна сторінка
    }
    return false;
  }

  backBtn.addEventListener('click', function () {
    if (closeParentOverlay()) return;

    // Фолбек: сторінка відкрита напряму
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
