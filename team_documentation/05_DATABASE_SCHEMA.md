# Руководство по схеме и дизайну базы данных

## 🔍 Обзор

В этом документе представлено подробное руководство по дизайну базы данных: схема, связи и потоки данных.

---

## 📋 Оглавление

1. [Обзор базы данных](#обзор-базы-данных)
2. [Диаграмма связей сущностей](#диаграмма-связей-сущностей)
3. [Схемы таблиц](#схемы-таблиц)
4. [Связи](#связи)
5. [Поток данных](#поток-данных)
6. [Типовые запросы](#типовые-запросы)
7. [Миграции базы данных](#миграции-базы-данных)

---

## 🗄 Обзор базы данных

### Технологии

| Компонент | Технология |
|-----------|------------|
| **ORM** | SQLAlchemy 2.0+ |
| **Разработка** | SQLite |
| **Продакшен** | PostgreSQL (рекомендуется) |
| **Пул соединений** | SQLAlchemy Pool |

### Расположение базы данных

- **Разработка**: `backend/predictions.db` (файл SQLite)
- **Продакшен**: настраивается через переменную окружения `DATABASE_URL`

---

## 📐 Диаграмма связей сущностей

```
┌─────────────────────┐
│    predictions      │
├─────────────────────┤
│ PK id               │
│    image_path       │
│    prediction       │
│    confidence       │
│    created_at       │
└─────────────────────┘

┌─────────────────────┐
│   library_items     │
├─────────────────────┤
│ PK id               │
│ UQ disease_id       │
│    name             │
│    name_ar          │
│    short            │
│    short_ar         │
│    symptoms_ar      │
│    red_flags_ar     │
│    safe_tips_ar     │
│    when_to_see...   │
│    risk_level       │
│    created_at       │
│    updated_at       │
└─────────────────────┘

┌─────────────────────┐
│     sections        │
├─────────────────────┤
│ PK id               │
│ UQ section_type     │
│    title            │
│    content          │
│    created_at       │
│    updated_at       │
└─────────────────────┘

┌─────────────────────┐
│     questions       │
├─────────────────────┤
│ PK id               │
│    question         │
│    answer           │
│    category         │
│    created_at       │
└─────────────────────┘
```

**Легенда:**
- PK = Primary Key (первичный ключ)
- UQ = Unique Constraint (ограничение уникальности)
- IX = Index (индекс)

---

## 📊 Схемы таблиц

### 1. predictions

**Назначение:** хранение записей предсказаний ИИ для истории и аудита.

```sql
CREATE TABLE predictions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    image_path VARCHAR(500) NOT NULL,
    prediction VARCHAR(100),
    confidence FLOAT,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_predictions_prediction ON predictions(prediction);
CREATE INDEX idx_predictions_created_at ON predictions(created_at DESC);
```

**Столбцы:**

| Столбец | Тип | Ограничения | Описание |
|--------|------|-------------|-------------|
| `id` | INTEGER | PK, AUTOINCREMENT | Уникальный идентификатор записи |
| `image_path` | VARCHAR(500) | NOT NULL | Путь к загруженному файлу изображения |
| `prediction` | VARCHAR(100) | NULLABLE | Метка предсказанного заболевания |
| `confidence` | FLOAT | NULLABLE | Оценка достоверности (0.0 – 1.0) |
| `created_at` | DATETIME | NOT NULL, DEFAULT | Отметка времени предсказания |

**Пример данных:**

```sql
INSERT INTO predictions (image_path, prediction, confidence, created_at) VALUES
('/uploads/550e8400-e29b-41d4-a716-446655440000.jpg', 'healthy_eye', 0.9234, '2024-01-15 10:30:00'),
('/uploads/660e8400-e29b-41d4-a716-446655440001.jpg', 'cataract', 0.8756, '2024-01-15 11:45:00'),
('/uploads/770e8400-e29b-41d4-a716-446655440002.jpg', 'conjunctivitis', 0.7823, '2024-01-15 14:20:00');
```

---

### 2. library_items

**Назначение:** хранение подробной информации о заболеваниях для раздела библиотеки.

```sql
CREATE TABLE library_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    disease_id VARCHAR(100) UNIQUE NOT NULL,
    name VARCHAR(200) NOT NULL,
    name_ar VARCHAR(200) NOT NULL,
    short TEXT NOT NULL,
    short_ar TEXT NOT NULL,
    symptoms_ar TEXT NOT NULL,
    red_flags_ar TEXT NOT NULL,
    safe_tips_ar TEXT NOT NULL,
    when_to_see_doctor_ar TEXT NOT NULL,
    risk_level VARCHAR(20) NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_library_items_disease_id ON library_items(disease_id);
```

**Столбцы:**

| Столбец | Тип | Ограничения | Описание |
|--------|------|-------------|-------------|
| `id` | INTEGER | PK, AUTOINCREMENT | Уникальный идентификатор записи |
| `disease_id` | VARCHAR(100) | UNIQUE, NOT NULL | Идентификатор заболевания (например, «cataract») |
| `name` | VARCHAR(200) | NOT NULL | Название заболевания на английском |
| `name_ar` | VARCHAR(200) | NOT NULL | Название заболевания на арабском |
| `short` | TEXT | NOT NULL | Краткое описание на английском |
| `short_ar` | TEXT | NOT NULL | Краткое описание на арабском |
| `symptoms_ar` | TEXT | NOT NULL | JSON-массив симптомов (арабский) |
| `red_flags_ar` | TEXT | NOT NULL | JSON-массив тревожных сигналов (арабский) |
| `safe_tips_ar` | TEXT | NOT NULL | JSON-массив полезных советов (арабский) |
| `when_to_see_doctor_ar` | TEXT | NOT NULL | Когда обратиться к врачу (арабский) |
| `risk_level` | VARCHAR(20) | NOT NULL | Уровень риска (Low, Moderate, High) |
| `created_at` | DATETIME | NOT NULL, DEFAULT | Время создания |
| `updated_at` | DATETIME | NOT NULL, DEFAULT | Время последнего обновления |

**Пример данных:**

```sql
INSERT INTO library_items (disease_id, name, name_ar, short, short_ar, symptoms_ar, red_flags_ar, safe_tips_ar, when_to_see_doctor_ar, risk_level) VALUES
('healthy_eye', 'Healthy Eye', 'عين سليمة', 'Normal eye without any detected abnormalities.', 'عين طبيعية بدون أي تشوهات مكتشفة.', '["رؤية واضحة", "لا يوجد احمرار", "لا يوجد ألم"]', '["تغير مفاجئ في الرؤية", "ألم شديد"]', '["فحص دوري", "حماية من الأشعة فوق البنفسجية"]', 'سنوياً للفحص الدوري', 'Low'),
('cataract', 'Cataract', 'المياه البيضاء', 'Clouding of the eye''s natural lens.', 'تعكر في العدسة الطبيعية للعين.', '["رؤية ضبابية", "حساسية للضوء", "رؤية هالات حول الأضواء"]', '["فقدان البصر المفاجئ"]', '["جراحة إزالة المياه البيضاء"]', 'فوراً عند ملاحظة أي تغير في الرؤية', 'Moderate'),
('conjunctivitis', 'Conjunctivitis', 'التهاب الملتحمة', 'Inflammation of the conjunctiva.', 'التهاب الملتحمة.', '["احمرار العين", "حكة", "دموع غزيرة"]', '["ألم شديد", "ضعف البصر"]', '["كمادات دافئة", "النظافة الشخصية"]', 'إذا استمرت الأعراض أكثر من أسبوع', 'Moderate'),
('keratitis', 'Keratitis', 'التهاب القرنية', 'Inflammation of the cornea.', 'التهاب القرنية.', '["ألم شديد", "احمرار", "حساسية للضوء"]', '["فقدان البصر", "تقرح القرنية"]', '["علاج فوري", "تجنب العدسات اللاصقة"]', 'فوراً - حالة طارئة', 'High');
```

**Примеры JSON-полей:**

```json
// symptoms_ar
["رؤية ضبابية", "حساسية للضوء", "رؤية هالات حول الأضواء"]

// red_flags_ar
["فقدان البصر المفاجئ", "ألم شديد لا يحتمل"]

// safe_tips_ar
["جراحة إزالة المياه البيضاء", "مراجعة الطبيب بانتظام"]
```

---

### 3. sections

**Назначение:** хранение разделов образовательного контента (About, Safety, Education).

```sql
CREATE TABLE sections (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    section_type VARCHAR(50) UNIQUE NOT NULL,
    title VARCHAR(200) NOT NULL,
    content TEXT NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
```

**Столбцы:**

| Столбец | Тип | Ограничения | Описание |
|--------|------|-------------|-------------|
| `id` | INTEGER | PK, AUTOINCREMENT | Уникальный идентификатор записи |
| `section_type` | VARCHAR(50) | UNIQUE, NOT NULL | Тип раздела (about, safety, education) |
| `title` | VARCHAR(200) | NOT NULL | Заголовок раздела |
| `content` | TEXT | NOT NULL | JSON-структура контента |
| `created_at` | DATETIME | NOT NULL, DEFAULT | Время создания |
| `updated_at` | DATETIME | NOT NULL, DEFAULT | Время последнего обновления |

**Пример данных:**

```sql
INSERT INTO sections (section_type, title, content) VALUES
('about', 'About Digital Ophthalmology Assistant', '{
  "subtitle": "AI-Powered Eye Disease Classification",
  "description": "A comprehensive system for anterior eye disease detection using deep learning.",
  "project_title": "Digital Ophthalmology Assistant - Graduation Project",
  "supervisor": "Dr. Eman Salah",
  "team_members": [
    "Fares Tamer Abdel Majeed - 4241097",
    "Israa Eldsouky Ibrahim - 4241107",
    "Mohamed Ayman Dorgham - 4241041",
    "Mohamed Mahmoud Wahba - 4241543"
  ],
  "stack": ["FastAPI", "TensorFlow", "MobileNetV2", "HTML5/CSS3/JS"],
  "model_scope": ["Conjunctivitis", "Cataract", "Keratitis", "Healthy Eye"]
}'),
('safety', 'Safety Information', '{
  "intro": "Important safety guidelines for using this AI system.",
  "cards": [
    {
      "title": "Clinical Validation",
      "content": "Always validate AI predictions with clinical examination."
    },
    {
      "title": "Professional Consultation",
      "content": "This system is for assistance only, not replacement of professional diagnosis."
    }
  ],
  "escalation_advice": "Seek immediate medical attention if you experience sudden vision loss, severe eye pain, or trauma."
}'),
('education', 'Patient Education', '{
  "intro": "Learn about eye health and disease prevention.",
  "blocks": [
    {
      "title": "Regular Eye Exams",
      "items": ["Annual check-ups", "Comprehensive eye exam", "Vision screening"],
      "arabic_title": "فحوصات العين الدورية",
      "arabic_text": "الفحص السنوي للعين مهم للكشف المبكر عن الأمراض."
    }
  ]
}');
```

---

### 4. questions

**Назначение:** хранение элементов FAQ для раздела вопросов/FAQ.

```sql
CREATE TABLE questions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    question VARCHAR(500) NOT NULL,
    answer TEXT NOT NULL,
    category VARCHAR(100),
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
```

**Столбцы:**

| Столбец | Тип | Ограничения | Описание |
|--------|------|-------------|-------------|
| `id` | INTEGER | PK, AUTOINCREMENT | Уникальный идентификатор записи |
| `question` | VARCHAR(500) | NOT NULL | Вопрос FAQ |
| `answer` | TEXT | NOT NULL | Ответ FAQ |
| `category` | VARCHAR(100) | NULLABLE | Категория (technical, medical, general) |
| `created_at` | DATETIME | NOT NULL, DEFAULT | Время создания |

**Пример данных:**

```sql
INSERT INTO questions (question, answer, category) VALUES
('How accurate is the AI model?', 'The AI model has been trained on thousands of eye images and achieves high accuracy for common conditions. However, accuracy may vary based on image quality and specific conditions.', 'technical'),
('Is this a replacement for a doctor?', 'No, this system is designed to assist healthcare providers, not replace them. Always consult with a qualified ophthalmologist for diagnosis and treatment.', 'medical'),
('What types of images can I upload?', 'You can upload clear, well-lit photos of the front of the eye. The system accepts JPG, PNG, BMP, and WebP formats up to 10MB.', 'general');
```

---

## 🔗 Связи

### Связи между сущностями

```
┌─────────────────────┐
│    predictions      │
│                     │
│  prediction (FK)    │──────┐
│                     │      │
└─────────────────────┘      │
                             │
                             │ References
                             ▼
┌─────────────────────┐
│   library_items     │
│                     │
│  disease_id (PK)    │◄────┘
│                     │
└─────────────────────┘
```

**Примечание:** поле `predictions.prediction` логически ссылается на `library_items.disease_id`, но не через формальное ограничение внешнего ключа. Это даёт гибкость на случай обновления библиотеки.

### Типы связей

| Связь | Тип | Описание |
|--------------|------|-------------|
| predictions → library_items | Многие к одному | Несколько предсказаний могут ссылаться на одно заболевание |
| sections → (нет) | Автономные | Разделы контента независимы |
| questions → (нет) | Автономные | Элементы FAQ независимы |

---

## 💧 Поток данных

### 1. Поток предсказания

```
User Upload → Backend Validates → AI Processes → Result Generated
                                                              ↓
                                              ┌───────────────┴───────────────┐
                                              │                               │
                                      Save to Database                Return to Frontend
                                              │                               │
                                              ▼                               ▼
                                      predictions table              JSON Response
```

**Операции с базой данных:**

```python
# 1. Create prediction record
prediction = Prediction(
    image_path=str(file_path),
    prediction=label,
    confidence=confidence,
)
db.add(prediction)
db.commit()
db.refresh(prediction)

# 2. Query predictions
results = db.query(Prediction).order_by(Prediction.created_at.desc()).all()

# 3. Filter by disease
cataract_results = db.query(Prediction).filter(Prediction.prediction == "cataract").all()

# 4. Delete prediction
db.delete(prediction)
db.commit()
```

### 2. Поток данных библиотеки

```
Database Seed → library_items table → API Endpoint → Frontend Display
                                                              ↓
                                              Search/Filter/Display to User
```

**Операции с базой данных:**

```python
# 1. Get all diseases
diseases = db.query(LibraryItem).all()

# 2. Search diseases
search_term = "cataract"
results = db.query(LibraryItem).filter(
    or_(
        LibraryItem.name.ilike(f"%{search_term}%"),
        LibraryItem.name_ar.ilike(f"%{search_term}%")
    )
).all()

# 3. Get specific disease
disease = db.query(LibraryItem).filter(LibraryItem.disease_id == "cataract").first()
```

---

## 🔎 Типовые запросы

### Запросы к предсказаниям

```sql
-- Get all predictions
SELECT * FROM predictions ORDER BY created_at DESC;

-- Get predictions by disease
SELECT * FROM predictions WHERE prediction = 'cataract';

-- Get predictions with high confidence (>90%)
SELECT * FROM predictions WHERE confidence > 0.9;

-- Get predictions count by disease
SELECT prediction, COUNT(*) as count 
FROM predictions 
GROUP BY prediction;

-- Get recent predictions (last 7 days)
SELECT * FROM predictions 
WHERE created_at >= datetime('now', '-7 days')
ORDER BY created_at DESC;

-- Delete old predictions (older than 30 days)
DELETE FROM predictions 
WHERE created_at < datetime('now', '-30 days');
```

### Запросы к библиотеке

```sql
-- Get all diseases
SELECT * FROM library_items;

-- Search diseases by name
SELECT * FROM library_items 
WHERE name LIKE '%cataract%' OR name_ar LIKE '%المياه%';

-- Get diseases by risk level
SELECT * FROM library_items WHERE risk_level = 'High';

-- Get disease by ID
SELECT * FROM library_items WHERE disease_id = 'cataract';
```

### Запросы к разделам

```sql
-- Get all sections
SELECT * FROM sections;

-- Get specific section
SELECT * FROM sections WHERE section_type = 'safety';

-- Update section content
UPDATE sections 
SET content = '{"new": "content"}', updated_at = CURRENT_TIMESTAMP 
WHERE section_type = 'about';
```

### Запросы к вопросам

```sql
-- Get all FAQs
SELECT * FROM questions ORDER BY category, id;

-- Get FAQs by category
SELECT * FROM questions WHERE category = 'technical';

-- Search FAQs
SELECT * FROM questions 
WHERE question LIKE '%accuracy%' OR answer LIKE '%accuracy%';
```

---

## 🔄 Миграции базы данных

### Создание таблиц (SQLAlchemy)

```python
# backend/app/database/db.py
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

Base = declarative_base()

def init_db() -> None:
    """Initialize database tables."""
    from app.models import library_item, prediction, question, section
    Base.metadata.create_all(bind=engine)
```

### Добавление нового столбца

```python
# 1. Update model
class Prediction(Base):
    __tablename__ = "predictions"
    id = Column(Integer, primary_key=True)
    # ... existing columns ...
    new_column = Column(String, nullable=True)  # Add new column

# 2. Create migration
# For SQLite (development):
#   Delete the database file and restart (data loss!)
# For PostgreSQL (production):
#   Use Alembic migrations

# 3. Alembic migration example
# alembic revision -m "Add new_column to predictions"
# Edit the generated migration file
# alembic upgrade head
```

### Начальное заполнение данных

```python
# backend/app/services/seed_service.py
def seed_content(db: Session) -> None:
    """Seed initial content to database."""
    
    # Seed library items
    library_items = [
        LibraryItem(
            disease_id="healthy_eye",
            name="Healthy Eye",
            name_ar="عين سليمة",
            # ... other fields ...
        ),
        # ... more items ...
    ]
    
    for item in library_items:
        existing = db.query(LibraryItem).filter(
            LibraryItem.disease_id == item.disease_id
        ).first()
        if not existing:
            db.add(item)
    
    # Seed sections
    sections = [
        Section(
            section_type="about",
            title="About",
            content={...}
        ),
        # ... more sections ...
    ]
    
    for section in sections:
        existing = db.query(Section).filter(
            Section.section_type == section.section_type
        ).first()
        if not existing:
            db.add(section)
    
    db.commit()
```

---

## 💡 Лучшие практики

### 1. Управление соединениями

```python
# Use dependency injection for database sessions
@router.get("/results")
async def list_results(db: Session = Depends(get_db)):
    # Session automatically closed after request
    results = db.query(Prediction).all()
    return results
```

### 2. Обработка ошибок

```python
try:
    db.add(prediction)
    db.commit()
    db.refresh(prediction)
except IntegrityError:
    db.rollback()
    raise HTTPException(status_code=400, detail="Database integrity error")
except Exception as e:
    db.rollback()
    logger.error(f"Database error: {e}")
    raise HTTPException(status_code=500, detail="Database error")
```

### 3. Массовые операции

```python
# Efficient bulk insert
db.bulk_insert_mappings(Prediction, [
    {"image_path": path1, "prediction": "cataract", "confidence": 0.9},
    {"image_path": path2, "prediction": "healthy", "confidence": 0.95},
])
db.commit()
```

### 4. Индексация

```python
# Add indexes for frequently queried columns
CREATE INDEX idx_predictions_prediction ON predictions(prediction);
CREATE INDEX idx_predictions_created_at ON predictions(created_at DESC);
CREATE INDEX idx_library_items_disease_id ON library_items(disease_id);
```

### 5. Валидация данных

```python
# Validate data before insertion
def validate_prediction(prediction: str, confidence: float):
    valid_predictions = ["healthy_eye", "conjunctivitis", "cataract", "keratitis"]
    if prediction not in valid_predictions:
        raise ValueError(f"Invalid prediction: {prediction}")
    if not 0 <= confidence <= 1:
        raise ValueError(f"Confidence must be between 0 and 1")
```

---

*По вопросам базы данных обращайтесь к тимлиду команды бэкенда.*

*Последнее обновление: 29 апреля 2026*  
*Версия документа: 1.0*
