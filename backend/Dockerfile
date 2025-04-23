# Use the official Python image as the base image
FROM python:3.13-alpine

WORKDIR /app

# Install system dependencies and git
RUN apk add --no-cache \
    build-base \
    postgresql-dev \
    git

# Install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .


CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]
