// SPDX-License-Identifier: LicenseRef-CityLegends-Proprietary-Software

// =============================================================
// ======= МОДАЛЬНІ ВІКНА (РЕЄСТРАЦІЯ / АВТОРИЗАЦІЯ) =======
// =============================================================

const registerBtn = document.getElementById('registerBtn');
const authorizationBtn = document.getElementById('authorizationBtn');

const modalOverlay_registration = document.getElementById('modalOverlay_registration');
const modalOverlay_authorization = document.getElementById('modalOverlay_authorization');

const closeModal_registration = document.getElementById('closeModal_registration');
const closeModal_authorization = document.getElementById('closeModal_authorization');

// Відкриття модалок
if (registerBtn && modalOverlay_registration) {
    registerBtn.addEventListener('click', () => {
        modalOverlay_registration.style.display = 'flex';
    });
}

if (authorizationBtn && modalOverlay_authorization) {
    authorizationBtn.addEventListener('click', () => {
        modalOverlay_authorization.style.display = 'flex';
    });
}

// Закриття по кнопці ×
if (closeModal_registration && modalOverlay_registration) {
    closeModal_registration.addEventListener('click', () => {
        modalOverlay_registration.style.display = 'none';
    });
}

if (closeModal_authorization && modalOverlay_authorization) {
    closeModal_authorization.addEventListener('click', () => {
        modalOverlay_authorization.style.display = 'none';
    });
}

// Закриття по кліку на фон
if (modalOverlay_registration) {
    modalOverlay_registration.addEventListener('click', (event) => {
        if (event.target === modalOverlay_registration) {
            modalOverlay_registration.style.display = 'none';
        }
    });
}

if (modalOverlay_authorization) {
    modalOverlay_authorization.addEventListener('click', (event) => {
        if (event.target === modalOverlay_authorization) {
            modalOverlay_authorization.style.display = 'none';
        }
    });
}

// =============================================================
// ======= ВІДНОВЛЕННЯ ПАРОЛЮ =======
// =============================================================

const forgotPasswordBtn = document.getElementById('forgotPasswordBtn');
if (forgotPasswordBtn) {
    forgotPasswordBtn.addEventListener('click', () => {
        window.open('reset-password.html', 'resetWindow', 'width=800,height=600');
    });
}

const denyResetBtn = document.getElementById('denyResetBtn');
if (denyResetBtn) {
    denyResetBtn.addEventListener('click', () => {
        if (window.opener) window.close();
        else window.history.back();
    });
}

// =============================================================
// ======= ВІДКРИТТЯ КАРТОК FAQ У НОВІЙ ВКЛАДЦІ =======
// =============================================================

const cardsFaqBtn = document.querySelector('.CardsFAQ');
if (cardsFaqBtn) {
    cardsFaqBtn.addEventListener('click', () => {
        window.open('faq-about-cards.html', 'cardsFaqWindow', 'width=800,height=600');
    });
}

// =============================================================
// ======= СИСТЕМА ПИТАНЬ І ВІДПОВІДЕЙ =======
// =============================================================

const questions = document.querySelectorAll(".question");
const answerBox = document.querySelector(".answer_box");

const answers = {
    "Що таке HTML?": "HTML (HyperText Markup Language) — це мова розмітки для створення структури веб-сторінок.",
    "Що таке CSS?": "CSS (Cascading Style Sheets) — мова стилів, яка визначає вигляд HTML-елементів.",
    "Що таке JavaScript?": "JavaScript — це мова програмування, яка додає інтерактивність до сторінок.",
    "Чим відрізняється мама і папа?": "Мама і тато відрізняються ролями у родині, але обидва важливі у вихованні дитини ❤️",
    "Що таке ПК?": "ПК (персональний комп’ютер) — це пристрій для обробки інформації та виконання програм.",
    "Що таке DОOM?": "DOOM — це класична відеогра жанру шутер від першої особи, створена id Software у 1993 році.",
    "Як працює GitLab?": "GitLab — це платформа для управління кодом, яка поєднує Git-репозиторії, CI/CD і засоби для командної розробки."
};

