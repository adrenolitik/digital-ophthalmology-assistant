/**
 * Цифровой ассистент офтальмолога — i18n.
 * Словари RU/EN. Смена языка через DOA_I18N.setLang(), выбор хранится в localStorage ("doa-lang").
 *
 * Подстановка параметров: t("d.msg.selected", { name: "eye.png" }) → "Выбран файл: eye.png".
 * В HTML используется разметка:
 *   data-i18n="key"              — заменить textContent
 *   data-i18n-attr="placeholder:key;aria-label:key2" — заменить атрибуты
 *   data-i18n-html="key"         — заменить innerHTML
 */
(function () {
  "use strict";

  const STORAGE_LANG = "doa-lang";

  const RU = {
    // Общие строки
    "brand.name": "Цифровой ассистент офтальмолога",
    "nav.menu": "Меню",
    "nav.toggle": "Открыть меню навигации",
    "nav.home": "Главная",
    "nav.diseases": "Библиотека заболеваний",
    "nav.education": "Обучение",
    "nav.safety": "Безопасность",
    "nav.about": "О проекте",
    "nav.startDiagnosis": "Начать диагностику",
    "nav.primary": "Основная навигация",
    "common.skip": "Перейти к содержимому",
    "common.theme": "Переключить тему",
    "common.backToTop": "Наверх",
    "common.footer": "Только образовательный интерфейс платформы. Не заменяет лицензированную медицинскую диагностику.",
    "common.close": "Закрыть",
    "common.language": "Язык интерфейса",
    "api.requestFailed": "Ошибка запроса ({status})",
    "common.unknown": "Неизвестно",
    "common.notAvailable": "нет данных",
    "common.yes": "Да",
    "common.no": "Нет",

    // Главная
    "home.title": "Цифровой ассистент офтальмолога | Главная",
    "home.meta": "Цифровой ассистент офтальмолога для триажа заболеваний переднего отдела глаза и обучения пациентов.",
    "home.heroTag": "Поддержка клинических решений на базе ИИ",
    "home.heroH1a": "Смотрите ясно,",
    "home.heroH1b": "диагностируйте",
    "home.heroH1em": "умнее",
    "home.heroLead": "Продвинутый ИИ-анализ изображений сетчатки и патологий глаза. Разработан для офтальмологов и доступен всем медицинским специалистам на Ближнем Востоке.",
    "home.analyzeImage": "Анализировать изображение",
    "home.browseConditions": "Смотреть заболевания",
    "home.statAccuracy": "Точность определения",
    "home.statConditions": "Охватываемые заболевания",
    "home.statBilingual": "Языки интерфейса",
    "home.illustration": "Медицинская иллюстрация",
    "home.badgeRetinopathy": "Диабетическая ретинопатия",
    "home.badgeOpticDisc": "Диск зрительного нерва: норма",
    "home.badgeConfidence": "Уверенность: 89,4%",
    "home.howItWorks": "Как это работает",
    "home.howItWorksSub": "Создан для безопасной интерпретации результатов и понимания дальнейших шагов.",
    "home.step1Title": "1) Получение изображения",
    "home.step1Text": "Снимите и загрузите чёткое изображение переднего отдела глаза, желательно качества щелевой лампы.",
    "home.step2Title": "2) Анализ",
    "home.step2Text": "Формирование вероятностей классов и контекстной оценки риска для образовательного триажа.",
    "home.step3Title": "3) Безопасный разбор",
    "home.step3Text": "Интерпретация результатов с клиническими оговорками и понятными путями дальнейших действий.",
    "home.supportedConditions": "Поддерживаемые заболевания",
    "home.supportedSub": "Основные карточки заболеваний динамически загружаются из базы знаний бэкенда.",
    "home.timeline": "Схема клинического процесса",
    "home.timelineSub": "От приёма пациента до передачи врачу.",
    "home.timelineUpload": "Загрузка",
    "home.timelineUploadText": "Снятие и отправка изображения глаза.",
    "home.timelineAi": "ИИ-анализ",
    "home.timelineAiText": "Классификация моделью с профилем уверенности.",
    "home.timelineInterpret": "Клиническая интерпретация",
    "home.timelineInterpretText": "Оценка индикаторов риска и тревожных признаков.",
    "home.timelineFollowUp": "Контроль врача",
    "home.timelineFollowUpText": "Передача специалисту при выявлении неотложных признаков.",
    "home.feedback": "Отзывы клиницистов",
    "home.feedbackSub": "Впечатления пользователей с внутренних демонстраций системы.",
    "home.quote1": "«Структурированное описание результата снизило неопределённость для немедицинского персонала.»",
    "home.quote2": "«Понятные обучающие блоки улучшили понимание пациентов при триаже.»",
    "home.quote3": "«Процесс выглядит профессионально и практически применим для обучения.»",
    "home.ctaTitle": "От загрузки изображения — к более безопасным решениям",
    "home.ctaText": "Используйте рабочую область диагностики для просмотра результатов модели и рекомендаций пациенту.",
    "home.ctaButton": "Открыть рабочую область диагностики",

    // Диагностика (статика)
    "diagnose.title": "Цифровой ассистент офтальмолога | Диагностика",
    "diagnose.meta": "Клиническая рабочая область диагностики с результатами ИИ-бэкенда и безопасными для пациента рекомендациями.",
    "diagnose.label": "Рабочая область диагностики",
    "diagnose.h1": "ИИ-анализ изображений глаза",
    "diagnose.lead": "Загрузите изображение сетчатки или переднего отдела глаза для выполнения инференса на бэкенде. Страница разделяет уверенные совпадения и случаи с низкой уверенностью или вне зоны обучения модели.",
    "diagnose.reviewFlow": "Процесс проверки",
    "diagnose.checkUpload": "Загрузите чёткое изображение одного глаза",
    "diagnose.checkConfidence": "Проверьте уверенность и второй по вероятности класс",
    "diagnose.checkUnrecognized": "Считайте unrecognized случаем, требующим проверки",
    "diagnose.input": "Входные данные",
    "diagnose.upload": "Загрузка изображения",
    "diagnose.step1": "Шаг 1",
    "diagnose.dropzoneLabel": "Загрузите изображение кликом или перетаскиванием",
    "diagnose.dropzoneTitle": "Перетащите изображение сюда или нажмите для выбора",
    "diagnose.dropzoneText": "Поддерживаются файлы PNG, JPG и JPEG до 10 МБ.",
    "diagnose.previewLabel": "Нажмите для увеличения",
    "diagnose.previewKicker": "Предпросмотр",
    "diagnose.previewTitle": "Здесь появится предпросмотр изображения",
    "diagnose.previewText": "Используйте центрированное, хорошо освещённое изображение для наилучшего результата.",
    "diagnose.quality": "Оценка готовности изображения",
    "diagnose.analyze": "Анализировать изображение →",
    "diagnose.reset": "Сбросить",
    "diagnose.footnote": "Изображения отправляются на бэкенд для инференса. Используйте результат как помощь при проверке, а не как окончательный диагноз.",
    "diagnose.output": "Результат",
    "diagnose.results": "Результаты анализа",
    "diagnose.step2": "Шаг 2",
    "diagnose.statusWaiting": "Ожидание загрузки изображения и анализа",
    "diagnose.loadingRow": "Анализ изображения — подождите...",
    "diagnose.empty": "Загрузите изображение и нажмите «Анализировать», чтобы увидеть результаты",
    "diagnose.lightboxLabel": "Увеличенный предпросмотр изображения",
    "diagnose.lightboxAlt": "Увеличенный предпросмотр глаза",

    // Диагностика (динамика)
    "d.status.idle": "Ожидание",
    "d.status.loading": "Анализ",
    "d.status.ready": "Изображение готово",
    "d.status.done": "Результат готов",
    "d.status.review": "Требуется клиническая проверка",
    "d.status.error": "Ошибка анализа",
    "d.status.badType": "Недопустимый тип файла",
    "d.status.tooLarge": "Файл слишком большой",
    "d.toast.started": "Анализ запущен",
    "d.toast.lowConfidence": "Результат с низкой уверенностью",
    "d.toast.ready": "Результат готов",
    "d.toast.reset": "Случай сброшен",
    "d.toast.badType": "Недопустимый тип файла",
    "d.toast.tooLarge": "Файл слишком большой",
    "d.msg.badType": "Недопустимый тип файла. Загрузите PNG или JPG.",
    "d.msg.tooLarge": "Размер файла превышает лимит 10 МБ.",
    "d.msg.selected": "Выбран файл: {name}",
    "d.msg.cleared": "Загрузка очищена.",
    "d.emptyResult": "Анализ ещё не выполнялся. Загрузите изображение и запустите анализ.",
    "d.err.failed": "Не удалось выполнить анализ",
    "d.err.unable": "Не удалось завершить анализ: {message}",
    "d.quality.good": "Хорошее · {percent}%",
    "d.quality.fair": "Среднее · {percent}%",
    "d.quality.weak": "Слабое · {percent}%",
    "d.previewAlt": "Предпросмотр выбранного изображения глаза",

    // Библиотека заболеваний
    "diseases.title": "Цифровой ассистент офтальмолога | Библиотека заболеваний",
    "diseases.meta": "Библиотека заболеваний с руководствами по офтальмологии и клиническими рекомендациями.",
    "diseases.h1": "База знаний о заболеваниях",
    "diseases.sub": "Полная справочная библиотека офтальмологических заболеваний с клиническими рекомендациями и материалами для обучения пациентов.",
    "diseases.filters": "Фильтры и навигация",
    "diseases.filterTitle": "Фильтр заболеваний",
    "diseases.searchPlaceholder": "Поиск заболеваний...",
    "diseases.searchLabel": "Поиск заболеваний",
    "diseases.categories": "Категории заболеваний",
    "diseases.tabAll": "Все заболевания",
    "diseases.tabCataract": "Катаракта",
    "diseases.tabConjunctivitis": "Конъюнктивит",
    "diseases.tabKeratitis": "Кератит",
    "diseases.tabNormal": "Норма",
    "diseases.tabPterygium": "Птеригий",
    "d.err.library": "Библиотека заболеваний недоступна с бэкенда",
    "diseases.err.load": "Не удалось загрузить данные библиотеки с бэкенда.",
    "diseases.err.none": "Подходящих заболеваний не найдено.",
    "d.tile.more": "Подробнее",
    "d.tile.unknown": "Неизвестно",
    "d.tile.imageAlt": "Изображение заболевания",
    "d.tile.cataract": "Катаракта",
    "d.tile.cataractShort": "Помутнение хрусталика глаза, приводящее к ухудшению зрения.",
    "d.tile.conjunctivitis": "Конъюнктивит",
    "d.tile.conjunctivitisShort": "Воспаление конъюнктивы, вызывающее покраснение и раздражение.",
    "d.tile.keratitis": "Кератит",
    "d.tile.keratitisShort": "Воспаление роговицы, которое может влиять на зрение.",
    "d.tile.normal": "Норма",
    "d.tile.normalShort": "Здоровый глаз без выявленных отклонений.",
    "d.backToDiagnose": "Вернуться к диагностике",

    // История
    "history.title": "Цифровой ассистент офтальмолога | История",
    "history.meta": "Полная история анализов с инструментами фильтрации.",
    "history.h1": "Полная история анализов",
    "history.sub": "Фильтрация и управление сохранёнными предсказаниями бэкенда для аудита и учебного разбора.",
    "history.filterLabel": "Фильтр по классу:",
    "history.filterAll": "Все",
    "history.clearAll": "Очистить всё",
    "h.err.load": "Не удалось загрузить результаты с бэкенда.",
    "h.err.none": "Нет записей для этого фильтра.",
    "h.recordId": "ID записи: {id} | {path}",
    "h.remove": "Удалить",
    "h.toast.removed": "Запись удалена",
    "h.toast.removeFailed": "Не удалось удалить результат",
    "h.toast.cleared": "Вся история бэкенда очищена",
    "h.toast.clearFailed": "Не удалось очистить историю бэкенда",

    // О проекте
    "about.title": "Цифровой ассистент офтальмолога | О проекте",
    "about.meta": "Команда проекта и академическая информация.",
    "about.fallbackTitle": "О проекте",
    "about.supervisedBy": "Научный руководитель: {name}",
    "about.team": "Команда проекта",
    "about.stack": "Технологии",
    "about.scope": "Область применения",
    "about.err.load": "Не удалось загрузить содержимое страницы «О проекте» с бэкенда.",

    // Безопасность
    "safety.title": "Цифровой ассистент офтальмолога | Безопасность",
    "safety.meta": "Безопасность, ограничения и политика обработки данных платформы.",
    "safety.fallbackTitle": "Безопасность",
    "safety.escalation": "Рекомендации по передаче врачу",
    "safety.err.load": "Не удалось загрузить содержимое страницы безопасности с бэкенда.",

    // Обучение
    "education.title": "Цифровой ассистент офтальмолога | Обучение",
    "education.meta": "Обучение пациентов: качество съёмки, признаки срочности и профилактика.",
    "education.fallbackTitle": "Обучение",
    "education.err.load": "Не удалось загрузить содержимое страницы обучения с бэкенда.",

    // Результат анализа
    "r.predicted": "Предполагаемое состояние",
    "r.apiLabel": "Метка API",
    "r.rawClass": "Исходный класс модели",
    "r.confidence": "Уверенность",
    "r.needsReview": "Требует проверки",
    "r.badgeConfidence": "Уверенность: {percent}%",
    "r.badgeRisk": "Риск: {level}",
    "r.badgeReview": "Требуется проверка",
    "r.bannerConfident": "Уверенная классификация",
    "r.bannerLow": "Классификация с низкой уверенностью",
    "r.bannerLowText": "Изображение недостаточно похоже на обучающие классы. Ближайший класс: {cls} с вероятностью {p1}%, при этом {other} очень близок — {p2}%.",
    "r.bannerConfidentText": "Наиболее вероятный класс — {cls} с отрывом {margin}% от следующего класса.",
    "r.triageOnly": "Этот результат следует рассматривать только как поддержку триажа.",
    "r.inScope": "Результат находится в пределах обучающих классов.",
    "r.topClass": "Топ-класс",
    "r.runnerUp": "Второй класс",
    "r.marginEntropy": "Отрыв / Энтропия",
    "r.factsTitle": "Результаты анализа",
    "r.confidenceTitle": "Распределение уверенности",
    "r.confidenceNote": "Если два верхних класса слишком близки, бэкенд возвращает unrecognized, чтобы избежать ошибочного диагноза.",
    "r.reviewTitle": "Рекомендации по проверке",
    "r.reviewNoConfirm": "Не считайте это подтверждённым диагнозом.",
    "r.reviewNewImage": "Запросите другое изображение с лучшим фокусом, освещением или кадрированием.",
    "r.reviewHint": "Используйте ближайший класс только как подсказку для ручной проверки.",
    "r.guidanceTitle": "Клинические рекомендации",
    "r.symptomsTitle": "Распространённые симптомы",
    "r.redFlagsTitle": "Тревожные признаки — немедленно обратитесь за помощью",
    "r.whenDoctorTitle": "Когда обратиться к врачу",

    // Классы модели и уровни риска
    "class.healthy_eye": "Здоровый глаз",
    "class.normal": "Норма",
    "class.conjunctivitis": "Конъюнктивит",
    "class.cataract": "Катаракта",
    "class.keratitis": "Кератит",
    "class.pterygium": "Птеригий",
    "class.unrecognized": "Не распознано",
    "risk.low": "низкий",
    "risk.moderate": "умеренный",
    "risk.medium": "средний",
    "risk.high": "высокий",
    "risk.urgent": "неотложный"
  };

  const EN = {
    // Common
    "brand.name": "Digital Ophthalmology Assistant",
    "nav.menu": "Menu",
    "nav.toggle": "Toggle navigation",
    "nav.home": "Home",
    "nav.diseases": "Disease Library",
    "nav.education": "Education",
    "nav.safety": "Safety",
    "nav.about": "About",
    "nav.startDiagnosis": "Start Diagnosis",
    "nav.primary": "Primary",
    "common.skip": "Skip to content",
    "common.theme": "Toggle theme",
    "common.backToTop": "Back to top",
    "common.footer": "Educational platform interface only. Not a substitute for licensed medical diagnosis.",
    "common.close": "Close",
    "common.language": "Language",
    "api.requestFailed": "Request failed ({status})",
    "common.unknown": "Unknown",
    "common.notAvailable": "N/A",
    "common.yes": "Yes",
    "common.no": "No",

    // Home
    "home.title": "Digital Ophthalmology Assistant | Home",
    "home.meta": "Digital Ophthalmology Assistant for anterior eye triage and patient education.",
    "home.heroTag": "AI-Powered Clinical Decision Support",
    "home.heroH1a": "See Clearly,",
    "home.heroH1b": "Diagnose",
    "home.heroH1em": "Smarter",
    "home.heroLead": "Advanced AI analysis for retinal images and eye pathology. Designed for ophthalmologists, accessible to all care providers across the Middle East.",
    "home.analyzeImage": "Analyze an Image",
    "home.browseConditions": "Browse Conditions",
    "home.statAccuracy": "Detection Accuracy",
    "home.statConditions": "Conditions Covered",
    "home.statBilingual": "Interface Languages",
    "home.illustration": "Medical illustration",
    "home.badgeRetinopathy": "Diabetic Retinopathy",
    "home.badgeOpticDisc": "Optic Disc: Normal",
    "home.badgeConfidence": "Conf. 89.4%",
    "home.howItWorks": "How It Works",
    "home.howItWorksSub": "Designed to support safe interpretation and next-step awareness.",
    "home.step1Title": "1) Acquire Image",
    "home.step1Text": "Capture and upload a clear anterior segment image, preferably slit-lamp quality.",
    "home.step2Title": "2) Analyze",
    "home.step2Text": "Generate class probabilities and contextual risk labeling for educational triage.",
    "home.step3Title": "3) Review Safely",
    "home.step3Text": "Interpret findings with clinical caveats and immediate guidance pathways.",
    "home.supportedConditions": "Supported Conditions",
    "home.supportedSub": "Core disease cards are loaded dynamically from the backend knowledge base.",
    "home.timeline": "Clinical Workflow Timeline",
    "home.timelineSub": "From intake to physician escalation.",
    "home.timelineUpload": "Upload",
    "home.timelineUploadText": "Capture and submit ocular image.",
    "home.timelineAi": "AI Review",
    "home.timelineAiText": "Model-based classification with confidence profile.",
    "home.timelineInterpret": "Clinical Interpretation",
    "home.timelineInterpretText": "Review risk indicators and red flags.",
    "home.timelineFollowUp": "Doctor Follow-up",
    "home.timelineFollowUpText": "Escalate when urgent signs are detected.",
    "home.feedback": "Clinical Feedback Themes",
    "home.feedbackSub": "Representative user impressions from internal demos.",
    "home.quote1": "\"The guided result narrative reduced uncertainty for non-specialist staff.\"",
    "home.quote2": "\"Clear education blocks improved patient understanding during triage.\"",
    "home.quote3": "\"The workflow feels professional and practical for teaching use.\"",
    "home.ctaTitle": "Move from Image Upload to Safer Decisions",
    "home.ctaText": "Use the diagnosis workspace to review model outputs and patient guidance.",
    "home.ctaButton": "Open Diagnosis Workspace",

    // Diagnose (static)
    "diagnose.title": "Digital Ophthalmology Assistant | Diagnosis",
    "diagnose.meta": "Clinical diagnosis workspace with backend AI outputs and patient-safe guidance.",
    "diagnose.label": "Diagnosis Workspace",
    "diagnose.h1": "AI Eye Image Analysis",
    "diagnose.lead": "Upload a retinal or anterior eye image for backend inference review. The page now separates confident matches from low-confidence or out-of-scope cases.",
    "diagnose.reviewFlow": "Review flow",
    "diagnose.checkUpload": "Upload a clear single-eye image",
    "diagnose.checkConfidence": "Check confidence and runner-up class",
    "diagnose.checkUnrecognized": "Treat unrecognized as review-required",
    "diagnose.input": "Input",
    "diagnose.upload": "Image Upload",
    "diagnose.step1": "Step 1",
    "diagnose.dropzoneLabel": "Upload image by click or drag and drop",
    "diagnose.dropzoneTitle": "Drop image here or click to browse",
    "diagnose.dropzoneText": "Supports PNG, JPG and JPEG files up to 10MB.",
    "diagnose.previewLabel": "Click to zoom",
    "diagnose.previewKicker": "Preview",
    "diagnose.previewTitle": "Image preview will appear here",
    "diagnose.previewText": "Use a centered, well-lit image for the cleanest signal.",
    "diagnose.quality": "Estimated image readiness",
    "diagnose.analyze": "Analyze Image →",
    "diagnose.reset": "Reset",
    "diagnose.footnote": "Images are sent to the backend for inference. Use this output as review support, not final diagnosis.",
    "diagnose.output": "Output",
    "diagnose.results": "Analysis Results",
    "diagnose.step2": "Step 2",
    "diagnose.statusWaiting": "Waiting for image upload and analysis",
    "diagnose.loadingRow": "Analyzing image — please wait...",
    "diagnose.empty": "Upload an image and click Analyze to see results",
    "diagnose.lightboxLabel": "Image zoom preview",
    "diagnose.lightboxAlt": "Zoomed eye preview",

    // Diagnose (dynamic)
    "d.status.idle": "Idle",
    "d.status.loading": "Analyzing",
    "d.status.ready": "Image ready",
    "d.status.done": "Result ready",
    "d.status.review": "Needs clinical review",
    "d.status.error": "Analysis failed",
    "d.status.badType": "Invalid file type",
    "d.status.tooLarge": "File too large",
    "d.toast.started": "Analyze started",
    "d.toast.lowConfidence": "Low-confidence result",
    "d.toast.ready": "Result ready",
    "d.toast.reset": "Case reset",
    "d.toast.badType": "Invalid file type",
    "d.toast.tooLarge": "Size too big",
    "d.msg.badType": "Invalid file type. Please upload PNG/JPG.",
    "d.msg.tooLarge": "File exceeds 10MB limit.",
    "d.msg.selected": "Selected: {name}",
    "d.msg.cleared": "Upload cleared.",
    "d.emptyResult": "No analysis yet. Upload a case and run analysis.",
    "d.err.failed": "Analysis failed",
    "d.err.unable": "Unable to complete analysis: {message}",
    "d.quality.good": "Good · {percent}%",
    "d.quality.fair": "Fair · {percent}%",
    "d.quality.weak": "Weak · {percent}%",
    "d.previewAlt": "Selected eye image preview",

    // Diseases
    "diseases.title": "Digital Ophthalmology Assistant | Disease Library",
    "diseases.meta": "Disease library with ophthalmology guidance and clinical recommendations.",
    "diseases.h1": "Disease Knowledge Base",
    "diseases.sub": "Comprehensive reference library for ophthalmic conditions with clinical guidance and patient education materials.",
    "diseases.filters": "Filters and navigation",
    "diseases.filterTitle": "Filter Conditions",
    "diseases.searchPlaceholder": "Search diseases...",
    "diseases.searchLabel": "Search diseases",
    "diseases.categories": "Disease categories",
    "diseases.tabAll": "All Conditions",
    "diseases.tabCataract": "Cataract",
    "diseases.tabConjunctivitis": "Conjunctivitis",
    "diseases.tabKeratitis": "Keratitis",
    "diseases.tabNormal": "Normal",
    "diseases.tabPterygium": "Pterygium",
    "d.err.library": "No disease library data from backend",
    "diseases.err.load": "Failed to load library data from backend.",
    "diseases.err.none": "No matching diseases found.",
    "d.tile.more": "Learn more",
    "d.tile.unknown": "Unknown",
    "d.tile.imageAlt": "Disease image",
    "d.tile.cataract": "Cataract",
    "d.tile.cataractShort": "Clouding of the eye's lens, leading to vision impairment.",
    "d.tile.conjunctivitis": "Conjunctivitis",
    "d.tile.conjunctivitisShort": "Inflammation of the conjunctiva causing redness and irritation.",
    "d.tile.keratitis": "Keratitis",
    "d.tile.keratitisShort": "Inflammation of the cornea that can affect vision.",
    "d.tile.normal": "Normal",
    "d.tile.normalShort": "Healthy eye examination with no detected abnormalities.",
    "d.backToDiagnose": "Back to Diagnose",

    // History
    "history.title": "Digital Ophthalmology Assistant | History",
    "history.meta": "Full diagnosis history with filtering tools.",
    "history.h1": "Full Analysis History",
    "history.sub": "Filter and manage stored backend predictions for audit and teaching review.",
    "history.filterLabel": "Filter by class:",
    "history.filterAll": "All",
    "history.clearAll": "Clear All",
    "h.err.load": "Failed to load backend results.",
    "h.err.none": "No entries for this filter.",
    "h.recordId": "Record ID: {id} | {path}",
    "h.remove": "Remove",
    "h.toast.removed": "History item removed",
    "h.toast.removeFailed": "Failed to delete result",
    "h.toast.cleared": "All backend history cleared",
    "h.toast.clearFailed": "Failed to clear backend history",

    // About
    "about.title": "Digital Ophthalmology Assistant | About",
    "about.meta": "Project team and academic details.",
    "about.fallbackTitle": "About",
    "about.supervisedBy": "Supervised by: {name}",
    "about.team": "Team Members",
    "about.stack": "Stack",
    "about.scope": "Deployment Scope",
    "about.err.load": "Unable to load About content from backend.",

    // Safety
    "safety.title": "Digital Ophthalmology Assistant | Safety",
    "safety.meta": "Safety, limitations, and data handling policy for the platform.",
    "safety.fallbackTitle": "Safety",
    "safety.escalation": "Clinical Escalation Advice",
    "safety.err.load": "Unable to load Safety content from backend.",

    // Education
    "education.title": "Digital Ophthalmology Assistant | Education",
    "education.meta": "Patient education for capture quality, urgency signals, and prevention.",
    "education.fallbackTitle": "Education",
    "education.err.load": "Unable to load Education content from backend.",

    // Prediction result
    "r.predicted": "Predicted Condition",
    "r.apiLabel": "API Label",
    "r.rawClass": "Top Raw Class",
    "r.confidence": "Confidence",
    "r.needsReview": "Needs Review",
    "r.badgeConfidence": "Confidence: {percent}%",
    "r.badgeRisk": "Risk: {level}",
    "r.badgeReview": "Review Required",
    "r.bannerConfident": "Confident classification",
    "r.bannerLow": "Low-confidence classification",
    "r.bannerLowText": "The image does not match the trained classes strongly enough. Closest class: {cls} at {p1}%, with {other} very close at {p2}%.",
    "r.bannerConfidentText": "The strongest class is {cls} with a margin of {margin}% over the next class.",
    "r.triageOnly": "This output should be treated as triage support only.",
    "r.inScope": "Result is inside the trained class space.",
    "r.topClass": "Top class",
    "r.runnerUp": "Runner-up",
    "r.marginEntropy": "Margin / Entropy",
    "r.factsTitle": "Analysis Results",
    "r.confidenceTitle": "Confidence Breakdown",
    "r.confidenceNote": "When the top two classes are too close, the backend returns unrecognized to avoid a misleading diagnosis.",
    "r.reviewTitle": "Review Guidance",
    "r.reviewNoConfirm": "Do not treat this as a confirmed diagnosis.",
    "r.reviewNewImage": "Request another image with better focus, lighting, or framing.",
    "r.reviewHint": "Use the closest class only as a hint for manual review.",
    "r.guidanceTitle": "Clinical Guidance",
    "r.symptomsTitle": "Common Symptoms",
    "r.redFlagsTitle": "Warning Signs - Seek Immediate Care",
    "r.whenDoctorTitle": "When to See a Doctor",

    // Model classes and risk levels
    "class.healthy_eye": "Healthy Eye",
    "class.normal": "Normal",
    "class.conjunctivitis": "Conjunctivitis",
    "class.cataract": "Cataract",
    "class.keratitis": "Keratitis",
    "class.pterygium": "Pterygium",
    "class.unrecognized": "Unrecognized",
    "risk.low": "low",
    "risk.moderate": "moderate",
    "risk.medium": "medium",
    "risk.high": "high",
    "risk.urgent": "urgent"
  };

  const DICTS = { ru: RU, en: EN };
  let currentLang = null;

  function normalizeLang(lang) {
    const value = String(lang || "").toLowerCase();
    return DICTS[value] ? value : "ru";
  }

  function getStoredLang() {
    try {
      return localStorage.getItem(STORAGE_LANG);
    } catch (_err) {
      return null;
    }
  }

  function storeLang(lang) {
    try {
      localStorage.setItem(STORAGE_LANG, lang);
    } catch (_err) {
      /* приватный режим — просто игнорируем */
    }
  }

  function detectLang() {
    const stored = getStoredLang();
    if (stored) return normalizeLang(stored);
    const nav = String(navigator.language || "ru").toLowerCase();
    return nav.startsWith("en") ? "en" : "ru";
  }

  /**
   * Перевод строки с подстановкой параметров: t("key", { name: "x" }).
   */
  function t(key, params) {
    const dict = DICTS[currentLang] || RU;
    let text = dict[key];
    if (text === undefined) text = RU[key];
    if (text === undefined) return key;
    if (params) {
      Object.keys(params).forEach((name) => {
        text = text.split(`{${name}}`).join(String(params[name]));
      });
    }
    return text;
  }

  function applyToRoot() {
    document.documentElement.lang = currentLang;
  }

  function applyStaticTranslations(scope) {
    const root = scope || document;
    root.querySelectorAll("[data-i18n]").forEach((el) => {
      const key = el.getAttribute("data-i18n");
      if (key) el.textContent = t(key);
    });
    root.querySelectorAll("[data-i18n-html]").forEach((el) => {
      const key = el.getAttribute("data-i18n-html");
      if (key) el.innerHTML = t(key);
    });
    root.querySelectorAll("[data-i18n-attr]").forEach((el) => {
      const spec = el.getAttribute("data-i18n-attr") || "";
      spec.split(";").forEach((pair) => {
        const [attr, key] = pair.split(":").map((part) => (part || "").trim());
        if (attr && key) el.setAttribute(attr, t(key));
      });
    });
  }

  function syncToggle() {
    const toggle = document.getElementById("lang-toggle");
    if (!toggle) return;
    toggle.querySelectorAll("[data-lang-btn]").forEach((btn) => {
      const active = btn.getAttribute("data-lang-btn") === currentLang;
      btn.classList.toggle("active", active);
      btn.setAttribute("aria-pressed", String(active));
    });
  }

  function setLang(lang, options) {
    const opts = options || {};
    const next = normalizeLang(lang);
    const changed = next !== currentLang;
    currentLang = next;
    if (opts.persist !== false) storeLang(next);
    applyToRoot();
    applyStaticTranslations();
    syncToggle();
    if (changed && typeof window.DOA_ON_LANGUAGE_CHANGE === "function") {
      try {
        window.DOA_ON_LANGUAGE_CHANGE(next);
      } catch (_err) {
        /* колбэк приложения не должен ломать смену языка */
      }
    }
  }

  function initToggle() {
    const toggle = document.getElementById("lang-toggle");
    if (!toggle || toggle.dataset.i18nBound) return;
    toggle.dataset.i18nBound = "1";
    toggle.addEventListener("click", (event) => {
      const btn = event.target.closest("[data-lang-btn]");
      if (!btn) return;
      setLang(btn.getAttribute("data-lang-btn"));
    });
  }

  function init() {
    currentLang = detectLang();
    applyToRoot();
    applyStaticTranslations();
    initToggle();
    syncToggle();
  }

  window.DOA_I18N = {
    t,
    setLang,
    getLang: () => currentLang,
    applyStaticTranslations,
    init
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
