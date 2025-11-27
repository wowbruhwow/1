// SPDX-License-Identifier: LicenseRef-CityLegends-Proprietary-Software

  /* ========================= Helpers ========================= */
  const qs  = (sel, root=document) => root.querySelector(sel);
  const qsa = (sel, root=document) => [...root.querySelectorAll(sel)];
  const isDisabled = el => el.matches('[disabled], [aria-disabled="true"]');

  /* Focus trap utils */
  const getFocusable = (root) =>
    qsa('a[href], button, textarea, input, select, [tabindex]:not([tabindex="-1"])', root)
      .filter(el => !el.hasAttribute('disabled') && !el.getAttribute('aria-disabled') && el.offsetParent !== null);

  /* ========================= Buttons: Loading / Toggle ========================= */
  function setButtonLoading(btn, on=true) {
    if (!btn || isDisabled(btn)) return;
    if (on) {
      btn.dataset.prevText ??= btn.textContent.trim();
      btn.classList.add('is-loading');
      btn.setAttribute('data-loading', 'true');
      btn.setAttribute('aria-busy', 'true');
      btn.setAttribute('aria-live', 'polite');

      // inject spinner if missing
      let spin = qs('.btn__spinner', btn);
      if (!spin) {
        spin = document.createElement('span');
        spin.className = 'btn__spinner';
        spin.setAttribute('aria-hidden', 'true');
        btn.prepend(spin);
      }
      // optional: swap text to "Loading…" if кнопка порожня
      if (!btn.dataset.keepText && btn.dataset.prevText === '') {
        btn.append(' Loading…');
      }
      btn.dataset.loadingState = 'on';
      btn.dataset.prevDisabled = btn.disabled ? '1' : '';
      btn.disabled = true;
    } else {
      btn.classList.remove('is-loading');
      btn.removeAttribute('data-loading');
      btn.removeAttribute('aria-busy');

      // повертаємо стан і текст
      if (btn.dataset.prevText && !btn.dataset.keepText) {
        // якщо міняли текст — можна повернути
        // (залишаю як є; більшість кейсів просто лишають оригінальний DOM)
      }
      if (!btn.dataset.prevDisabled) btn.disabled = false;
      delete btn.dataset.loadingState;
    }
  }

  // Авто-loading для кнопок з атрибутом data-loading-on-click
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('.btn[data-loading-on-click]');
    if (!btn || isDisabled(btn)) return;

    const ms = parseInt(btn.dataset.loadingTime || '1200', 10);
    setButtonLoading(btn, true);

    // Якщо розробник відмітив data-async="selector", чекаємо подію завершення ззовні:
    //   document.querySelector(selector).dispatchEvent(new CustomEvent('done'))
    const asyncSel = btn.dataset.async;
    if (asyncSel) {
      const target = qs(asyncSel) || document;
      const handler = () => {
        setButtonLoading(btn, false);
        target.removeEventListener('done', handler);
      };
      target.addEventListener('done', handler, { once:true });
    } else {
      // інакше — просто таймер
      setTimeout(() => setButtonLoading(btn, false), isNaN(ms) ? 1200 : ms);
    }
  });

  // Toggle buttons: перемикає aria-pressed для .btn--toggle або [data-toggle]

  /* ===== Improved Toggle: click + keyboard, switch support, target hook ===== */
  function getToggleAttr(el){
    // prefer 'switch' semantics when declared
    if (el.dataset.toggle === 'switch' || el.getAttribute('role') === 'switch') return 'aria-checked';
    return 'aria-pressed';
  }
  function toggleState(el){
    if (!el) return;
    const attr = getToggleAttr(el);
    const cur  = el.getAttribute(attr);
    const next = (cur === 'true') ? 'false' : 'true';
    el.setAttribute(attr, next);
    // helper class for styling hooks
    el.classList.toggle('is-on', next === 'true');
    // optional: toggle targets if provided, e.g. data-target="#panel,.chip"
    if (el.dataset.target){
      document.querySelectorAll(el.dataset.target).forEach(n => n.classList.toggle('is-on', next === 'true'));
    }
    // fire a CustomEvent so app code can react
    el.dispatchEvent(new CustomEvent('toggle', { bubbles:true, detail: { checked: next === 'true', attr } }));
  }

  