questions.forEach(button => {
    button.addEventListener("click", () => {
        const text = button.textContent.trim();
        answerBox.innerHTML = `<p>${answers[text] || "Немає відповіді для цього питання."}</p>`;
    });
});

// =============================================================
// ======= ПЕРЕХІД НА СТОРІНКУ НАЛАШТУВАНЬ =======
// =============================================================

document.addEventListener("DOMContentLoaded", () => {
    const settingsButton = document.querySelector(".Settings");
    if (settingsButton) {
        settingsButton.addEventListener("click", () => {
            window.location.href = "/settings";
        });
    }
});

// =============================================================
// ======= НАЛАШТУВАННЯ ГРАВЦЯ (АВАТАРИ, КНОПКИ) =======
// =============================================================

// Тепер openFilePicker перевіряє: якщо фото вже є — робить його активним, інакше відкриває провідник
function openFilePicker(index) {
    const saved = localStorage.getItem(`custom_avatar_${index}`);
    if (saved) {
        // встановлюємо як активний (відображається в профілі)
        localStorage.setItem('active_avatar', saved);
        // опціонально: підсвітити вибір у налаштуваннях (реагувати CSS-класом)
        highlightActiveAvatar(index);
        alert(`✅ Аватар ${index} вибрано!`);
    } else {
        // якщо немає збереженого фото — відкриваємо провідник
        const input = document.getElementById(`avatarInput${index}`);
        if (input) input.click();
    }
}

// Встановити кастомний аватар при виборі файлу
function setAvatar(input, index) {
    const file = input.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function (e) {
            const dataUrl = e.target.result;
            const button = document.querySelectorAll('.custom_avatar')[index - 1];
            if (button) {
                button.style.backgroundImage = `url('${dataUrl}')`;
                button.style.backgroundSize = 'cover';
                button.style.backgroundPosition = 'center';
            }
            // зберігаємо в localStorage
            localStorage.setItem(`custom_avatar_${index}`, dataUrl);
            // автоматично робимо цей аватар активним після завантаження
            localStorage.setItem('active_avatar', dataUrl);
            highlightActiveAvatar(index);
            alert(`✅ Аватар ${index} завантажено і вибрано!`);
        };
        reader.readAsDataURL(file);
    }
}

// Показати збережені аватари (без додаткових обробників click)
function loadSavedAvatars() {
    const customAvatars = document.querySelectorAll('.custom_avatar');
    customAvatars.forEach((button, i) => {
        const saved = localStorage.getItem(`custom_avatar_${i + 1}`);
        if (saved) {
            button.style.backgroundImage = `url('${saved}')`;
            button.style.backgroundSize = 'cover';
            button.style.backgroundPosition = 'center';
        } else {
            // якщо немає збереженого фото — можна задати дефолтний вигляд
            button.style.backgroundImage = '';
            button.style.backgroundColor = '#ccc';
        }
    });

    // підсвітити активний, якщо є
    const active = localStorage.getItem('active_avatar');
    if (active) {
        // знайдемо індекс активного серед кастомних (якщо збігається)
        for (let i = 1; i <= customAvatars.length; i++) {
            const saved = localStorage.getItem(`custom_avatar_${i}`);
            if (saved === active) {
                highlightActiveAvatar(i);
                break;
            }
        }
    }
}

// Відзначити (CSS-класом) активну аватарку в налаштуваннях
function highlightActiveAvatar(index) {
    const customAvatars = document.querySelectorAll('.custom_avatar');
    customAvatars.forEach((btn, i) => {
        btn.classList.toggle('active-avatar', (i === index - 1));
    });
}

// Скинути аватари
function resetAvatars() {
    const customAvatars = document.querySelectorAll('.custom_avatar');
    customAvatars.forEach((button, i) => {
        button.style.backgroundImage = '';
        button.style.backgroundColor = '#ccc';
        localStorage.removeItem(`custom_avatar_${i + 1}`);
        button.classList.remove('active-avatar');
    });
    localStorage.removeItem('active_avatar');
    for (let i = 1; i <= 4; i++) {
        const input = document.getElementById(`avatarInput${i}`);
        if (input) input.value = '';
    }
}

