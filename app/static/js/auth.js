// SPDX-License-Identifier: LicenseRef-CityLegends-Proprietary-Software

// Простий front-end контролер для сторінок auth/registration/reset.

function select(selector, root = document) {
  return root.querySelector(selector);
}

function on(event, selector, handler) {
  document.addEventListener(event, (e) => {
    const target = e.target.closest(selector);
    if (!target) return;
    handler(e, target);
  });
}

function setFormMessage(form, message, isError = true) {
  const box = form.querySelector('.form-messages');
  if (!box) return;
  box.textContent = message || '';
  box.style.color = isError ? '#ffdddd' : '#d4ffd4';
}

function setFieldState(fieldEl, state) {
  if (!fieldEl) return;
  fieldEl.classList.remove('field-input', 'field-success', 'field-error');
  if (!state) return;
  fieldEl.classList.add(`field-${state}`);
}

function validateEmail(value) {
  if (!value.trim()) return 'Вкажіть електронну пошту.';
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!re.test(value)) return 'Невірний формат електронної пошти.';
  return null;
}

function validatePassword(value) {
  if (!value) return 'Вкажіть пароль.';
  if (value.length < 8) return 'Пароль має містити щонайменше 8 символів.';
  if (value.length > 20) return 'Пароль задовгий (макс. 20 символів).';
  if (!/[A-Za-z]/.test(value) || !/[0-9]/.test(value)) {
    return 'Пароль має містити літеру та цифру.';
  }
  return null;
}

function validateNickname(value) {
  if (!value.trim()) return 'Вкажіть унікальний нік.';
  if (value.length > 16) return 'Нік задовгий';
  return null;
}

async function postJson(url, body) {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    cache: 'no-store',
  });
  let data = null;
  try {
    data = await res.json();
  } catch (e) {
    data = null;
  }
  return { ok: res.ok, status: res.status, data };
}

function setupAuthChoicePage() {
  const loginBtn = select('.login-button[data-nav="login"]');
  const regBtn = select('.register-button[data-nav="register"]');

  if (loginBtn) {
    loginBtn.addEventListener('click', () => {
      window.location.href = '/authentication';
    });
  }
  if (regBtn) {
    regBtn.addEventListener('click', () => {
      window.location.href = '/registration';
    });
  }
}

function setupLoginPage() {
  const form = select('form[data-form="login"]');
  if (!form) return;

  const backBtn = select('.button-exit[data-nav="back"]');
  if (backBtn) {
    backBtn.addEventListener('click', () => {
      window.location.href = '/auth';
    });
  }

  const resetBtn = select('[data-nav="reset-password"]');
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      window.location.href = '/reset-password';
    });
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = form.elements['email']?.value || '';
    const password = form.elements['password']?.value || '';

    const emailError = validateEmail(email);
    const passError = password ? null : 'Вкажіть пароль.';

    const emailField = form.querySelector('[data-field="email"]');
    const passField = form.querySelector('[data-field="password"]');
    setFieldState(emailField, emailError ? 'error' : 'success');
    setFieldState(passField, passError ? 'error' : 'success');

    if (emailError || passError) {
      setFormMessage(form, 'Невірні дані входу.', true);
      return;
    }

    try {
      const { ok, data } = await postJson('/auth/login', { email, password });
      if (!ok || !data || data.ok === false) {
        const msg = (data && data.message) || 'Невірні дані входу.';
        setFormMessage(form, msg, true);
        return;
      }
      setFormMessage(form, data.message || 'Вхід успішний.', false);
      setTimeout(() => {
        window.location.href = '/profile';
      }, 500);
    } catch (err) {
      setFormMessage(form, 'Сталася помилка. Спробуйте ще раз пізніше.', true);
    }
  });
}