document.addEventListener('click', (e) => {
  const t = e.target.closest('.btn--toggle, [data-toggle="aria-pressed"]');
  if (!t || isDisabled(t)) return;
  const v = t.getAttribute('aria-pressed') === 'true';
  t.setAttribute('aria-pressed', String(!v));
});

// Додаємо Space/Enter для чіткого on/off з клавіатури
document.addEventListener('keydown', (e) => {
  if (e.key !== ' ' && e.key !== 'Enter') return;
  const t = e.target.closest('.btn--toggle, [data-toggle="aria-pressed"]');
  if (!t || isDisabled(t)) return;
  e.preventDefault(); // щоб пробіл не скролив
  const v = t.getAttribute('aria-pressed') === 'true';
  t.setAttribute('aria-pressed', String(!v));
});
/* ========================= Modals =========================
     В HTML:
      - кнопка відкриття:  data-open-modal="#modalId"
      - кнопка закриття:   data-close-modal
      - обгортка модалки:  .modal-wrap
      - overlay:           .overlay
  ============================================================ */
  const state = { lastFocus:null, openModalId:null };

  function openModal(id) {
    const modal = typeof id === 'string' ? qs(id) : id;
    if (!modal) return;

    const wrap = qs('.modal-wrap');
    const overlay = qs('.overlay');
    state.lastFocus = document.activeElement;
    state.openModalId = '#' + (modal.id || '');

    overlay && (overlay.hidden = false, overlay.style.display = 'block');
    wrap && (wrap.hidden = false, wrap.style.display = 'grid');

    modal.removeAttribute('hidden');
    modal.setAttribute('aria-modal', 'true');
    document.documentElement.style.overflow = 'hidden';

    // фокус-трап
    const focusables = getFocusable(modal);
    (focusables[0] || modal).focus();

    // trap handler
    function trap(e) {
      if (e.key !== 'Tab') return;
      const f = getFocusable(modal);
      if (!f.length) return;
      const first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault(); last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault(); first.focus();
      }
    }
    modal.__trapHandler = trap;
    modal.addEventListener('keydown', trap);
  }

  function closeModal(modalEl=null) {
    const wrap = qs('.modal-wrap');
    const overlay = qs('.overlay');

    const modals = modalEl ? [modalEl] : qsa('.modal');
    modals.forEach(m => {
      m.setAttribute('hidden','');
      m.removeAttribute('aria-modal');
      if (m.__trapHandler) {
        m.removeEventListener('keydown', m.__trapHandler);
        delete m.__trapHandler;
      }
    });

    overlay && (overlay.hidden = true, overlay.style.display = 'none');
    wrap && (wrap.hidden = true, wrap.style.display = 'none');
    document.documentElement.style.overflow = '';

    if (state.lastFocus && typeof state.lastFocus.focus === 'function') {
      state.lastFocus.focus();
    }
    state.openModalId = null;
  }

  // Клік по кнопках open/close
  document.addEventListener('click', (e) => {
    const btnOpen = e.target.closest('[data-open-modal]');
    if (btnOpen) {
      const id = btnOpen.getAttribute('data-open-modal');
      openModal(id);
      return;
    }
    const btnClose = e.target.closest('[data-close-modal]');
    if (btnClose) {
      const modal = btnClose.closest('.modal');
      closeModal(modal);
      return;
    }
    // клік по overlay — закриває
    const overlay = e.target.closest('.overlay');
    if (overlay) {
      closeModal();
    }
  });

  // Esc закриває активну модалку
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && state.openModalId) {
      closeModal();
    }
  });

  /* ========================= Progress bar =========================
     Markup:
       <div class="progress" data-progress data-value="0" data-max="100">
         <div class="progress__bar"></div>
       </div>
     Indeterminate:
       <div class="progress" data-progress data-indeterminate>
         <div class="progress__bar"></div>
       </div>
  ================================================================== */
  function setProgress(el, value, max=100) {
    const bar = qs('.progress__bar', el);
    const v = Math.max(0, Math.min(value, max));
    el.dataset.value = String(v);
    el.dataset.max = String(max);
    el.setAttribute('aria-valuenow', String(v));
    el.setAttribute('aria-valuemax', String(max));
    if (bar) bar.style.width = (v / max * 100) + '%';
  }

  // Простенька анімація indeterminate (без CSS)
  const indeterminateLoops = new Map();
  function startIndeterminate(el) {
    if (indeterminateLoops.has(el)) return;
    const bar = qs('.progress__bar', el);
    if (!bar) return;
    let t = 0;
    const loop = () => {
      // синусоїда дає плавність; 0..1
      const w = (Math.sin(t) * .5 + .5) * 60 + 20; // ширина 20–80%
      const x = ((Math.cos(t*0.8) * .5 + .5) * (100 - w));
      bar.style.width = w + '%';
      bar.style.transform = `translateX(${x}%)`;
      t += 0.05;
      const id = requestAnimationFrame(loop);
      indeterminateLoops.set(el, id);
    };
    loop();
  }
  function stopIndeterminate(el) {
    const id = indeterminateLoops.get(el);
    if (id) cancelAnimationFrame(id);
    indeterminateLoops.delete(el);
    const bar = qs('.progress__bar', el);
    if (bar) {
      bar.style.transform = 'translateX(0)';
    }
  }

  // Auto-init для всіх прогресів
  function initProgress() {
    qsa('[data-progress]').forEach(el => {
      if (el.hasAttribute('data-indeterminate')) {
        el.removeAttribute('aria-valuenow');
        el.removeAttribute('aria-valuetext');
        startIndeterminate(el);
      } else {
        const max = parseFloat(el.dataset.max || '100');
        const val = parseFloat(el.dataset.value || '0');
        setProgress(el, val, max);
        stopIndeterminate(el);
      }
    });
  }
  initProgress();

  // Демо-API на window, щоб можна було керувати з консолі
  window.UIKit = {
    setButtonLoading,
    openModal,
    closeModal,
    setProgress,
    startIndeterminate,
    stopIndeterminate
  };
  // Рівномірний прогрес по кроках (0..totalSteps)