// ================================================================================
// ======= ОБРОБКА КНОПОК "ЗБЕРЕГТИ", "СКИНУТИ", "НАЗАД", "ВИЙТИ З АКАУНТУ" =======
// ================================================================================

document.addEventListener('DOMContentLoaded', () => {
    loadSavedAvatars();

    const resetButton = document.querySelector('.ResetButton');
    const saveButton = document.querySelector('.SaveButton');
    const backButton = document.querySelector('.BackButton');

    if (resetButton) {
        resetButton.addEventListener('click', resetAvatars);
    }

    if (saveButton) {
        saveButton.addEventListener('click', () => {
            alert("✅ Налаштування збережено!");
            window.location.href = "/profile";
        });
    }

    if (backButton) {
        backButton.addEventListener('click', () => {
            window.location.href = "/profile";
        });
    }

    // Відобразити активний аватар у профілі (кнопка .Avatar на сторінці профілю)
    const avatarButton = document.querySelector(".Avatar");
    if (avatarButton) {
        const activeAvatar = localStorage.getItem("active_avatar");
        if (activeAvatar) {
            avatarButton.style.backgroundImage = `url('${activeAvatar}')`;
            avatarButton.style.backgroundSize = 'cover';
            avatarButton.style.backgroundPosition = 'center';
        }
    }
});

const goBackButton = document.querySelector('.GoBackBtn');
if (goBackButton) {
    goBackButton.addEventListener('click', () => {
        // Вихід з акаунту + повернення на екран авторизації
        window.location.href = "/auth/logout"; 
    });
}

// ================================================================================
// ======= ОБРОБКА КНОПОК "СТВОРИТИ КІМНАТУ", "ЗБЕРЕГТИ КІМНАТУ" ======
// ================================================================================

// === CREATE ROOM ===
const createRoomBtn = document.querySelector('#createRoomBtnAnchor');
const createModal = document.getElementById('createRoomModal');

function updateCreateModalVars() {
    const rect = createRoomBtn.getBoundingClientRect();
    document.documentElement.style.setProperty('--btn-bottom', rect.bottom + window.scrollY + 'px');
    document.documentElement.style.setProperty('--btn-left', rect.left + rect.width / 2 + window.scrollX + 'px');
}

createRoomBtn.addEventListener('click', () => {
    updateCreateModalVars();
    createModal.classList.toggle('open');
});

window.addEventListener('scroll', updateCreateModalVars);
window.addEventListener('resize', updateCreateModalVars);


// === JOIN ROOM ===
const joinRoomBtn = document.querySelector('#joinRoomBtnAnchor');
const joinModal = document.getElementById('joinRoomModal');

function updateJoinModalVars() {
    const rect = joinRoomBtn.getBoundingClientRect();
    document.documentElement.style.setProperty('--join-btn-bottom', rect.bottom + window.scrollY + 'px');
    document.documentElement.style.setProperty('--join-btn-left', rect.left + rect.width / 2 + window.scrollX + 'px');
}

joinRoomBtn.addEventListener('click', () => {
    updateJoinModalVars();
    joinModal.classList.toggle('open');
});

window.addEventListener('scroll', updateJoinModalVars);
window.addEventListener('resize', updateJoinModalVars);

// Підтвердження приєднання до кімнати
const joinConfirmBtn = document.querySelector('#joinRoomModal .confirmBtn');
const joinModalEl = document.getElementById('joinRoomModal');
const joinRoomIdInput = joinModalEl ? document.getElementById('joinRoomIdInput') : null;
const joinRoomPasswordInput = joinModalEl ? document.getElementById('joinRoomPasswordInput') : null;

