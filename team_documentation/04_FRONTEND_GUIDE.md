# Техническое руководство по фронтенду

## 🔍 Обзор

В этом документе представлено подробное руководство по веб-фронтенду: архитектура, страницы, стили и функциональность JavaScript.

---

## 📋 Оглавление

1. [Обзор архитектуры](#обзор-архитектуры)
2. [Структура проекта](#структура-проекта)
3. [Страницы и навигация](#страницы-и-навигация)
4. [Система стилей](#система-стилей)
5. [Архитектура JavaScript](#архитектура-javascript)
6. [Интеграция с API](#интеграция-с-api)
7. [Основные возможности](#основные-возможности)
8. [Лучшие практики](#лучшие-практики)

---

## 🏗 Обзор архитектуры

### Технологический стек

| Компонент | Технология | Назначение |
|-----------|------------|---------|
| **Структура** | HTML5 | Семантичная разметка |
| **Стили** | CSS3 (собственные) | Адаптивный дизайн, темы |
| **Интерактивность** | Ванильный JavaScript | Без зависимостей от фреймворков |
| **Иконки** | Собственные SVG (инлайн) | Единая иконография |
| **Хранилище** | LocalStorage | Предпочтения и настройки пользователя |

### Философия проектирования

- **Без фреймворков**: чистый ванильный JavaScript для максимальной производительности и минимальных зависимостей
- **Адаптивность**: подход «mobile-first», работа на любых размерах экрана
- **Доступность**: соответствие WCAG 2.1 AA с корректными ARIA-атрибутами
- **Многоязычность**: интерфейс на русском и английском с сохранением выбора в localStorage
- **Современность**: пользовательские CSS-свойства, flexbox, grid, анимации

### Поток приложения

```
User → HTML Page → CSS Styling → JavaScript Enhancement → API Calls → Dynamic Content
```

---

## 📁 Структура проекта

```
frontend/
├──  pages/                    # HTML pages
│   ├── index.html              # Homepage
│   ├── diagnose.html           # AI diagnosis page
│   ├── diseases.html           # Disease library
│   ├── history.html            # Prediction history
│   ├── about.html              # About page
│   ├── safety.html             # Safety information
│   └── education.html          # Patient education
│
├──  styles/                   # CSS files
│   └── styles.css              # Main stylesheet (all styles)
│
├──  js/                       # JavaScript files
│   └── app.js                  # Main application script
│
├──  assets/                   # Static assets
│   └── icons.js                # SVG icon definitions
│
└── README.md                   # Frontend documentation
```

### Ключевые файлы

| Файл | Строк | Назначение |
|------|-------|---------|
| `styles.css` | ~1500+ | Все стили, адаптивные точки перелома, темы |
| `app.js` | 759 | Вся логика JavaScript, вызовы API, работа с UI |
| `icons.js` | ~200+ | Определения SVG-иконок в виде JavaScript-функций |

---

## 📄 Страницы и навигация

### 1. Главная страница (`index.html`)

**Назначение:** посадочная страница с обзором проекта и избранными заболеваниями.

**Ключевые разделы:**
- Hero-блок с названием проекта и слоганом
- Сетка избранных заболеваний (карточки с эффектами при наведении)
- Быстрая навигация по основным функциям
- Кнопки призыва к действию

**Источники данных:**
- Данные заболеваний из API бэкенда (`/api/v1/library`)
- Контент из бэкенда (`/api/v1/content/home`)

---

### 2. Страница диагностики (`diagnose.html`)

**Назначение:** основной интерфейс диагностики ИИ для загрузки и анализа снимков глаз.

**Ключевые компоненты:**
- **Dropzone**: область загрузки файлов перетаскиванием
- **Предпросмотр**: просмотр изображения в лайтбоксе
- **Кнопка «Анализ»**: запускает предсказание ИИ
- **Индикатор статуса**: показывает текущее состояние (покой, загрузка, готово, ошибка)
- **Отображение результатов**: показывает предсказание с оценкой достоверности
- **Кнопка сброса**: очищает текущий случай

**Рабочий процесс:**
1. Пользователь загружает/перетаскивает изображение
2. Фронтенд проверяет тип и размер файла
3. Отображается предпросмотр изображения
4. Пользователь нажимает «Анализ»
5. Изображение отправляется в бэкенд (`POST /predict`)
6. Результаты отображаются с оценкой достоверности
7. Предсказание автоматически сохраняется в базе данных

---

### 3. Страница заболеваний (`diseases.html`)

**Назначение:** подробная библиотека заболеваний с поиском и фильтрацией.

**Основные возможности:**
- **Строка поиска**: фильтрация заболеваний по названию или симптомам
- **Вкладки заболеваний**: фильтр по конкретной категории
- **Карточки заболеваний**: подробная информация о каждом состоянии
- **Контент из API**: описания заболеваний из бэкенда
- **Фильтры и поиск**: подбор заболеваний по названию и категории

**Структура данных заболевания:**
```javascript
{
  id: "cataract",
  name: "Cataract",
  name_ar: "المياه البيضاء",
  short: "Clouding of the eye's lens...",
  short_ar: "تعكر في عدسة العين...",
  symptoms_ar: ["رؤية ضبابية", "حساسية للضوء"],
  red_flags_ar: ["فقدان البصر المفاجئ"],
  safe_tips_ar: ["جراحة إزالة المياه البيضاء"],
  when_to_see_doctor_ar: "فوراً عند ملاحظة أي تغير",
  risk_level: "Moderate"
}
```

---

### 4. Страница истории (`history.html`)

**Назначение:** просмотр и управление прошлыми предсказаниями.

**Основные возможности:**
- **Выпадающий фильтр**: фильтрация по типу заболевания
- **Список истории**: хронологический список предсказаний
- **Функция удаления**: удаление отдельных или всех записей
- **Статистика**: количество и распределение предсказаний

**Источник данных:**
- API бэкенда: `GET /api/v1/results`

---

### 5. Страница «О проекте» (`about.html`)

**Назначение:** информация о проекте, участниках команды и технологическом стеке.

**Ключевые разделы:**
- Обзор проекта и его цели
- Список участников команды
- Технологический стек
- Информация о руководителе
- Принадлежность к университету

**Источник данных:**
- API бэкенда: `GET /api/v1/content/about`

---

### 6. Страница «Безопасность» (`safety.html`)

**Назначение:** важная информация о безопасности и дисклеймеры.

**Ключевые компоненты:**
- Баннер предупреждения
- Карточки безопасности с рекомендациями
- Советы по клинической эскалации
- Медицинский дисклеймер

**Источник данных:**
- API бэкенда: `GET /api/v1/content/safety`

---

### 7. Страница «Обучение» (`education.html`)

**Назначение:** образовательные материалы для пациентов и советы по уходу за глазами.

**Основные возможности:**
- Образовательные блоки с иконками
- Советы по профилактике
- Полезные привычки для здоровья глаз

**Источник данных:**
- API бэкенда: `GET /api/v1/content/education`

---

## 🎨 Система стилей

### Пользовательские CSS-свойства (переменные)

```css
:root {
  /* Colors - Light Theme */
  --primary: #2563eb;
  --primary-dark: #1d4ed8;
  --secondary: #64748b;
  --background: #ffffff;
  --surface: #f8fafc;
  --text: #0f172a;
  --text-muted: #64748b;
  --border: #e2e8f0;
  
  /* Status Colors */
  --success: #22c55e;
  --warning: #f59e0b;
  --danger: #ef4444;
  --info: #3b82f6;
  
  /* Spacing */
  --spacing-xs: 0.25rem;
  --spacing-sm: 0.5rem;
  --spacing-md: 1rem;
  --spacing-lg: 1.5rem;
  --spacing-xl: 2rem;
  
  /* Typography */
  --font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
  --font-size-base: 16px;
  --line-height: 1.6;
  
  /* Borders & Shadows */
  --border-radius: 0.5rem;
  --shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
  
  /* Transitions */
  --transition: all 0.3s ease;
}

/* Dark Theme */
[data-theme="dark"] {
  --background: #0f172a;
  --surface: #1e293b;
  --text: #f1f5f9;
  --text-muted: #94a3b8;
  --border: #334155;
}
```

### Адаптивные точки перелома

```css
/* Mobile First Approach */
/* Base styles for mobile (< 640px) */

/* Tablet */
@media (min-width: 640px) {
  /* Tablet-specific styles */
}

/* Desktop */
@media (min-width: 900px) {
  /* Desktop-specific styles */
}

/* Large Screens */
@media (min-width: 1200px) {
  /* Large screen optimizations */
}
```

### Ключевые CSS-классы

| Класс | Назначение |
|-------|---------|
| `.container` | Контейнер с максимальной шириной и отступами |
| `.card` | Компонент карточки с тенью и рамкой |
| `.btn` | Базовые стили кнопки |
| `.btn-primary` | Кнопка основного действия |
| `.btn-ghost` | Ненавязчивая кнопка с эффектом при наведении |
| `.btn-outline` | Кнопка с контуром |
| `.grid` | Раскладка CSS Grid |
| `.flex` | Раскладка Flexbox |
| `.stack` | Вертикальная укладка с промежутком |
| `.reveal` | Триггер анимации появления при прокрутке |
| `.tilt-card` | 3D-эффект наклона при наведении |
| `.ltr` | Направление текста слева направо |

---

## 🧩 Архитектура JavaScript

### Основная структура приложения (`app.js`)

```javascript
(() => {
  "use strict";
  
  // Configuration
  const API_ROOT = (window.DOA_API_BASE || 
                   localStorage.getItem("doa-api-base") || 
                   "http://127.0.0.1:8000").replace(/\/+$/, "");
  const CONTENT_API_BASE = `${API_ROOT}/api/v1`;
  
  // State
  let diseases = null;
  
  // Initialization
  initIcons();
  initTheme();
  initNav();
  initBackToTop();
  initRipple();
  initRevealSystem();
  initTiltCards();
  initHeroParallax();
  
  // Load diseases data
  loadDiseases().catch(() => { diseases = {}; })
    .then(() => {
      const page = document.body.dataset.page;
      if (page === "home") renderHomeDiseases();
      if (page === "diseases") initDiseasesPage();
      if (page === "diagnose") initDiagnosePage();
      if (page === "history") initHistoryPage();
      if (page === "about") initAboutPage();
      if (page === "safety") initSafetyPage();
      if (page === "education") initEducationPage();
    });
  
  // ... rest of the code
})();
```

### Ключевые функции

#### 1. Управление темой

```javascript
function initTheme() {
  const root = document.documentElement;
  const saved = localStorage.getItem(STORAGE_THEME);
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  applyTheme(saved || (prefersDark ? "dark" : "light"));
  
  // Theme toggle button
  const toggle = byId("theme-toggle");
  if (toggle) {
    toggle.addEventListener("click", () => {
      const next = root.dataset.theme === "dark" ? "light" : "dark";
      applyTheme(next);
      localStorage.setItem(STORAGE_THEME, next);
    });
  }
}
```

#### 2. Навигация

```javascript
function initNav() {
  const navBtn = document.querySelector(".nav-toggle");
  const nav = byId("site-nav");
  
  if (!navBtn || !nav) return;
  
  navBtn.addEventListener("click", () => {
    const open = nav.classList.toggle("open");
    navBtn.setAttribute("aria-expanded", String(open));
  });
}
```

#### 3. Система анимаций появления

```javascript
function initRevealSystem() {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  
  const nodes = document.querySelectorAll(".reveal, .stagger");
  if (!nodes.length) return;
  
  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("in-view");
      
      if (entry.target.classList.contains("stagger")) {
        Array.from(entry.target.children).forEach((child, index) => {
          child.style.transitionDelay = `${index * 70}ms`;
        });
      }
      
      io.unobserve(entry.target);
    });
  }, { threshold: 0.15 });
  
  nodes.forEach(n => io.observe(n));
}
```

#### 4. Логика страницы диагностики

```javascript
function initDiagnosePage() {
  const imageInput = byId("image-input");
  const dropzone = byId("dropzone");
  const preview = byId("preview-box");
  const analyzeBtn = byId("analyze-btn");
  const resetBtn = byId("reset-btn");
  const status = byId("status-indicator");
  const loadingLine = byId("loading-line");
  const skeleton = byId("result-skeleton");
  const result = byId("result-content");
  
  let currentFile = null;
  let currentDataURL = "";
  
  // File handling
  imageInput.addEventListener("change", () => {
    const file = imageInput.files?.[0];
    if (file) handleFile(file);
  });
  
  // Drag and drop
  dropzone.addEventListener("drop", (e) => {
    const file = e.dataTransfer?.files?.[0];
    if (file) handleFile(file);
  });
  
  // Analyze button
  analyzeBtn.addEventListener("click", async () => {
    if (!currentFile) return;
    
    setStatus(status, "loading", "Analyzing");
    try {
      const predicted = await predictImage(currentFile);
      result.innerHTML = renderPredictionResultContent(predicted);
      setStatus(status, "done", "Result ready");
    } catch (err) {
      setStatus(status, "error", "Analysis failed");
    }
  });
  
  function handleFile(file) {
    // Validate file type and size
    if (!["image/png", "image/jpeg"].includes(file.type)) {
      toast("Invalid file type", "error");
      return;
    }
    
    if (file.size > 10 * 1024 * 1024) {
      toast("Size too big", "error");
      return;
    }
    
    // Read and preview
    const reader = new FileReader();
    reader.onload = () => {
      currentFile = file;
      currentDataURL = reader.result;
      preview.innerHTML = `<img src="${currentDataURL}" alt="Preview" />`;
      analyzeBtn.disabled = false;
    };
    reader.readAsDataURL(file);
  }
}
```

#### 5. Интеграция с API

```javascript
async function predictImage(file) {
  const formData = new FormData();
  formData.append("file", file);
  
  const response = await fetch(`${API_ROOT}/predict`, {
    method: "POST",
    body: formData
  });
  
  return parseApiResponse(response);
}

async function parseApiResponse(response) {
  let data = null;
  try {
    data = await response.json();
  } catch (_err) {
    data = null;
  }
  
  if (!response.ok) {
    const detail = data?.detail ? String(data.detail) : `Request failed (${response.status})`;
    throw new Error(detail);
  }
  
  return data || {};
}
```

---

## 🔗 Интеграция с API

### Базовая конфигурация

```javascript
const API_ROOT = (window.DOA_API_BASE || 
                 localStorage.getItem("doa-api-base") || 
                 "http://127.0.0.1:8000").replace(/\/+$/, "");
const CONTENT_API_BASE = `${API_ROOT}/api/v1`;
```

### Функции API

| Функция | Эндпоинт | Назначение |
|----------|----------|---------|
| `predictImage(file)` | `POST /predict` | Предсказание заболевания ИИ |
| `listResults(prediction)` | `GET /api/v1/results` | Получение истории предсказаний |
| `deleteResult(id)` | `DELETE /api/v1/results/{id}` | Удаление предсказания |
| `listLibrary(q, name)` | `GET /api/v1/library` | Получение информации о заболеваниях |
| `getSectionContent(type)` | `GET /api/v1/content/{type}` | Получение контента страницы |

### Обработка ошибок

```javascript
async function parseApiResponse(response) {
  let data = null;
  try {
    data = await response.json();
  } catch (_err) {
    data = null;
  }
  
  if (!response.ok) {
    const detail = data?.detail ? String(data.detail) : `Request failed (${response.status})`;
    throw new Error(detail);
  }
  
  return data || {};
}
```

---

## ✨ Основные возможности

### 1. Система тем

- **Светлый/тёмный режим**: автоопределение + ручное переключение
- **Сохранение**: предпочтение о теме хранится в LocalStorage
- **Плавные переходы**: CSS-переходы при смене темы

### 2. Адаптивная навигация

- **Мобильное меню**: гамбургер-меню для мобильных устройств
- **Меню на компьютере**: полноценная навигационная панель для больших экранов
- **Доступность**: корректные ARIA-атрибуты и навигация с клавиатуры

### 3. Загрузка и предпросмотр изображений

- **Перетаскивание**: интуитивная загрузка файлов
- **Валидация файлов**: проверка типа и размера
- **Предпросмотр**: просмотр в стиле лайтбокса
- **Индикация прогресса**: состояния загрузки и статусы

### 4. Анимации и эффекты

- **Появление при прокрутке**: элементы анимируются при прокрутке
- **Эффект наклона**: 3D-наклон карточки при движении мыши
- **Эффект ряби**: рябь на кнопках в стиле Material Design
- **Параллакс**: параллакс hero-блока при прокрутке

### 5. Доступность

- **Навигация с клавиатуры**: полная поддержка клавиатуры
- **Скринридеры**: корректные ARIA-метки и роли
- **Управление фокусом**: видимые индикаторы фокуса
- **Ограниченная анимация**: учёт предпочтений пользователя по движению

### 6. Многоязычная поддержка

- **Русский/английский**: интерфейс полностью на обоих языках
- **Переключение языка**: кнопки RU/EN в шапке, выбор хранится в localStorage
- **Мгновенное обновление**: динамический контент перерисовывается без перезагрузки
- **Авто-детект**: сохранённый выбор → язык браузера

---

## 💡 Лучшие практики

### 1. Организация кода

```javascript
// Use IIFE to avoid global scope pollution
(() => {
  "use strict";
  
  // Constants first
  const CONSTANTS = { ... };
  
  // State
  let state = { ... };
  
  // Initialization
  function init() { ... }
  
  // Event handlers
  function handleEvent() { ... }
  
  // Utility functions
  function utility() { ... }
  
  // Start application
  init();
})();
```

### 2. Работа с DOM

```javascript
// Use helper functions for common operations
function byId(id) { 
  return document.getElementById(id); 
}

function escapeHtml(text) {
  return String(text)
    .replace(/&/g, "&")
    .replace(/</g, "<")
    .replace(/>/g, ">")
    .replace(/\"/g, "")
    .replace(/'/g, "&#039;");
}
```

### 3. Делегирование событий

```javascript
// Use event delegation for dynamic content
container.addEventListener("click", (e) => {
  const btn = e.target.closest("[data-action]");
  if (btn) {
    handleAction(btn.dataset.action);
  }
});
```

### 4. Асинхронные операции

```javascript
// Always handle errors in async operations
async function fetchData() {
  try {
    const response = await fetch(url);
    const data = await response.json();
    return data;
  } catch (err) {
    console.error("Fetch error:", err);
    throw err;
  }
}
```

### 5. Производительность

```javascript
// Debounce expensive operations
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// Use Intersection Observer for lazy loading
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      loadImage(entry.target);
      observer.unobserve(entry.target);
    }
  });
});
```

---

## ▶ Запуск фронтенда

### Сервер разработки

```bash
cd frontend
python3 -m http.server 8080
```

Откройте: http://127.0.0.1:8080/pages/index.html

### Настройка URL API

Если бэкенд находится не на адресе по умолчанию:

```javascript
// In browser console:
localStorage.setItem("doa-api-base", "http://your-backend-url:8000");
location.reload();
```

### Развёртывание в продакшене

1. **Статический хостинг**: разместите каталог `frontend/` на любом статическом хостинге
2. **CDN**: используйте CDN для лучшей производительности
3. **Переменные окружения**: задайте URL API через `window.DOA_API_BASE`

---

## 🌐 Поддержка браузеров

| Браузер | Версия | Поддержка |
|---------|---------|---------|
| Chrome | 90+ |  Полная |
| Firefox | 88+ |  Полная |
| Safari | 14+ |  Полная |
| Edge | 90+ |  Полная |
| Mobile Safari | iOS 14+ |  Полная |
| Chrome Mobile | Android 9+ |  Полная |

---

*По вопросам фронтенда обращайтесь к тимлиду команды фронтенда.*

*Последнее обновление: 29 апреля 2026*  
*Версия документа: 1.0*