function setProgressByStep(el, stepIndex, totalSteps) {
  // захист і клампінг
  const steps = Math.max(1, Number(totalSteps || el.dataset.steps || 1));
  const step  = Math.max(0, Math.min(Number(stepIndex), steps));

  // відсоток: 0% на 0-му кроці, 100% на фінальному
  const pct = Math.round(step * 100 / steps);

  el.dataset.steps = String(steps);
  el.dataset.step  = String(step);
  setProgress(el, pct, 100);

  // якщо був indeterminate — зупиняємо
  el.removeAttribute('data-indeterminate');
  stopIndeterminate(el);
}

  function nextStep(el) {
  const steps = Number(el.dataset.steps || 1);
  const step  = Number(el.dataset.step || 0) + 1;
  setProgressByStep(el, Math.min(step, steps), steps);
}
function prevStep(el) {
  const steps = Number(el.dataset.steps || 1);
  const step  = Math.max(0, Number(el.dataset.step || 0) - 1);
  setProgressByStep(el, step, steps);
}

// Авто-ініт з підтримкою data-steps / data-step
(function patchInitProgress(){
  const _init = initProgress;
  initProgress = function(){
    qsa('[data-progress]').forEach(el => {
      if (el.hasAttribute('data-indeterminate')) {
        startIndeterminate(el);
      } else if (el.hasAttribute('data-steps')) {
        const steps = Number(el.dataset.steps || 1);
        const step  = Number(el.dataset.step || 0);
        setProgressByStep(el, step, steps);
      } else {
        const max = parseFloat(el.dataset.max || '100');
        const val = parseFloat(el.dataset.value || '0');
        setProgress(el, val, max);
      }
    });
  };
})();
initProgress();

  /* ========================= Password validation =========================
   Поле з data-validate="password" показує список невиконаних умов у контейнері,
   який вказано через data-error-target.
   Умови за замовчуванням:
     - мін. 8 символів
     - літера у нижньому регістрі
     - літера у верхньому регістрі
     - цифра
     - спецсимвол
   Можна кастомізувати через data-атрибути на інпуті:
     data-minlen="10"
     data-require-lower="0|1"
     data-require-upper="0|1"
     data-require-digit="0|1"
     data-require-special="0|1"
=========================================================================== */
function validatePasswordField(input) {
  const val = String(input.value || '');
  const minLen = Number(input.dataset.minlen || 8);
  const needLower   = (input.dataset.requireLower ?? '1') !== '0';
  const needUpper   = (input.dataset.requireUpper ?? '1') !== '0';
  const needDigit   = (input.dataset.requireDigit ?? '1') !== '0';
  const needSpecial = (input.dataset.requireSpecial ?? '1') !== '0';

  const unmet = [];

  if (val.length < minLen) unmet.push(`Мінімум ${minLen} символів`);
  if (needLower   && !/[a-zа-яґєії]/.test(val)) unmet.push('Щонайменше одна літера нижнього регістру');
  if (needUpper   && !/[A-ZА-ЯҐЄІЇ]/.test(val)) unmet.push('Щонайменше одна літера ВЕРХНЬОГО регістру');
  if (needDigit   && !/\d/.test(val))            unmet.push('Щонайменше одна цифра');
  if (needSpecial && !/[^\p{L}\p{N}\s]/u.test(val)) unmet.push('Щонайменше один спецсимвол');

  // aria-invalid і вивід
  const errSel = input.getAttribute('data-error-target');
  const out = errSel ? qs(errSel) : null;

  if (unmet.length) {
    input.setAttribute('aria-invalid', 'true');
    if (out) {
      out.innerHTML = '<ul>' + unmet.map(m => `<li>${m}</li>`).join('') + '</ul>';
    }
  } else {
    input.removeAttribute('aria-invalid');
    if (out) out.textContent = '';
  }

  return unmet.length === 0;
}