if (joinConfirmBtn) {
    joinConfirmBtn.addEventListener('click', async () => {
        if (!joinRoomIdInput) return;
        const raw = joinRoomIdInput.value.trim();
        if (!raw) {
            alert('Введіть ID або код кімнати.');
            return;
        }

        let roomId = raw;
        const match = raw.match(/^CL-(\d+)$/i);
        if (match) {
            roomId = match[1];
        }

        if (!/^[0-9]+$/.test(roomId)) {
            alert('ID кімнати має бути числом або кодом вигляду CL-<ID>.');
            return;
        }

        const password = joinRoomPasswordInput ? joinRoomPasswordInput.value.trim() : '';
        const payload = {};
        if (password) {
            payload.password = password;
        }

        try {
            const { ok, data } = await postJson(`/rooms/${roomId}/join`, payload);
            if (!ok || !data || data.ok === false) {
                const msg = (data && data.message) || 'Не вдалося приєднатися до кімнати.';
                alert(msg);
                return;
            }

            const room = data.room;
            if (!room || !room.id) {
                alert('Некоректна відповідь сервера при приєднанні до кімнати.');
                return;
            }

            // Прив'язуємо чат до реальної кімнати з БД
            setRoomId(room.id);

            if (joinModalEl) {
                joinModalEl.classList.remove('open');
            }

            if (roomCreatedPanel) {
                roomCreatedPanel.style.display = 'block';
            }

            requestAnimationFrame(() => {
                initializeChatUI();
            });
        } catch (err) {
            console.error('Join room error:', err);
            alert('Сталася помилка при приєднанні до кімнати. Спробуйте пізніше.');
        }
    });
}

const nicknameInput = document.getElementById("nicknameInput");
const editBtn = document.getElementById("editNicknameBtn");
const saveBtn = document.getElementById("saveNicknameBtn");

async function postJson(url, body) {
    const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
        cache: "no-store",
    });
    let data = null;
    try {
        data = await res.json();
    } catch (e) {
        data = null;
    }
    return { ok: res.ok, status: res.status, data };
}

// Редагування ніку тільки на сторінці профілю
if (nicknameInput && editBtn && saveBtn) {
    // Натискаємо "Змінити"
    editBtn.addEventListener("click", () => {
        nicknameInput.disabled = false;
        nicknameInput.focus();
    });

    // Натискаємо "Зберегти" — оновлюємо нік у БД
    saveBtn.addEventListener("click", async () => {
        const newNick = nicknameInput.value.trim();

        if (newNick.length < 3) {
            alert("Нік має бути довшим за 2 символи");
            return;
        }

        try {
            const { ok, data } = await postJson('/profile/nickname', { nickname: newNick });
            if (!ok || !data || data.ok === false) {
                const msg = (data && data.message) || 'Не вдалося зберегти нік.';
                alert(msg);
                return;
            }
            nicknameInput.disabled = true;
            alert(data.message || 'Зміни збережено.');
        } catch (err) {
            console.error('Nickname update error:', err);
            alert('Сталася помилка при збереженні ніку. Спробуйте пізніше.');
        }
    });
}

// Панель після створення кімнати
const createConfirmBtn = document.querySelector('#createRoomModal .confirmBtn');
const roomCreatedPanel = document.getElementById('roomCreatedPanel');
const closeCreatedPanel = document.querySelector('.close-created-panel');
const createModalEl = document.getElementById('createRoomModal');
const createNameInput = createModalEl ? createModalEl.querySelector('.modal-name input') : null;
const createPlayersButtons = createModalEl ? Array.from(createModalEl.querySelectorAll('.players-block .modal-row button')) : [];
const createAccessButtons = createModalEl ? Array.from(createModalEl.querySelectorAll('.modal-access .modal-row button')) : [];
const createPasswordInput = createModalEl ? createModalEl.querySelector('.modal-password input') : null;
const createModeButtons = createModalEl ? Array.from(createModalEl.querySelectorAll('.modal-mode .modal-row button')) : [];

function setupToggleGroup(buttons) {
    if (!buttons || !buttons.length) return;
    buttons.forEach((btn) => {
        btn.addEventListener('click', () => {
            buttons.forEach((b) => b.classList.remove('active'));
            btn.classList.add('active');
        });
    });
}

setupToggleGroup(createPlayersButtons);
setupToggleGroup(createAccessButtons);
setupToggleGroup(createModeButtons);

