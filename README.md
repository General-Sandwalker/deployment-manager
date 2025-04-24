# Deployment Manager
=====================

## Managing Admins
------------------

To manage admins, follow these steps:

1. Start the Docker containers using `docker-compose up`
2. Run the following command to access the backend container:
```bash
docker exec -it backend bash
```
3. Run the admin manager script:
```bash
python /deployment-manager/admin-manager.py
```
This will start the admin manager interface, allowing you to manage admin privileges and perform administrative tasks.

Note: Make sure you have Docker and Docker Compose installed on your system to run these commands.