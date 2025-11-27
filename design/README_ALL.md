<!-- SPDX-License-Identifier: LicenseRef-CityLegends-Proprietary-Docs -->

# Дизайн-ресурси — City Legends

Цей файл є навігатором для **всіх дизайн-матеріалів** проєкту *City Legends* (UI-флоу, скріншоти, специфікації компонентів).

> **Приватно та конфіденційно.** Матеріали призначені лише для внутрішнього використання авторизованими учасниками проєкту.

---

## ВАЖЛИВО (організація документації)

Усі деталі та вимоги зберігаються **внутрішньо в README/MD** відповідних папок.  
Наприклад: логіка сайту й навігації — у `website_design/SITE_LOGIC.md`; специфікації кнопок — у `button_design/BUTTON.md`; деталі дизайнерських оформлень - `art_assets/ART.md`.  
**Не дублюємо** інформацію в цьому файлі — тут лише індекс і правила.

---

## Зовнішні ресурси

1. **Figma (джерело макетів):** https://www.figma.com/design/dff4bnMz6NAjeUceuhmrPM/Untitled?node-id=653-232&t=qG0TsHGjbwX8aLNb-0  
2. **Шрифти:** *Jim Nightshade*, *Jura*, *Kelly Slab*.  
3. **Кольори/токени:** див. розділ “Загальні вимоги” у `website_design/SITE_LOGIC.md`.

---

## Структура папок дизайну

- `screenshots_photos/website_design/` — фінальні екрани сайту/лендингу, модалі (Login/Sign Up/Password Recovery, CreateRoom/FindRoom), профіль користувача.  
  - `SITE_LOGIC.md` — флоу користувача, навігація, технічні примітки (стандарти відступів/сіточки, basic A11y, розташування toast).  

- `screenshots_photos/button_design/` — компоненти кнопок, інпутів, лічильників.  
  - `BUTTON.md` — стани (default/hover/active/focus/disabled), CTA/Secondary, Toggle (on/off), розміри, відступи, бордер-радіуси.

- `screenshots_photos/game_design/` — загальні ігрові екрани та ключові елементи (поле, карти, діалоги). 

- `screenshots_photos/art_assets/` — усі доступні матеріали детального дизайну.

> Будь-які додаткові підпапки створюємо з **чіткою назвою англійською**, уникаємо пробілів: `icons/`, `illustrations/`, `fonts/` тощо.

---

## Як додавати матеріали

1. Розміщуйте файли у відповідній папці (`website_design/`, `button_design/`, `game_design/`).  
2. Додавайте короткий опис/посилання у відповідний `*.md` файл папки.  
3. Для **бінарних файлів** (`.png`, `.svg`, `.mp4`, `.ttf`, `.otf`, `.docx`, `.pptx` тощо) створюйте **sidecar** поруч:  
   ```
   filename.ext.license
   ```
   зі строкою:
   ```
   SPDX-License-Identifier: LicenseRef-CityLegends-Proprietary-Assets
   ```
   або для текстових документів у `docs/` —  
   `SPDX-License-Identifier: LicenseRef-CityLegends-Proprietary-Docs`.

---

## Ліцензія (дизайн-матеріали)

Всі матеріали в `design/` є власністю City Legends.  
`SPDX-License-Identifier: LicenseRef-CityLegends-Proprietary-Assets`  
Заборонено копіювання, модифікація, розповсюдження або публічне відтворення без письмового дозволу.  
Для питань або дозволів звертайтесь до мейнтейнерів.

> **Технічна примітка:** для актуальних патернів реалізації UI/A11y (HTML/JS для модалок, кнопок, toast, прогрес-барів) орієнтуйтесь на `docs/dev/ABOUT_SCRIPT.md` та `app/static/js/ui.js`.
