# Deployment Manager

A full-stack web application for managing and deploying static websites from git repositories. The application provides a user-friendly dashboard for users to manage their static site deployments and an admin panel for administrators to monitor and manage all websites.

## Features

- **User Features**

  - Create and deploy static websites from git repositories
  - Start, stop, and redeploy websites with a single click
  - Monitor website status (running, stopped, deploying, error)
  - View deployment logs
  - Filter and search websites
- **Admin Features**

  - View and manage all user websites
  - Start, stop, and redeploy any website
  - Delete websites
  - Monitor system resources
  - User management

## Architecture

The application consists of:

- **Backend**: FastAPI Python application that handles website deployments and API requests
- **Frontend**: Next.js React application providing the user interface
- **Database**: PostgreSQL database storing user and website information

## Getting Started

### Prerequisites

- Docker and Docker Compose
- Git

### Installation

1. Clone the repository:

```bash
git clone https://github.com/General-Sandwalker/deployment-manager.git
cd deployment-manager
```

2. Start the application using Docker Compose:

```bash
docker-compose up -d
```

3. Access the application:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000

## Managing Admins

To manage admin users, follow these steps:

1. Start the Docker containers using `docker-compose up`
2. Run the following command to access the backend container:

```bash
docker exec -it deployment_backend python3 /app/admin-manager.py
```

This will start the admin manager interface, allowing you to manage admin privileges and perform administrative tasks.

## Port Configuration

The application reserves ports in the range 11000-11100 for deployed websites. You can modify this range in the configuration settings if needed.

## Contributing

Please read [CONTRIBUTING.md](CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
