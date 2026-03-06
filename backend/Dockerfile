# Base image
FROM python:3.14-slim

# Set working directory
WORKDIR /app

# Copy requirements first
COPY requirements.txt .

# Install dependencies
RUN pip install --upgrade pip
RUN pip install -r requirements.txt

# Copy backend code
COPY . .

# Expose port
EXPOSE 8000

# Command to run server
CMD ["sh", "-c", "python manage.py collectstatic --noinput --settings=config.settings.dev && python manage.py runserver 0.0.0.0:8000 --settings=config.settings.dev"]