function setupRegisterPage() {
  const form = select('form[data-form="register"]');
  if (!form) return;

  const backBtn = select('.button-exit[data-nav="back"]');
  if (backBtn) {
    backBtn.addEventListener('click', () => {
      window.location.href = '/auth';
    });
  }

  const termsBtn = select('.checkmark-button[data-toggle="terms"]');
  let termsAccepted = false;
  if (termsBtn) {
    termsBtn.addEventListener('click', () => {
      termsAccepted = !termsAccepted;
      termsBtn.setAttribute('aria-pressed', String(termsAccepted));
    });
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const nickname = form.elements['nickname']?.value || '';
    const email = form.elements['email']?.value || '';
    const emailConfirm = form.elements['email_confirm']?.value || '';
    const password = form.elements['password']?.value || '';
    const passwordConfirm = form.elements['password_confirm']?.value || '';

    const nickError = validateNickname(nickname);
    const emailError = validateEmail(email);
    const emailMatchError = email && emailConfirm && email !== emailConfirm
      ? 'Емейли не збігаються.'
      : null;
    const passError = validatePassword(password);
    const passMatchError = password && passwordConfirm && password !== passwordConfirm
      ? 'Паролі не збігаються.'
      : null;

    const nickField = form.querySelector('[data-field="nickname"]');
    const emailField = form.querySelector('[data-field="email"]');
    const emailConfirmField = form.querySelector('[data-field="email-confirm"]');
    const passField = form.querySelector('[data-field="password"]');
    const passConfirmField = form.querySelector('[data-field="password-confirm"]');
    const termsField = form.querySelector('[data-field="terms"]');

    setFieldState(nickField, nickError ? 'error' : 'success');
    setFieldState(emailField, emailError ? 'error' : 'success');
    setFieldState(emailConfirmField, emailMatchError ? 'error' : 'success');
    setFieldState(passField, passError ? 'error' : 'success');
    setFieldState(passConfirmField, passMatchError ? 'error' : 'success');
    setFieldState(termsField, !termsAccepted ? 'error' : 'success');

    if (nickError === 'Нік задовгий') {
      setFormMessage(form, nickError, true);
      return;
    }

    if (!termsAccepted) {
      setFormMessage(form, 'Підтвердьте, що погоджуєтесь з умовами.', true);
      return;
    }

    if (nickError || emailError || emailMatchError || passError || passMatchError) {
      // Показуємо першу помилку за пріоритетом
      const msg = nickError || emailError || emailMatchError || passError || passMatchError;
      setFormMessage(form, msg, true);
      return;
    }

    try {
      const { ok, data } = await postJson('/auth/register', {
        nickname,
        email,
        password,
      });
      if (!ok || !data || data.ok === false) {
        const msg = (data && data.message) || 'Сталася помилка при реєстрації.';
        setFormMessage(form, msg, true);
        return;
      }
      setFormMessage(form, data.message || 'Акаунт створено.', false);
      setTimeout(() => {
        window.location.href = '/profile';
      }, 700);
    } catch (err) {
      setFormMessage(form, 'Сталася помилка. Спробуйте ще раз пізніше.', true);
    }
  });
}

function setupResetPage() {
  const form = select('form[data-form="reset"]');
  if (!form) return;

  const backBtn = select('.rectangle-4[data-nav="back"]');
  if (backBtn) {
    backBtn.addEventListener('click', () => {
      window.history.length > 1 ? window.history.back() : (window.location.href = '/authentication');
    });
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = form.elements['email']?.value || '';
    const emailError = validateEmail(email);

    const emailField = form.querySelector('[data-field="email"]');
    setFieldState(emailField, emailError ? 'error' : 'success');

    if (emailError) {
      setFormMessage(form, emailError, true);
      return;
    }

    try {
      const { ok, data } = await postJson('/auth/reset', { email });
      if (!ok || !data || data.ok === false) {
        const msg = (data && data.message) || 'Сталася помилка. Спробуйте ще раз пізніше.';
        setFormMessage(form, msg, true);
        return;
      }
      setFormMessage(form, data.message || 'Лист надіслано.', false);
    } catch (err) {
      setFormMessage(form, 'Сталася помилка. Спробуйте ще раз пізніше.', true);
    }
  });
}

// ------------- Init -------------
// При вводі будь-якого символу в полі підсвічуємо його стан як "введення".
document.addEventListener('input', (e) => {
  const input = e.target.closest('.auth-input');
  if (!input) return;
  const field = input.closest('[data-field]');
  if (!field) return;
  setFieldState(field, 'input');
});

document.addEventListener('DOMContentLoaded', () => {
  const page = document.body.getAttribute('data-page');
  switch (page) {
    case 'auth-choice':
      setupAuthChoicePage();
      break;
    case 'login':
      setupLoginPage();
      break;
    case 'register':
      setupRegisterPage();
      break;
    case 'reset-password':
      setupResetPage();
      break;
    default:
      break;
  }
});