// Відкриття панелі
if (createConfirmBtn) {
    createConfirmBtn.addEventListener('click', async () => {
        if (!createNameInput) return;
        const name = createNameInput.value.trim();
        if (!name) {
            alert('Вкажіть назву кімнати.');
            return;
        }

        let maxPlayers = 2;
        const activePlayersBtn = createPlayersButtons.find((btn) => btn.classList.contains('active'));
        if (activePlayersBtn) {
            const label = activePlayersBtn.textContent.trim();
            if (label === '4') {
                maxPlayers = 4;
            }
        }

        let access = 'public';
        const activeAccessBtn = createAccessButtons.find((btn) => btn.classList.contains('active'));
        if (activeAccessBtn) {
            const label = activeAccessBtn.textContent.trim();
            if (label === 'Приватна') {
                access = 'private';
            }
        }

        let mode = 'quick';
        const activeModeBtn = createModeButtons.find((btn) => btn.classList.contains('active'));
        if (activeModeBtn) {
            const label = activeModeBtn.textContent.trim();
            if (label === 'Класична') {
                mode = 'classic';
            }
        }

        const password = createPasswordInput ? createPasswordInput.value.trim() : '';
        if (access === 'private' && password.length < 4) {
            alert('Пароль для приватної кімнати має містити щонайменше 4 символи.');
            return;
        }

        const payload = { name, mode, maxPlayers, access };
        if (access === 'private' && password) {
            payload.password = password;
        }

        try {
            const { ok, data } = await postJson('/rooms', payload);
            if (!ok || !data || data.ok === false) {
                const msg = (data && data.message) || 'Не вдалося створити кімнату. Спробуйте ще раз.';
                alert(msg);
                return;
            }

            const room = data.room;
            if (!room || !room.id) {
                alert('Некоректна відповідь сервера при створенні кімнати.');
                return;
            }

            // Використовуємо id реальної кімнати з БД для чату
            setRoomId(room.id);

            if (createModalEl) {
                createModalEl.classList.remove('open');
            }

            if (roomCreatedPanel) {
                roomCreatedPanel.style.display = 'block';
            }

            requestAnimationFrame(() => {
                initializeChatUI();
            });
        } catch (err) {
            console.error('Create room error:', err);
            alert('Сталася помилка при створенні кімнати. Спробуйте пізніше.');
        }
    });
}

// Закриття панелі
closeCreatedPanel.addEventListener('click', () => {
    roomCreatedPanel.style.display = "none";
});

// Перемикач вкладок
document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {

        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        const tab = btn.dataset.tab;

        document.querySelectorAll('.tab-content').forEach(c => c.style.display = 'none');
        document.getElementById(`tab-${tab}`).style.display = 'block';
    });
});

// ===================== ЧАТ У ЛОБІ (Варіант №1 — roomId з API) =====================

let chatMessages = null;
let chatInput = null;
let chatSendBtn = null;
let nicknameInputEl = document.getElementById("nicknameInput");
let roomId = null;
let lastMessageId = null;

