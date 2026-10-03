# Техническое руководство по API бэкенда

## 🔍 Обзор

В этом документе представлено подробное руководство по бэкенду на FastAPI: все эндпоинты, модели данных и детали реализации.

### Недавние улучшения (v1.1)

Реализованы следующие улучшения для повышения надёжности, масштабируемости и соответствия методологии проекта:

1. **Стандартизированные имена классов заболеваний**: все метки заболеваний теперь оформляются единообразно (строчными с подчёркиваниями: `healthy_eye`, `conjunctivitis`, `cataract`, `keratitis`).

2. **Улучшенный конвейер препроцессинга**: теперь используется корректный подход «сначала масштабирование, затем кроп»: короткая сторона масштабируется до 256 (с сохранением пропорций), затем центральный кроп до 224×224. Это в точности соответствует обучающему конвейеру.

3. **Отслеживание по Request ID**: каждый запрос теперь получает уникальный UUID для сквозной трассировки, он логируется в заголовке запроса (`X-Request-ID`) для отладки и мониторинга.

4. **Поддержка пагинации**: эндпоинт `/api/v1/results` теперь поддерживает пагинацию с настраиваемым размером страницы (по умолчанию 20, максимум 100) для эффективной работы с большими наборами данных.

5. **Улучшенная обработка ошибок**: расширенная валидация, включая ограничения на размеры изображения (минимум 50×50, максимум 4096×4096 пикселей), и более информативные сообщения об ошибках.

6. **Полный набор тестов**: добавлены тесты на pytest, покрывающие валидацию предсказаний, работу сервиса ИИ и алгоритм центрального кропа.

7. **Docker, готовый к продакшену**: многостадийная сборка, непривилегированный пользователь, проверки работоспособности и оптимизированный размер образа.

---

## 📋 Оглавление