document.addEventListener('input', (e) => {
  const input = e.target.closest('[data-validate="password"]');
  if (!input) return;
  validatePasswordField(input);
});

// Опційно: валідація на blur/submit (приклад під submit форми)
document.addEventListener('submit', (e) => {
  const form = e.target.closest('form');
  if (!form) return;
  const pwd = form.querySelector('[data-validate="password"]');
  if (pwd && !validatePasswordField(pwd)) {
    e.preventDefault();
    pwd.focus();
  }
});

(() => {
  const TOAST_ID = 'app-toast';
  let toastTimer = null;

  function showToast(message, opts = {}) {
    const node = document.getElementById(TOAST_ID);
    if (!node) return;                // якщо контейнера нема — тихо виходимо
    node.textContent = message;
    node.hidden = false;              // показати
    clearTimeout(toastTimer);
    const duration = Number(opts.duration) || 2500;
    toastTimer = setTimeout(() => {
      node.hidden = true;             // сховати
    }, duration);
  }

  // 1) Специфічний кейс з прикладу: #save-button
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('#save-button');
    if (!btn) return;
    showToast('Готово', { duration: 2500 });
  });

  // 2) Універсальний варіант: будь-який елемент з data-toast="Повідомлення"
  document.addEventListener('click', (e) => {
    const t = e.target.closest('[data-toast]');
    if (!t) return;
    const msg = t.getAttribute('data-toast') || 'Готово';
    showToast(msg, { duration: t.getAttribute('data-toast-duration') || 2500 });
  });

  // Експортуємо при потребі для ручного виклику
  window.showToast = showToast;
})();