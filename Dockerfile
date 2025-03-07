FROM python:3.11

# Встановлюємо робочу директорію в контейнері
WORKDIR /app

# Копіюємо всі файли у контейнер
COPY core /app/

# Встановлюємо залежності
RUN pip install --no-cache-dir -r requirements.txt

# Відкриваємо порт (щоб PostgreSQL міг працювати з Django)
EXPOSE 8000

# НЕ запускаємо сервер Django (видаляємо запуск runserver)
CMD ["sh", "-c", "ls -la /app && echo 'Контейнер готовий, запустіть сервер вручну'"]