1. [Обзор архитектуры](#обзор-архитектуры)
2. [Структура проекта](#структура-проекта)
3. [Справочник эндпоинтов API](#справочник-эндпоинтов-api)
4. [Модели базы данных](#модели-базы-данных)
5. [Конфигурация](#конфигурация)
6. [Обработка ошибок](#обработка-ошибок)
7. [Лучшие практики](#лучшие-практики)

---

## 🏗 Обзор архитектуры

### Технологический стек

| Компонент | Технология | Версия |
|-----------|------------|---------|
| **Фреймворк** | FastAPI | >=0.109.0 |
| **Язык** | Python | 3.11+ |
| **ORM базы данных** | SQLAlchemy | >=2.0.25 |
| **База данных** | SQLite (dev) / PostgreSQL (prod) | - |
| **Валидация** | Pydantic | >=2.5.0 |
| **ИИ/ML** | TensorFlow | >=2.15.0 |
| **Обработка изображений** | Pillow | >=10.2.0 |
| **Хаб моделей** | Hugging Face Hub | >=0.20.0 |

### Поток приложения

```
Request → Middleware → Router → Service → Database/AI → Response
```

### Ключевые паттерны проектирования

1. **Внедрение зависимостей**: `Depends()` в FastAPI для сессий базы данных
2. **Паттерн «Repository»**: сервисы абстрагируют операции с базой данных
3. **Паттерн Singleton**: модель ИИ загружается один раз
4. **Контекстные менеджеры**: корректное освобождение ресурсов

---

## 📁 Структура проекта

```
backend/
├── app/
│   ├── __init__.py              # Package initialization
│   ├── main.py                  # Application entry point
│   ├── config.py                # Configuration management
│   │
│   ├──  database/
│   │   ├── __init__.py
│   │   └── db.py                # Database connection & session
│   │
│   ├──  models/               # SQLAlchemy ORM models
│   │   ├── __init__.py
│   │   ├── prediction.py        # Prediction records
│   │   ├── library_item.py      # Disease library
│   │   ├── section.py           # Content sections
│   │   └── question.py          # FAQ items
│   │
│   ├──  routes/               # API endpoints
│   │   ├── __init__.py
│   │   ├── predict.py           # POST /predict
│   │   ├── results.py           # GET/DELETE /api/v1/results
│   │   ├── library.py           # GET /api/v1/library
│   │   ├── content.py           # GET /api/v1/content
│   │   └── questions.py         # GET /api/v1/questions
│   │
│   └──  services/             # Business logic
│       ├── __init__.py
│       ├── ai_service.py        # AI inference
│       └── seed_service.py      # Database seeding
│
├── requirements.txt             # Python dependencies
├── .env.example                # Environment template
└── Dockerfile                  # Container configuration
```

---

## 📡 Справочник эндпоинтов API

### Базовый URL

```
Development: http://localhost:8000
Production: http://your-domain.com
```

### Документация API

- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc
- **OpenAPI JSON**: http://localhost:8000/openapi.json

---

### 1. Проверка работоспособности

**Эндпоинт:** `GET /health`

**Описание:** проверяет, работает ли API и в норме ли он.

**Ответ:**
```json
{
  "status": "healthy",
  "version": "1.0.0"
}
```

**Коды статуса:**
- `200 OK`: API в норме
- `500 Internal Server Error`: неполадки в API

---

### 2. Корневой эндпоинт

**Эндпоинт:** `GET /`

**Описание:** получение информации об API и доступной документации.

**Ответ:**
```json
{
  "name": "Digital Ophthalmology Assistant",
  "version": "1.0.0",
  "docs": "/docs",
  "health": "/health"
}
```

---

### 3. Предсказание заболевания глаза

**Эндпоинт:** `POST /predict`

**Описание:** загрузка снимка глаза и получение классификации заболевания на базе ИИ. Перед инференсом система использует собственный алгоритм препроцессинга с центральным кропом для выделения области глаза.

**Запрос:**
- **Content-Type:** `multipart/form-data`
- **Тело:**
  - `file` (binary): файл изображения (JPG, PNG, BMP, WebP)
  - Максимальный размер: 10 МБ
  - Размеры изображения: минимум 50×50px, максимум 4096×4096px

**Успешный ответ (200):**
```json
{
  "label": "healthy_eye",
  "confidence": 0.9234
}
```

**Допустимые метки предсказаний:**
- `healthy_eye` — нормальный глаз без отклонений
- `conjunctivitis` — воспаление конъюнктивы
- `cataract` — помутнение хрусталика
- `keratitis` — воспаление роговицы

**Ответы об ошибках:**

| Код | Причина | Ответ |
|------|--------|----------|
| `400` | Нет имени файла | `{"detail": "Missing filename in upload"}` |
| `400` | Пустой файл | `{"detail": "Empty file received"}` |
| `400` | Изображение слишком маленькое | `{"detail": "Image dimensions too small..."}` |
| `400` | Изображение слишком большое | `{"detail": "Image dimensions too large..."}` |
| `413` | Файл слишком большой | `{"detail": "File too large"}` |
| `415` | Неподдерживаемый тип | `{"detail": "Unsupported file type: .gif"}` |
| `500` | Модель не найдена | `{"detail": "Model not found. Please ensure the model is properly deployed."}` |
| `500` | Сбой предсказания | `{"detail": "Prediction failed due to an internal error"}` |

**Реализация:**
```python
# backend/app/routes/predict.py
@router.post("/predict", response_model=dict[str, str | float])
async def run_prediction(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    settings: Settings = Depends(get_settings),
) -> dict[str, str | float]:
    # 1. Validate file
    # 2. Validate image content
    # 3. Save file to upload directory
    # 4. Run AI prediction
    # 5. Save to database
    # 6. Return result
```

---

### 4. Список результатов предсказаний

**Эндпоинт:** `GET /api/v1/results`

**Описание:** получение записей предсказаний с опциональной фильтрацией и пагинацией.

**Параметры запроса:**
- `min_confidence` (необязательный): фильтр по минимальной достоверности (0.0–1.0)
- `prediction` (необязательный): фильтр по метке предсказания
- `date_from` (необязательный): фильтр по дате начала (формат ISO 8601)
- `date_to` (необязательный): фильтр по дате окончания (формат ISO 8601)
- `page` (необязательный): номер страницы, отсчёт с 1 (по умолчанию: 1)
- `page_size` (необязательный): результатов на страницу (по умолчанию: 20, максимум: 100)

**Успешный ответ (200):**
```json
{
  "data": [
    {
      "id": 1,
      "image_path": "/path/to/uploads/uuid.jpg",
      "prediction": "healthy_eye",
      "confidence": 0.9234,
      "created_at": "2024-01-15T10:30:00"
    },
    {
      "id": 2,
      "image_path": "/path/to/uploads/uuid2.jpg",
      "prediction": "cataract",
      "confidence": 0.8756,
      "created_at": "2024-01-15T11:45:00"
    }
  ],
  "pagination": {
    "page": 1,
    "page_size": 20,
    "total_count": 150,
    "total_pages": 8,
    "has_next": true,
    "has_previous": false
  }
}
```

**Реализация:**
```python
# backend/app/routes/results.py
@router.get("/results")
def list_results(
    min_confidence: Optional[float] = Query(default=None, ge=0.0, le=1.0),
    prediction: Optional[str] = Query(default=None),
    date_from: Optional[datetime] = Query(default=None),
    date_to: Optional[datetime] = Query(default=None),
    page: int = Query(default=1, ge=1, description="Page number (1-indexed)"),
    page_size: int = Query(default=20, ge=1, le=100, description="Results per page"),
    db: Session = Depends(get_db),
):
    """List prediction results with pagination support."""
    query = db.query(Prediction)

    if min_confidence is not None:
        query = query.filter(Prediction.confidence >= min_confidence)
    if prediction is not None and prediction.strip():
        query = query.filter(Prediction.prediction == prediction.strip())
    if date_from is not None:
        query = query.filter(Prediction.created_at >= date_from)
    if date_to is not None:
        query = query.filter(Prediction.created_at <= date_to)

    total_count = query.count()
    offset = (page - 1) * page_size
    records = query.order_by(Prediction.created_at.desc()).offset(offset).limit(page_size).all()
    
    return {
        "data": [...],
        "pagination": {
            "page": page,
            "page_size": page_size,
            "total_count": total_count,
            "total_pages": (total_count + page_size - 1) // page_size,
            "has_next": offset + page_size < total_count,
            "has_previous": page > 1,
        }
    }
```

---

### 5. Получение одного результата

**Эндпоинт:** `GET /api/v1/results/{result_id}`

**Описание:** получение конкретного предсказания по ID.

**Параметры пути:**
- `result_id` (целое число): ID записи предсказания

**Успешный ответ (200):**
```json
{
  "id": 1,
  "image_path": "/path/to/uploads/uuid.jpg",
  "prediction": "healthy_eye",
  "confidence": 0.9234,
  "created_at": "2024-01-15T10:30:00"
}
```

**Ответы об ошибках:**
- `404 Not Found`: результат с указанным ID не найден

---

### 6. Удаление результата

**Эндпоинт:** `DELETE /api/v1/results/{result_id}`

**Описание:** удаление конкретной записи предсказания.

**Параметры пути:**
- `result_id` (целое число): ID записи предсказания

**Успешный ответ (200):**
```json
{
  "message": "Result deleted successfully"
}
```

**Ответы об ошибках:**
- `404 Not Found`: результат с указанным ID не найден

---

### 7. Список библиотеки заболеваний

**Эндпоинт:** `GET /api/v1/library`

**Описание:** получение информации о заболеваниях с возможностями поиска и фильтрации.

**Параметры запроса:**
- `q` (необязательный): поисковый запрос (поиск по названию и симптомам)
- `name` (необязательный): фильтр по конкретному названию заболевания

**Успешный ответ (200):**
```json
[
  {
    "id": "healthy_eye",
    "name": "Healthy Eye",
    "name_ar": "عين سليمة",
    "short": "Normal eye without any detected abnormalities.",
    "short_ar": "عين طبيعية بدون أي تشوهات مكتشفة.",
    "symptoms_ar": ["رؤية واضحة", "لا يوجد احمرار", "لا يوجد ألم"],
    "red_flags_ar": ["تغير مفاجئ في الرؤية", "ألم شديد"],
    "safe_tips_ar": ["فحص دوري", "حماية من الأشعة فوق البنفسجية"],
    "when_to_see_doctor_ar": "سنوياً للفحص الدوري",
    "risk_level": "Low",
    "created_at": "2024-01-15T09:00:00",
    "updated_at": "2024-01-15T09:00:00"
  }
]
```

---

### 8. Получение подробной информации о заболевании

**Эндпоинт:** `GET /api/v1/library/{disease_id}`

**Описание:** получение подробной информации о конкретном заболевании.

**Параметры пути:**
- `disease_id` (строка): идентификатор заболевания

**Успешный ответ (200):**
```json
{
  "id": "cataract",
  "name": "Cataract",
  "name_ar": "المياه البيضاء",
  "short": "Clouding of the eye's lens...",
  "short_ar": "تعكر في عدسة العين...",
  "symptoms_ar": ["رؤية ضبابية", "حساسية للضوء", "رؤية هالات"],
  "red_flags_ar": ["فقدان البصر المفاجئ"],
  "safe_tips_ar": ["جراحة إزالة المياه البيضاء"],
  "when_to_see_doctor_ar": "فوراً عند ملاحظة أي تغير في الرؤية",
  "risk_level": "Moderate"
}
```

---

### 9. Получение раздела контента

**Эндпоинт:** `GET /api/v1/content/{section_type}`

**Описание:** получение образовательного контента для конкретных разделов.

**Параметры пути:**
- `section_type` (строка): тип раздела (about, safety, education)

**Успешный ответ (200):**
```json
{
  "title": "Safety Information",
  "content": {
    "intro": "Important safety guidelines...",
    "cards": [
      {
        "title": "Clinical Validation",
        "content": "Always validate AI predictions..."
      }
    ],
    "escalation_advice": "When to seek immediate medical attention..."
  }
}
```

---

### 10. Получение вопросов/FAQ

**Эндпоинт:** `GET /api/v1/questions`

**Описание:** получение часто задаваемых вопросов.

**Успешный ответ (200):**
```json
[
  {
    "id": 1,
    "question": "How accurate is the AI?",
    "answer": "The AI model has been trained on...",
    "category": "technical"
  }
]
```

---

## 🗄 Модели базы данных

### 1. Модель Prediction

**Таблица:** `predictions`

**Назначение:** хранение записей предсказаний ИИ для истории.

```python
class Prediction(Base):
    __tablename__ = "predictions"

    id = Column(Integer, primary_key=True, index=True)
    image_path = Column(String, nullable=False)
    prediction = Column(String, nullable=True)
    confidence = Column(Float, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
```

**Поля:**
- `id`: уникальный идентификатор (автоинкремент)
- `image_path`: путь к загруженному файлу изображения
- `prediction`: метка заболевания, предсказанная ИИ
- `confidence`: оценка достоверности (от 0.0 до 1.0)
- `created_at`: отметка времени предсказания

---

### 2. Модель LibraryItem

**Таблица:** `library_items`

**Назначение:** хранение информации о заболеваниях для раздела библиотеки.

```python
class LibraryItem(Base):
    __tablename__ = "library_items"

    id = Column(Integer, primary_key=True, index=True)
    disease_id = Column(String, unique=True, index=True, nullable=False)
    name = Column(String, nullable=False)
    name_ar = Column(String, nullable=False)
    short = Column(Text, nullable=False)
    short_ar = Column(Text, nullable=False)
    symptoms_ar = Column(Text, nullable=False)  # JSON array
    red_flags_ar = Column(Text, nullable=False)  # JSON array
    safe_tips_ar = Column(Text, nullable=False)  # JSON array
    when_to_see_doctor_ar = Column(Text, nullable=False)
    risk_level = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
```

**Поля:**
- `disease_id`: уникальный идентификатор (например, «cataract», «healthy_eye»)
- `name`: название заболевания на английском
- `name_ar`: название заболевания на арабском
- `short`: краткое описание на английском
- `short_ar`: краткое описание на арабском
- `symptoms_ar`: JSON-массив симптомов на арабском
- `red_flags_ar`: JSON-массив тревожных сигналов на арабском
- `safe_tips_ar`: JSON-массив полезных советов на арабском
- `when_to_see_doctor_ar`: когда обратиться к врачу (арабский)
- `risk_level`: Low, Moderate или High

---

### 3. Модель Section

**Таблица:** `sections`

**Назначение:** хранение разделов образовательного контента (about, safety, education).

```python
class Section(Base):
    __tablename__ = "sections"

    id = Column(Integer, primary_key=True, index=True)
    section_type = Column(String, unique=True, nullable=False)
    title = Column(String, nullable=False)
    content = Column(Text, nullable=False)  # JSON
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
```

---

### 4. Модель Question

**Таблица:** `questions`

**Назначение:** хранение элементов FAQ.

```python
class Question(Base):
    __tablename__ = "questions"

    id = Column(Integer, primary_key=True, index=True)
    question = Column(String, nullable=False)
    answer = Column(Text, nullable=False)
    category = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
```

---

## ⚙️ Конфигурация

### Переменные окружения

Создайте файл `.env` в каталоге `backend/`:

```env
# Server
HOST=0.0.0.0
PORT=8000

# Application
DEBUG=false
APP_NAME="Digital Ophthalmology Assistant"
APP_VERSION=1.0.0

# Database
DATABASE_URL=sqlite:///./predictions.db

# CORS
CORS_ORIGINS=["*"]

# DL Model
MODEL_PATH=

# File Upload
UPLOAD_DIR=
MAX_UPLOAD_SIZE_MB=10
```

### Класс конфигурации

```python
# backend/app/config.py
class Settings(BaseSettings):
    """Application settings loaded from environment variables."""
    
    # Application
    app_name: str = "Digital Ophthalmology Assistant"
    app_version: str = "1.0.0"
    debug: bool = False
    
    # Server
    host: str = "0.0.0.0"
    port: int = 7860
    
    # Database
    database_url: str | None = None
    
    # CORS
    cors_origins: list[str] = ["*"]
    
    # DL Model
    model_repo_id: str = "mohamed-wahba77/eye-disease-model"
    model_filename: str = "model.keras"
    
    # File Upload
    upload_dir: Path | None = None
    max_upload_size_mb: int = 10
    allowed_extensions: set[str] = {".jpg", ".jpeg", ".png", ".bmp", ".webp"}
```

---

### Отслеживание по Request ID

Каждому запросу назначается уникальный UUID, который:
- логируется в начале и конце каждого запроса;
- включается в заголовок ответа `X-Request-ID`;
- используется для сквозной трассировки запросов в продакшене.

**Пример запроса/ответа:**
```
Request Header:  (auto-generated)
Response Header: X-Request-ID: 550e8400-e29b-41d4-a716-446655440000
```

---

## 🛡 Обработка ошибок

### Пользовательские обработчики исключений

```python
# backend/app/main.py

@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    """Handle HTTP exceptions with consistent format."""
    return JSONResponse(
        status_code=exc.status_code,
        content={"detail": exc.detail, "status_code": exc.status_code},
    )

@app.exception_handler(Exception)
async def unhandled_exception_handler(request: Request, exc: Exception):
    """Handle unhandled exceptions with logging."""
    logger.error(f"Unhandled exception in {request.method} {request.url}: {exc}")
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal server error", "status_code": 500},
    )
```

### Стандартный формат ответа об ошибке

```json
{
  "detail": "Error message describing what went wrong",
  "status_code": 400
}
```

### Основные коды статуса HTTP

| Код | Значение | Использование |
|------|---------|-------|
| `200` | OK | Успешный запрос |
| `400` | Bad Request | Некорректный вход (нет файла, пустой файл) |
| `404` | Not Found | Ресурс не найден (ID результата, ID заболевания) |
| `413` | Payload Too Large | Файл превышает допустимый размер |
| `415` | Unsupported Media Type | Недопустимое расширение файла |
| `500` | Internal Server Error | Ошибка на стороне сервера (загрузка модели, предсказание) |

---

## 🔧 Реализация сервиса ИИ

### Конвейер препроцессинга

Конвейер препроцессинга в точности соответствует обучающему:

1. **Загрузка и преобразование в RGB** — обеспечивает единообразный вход из 3 каналов
2. **Масштабирование до 256** — короткая сторона масштабируется до 256 пикселей (с сохранением пропорций)
3. **Центральный кроп до 224×224** — фокус на центральной области глаза
4. **Нормализация до [0, 1]** — значения пикселей делятся на 255.0
5. **Расширение размерностей** — добавление измерения батча для инференса

```python
# backend/app/services/ai_service.py

def preprocess_image(image_path: str | Path) -> np.ndarray:
    """Preprocess image for model inference.
    
    Matches the exact preprocessing used during training:
    1. Load image and convert to RGB
    2. Scale so shortest side = 256 (maintaining aspect ratio)
    3. Center crop to 224x224
    4. Normalize to [0, 1] by dividing by 255.0
    5. Expand dimensions for batch inference
    """
    path = Path(image_path)
    img = Image.open(path).convert("RGB")
    arr = np.asarray(img, dtype=np.float32)
    
    h, w = arr.shape[:2]
    
    # Scale to 256 on shortest side (same as training)
    scale = 256 / min(h, w)
    new_w, new_h = int(w * scale), int(h * scale)
    
    img = Image.fromarray(arr.astype(np.uint8))
    img = img.resize((new_w, new_h), Image.Resampling.BILINEAR)
    
    arr = np.asarray(img, dtype=np.float32)
    h, w = arr.shape[:2]
    
    # Center crop to 224x224
    start_h = (h - IMG_SIZE) // 2
    start_w = (w - IMG_SIZE) // 2
    arr = arr[start_h:start_h + IMG_SIZE, start_w:start_w + IMG_SIZE]
    
    # Normalize
    arr = arr / 255.0
    
    return np.expand_dims(arr, axis=0)
```

### Метки классификации заболеваний

Все метки заболеваний следуют единообразной соглашённости об именовании (строчными с подчёркиваниями):

```python
CLASS_NAMES = (
    "healthy_eye",      # Normal eye
    "conjunctivitis",   # Inflammation of conjunctiva
    "cataract",         # Lens opacification
    "keratitis",        # Corneal inflammation
)
```

---

## 🧪 Тестирование

### Запуск тестов

```bash
cd backend
pip install pytest pillow
pytest tests/ -v
```

### Покрые тестами

| Модуль | Тесты | Покрытие |
|--------|-------|----------|
| `test_predict.py` | Валидация изображений, поддержка форматов, ограничения размеров | Эндпоинт предсказания |
| `test_ai_service.py` | Конвейер препроцессинга, нормализация имён классов, пороги достоверности | Сервис ИИ |

### Пример теста

```python
# backend/tests/test_ai_service.py
class TestPreprocessingPipeline:
    """Tests for the preprocessing pipeline."""
    
    def test_preprocess_image_output_shape(self):
        """Test that preprocessing produces correct output shape."""
        # Create a test image
        img = Image.new('RGB', (500, 400), color=(128, 128, 128))
        img.save('/tmp/test_image.jpg')
        
        # Preprocess
        batch = preprocess_image('/tmp/test_image.jpg')
        
        # Check output shape (1, 224, 224, 3)
        assert batch.shape == (1, 224, 224, 3)
        assert batch.dtype == np.float32
        assert 0.0 <= batch.min() and batch.max() <= 1.0
```

---

## 💡 Лучшие практики

### 1. Управление сессиями базы данных

Всегда используйте внедрение зависимостей для сессий базы данных:

```python
@router.get("/results")
async def list_results(db: Session = Depends(get_db)):
    # Database operations here
    pass  # Session automatically closed after request
```

### 2. Валидация входных данных

Используйте модели Pydantic для валидации запросов/ответов:

```python
class PredictionSchema(BaseModel):
    label: str
    confidence: float

    class Config:
        json_schema_extra = {
            "example": {
                "label": "healthy_eye",
                "confidence": 0.9234
            }
        }
```

### 3. Обработка ошибок

Всегда корректно обрабатывайте исключения:

```python
try:
    label, confidence = predict_image(file_path)
except FileNotFoundError:
    raise HTTPException(
        status_code=500,
        detail="Model not found on HuggingFace Hub"
    )
except Exception:
    raise HTTPException(
        status_code=500,
        detail="Prediction failed"
    )
```

### 4. Логирование

Используйте корректное логирование для отладки и мониторинга:

```python
logger = logging.getLogger(__name__)

logger.info("Starting up Digital Ophthalmology Assistant...")
logger.warning(f"Failed to preload DL model: {e}")
logger.error(f"Unhandled exception: {exc}")
```

### 5. Подсказки типов

Всегда используйте подсказки типов для ясности кода:

```python
def predict_image(image_path: str | Path) -> Tuple[str, float]:
    """Run inference on image and return prediction."""
    pass
```

### 6. Async/Await

Используйте async для операций, связанных с вводом-выводом:

```python
@router.post("/predict")
async def run_prediction(
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    content = await file.read()  # Async file read
    # ...
```

---

## 🧪 Тестирование API

### С помощью curl

```bash
# Health check
curl http://localhost:8000/health

# Predict
curl -X POST http://localhost:8000/predict \
  -F "file=@/path/to/eye_image.jpg"

# List results
curl http://localhost:8000/api/v1/results

# Get disease library
curl http://localhost:8000/api/v1/library
```

### С помощью Python requests

```python
import requests

# Health check
response = requests.get("http://localhost:8000/health")
print(response.json())

# Predict
with open("eye_image.jpg", "rb") as f:
    files = {"file": f}
    response = requests.post("http://localhost:8000/predict", files=files)
    print(response.json())

# List results
response = requests.get("http://localhost:8000/api/v1/results")
print(response.json())
```

---

## ▶ Запуск бэкенда

### Режим разработки

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate  # macOS/Linux
pip install -r requirements.txt
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### Продакшен-режим

```bash
uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 4
```

### Docker

```bash
cd backend
docker build -t ophthalmology-api .
docker run -p 8000:8000 ophthalmology-api
```

---

*По вопросам бэкенда обращайтесь к тимлиду команды бэкенда.*

*Последнее обновление: 3 мая 2026*  
*Версия документа: 1.2*

---

## 📝 История изменений

### Версия 1.2 (3 мая 2026)

- **Обновлено**: конвейер препроцессинга теперь использует подход «сначала масштабирование, затем кроп» (масштабирование до 256, затем центральный кроп до 224)
- **Обновлено**: файл модели переименован в `Eye_Disease_model_v3.keras`
- **Улучшены**: пороги достоверности (HIGH=0.80, MEDIUM=0.60, LOW=0.45)
- **Добавлено**: метрика нормализованной энтропии для обнаружения неопределённости
- **Добавлено**: отслеживание маржи достоверности для обнаружения неоднозначности
- **Исправлено**: нормализация имён классов с сопоставлением псевдонимов для меток обучения

### Версия 1.1 (29 апреля 2026)

- **Исправлено**: стандартизированы имена классов заболеваний (`conjunctivitis`, `cataract` вместо несогласованных имён)
- **Добавлено**: middleware отслеживания Request ID для сквозной трассировки запросов
- **Добавлена**: поддержка пагинации для эндпоинта `/api/v1/results`
- **Добавлена**: валидация размеров изображений (минимум 50×50, максимум 4096×4096 пикселей)
- **Улучшена**: обработка ошибок с информативными сообщениями
- **Улучшена**: конфигурация Docker, готовая к продакшену, с многостадийной сборкой
- **Добавлен**: полный набор тестов на pytest

### Версия 1.0 (первый выпуск)

- Первоначальная реализация бэкенда на FastAPI
- Инференс ИИ с моделью TensorFlow/Keras
- База данных SQLite с ORM SQLAlchemy
- CRUD-операции для предсказаний, элементов библиотеки, разделов контента и вопросов
