# Руководство по развёртыванию и настройке

## 🔍 Обзор

В этом документе представлены подробные инструкции по настройке, запуску и развёртыванию проекта «Цифровой ассистент офтальмолога» в окружениях разработки и продакшена.

---

## 📋 Оглавление

1. [Требования](#требования)
2. [Настройка окружения разработки](#настройка-окружения-разработки)
3. [Развёртывание в продакшене](#развертывание-в-продакшене)
4. [Развёртывание в Docker](#развертывание-в-docker)
5. [Конфигурация окружения](#конфигурация-окружения)
6. [Устранение неполадок](#устранение-неполадок)

---

## 📋 Требования

### Необходимое ПО

| ПО | Версия | Назначение |
|----------|---------|---------|
| Python | 3.11+ | Среда выполнения бэкенда |
| pip | Последняя | Менеджер пакетов Python |
| Node.js | 18+ (необязательно) | Инструменты фронтенда |
| Git | Последняя | Контроль версий |
| Docker | 20+ (необязательно) | Контейнеризация |

### Системные требования

| Компонент | Минимум | Рекомендуется |
|-----------|---------|-------------|
| CPU | 2 ядра | 4+ ядер |
| ОЗУ | 4 ГБ | 8+ ГБ |
| Диск | 10 ГБ | 20+ ГБ |
| GPU | Не требуется | GPU NVIDIA для более быстрого инференса ИИ |

---

## 🛠 Настройка окружения разработки

### 1. Клонирование репозитория

```bash
git clone https://github.com/mohammedwahba2/digital-ophthalmology-assistant.git
cd digital-ophthalmology-assistant
```

### 2. Настройка бэкенда

```bash
# Navigate to backend
cd backend

# Create virtual environment
python3 -m venv .venv

# Activate virtual environment
# macOS/Linux:
source .venv/bin/activate
# Windows:
.venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Copy environment file
cp .env.example .env

# Edit .env with your settings (optional)
nano .env

# Initialize database (happens automatically on first run)
# Start the server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

**Бэкенд должен быть доступен по адресу:** http://localhost:8000

**Документация API:** http://localhost:8000/docs

### 3. Настройка фронтенда

Откройте новый терминал:

```bash
# Navigate to frontend
cd frontend

# Start simple HTTP server
python3 -m http.server 8080
```

**Фронтенд должен быть доступен по адресу:** http://localhost:8080/pages/index.html

### 4. Настройка URL API (при необходимости)

Если ваш бэкенд находится не на адресе по умолчанию:

```javascript
// In browser console on frontend page:
localStorage.setItem("doa-api-base", "http://your-backend-url:8000");
location.reload();
```

### 5. Проверка настройки

1. Откройте http://localhost:8080/pages/index.html в браузере
2. Перейдите на страницу «Диагностика»
3. Загрузите тестовый снимок глаза
4. Убедитесь, что предсказание ИИ работает

---

## 🚀 Развёртывание в продакшене

### Вариант 1: прямое развёртывание

#### Бэкенд

```bash
# Install dependencies
pip install -r requirements.txt

# Set up environment variables
export HOST=0.0.0.0
export PORT=8000
export DATABASE_URL=postgresql://user:password@localhost:5432/ophthalmology
export DEBUG=false

# Run with production server
uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 4
```

#### Фронтенд

Разместите каталог `frontend/` на любом статическом веб-хостинге:

- **Netlify**: перетащите папку фронтенда
- **Vercel**: подключите репозиторий GitHub
- **AWS S3**: загрузите в S3-бакет со статическим хостингом
- **Nginx**: обслуживайте через Nginx

**Пример конфигурации Nginx:**

```nginx
server {
    listen 80;
    server_name your-domain.com;
    
    root /path/to/frontend;
    index index.html;
    
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    # Proxy API requests to backend
    location /api/ {
        proxy_pass http://localhost:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
    
    location /predict {
        proxy_pass http://localhost:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

---

### Вариант 2: развёртывание на облачной платформе

#### Heroku

**1. Создание приложения Heroku**

```bash
heroku create ophthalmology-assistant
```

**2. Бэкенд (Heroku)**

Создайте файл `Procfile` в каталоге бэкенда:
```
web: uvicorn app.main:app --host 0.0.0.0 --port $PORT
```

Создайте `runtime.txt`:
```
python-3.11.0
```

Развёртывание:
```bash
cd backend
git init
git add .
git commit -m "Initial commit"
heroku git:remote -a ophthalmology-assistant
git push heroku main
```

**3. Фронтенд (Netlify)**

Подключите репозиторий GitHub к Netlify и задайте настройки сборки:
- Команда сборки: (нет)
- Каталог публикации: `frontend`

---

#### Развёртывание на AWS

**1. Бэкенд (EC2 или Elastic Beanstalk)**

```bash
# EC2 Setup
sudo yum update
sudo yum install python3 python3-pip git

# Clone and setup
git clone <repository-url>
cd digital-ophthalmology-assistant/backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt

# Run with Gunicorn
pip install gunicorn
gunicorn -w 4 -b 0.0.0.0:8000 app.main:app
```

**2. Фронтенд (S3 + CloudFront)**

```bash
# Upload to S3
aws s3 sync frontend/ s3://your-bucket-name/

# Enable static website hosting
aws s3 website s3://your-bucket-name/ --index-document index.html

# Create CloudFront distribution for HTTPS
```

---

## 🐳 Развёртывание в Docker

### 1. Сборка Docker-образов

**Dockerfile бэкенда** (уже существует в `backend/Dockerfile`):

```dockerfile
FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8000

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

**Сборка образа бэкенда:**

```bash
cd backend
docker build -t ophthalmology-backend .
```

**Dockerfile фронтенда** (создайте `frontend/Dockerfile`):

```dockerfile
FROM nginx:alpine

COPY . /usr/share/nginx/html/

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

**Сборка образа фронтенда:**

```bash
cd frontend
docker build -t ophthalmology-frontend .
```

### 2. Docker Compose

Создайте `docker-compose.yml` в корне проекта:

```yaml
version: '3.8'

services:
  backend:
    build: ./backend
    ports:
      - "8000:8000"
    environment:
      - DATABASE_URL=sqlite:///./predictions.db
      - DEBUG=false
    volumes:
      - ./backend/uploads:/app/uploads
      - ./backend/predictions.db:/app/predictions.db
    restart: unless-stopped

  frontend:
    build: ./frontend
    ports:
      - "80:80"
    depends_on:
      - backend
    restart: unless-stopped
```

**Запуск через Docker Compose:**

```bash
docker-compose up -d
```

**Доступ:**
- Фронтенд: http://localhost
- API бэкенда: http://localhost:8000

---

## ⚙️ Конфигурация окружения

### Переменные окружения

Создайте файл `.env` в каталоге `backend/`:

```env
# Server Configuration
HOST=0.0.0.0
PORT=8000

# Application Settings
DEBUG=false
APP_NAME="Digital Ophthalmology Assistant"
APP_VERSION=1.0.0

# Database Configuration
# SQLite (Development)
DATABASE_URL=sqlite:///./predictions.db

# PostgreSQL (Production)
# DATABASE_URL=postgresql://username:password@localhost:5432/ophthalmology

# MySQL (Alternative)
# DATABASE_URL=mysql://username:password@localhost:3306/ophthalmology

# CORS Settings
CORS_ORIGINS=["https://your-domain.com", "https://www.your-domain.com"]

# File Upload Settings
UPLOAD_DIR=uploads
MAX_UPLOAD_SIZE_MB=10

# Model Configuration (Optional - defaults to HuggingFace Hub)
# MODEL_PATH=models/model.keras
```

### Соображения безопасности

1. **Никогда не коммитьте файлы `.env`** — добавьте их в `.gitignore`
2. **Используйте надёжные пароли базы данных** — генерируйте безопасные случайные пароли
3. **Включайте HTTPS** — используйте SSL-сертификаты (Let's Encrypt)
4. **Задавайте корректные источники CORS** — ограничьте их вашим доменом
5. **Ограничивайте размер загрузки файлов** — предотвращайте атаки DoS
6. **Используйте переменные окружения** — не зашивайте секреты в код

---

## 🔧 Устранение неполадок

### Проблема 1: порт уже занят

**Ошибка:** `Address already in use`

**Решение:**
```bash
# Find process using the port
lsof -i :8000

# Kill the process
kill -9 <PID>

# Or use a different port
uvicorn app.main:app --port 8001
```

### Проблема 2: модуль не найден

**Ошибка:** `ModuleNotFoundError: No module named 'tensorflow'`

**Решение:**
```bash
# Activate virtual environment
source .venv/bin/activate

# Reinstall dependencies
pip install -r requirements.txt
```

### Проблема 3: база данных заблокирована

**Ошибка:** `database is locked`

**Решение:**
```bash
# For SQLite, ensure only one process accesses the database
# Kill any stale processes
pkill -f uvicorn

# Or switch to PostgreSQL for production
```

### Проблема 4: модель не найдена

**Ошибка:** `FileNotFoundError: Model file not found`

**Решение:**
1. Убедитесь в наличии подключения к интернету для загрузки с HuggingFace Hub
2. Или вручную положите модель в `backend/models/model.keras`
3. Проверьте токен HuggingFace, если используется приватная модель

### Проблема 5: ошибки CORS

**Ошибка:** `CORS policy blocked`

**Решение:**
```env
# In .env file
CORS_ORIGINS=["*"]  # For development only

# For production, specify exact origins
CORS_ORIGINS=["https://your-domain.com"]
```

### Проблема 6: медленный инференс

**Симптомы:** предсказания занимают >10 секунд

**Решения:**
1. Используйте ускорение на GPU (TensorFlow с поддержкой CUDA)
2. Уменьшайте разрешение изображения перед загрузкой
3. Увеличьте ресурсы сервера (CPU/ОЗУ)
4. Включите прогрев модели при запуске

---

## 📊 Мониторинг и логирование

### Логи приложения

```bash
# View logs (when running with uvicorn)
# Logs appear in console

# Save logs to file
uvicorn app.main:app --log-config logging.conf
```

### Проверка работоспособности

```bash
# Check if API is healthy
curl http://localhost:8000/health

# Expected response:
# {"status": "healthy", "version": "1.0.0"}
```

### Резервное копирование базы данных

```bash
# SQLite backup
cp predictions.db predictions_backup_$(date +%Y%m%d).db

# PostgreSQL backup
pg_dump -U username ophthalmology > backup_$(date +%Y%m%d).sql

# Restore PostgreSQL
psql -U username ophthalmology < backup_$(date +%Y%m%d).sql
```

---

## 🚀 Оптимизация производительности

### 1. Включение кэширования

```python
# Use Redis for caching (optional)
# Add to requirements.txt: redis, fastapi-cache2

from fastapi_cache import FastAPICache
from fastapi_cache.backends.redis import RedisBackend

@app.on_event("startup")
async def startup():
    redis = aioredis.from_url("redis://localhost")
    FastAPICache.init(RedisBackend(redis), prefix="fastapi-cache")
```

### 2. Оптимизация базы данных

```sql
-- Add indexes for frequently queried columns
CREATE INDEX idx_predictions_created_at ON predictions(created_at DESC);
CREATE INDEX idx_predictions_prediction ON predictions(prediction);
CREATE INDEX idx_library_items_disease_id ON library_items(disease_id);
```

### 3. CDN для статических ресурсов

Размещайте ресурсы фронтенда на CDN для более быстрой загрузки:
- CloudFlare
- AWS CloudFront
- Azure CDN

---

## ✅ Чек-лист для продакшена

- [ ] Переменные окружения настроены
- [ ] База данных развернута (рекомендуется PostgreSQL)
- [ ] HTTPS включён с SSL-сертификатом
- [ ] Источники CORS ограничены доменом продакшена
- [ ] Режим отладки отключён
- [ ] Логирование ошибок настроено
- [ ] Резервные копии базы данных запланированы
- [ ] Мониторинг настроен (доступность, ошибки)
- [ ] Ограничение частоты запросов включено (защита от злоупотреблений)
- [ ] Лимиты загрузки файлов настроены
- [ ] Модель прогрета при запуске
- [ ] Нагрузочное тестирование выполнено

---

*По вопросам развёртывания обращайтесь к тимлиду DevOps.*

*Последнее обновление: 29 апреля 2026*  
*Версия документа: 1.0*
