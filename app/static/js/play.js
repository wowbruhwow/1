// SPDX-License-Identifier: LicenseRef-CityLegends-Proprietary-Software
// =============================================================
// ===============   STATE MACHINE (глобально)   ===============
// =============================================================

class StateMachine {
    constructor(initial, transitions) {
        this.state = initial;
        this.transitions = transitions;
    }

    send(event) {
        const next = this.transitions[this.state]?.[event];
        if (next) this.state = next;
    }
}

const fsm = new StateMachine("idle", {
    idle:     { start: "starting" },
    starting: { myTurn: "myTurn", theirTurn: "theirTurn" },
    myTurn:   { theirTurn: "theirTurn", finish: "finished" },
    theirTurn:{ myTurn: "myTurn", finish: "finished" },
    finished: {}
});


// =============================================================
// ============  ВСЕ ІНШЕ В ОДНОМУ DOMContentLoaded  ===========
// =============================================================

window.addEventListener("DOMContentLoaded", () => {

    // =========================================================
    // ЧАТ
    // =========================================================

    const gameChatBtn = document.querySelector('.GameChat');
    const gameChatWindow = document.getElementById('gameChatWindow');
    const closeGameChat = document.getElementById('closeGameChat');
    const chatMsgBox = document.getElementById('gameChatMessages');
    const chatInput = document.getElementById('gameChatInput');
    const chatSend = document.getElementById('gameChatSend');

    function sendGameChatMessage() {
        const text = chatInput.value.trim();
        if (!text) return;
        const wrap = document.createElement("div");
        wrap.style.marginBottom = "0.4vw";
        wrap.style.background = "#d9c6b5";
        wrap.style.padding = "0.3vw 0.5vw";
        wrap.style.borderRadius = "0.4vw";
        wrap.innerHTML = `<b>Гравець</b><br>${text}`;
        chatMsgBox.appendChild(wrap);
        chatMsgBox.scrollTop = chatMsgBox.scrollHeight;
        chatInput.value = "";
    }

    gameChatBtn?.addEventListener('click', () => {
        gameChatWindow.style.display = "flex";
    });

    closeGameChat?.addEventListener("click", (e) => {
        e.stopPropagation();
        gameChatWindow.style.display = "none";
    });

    chatSend?.addEventListener('click', sendGameChatMessage);

    chatInput?.addEventListener('keydown', (e) => {
        if (e.key === "Enter") {
            e.preventDefault();
            sendGameChatMessage();
        }
    });


    // =========================================================
    // АКТИВНИЙ АВАТАР
    // =========================================================

    const avatarButton = document.querySelector(".PlayerME");
    const activeAvatar = localStorage.getItem("active_avatar");
    if (avatarButton && activeAvatar) {
        avatarButton.style.backgroundImage = `url('${activeAvatar}')`;
        avatarButton.style.backgroundSize = "cover";
    }


    // =========================================================
    // МОДАЛКА СКИДУ
    // =========================================================

    const openDropsBtn = document.querySelector('.OpenDrops');
    const dropsOverlay = document.getElementById('modalOverlay_drops');
    const dropsClose = document.getElementById('closeModal_drops');

    openDropsBtn?.addEventListener("click", () => {
        dropsOverlay.style.display = "flex";
    });

    dropsClose?.addEventListener("click", () => {
        dropsOverlay.style.display = "none";
    });


    // =========================================================
    // МОДАЛКА GAME MENU
    // =========================================================

    const openMenuBtn = document.querySelector(".GameMenu");
    const gameMenuOverlay = document.getElementById("modalOverlay_gameMenu");
    const closeMenu = document.getElementById("closeModal_gameMenu");
    const backBtn = document.querySelector(".hex_btn");

    openMenuBtn?.addEventListener("click", () => {
        gameMenuOverlay.style.display = "flex";
    });

    closeMenu?.addEventListener("click", () => {
        gameMenuOverlay.style.display = "none";
    });

    backBtn?.addEventListener("click", () => {
        gameMenuOverlay.style.display = "none";
    });


    // =========================================================
    // FSM + CHAT INTEGRATION
    // =========================================================

    function systemMessage(text) {
        const wrap = document.createElement("div");
        wrap.style.marginBottom = "0.4vw";
        wrap.style.background = "#fff3c4";
        wrap.style.padding = "0.3vw 0.5vw";
        wrap.style.borderRadius = "0.4vw";
        wrap.innerHTML = `<b>Система</b><br>${text}`;
        chatMsgBox.appendChild(wrap);
        chatMsgBox.scrollTop = chatMsgBox.scrollHeight;
    }

    const originalSend = fsm.send.bind(fsm);
    fsm.send = function(event) {
        originalSend(event);

        if (event === "start") systemMessage("ГРА ПОЧАЛАСЬ!");
        if (event === "finish") systemMessage("ГРУ ЗАВЕРШЕНО!");
        if (event === "myTurn") systemMessage("Твій хід!");
        if (event === "theirTurn") systemMessage("Хід суперника!");
    };

    document.querySelectorAll("#fsm-debug button").forEach(btn => {
        btn.addEventListener("click", () => {
            fsm.send(btn.dataset.event);
        });
    });

    // =========================================================
    // DRAGGABLE CHAT WINDOW
    // =========================================================

    (function enableDragging() {
        const header = document.querySelector(".game-chat-header");
        const win = document.getElementById("gameChatWindow");
        const closeBtn = document.getElementById("closeGameChat");

        if (!header || !win) return;

        let startX = 0;
        let startY = 0;
        let startLeft = 0;
        let startTop = 0;
        let isDown = false;

        // Забороняємо drag, якщо клікаємо на кнопку закриття
        closeBtn?.addEventListener("mousedown", e => e.stopPropagation());

        header.addEventListener("mousedown", (e) => {
            if (closeBtn && closeBtn.contains(e.target)) return;

            isDown = true;
            startX = e.clientX;
            startY = e.clientY;
            startLeft = win.offsetLeft;
            startTop = win.offsetTop;

            document.addEventListener("mousemove", dragMove);
            document.addEventListener("mouseup", dragEnd);
        });

        function dragMove(e) {
            if (!isDown) return;

            const dx = e.clientX - startX;
            const dy = e.clientY - startY;

            win.style.left = startLeft + dx + "px";
            win.style.top = startTop + dy + "px";
        }

        function dragEnd() {
            isDown = false;
            document.removeEventListener("mousemove", dragMove);
            document.removeEventListener("mouseup", dragEnd);
        }
    })();

    const faqBtn = document.querySelector(".CardsFAQ");

    faqBtn?.addEventListener("click", () => {
        window.open("/faq-about-cards", "_blank");
    });

});