function escapeHtml(str) {
    return String(str)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function setRoomId(id) {
    console.log("ROOM SET:", id);
    roomId = id;
    lastMessageId = null;
    loadChat();
}

function renderMessage(msg) {
    const wrap = document.createElement("div");
    wrap.classList.add("chat-message");

    const nick = nicknameInputEl?.value.trim() || "";
    wrap.classList.add(msg.author === nick ? "chat-message--me" : "chat-message--other");

    const time = msg.createdAt
        ? new Date(msg.createdAt).toLocaleTimeString("uk-UA", { hour: "2-digit", minute: "2-digit" })
        : "";

    wrap.innerHTML = `
        <div class="chat-message__meta">
            <span class="chat-message__author">${escapeHtml(msg.author)}</span>
            ${time ? `<span class="chat-message__time">${time}</span>` : ""}
        </div>
        <div class="chat-message__text">${escapeHtml(msg.text)}</div>
    `;
    return wrap;
}

async function loadChat() {
    if (!roomId || !chatMessages) return;

    const url = lastMessageId
        ? `/api/chat/${roomId}?sinceId=${encodeURIComponent(lastMessageId)}`
        : `/api/chat/${roomId}`;

    try {
        const res = await fetch(url);
        if (!res.ok) return;

        const data = await res.json();
        const messages = Array.isArray(data.messages) ? data.messages : [];

        if (!lastMessageId) chatMessages.innerHTML = "";

        for (const msg of messages) {
            chatMessages.appendChild(renderMessage(msg));
            lastMessageId = msg.id;
        }

        chatMessages.scrollTop = chatMessages.scrollHeight;
    } catch (err) {
        console.error("Chat load error:", err);
    }
}

async function sendMessage() {
    if (!chatInput) return;

    const text = chatInput.value.trim();
    if (!text) return;

    const author = nicknameInputEl?.value.trim() || "Гравець";

    // 1. ЛОКАЛЬНО СТВОРЮЄМО ПОВІДОМЛЕННЯ
    const localMsg = {
        id: "local-" + Date.now(),
        author,
        text,
        createdAt: new Date().toISOString(),
    };

    if (chatMessages) {
        // додаємо в DOM одразу
        chatMessages.appendChild(renderMessage(localMsg));
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    // очищаємо інпут одразу, незалежно від сервера
    chatInput.value = "";

    // 2. Якщо немає roomId — вважаємо, що чат не ініціалізовано, і не показуємо локальні повідомлення
    if (!roomId) {
        alert('Чат доступний тільки в межах кімнати. Спочатку створіть або приєднайтесь до кімнати.');
        // В ідеалі цей стан не мав би траплятись, бо setRoomId викликається після /rooms або /join
        return;
    }

    // 3. ПРОБУЄМО ВІДПРАВИТИ НА БЕКЕНД
    try {
        const res = await fetch(`/api/chat/${roomId}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ text, author })
        });

        if (!res.ok) {
            console.warn("Chat send failed with status:", res.status);
            return;
        }

        // якщо бекенд відповів — підтягнемо "офіційну" історію
        await loadChat();
    } catch (err) {
        console.error("Chat send error:", err);
        // UI вже оновлено, так що просто лог
    }
}


function initializeChatUI() {
    chatMessages = document.getElementById("chatMessages");
    chatInput = document.getElementById("chatInput");
    chatSendBtn = document.getElementById("chatSendBtn");

    if (!chatMessages || !chatInput || !chatSendBtn) {
        console.warn("Chat UI missing:", { chatMessages, chatInput, chatSendBtn });
        return;
    }

    chatSendBtn.onclick = sendMessage;

    chatInput.onkeydown = (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    console.log("Chat UI initialized successfully");
}

setInterval(() => {
    if (roomId) loadChat();
}, 2000);




// SPDX-License-Identifier: LicenseRef-CityLegends-Proprietary-Software
// =============================================================
// ======= МОДАЛЬНЕ ВІКНО ДЛЯ "СКИДУ" =======
// =============================================================

const openDropsBtn = document.querySelector('.OpenDrops');
const modalOverlay_drops = document.getElementById('modalOverlay_drops');
const closeModal_drops = document.getElementById('closeModal_drops');
const dialogDrops = modalOverlay_drops ? modalOverlay_drops.querySelector('.modal_drops') : null;

let lastFocusDrops = null;

function getFocusable(root) {
  return root
    ? Array.from(
        root.querySelectorAll(
          'a[href], button, textarea, input, select, [tabindex]:not([tabindex="-1"])'
        )
      ).filter(el => !el.hasAttribute('disabled') && el.getAttribute('aria-disabled') !== 'true')
    : [];
}

function openDropsModal() {
  if (!modalOverlay_drops || !dialogDrops) return;
  lastFocusDrops = document.activeElement;
  modalOverlay_drops.hidden = false;
  modalOverlay_drops.style.display = 'flex';
  const focusables = getFocusable(dialogDrops);
  (focusables[0] || dialogDrops).focus();
}

function closeDropsModal() {
  if (!modalOverlay_drops || !dialogDrops) return;
  modalOverlay_drops.style.display = 'none';
  modalOverlay_drops.hidden = true;
  if (lastFocusDrops && typeof lastFocusDrops.focus === 'function') {
    lastFocusDrops.focus();
    lastFocusDrops = null;
  }
}

// Відкриття
if (openDropsBtn && modalOverlay_drops) {
  openDropsBtn.addEventListener('click', openDropsModal);
}

// Закриття по кнопці ×
if (closeModal_drops && modalOverlay_drops) {
  closeModal_drops.addEventListener('click', closeDropsModal);
}

// Закриття по кліку на фон
if (modalOverlay_drops) {
  modalOverlay_drops.addEventListener('click', (event) => {
    if (event.target === modalOverlay_drops) {
      closeDropsModal();
    }
  });
}

// Фокус-трап + Esc для модалки "Скинуті карти"
if (dialogDrops) {
  dialogDrops.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      closeDropsModal();
      return;
    }
    if (e.key === 'Tab') {
      const focusables = getFocusable(dialogDrops);
      if (!focusables.length) return;
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
}

// =============================================================
// ======= МОДАЛЬНЕ ВІКНО ДЛЯ GAME MENU =======
// =============================================================

const openGameMenuBtn = document.querySelector('.GameMenu');
const modalOverlay_gameMenu = document.getElementById('modalOverlay_gameMenu');
const closeModal_gameMenu = document.getElementById('closeModal_gameMenu');
const dialogGameMenu = modalOverlay_gameMenu ? modalOverlay_gameMenu.querySelector('.modal_gameMenu') : null;
const backButton = document.querySelector('.hex_btn');

let lastFocusGameMenu = null;

function openGameMenuModal() {
  if (!modalOverlay_gameMenu || !dialogGameMenu) return;
  lastFocusGameMenu = document.activeElement;
  modalOverlay_gameMenu.hidden = false;
  modalOverlay_gameMenu.style.display = 'flex';
  const focusables = getFocusable(dialogGameMenu);
  (focusables[0] || dialogGameMenu).focus();
}

function closeGameMenuModal() {
  if (!modalOverlay_gameMenu || !dialogGameMenu) return;
  modalOverlay_gameMenu.style.display = 'none';
  modalOverlay_gameMenu.hidden = true;
  if (lastFocusGameMenu && typeof lastFocusGameMenu.focus === 'function') {
    lastFocusGameMenu.focus();
    lastFocusGameMenu = null;
  }
}

// Відкриття
if (openGameMenuBtn && modalOverlay_gameMenu) {
  openGameMenuBtn.addEventListener('click', openGameMenuModal);
}

// Закриття по ×
if (closeModal_gameMenu) {
  closeModal_gameMenu.addEventListener('click', closeGameMenuModal);
}

// Закриття по кліку на фон
if (modalOverlay_gameMenu) {
  modalOverlay_gameMenu.addEventListener('click', (e) => {
    if (e.target === modalOverlay_gameMenu) {
      closeGameMenuModal();
    }
  });
}

// Закриття по кнопці "--Назад--"
if (backButton && modalOverlay_gameMenu) {
  backButton.addEventListener('click', closeGameMenuModal);
}

// Фокус-трап + Esc для модалки Game Menu
if (dialogGameMenu) {
  dialogGameMenu.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      closeGameMenuModal();
      return;
    }
    if (e.key === 'Tab') {
      const focusables = getFocusable(dialogGameMenu);
      if (!focusables.length) return;
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
}

// =============================================================
// ======= УНІВЕРСАЛЬНІ МОДАЛЬНІ ВІКНА =======
// =============================================================

// Відкриття модалок
document.querySelectorAll('[data-modal]').forEach(button => {
  button.addEventListener('click', () => {
    const modalId = button.getAttribute('data-modal');
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.style.display = 'flex';
      document.body.style.overflow = 'hidden';
    }
  });
});

// Закриття модалок
document.querySelectorAll('.modalOverlay').forEach(modal => {
  const closeBtn = modal.querySelector('.closeModal');

  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      modal.style.display = 'none';
      document.body.style.overflow = '';
    });
  }

  // Закриття при кліку на фон
  modal.addEventListener('click', (event) => {
    if (event.target === modal) {
      modal.style.display = 'none';
      document.body.style.overflow = '';
    }
  });
});