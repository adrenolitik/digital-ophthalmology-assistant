# Техническое руководство по ИИ/глубокому обучению

## 🔍 Обзор

В этом документе представлено подробное техническое руководство по системе глубокого обучения, используемой для классификации заболеваний глаз.

---

## 📋 Оглавление

1. [Архитектура модели](#архитектура-модели)
2. [Конвейер инференса](#конвейер-инференса)
3. [Реализация кода](#реализация-кода)
4. [Загрузка модели](#загрузка-модели)
5. [Препроцессинг](#препроцессинг)
6. [Предсказание](#предсказание)
7. [Оптимизация производительности](#оптимизация-производительности)
8. [Устранение неполадок](#устранение-неполадок)

---

## 🧠 Архитектура модели

### Базовая архитектура: MobileNetV2

Наша модель построена на **MobileNetV2** — лёгкой свёрточной нейросети, разработанной для мобильных и встраиваемых vision-приложений.

#### Почему MobileNetV2?
- **Эффективность**: оптимизирована для мобильного и веб-развёртывания
- **Скорость**: быстрый инференс (~2–3 секунды на изображение)
- **Точность**: хороший баланс между размером и качеством
- **Разделимые свёртки по глубине**: меньше параметров и вычислений

### Характеристики модели

| Параметр | Значение |
|-----------|-------|
| **Форма входа** | 224 × 224 × 3 (RGB) |
| **Базовая архитектура** | MobileNetV2 (предобучена на ImageNet) |
| **Пользовательские слои** | Global Average Pooling + BatchNormalization + Dense(256) + Dropout(0.5) + Dense(128) + Dropout(0.3) + Dense(4, softmax) |
| **Выходные классы** | 4 (Здоров, Конъюнктивит, Катаракта, Кератит) |
| **Формат модели** | `.keras` (родной формат Keras) |
| **Файл модели** | `Eye_Disease_model_v3.keras` |
| **Размер модели** | ~22 МБ |
| **Набор данных для обучения** | Пользовательский набор изображений глазных заболеваний |
| **Имена классов (обучение)** | `["healthy_eye", "Conjunctivitis Recognition", "Cataract dataset", "keratitis"]` |
| **Имена классов (API)** | `["healthy_eye", "conjunctivitis", "cataract", "keratitis"]` |

### Схема архитектуры модели

```
Input (224×224×3)
    ↓
MobileNetV2 Base (pre-trained weights)
    ↓
Global Average Pooling 2D
    ↓
Dropout (0.5)
    ↓
Dense Layer (4 units, softmax activation)
    ↓
Output Probabilities [p_healthy, p_conjunctivitis, p_cataract, p_keratitis]
```

---

## ⚙️ Конвейер инференса

Полный процесс инференса состоит из 5 этапов:

```
┌─────────────────────────────────────────────────────────────────┐
│ STAGE 1: Image Upload                                          │
│ - User selects/drags image file                                │
│ - Frontend validates file type (JPG, PNG, etc.)                │
│ - File size check (max 10MB)                                   │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│ STAGE 2: Backend Reception                                     │
│ - FastAPI receives multipart form data                         │
│ - Validates file extension and content                         │
│ - Saves to temporary upload directory                          │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│ STAGE 3: Image Preprocessing                                   │
│ - Load image with Pillow                                       │
│ - Convert to RGB (remove alpha channel if present)             │
│ - Scale: shortest side → 256 (maintain aspect ratio)           │
│ - Center crop to 224×224 pixels                                │
│ - Normalize pixel values (divide by 255.0)                     │
│ - Expand dimensions for batch inference                        │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│ STAGE 4: Model Inference                                       │
│ - Load pre-trained model (singleton pattern)                   │
│ - Run forward pass through neural network                      │
│ - Get output probabilities for each class                      │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│ STAGE 5: Post-processing & Response                            │
│ - Normalize class names (training → API labels)                │
│ - Compute confidence metrics (margin, entropy)                 │
│ - Determine confidence level (high/medium/low)                 │
│ - Flag low-confidence predictions for review                   │
│ - Return JSON response with all probabilities                  │
│ - Save prediction to database for history                      │
└─────────────────────────────────────────────────────────────────┘
```

---

## 💻 Реализация кода

### Структура файлов

```
backend/app/services/
├── __init__.py
├── ai_service.py          # Main AI service (this is the core)
└── seed_service.py        # Database seeding
```

### Основной сервис ИИ: `ai_service.py`

#### 1. Импорты и конфигурация

```python
import json
import math
import threading
from pathlib import Path
from typing import Tuple

import numpy as np
from PIL import Image
import tensorflow as tf

# Configuration constants
IMG_SIZE = 224

# Load class names dynamically from training (stored in class_names.json)
CLASS_PATH = Path(__file__).resolve().parents[2] / "models" / "class_names.json"
with open(CLASS_PATH) as f:
    CLASS_NAMES = tuple(json.load(f))
# CLASS_NAMES = ("healthy_eye", "Conjunctivitis Recognition", "Cataract dataset", "keratitis")

# Mapping from training labels to stable public API labels
CLASS_NAME_ALIASES = {
    "healthy_eye": "healthy_eye",
    "normal": "healthy_eye",
    "conjunctivitis recognition": "conjunctivitis",
    "conjunctivitis": "conjunctivitis",
    "cataract dataset": "cataract",
    "cataract": "cataract",
    "keratitis": "keratitis",
}

UNKNOWN_LABEL = "unrecognized"

def normalize_class_name(name: str) -> str:
    """Map notebook/training labels to stable public API labels."""
    normalized = "_".join(str(name).strip().lower().split())
    alias_key = normalized.replace("_", " ")
    return CLASS_NAME_ALIASES.get(alias_key, normalized)

# Confidence thresholds
HIGH_CONFIDENCE = 0.80
MEDIUM_CONFIDENCE = 0.60
LOW_CONFIDENCE = 0.45
MIN_MARGIN = 0.15
MAX_NORMALIZED_ENTROPY = 0.85
```

#### 2. Загрузка модели (паттерн Singleton)

```python
_model = None
_lock = threading.Lock()

DEFAULT_MODEL_PATH = Path(__file__).resolve().parents[2] / "models" / "Eye_Disease_model_v3.keras"

def get_model(model_path: Path | str | None = None) -> tf.keras.Model:
    """Thread-safe singleton DL model loader."""
    global _model

    if _model is not None:
        return _model

    with _lock:
        if _model is not None:
            return _model

        if model_path is None:
            model_path = DEFAULT_MODEL_PATH
        
        model_path = Path(model_path)
        
        if not model_path.exists():
            raise FileNotFoundError(f"Model not found: {model_path}")

        _model = tf.keras.models.load_model(str(model_path))

        # Warmup (important for DL inference latency)
        _model.predict(np.zeros((1, IMG_SIZE, IMG_SIZE, 3)), verbose=0)

    return _model
```

**Ключевые моменты:**
- **Паттерн Singleton**: модель загружается только один раз и затем переиспользуется
- **Потокобезопасность**: блокировка предотвращает гонки данных при загрузке
- **Ленивая загрузка**: модель загружается при первом обращении, а не при старте
- **Прогрев**: первое предсказание подготавливает GPU/CPU к более быстрым последующим инференсам

#### 3. Препроцессинг изображений (соответствует обучению на 100%)

```python
def preprocess_image(image_path: str | Path) -> np.ndarray:
    """Prepare image for model inference.
    
    Matches the exact preprocessing used during training:
    1. Load image and convert to RGB
    2. Scale so shortest side = 256 (maintaining aspect ratio)
    3. Center crop to 224x224
    4. Normalize to [0, 1] by dividing by 255.0
    5. Expand dimensions for batch inference
    """
    path = Path(image_path)

    if not path.exists():
        raise FileNotFoundError(f"Image not found: {path}")

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

**Зачем сначала масштабировать до 256?**
- Сохраняет пропорции (без искажений)
- Обеспечивает единый с обучением препроцессинг
- Модель обучалась именно с этим подходом к масштабированию

**Зачем центральный кроп до 224?**
- Фокусируется на центральной области глаза
- Убирает периферический шум (ресницы, кожа, края оборудования)
- Соответствует требованиям модели к входу

**Зачем нормализовать?**
- Нейросети лучше обучаются на нормализованных входах
- Значения пикселей в диапазоне [0, 1] стабилизируют градиентный спуск
- Соответствует препроцессингу, использованному при обучении модели

#### 4. Предсказание с расширенной постобработкой

```python
def build_prediction_result(probabilities: np.ndarray) -> dict:
    """Convert raw softmax output into a safer API response."""
    probs = np.asarray(probabilities, dtype=np.float32)
    
    sorted_indices = np.argsort(probs)[::-1]
    top_idx = int(sorted_indices[0])
    top_prob = float(probs[top_idx])
    second_prob = float(probs[sorted_indices[1]]) if len(sorted_indices) > 1 else 0.0
    margin = top_prob - second_prob
    entropy = _normalized_entropy(probs)

    # Use normalized class name for the predicted class
    predicted_class = normalize_class_name(CLASS_NAMES[top_idx])
    
    # Determine if prediction needs review
    is_low_confidence = top_prob < LOW_CONFIDENCE
    is_ambiguous = margin < MIN_MARGIN
    is_high_entropy = entropy > MAX_NORMALIZED_ENTROPY
    needs_review = is_low_confidence or is_ambiguous or is_high_entropy

    # Determine confidence level
    if top_prob >= HIGH_CONFIDENCE and margin >= MIN_MARGIN:
        confidence_level = "high"
    elif top_prob >= MEDIUM_CONFIDENCE and margin >= MIN_MARGIN:
        confidence_level = "medium"
    else:
        confidence_level = "low"

    public_label = UNKNOWN_LABEL if needs_review else predicted_class
    
    return {
        "label": public_label,
        "predicted_class": predicted_class,
        "confidence": round(top_prob, 6),
        "confidence_level": confidence_level,
        "all_probabilities": {
            normalize_class_name(CLASS_NAMES[i]): round(float(probs[i]), 6) 
            for i in range(len(CLASS_NAMES))
        },
        "needs_review": needs_review,
        "second_best_class": normalize_class_name(CLASS_NAMES[sorted_indices[1]]),
        "second_best_confidence": round(second_prob, 6),
        "confidence_margin": round(margin, 6),
        "normalized_entropy": round(entropy, 6),
    }

def predict_image(image_path: str | Path) -> Tuple[str, float]:
    """Run inference on image and return prediction."""
    model = get_model()
    batch = preprocess_image(image_path)
    preds = model.predict(batch, verbose=0)[0]
    result = build_prediction_result(preds)
    return result["label"], float(result["confidence"])

def predict_image_detailed(image_path: str | Path) -> dict:
    """Run inference and return detailed prediction results."""
    model = get_model()
    batch = preprocess_image(image_path)
    preds = model.predict(batch, verbose=0)[0]
    return build_prediction_result(preds)
```

**Пояснение выходных данных:**
- `label`: публичное предсказание (или `"unrecognized"` при низкой достоверности)
- `predicted_class`: фактическое предсказание модели (нормализованное имя класса)
- `confidence`: оценка достоверности предсказания
- `confidence_level`: `"high"`, `"medium"` или `"low"`
- `all_probabilities`: полное распределение вероятностей по всем классам
- `needs_review`: булев флаг предсказаний с низкой достоверностью
- Дополнительные метрики: маржа, энтропия, класс-второе место

---

## 📦 Загрузка модели

### Вариант 1: автоматическая загрузка с Hugging Face Hub

```python
from app.services.ai_service import get_model

# No argument = download from HF Hub
model = get_model()
```

### Вариант 2: локальный путь к модели

```python
from pathlib import Path
from app.services.ai_service import get_model

# Provide local path
model = get_model(Path("backend/models/model.keras"))
```

### Вариант 3: загрузка на основе конфигурации

```python
# In config.py
@property
def resolved_model_path(self) -> Path:
    """Get default local model path."""
    return Path(__file__).resolve().parents[2] / "models" / self.model_filename

# In main.py (startup)
from app.services.ai_service import get_model
get_model(settings.resolved_model_path)
```

---

## 🔧 Детали препроцессинга

### Преобразования шаг за шагом

| Шаг | Операция | Форма входа | Форма выхода | Назначение |
|------|-----------|-------------|--------------|---------|
| 1 | Загрузка изображения | Файл на диске | (H, W, 3) | Чтение данных изображения |
| 2 | Преобразование в RGB | (H, W, 4) или (H, W) | (H, W, 3) | Обеспечить 3 канала |
| 3 | Масштабирование (короткая сторона=256) | (H, W, 3) | (H', W', 3) | Сохранить пропорции |
| 4 | Центральный кроп | (H', W', 3) | (224, 224, 3) | Сфокусироваться на области глаза |
| 5 | Нормализация | [0, 255] | [0.0, 1.0] | Стабилизировать инференс |
| 6 | Расширение размерностей | (224, 224, 3) | (1, 224, 224, 3) | Добавить измерение батча |

### Наглядный пример

```
Original Image (1000×800)
    ↓ Scale (shortest side → 256)
Scaled Image (320×256) - aspect ratio preserved
    ↓ Center Crop (224×224 from center)
Cropped Image (224×224) - focused on center
    ↓ Normalize
Normalized Image - pixel values between 0 and 1
    ↓ Expand Dims
Batch Image (1, 224, 224, 3) - ready for model
```

### Нормализация имён классов

Модель обучалась на конкретных именах папок, которые отличаются от меток API:

| Метка обучения (из class_names.json) | Метка API (нормализованная) |
|----------------------------------------|------------------------|
| `healthy_eye` | `healthy_eye` |
| `Conjunctivitis Recognition` | `conjunctivitis` |
| `Cataract dataset` | `cataract` |
| `keratitis` | `keratitis` |

Функция `normalize_class_name()` выполняет это сопоставление, обеспечивая единообразные ответы API.

---

## 🔮 Предсказание

### Понимание выходных данных модели

Модель выдаёт распределение вероятностей по 4 классам:

```python
# Example output (raw probabilities)
preds = [0.9234, 0.0421, 0.0234, 0.0111]
#          healthy   conjunctivitis  cataract  keratitis

# Interpretation:
# - 92.34% chance: Healthy eye
# - 4.21% chance: Conjunctivitis
# - 2.34% chance: Cataract
# - 1.11% chance: Keratitis

# Full API response:
{
    "label": "healthy_eye",           # Public-facing label
    "predicted_class": "healthy_eye", # Normalized class name
    "confidence": 0.9234,
    "confidence_level": "high",
    "needs_review": False,
    "all_probabilities": {
        "healthy_eye": 0.9234,
        "conjunctivitis": 0.0421,
        "cataract": 0.0234,
        "keratitis": 0.0111
    },
    "second_best_class": "conjunctivitis",
    "confidence_margin": 0.8813,
    "normalized_entropy": 0.1523
}
```

### Пороги достоверности

| Порог | Значение | Интерпретация |
|-----------|-------|----------------|
| `HIGH_CONFIDENCE` | 0.80 | Предсказание надёжно |
| `MEDIUM_CONFIDENCE` | 0.60 | Предсказание умеренно надёжно |
| `LOW_CONFIDENCE` | 0.45 | Предсказание неопределённо |
| `MIN_MARGIN` | 0.15 | Минимальный разрыв между двумя лучшими классами |
| `MAX_NORMALIZED_ENTROPY` | 0.85 | Максимальная неопределённость (энтропия) |

### Уровни достоверности

| Уровень | Условия | Действие |
|-------|------------|--------|
| `high` | confidence ≥ 0.80 И margin ≥ 0.15 | Доверять предсказанию |
| `medium` | confidence ≥ 0.60 И margin ≥ 0.15 | Учитывать предсказание, проверить клинически |
| `low` | Иначе | Пометить на проверку, порекомендовать специалиста |

### Обнаружение низкой достоверности

Предсказание помечается на проверку (`needs_review=True`), если выполнено ЛЮБОЕ из условий:
- Вероятность лучшего класса < `LOW_CONFIDENCE` (0.45)
- Маржа между двумя лучшими классами < `MIN_MARGIN` (0.15)
- Нормализованная энтропия > `MAX_NORMALIZED_ENTROPY` (0.85)

При пометке поле `label` возвращает `"unrecognized"` вместо предсказанного класса.

---

## 🚀 Оптимизация производительности

### 1. Прогрев модели

```python
# First prediction after loading is slow (cold start)
# Warmup prepares the model
_model.predict(np.zeros((1, IMG_SIZE, IMG_SIZE, 3)), verbose=0)
```

### 2. Паттерн Singleton

```python
# Load once, use many times
# Saves memory and loading time
_model = None  # Global variable
```

### 3. Потокобезопасность

```python
_lock = threading.Lock()  # Prevents race conditions

with _lock:
    # Only one thread can load model at a time
    if _model is None:
        _model = load_model()
```

### 4. Батчевый инференс (улучшение в будущем)

```python
# Currently: One image at a time
# Future: Multiple images in one batch
batch = np.vstack([img1, img2, img3])  # (3, 224, 224, 3)
preds = model.predict(batch)  # Faster than 3 separate predictions
```

### Метрики производительности

| Метрика | Значение | Примечания |
|--------|-------|-------|
| Время загрузки модели | ~2–3 секунды | Разовые затраты |
| Время инференса | ~0.5–1 секунда | На изображение |
| Использование памяти | ~200 МБ | Модель + накладные расходы |
| Загрузка CPU | ~50–80% | Во время инференса |

---

## 🔧 Устранение неполадок

### Проблема 1: модель не найдена

**Ошибка:**
```
FileNotFoundError: Model file not found at: /path/to/model.keras
```

**Решения:**
1. Убедитесь, что файл модели существует по указанному пути
2. Проверьте права на файл
3. При загрузке проверьте доступ к Hugging Face Hub

### Проблема 2: нехватка памяти

**Ошибка:**
```
ResourceExhaustedError: OOM when allocating tensor
```

**Решения:**
1. Уменьшите размер батча (сейчас 1, дальше уменьшить нельзя)
2. Используйте CPU вместо GPU: `export CUDA_VISIBLE_DEVICES=""`
3. Закройте другие приложения, потребляющие много памяти

### Проблема 3: медленный инференс

**Симптомы:**
- Предсказание занимает >5 секунд
- Высокая загрузка CPU

**Решения:**
1. Убедитесь, что прогрев модели выполняется
2. Проверьте системные ресурсы (ОЗУ, CPU)
3. Рассмотрите использование ускорения на GPU
4. Оптимизируйте препроцессинг изображений (уменьшайте размер до загрузки)

### Проблема 4: плохие предсказания

**Симптомы:**
- Низкие оценки достоверности
- Неправильная классификация

**Решения:**
1. Проверьте качество изображения (хорошее освещение, резкость)
2. Убедитесь в корректном препроцессинге (центральный кроп, нормализация)
3. Проверьте, что изображение действительно является снимком глаза
4. Рассмотрите переобучение модели на больших данных

---

## 📡 Пример использования API

### Запрос

```bash
curl -X POST http://localhost:8000/predict \
  -F "file=@/path/to/eye_image.jpg"
```

### Ответ

```json
{
  "label": "healthy_eye",
  "predicted_class": "healthy_eye",
  "confidence": 0.9234,
  "confidence_level": "high",
  "all_probabilities": {
    "healthy_eye": 0.9234,
    "conjunctivitis": 0.0421,
    "cataract": 0.0234,
    "keratitis": 0.0111
  },
  "needs_review": false,
  "second_best_class": "conjunctivitis",
  "second_best_confidence": 0.0421,
  "confidence_margin": 0.8813,
  "normalized_entropy": 0.1523
}
```

### Клиент на Python

```python
import requests

# Upload image
with open("eye_image.jpg", "rb") as f:
    files = {"file": f}
    response = requests.post("http://localhost:8000/predict", files=files)

# Parse response
result = response.json()
print(f"Prediction: {result['label']}")
print(f"Confidence: {result['confidence']:.2%}")
```

---

## 🔮 Планы по улучшению

### 1. Ансамбль из нескольких моделей
```python
# Combine predictions from multiple models for better accuracy
models = [model1, model2, model3]
predictions = [m.predict(batch) for m in models]
final_pred = np.mean(predictions, axis=0)
```

### 2. Визуализация Grad-CAM
```python
# Show which parts of the image influenced the prediction
# Helps with model interpretability and clinical trust
```

### 3. Квантификация неопределённости
```python
# Provide confidence intervals, not just point estimates
# Helps clinicians understand prediction reliability
```

### 4. Версионирование моделей
```python
# Track model versions and allow rollback
# A/B testing of different model versions
```

---

## 📌 Главное

1. **Модель**: CNN на базе MobileNetV2 с пользовательской головой (BatchNorm, слои Dense, Dropout)
2. **Вход**: изображения RGB 224×224, масштабируемые до 256 по короткой стороне с центральным кропом
3. **Выход**: классификация по 4 классам с расширенными метриками достоверности
4. **Имена классов**: метки обучения нормализуются в стабильные метки API через `normalize_class_name()`
5. **Производительность**: время инференса ~1 секунда, паттерн Singleton для эффективности
6. **Безопасность**: предсказания с низкой достоверностью помечаются `needs_review=True` и `label="unrecognized"`
7. **Файл модели**: `Eye_Disease_model_v3.keras` (~22 МБ)
8. **Файл имён классов**: `class_names.json` (динамическая загрузка предотвращает расхождения)

---

*По вопросам системы ИИ обращайтесь к тимлиду команды ИИ/ML.*

*Последнее обновление: 3 мая 2026*  
*Версия документа: 2.0*
