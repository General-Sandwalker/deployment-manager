# Deployment Manager Backend

The backend component of the Deployment Manager application built with FastAPI, providing RESTful API endpoints and handling website deployments.

## Features

- RESTful API with comprehensive validation and error handling
- JWT-based authentication
- Database integration with SQLAlchemy ORM
- Deployment service for static websites from Git repositories
- Background task processing
- Admin management interface

## Directory Structure

- `app/`: Main application code
  - `api/`: API endpoints and routes
  - `core/`: Core functionalities like config, security, and logging
  - `crud/`: Database CRUD operations
  - `models/`: SQLAlchemy models
  - `schemas/`: Pydantic schemas for request/response validation
  - `services/`: Business logic and services
- `static_sites/`: Directory where deployed websites are stored
- `admin-manager.py`: CLI tool for managing admin users

## API Endpoints

### Authentication

- `POST /auth/login`: Authenticate a user and return a JWT token
- `POST /auth/register`: Register a new user

### User Routes

- `GET /users/me`: Get current user information
- `PUT /users/me`: Update current user information

### Website Routes

- `GET /websites/`: List all websites for the current user
- `GET /websites/{id}`: Get a specific website details
- `POST /websites/`: Create a new website
- `PUT /websites/{id}`: Update website details
- `DELETE /websites/{id}`: Delete a website
- `POST /websites/{id}/start`: Start a website
- `POST /websites/{id}/stop`: Stop a website
- `POST /websites/{id}/redeploy`: Redeploy a website

### Admin Routes

- `GET /admin/websites/`: List all websites (admin only)
- `GET /admin/websites/{id}`: Get any website details (admin only)
- `PUT /admin/websites/{id}`: Update any website (admin only)
- `DELETE /admin/websites/{id}`: Delete any website (admin only)
- `POST /admin/websites/{id}/start`: Start any website (admin only)
- `POST /admin/websites/{id}/stop`: Stop any website (admin only)
- `GET /admin/users/`: List all users (admin only)
- `PUT /admin/users/{id}`: Update any user (admin only)

## Development

### Prerequisites

- Python 3.12+
- PostgreSQL

### Local Development Setup

1. Create a virtual environment:

```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. Install dependencies:

```bash
pip install -r requirements.txt
```

3. Set up environment variables (create a `.env` file)
4. Run the application:

```bash
uvicorn app.main:app --reload
```

## Deployment

The application is containerized using Docker and can be deployed using the provided Dockerfile:

```bash
docker build -t deployment-manager-backend .
docker run -p 8000:8000 deployment-manager-backend
```

For production deployment, consider using Docker Compose as shown in the main README.
