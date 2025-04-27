import os
import subprocess
import signal
import socket
from pathlib import Path
import sys
from typing import Optional, Dict
from sqlalchemy.orm import Session
from contextlib import contextmanager
from datetime import datetime
from ..models.website import Website, WebsiteStatus
from ..models.user import User
from ..core.config import settings
from ..core.logger import logger

STATIC_SITES_DIR = Path(os.getenv("STATIC_SITES_DIR", "/app/static_sites"))

class WebsiteProcessManager:
    _instance = None
    PORT_RANGE_SIZE = 100  # Number of sequential ports to allocate
    
    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
            cls._instance.processes = {}  # Dictionary to store running processes
        return cls._instance

    def _sanitize_name(self, name: str) -> str:
        """Sanitize names to be filesystem-safe"""
        return "".join(c if c.isalnum() else "_" for c in name)

    def _get_site_path(self, full_name: str, website_name: str) -> Path:
        """Get the full path for a website using full_name"""
        sanitized_name = self._sanitize_name(full_name)
        user_dir = STATIC_SITES_DIR / sanitized_name
        user_dir.mkdir(parents=True, exist_ok=True)
        return user_dir / website_name

    def get_available_port(self, db: Session) -> int:
        """Find an available port in the configured range"""
        used_ports = {w.port for w in db.query(Website.port).all()}
        base_port = settings.WEBSITE_MIN_PORT
        
        for offset in range(self.PORT_RANGE_SIZE):
            port = base_port + offset
            if port not in used_ports and self._is_port_available(port):
                return port
        
        raise ValueError(
            f"No available ports in range {base_port}-{base_port + self.PORT_RANGE_SIZE - 1}"
        )

    def _is_port_available(self, port: int) -> bool:
        """Check if a port is actually available on the system"""
        with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
            try:
                s.bind(('', port))
                return True
            except socket.error:
                return False

    @contextmanager
    def _log_execution(self, full_name: str, website_name: str):
        """Context manager for logging operations"""
        sanitized_name = self._sanitize_name(full_name)
        log_dir = STATIC_SITES_DIR / sanitized_name / "logs"
        log_dir.mkdir(parents=True, exist_ok=True)
        log_file = log_dir / f"{website_name}.log"
        
        try:
            with open(log_file, 'a') as f:
                f.write(f"Starting operation at {datetime.utcnow()}\n")
                yield f
                f.write(f"Completed operation at {datetime.utcnow()}\n")
        except Exception as e:
            logger.error(f"Logging failed: {str(e)}")
            raise

    def deploy_static_site(
        self,
        db: Session,
        git_repo: str,
        website_name: str,
        user_id: int
    ) -> int:
        """Deploy a static site and return the port number"""
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            raise ValueError(f"User {user_id} not found")
        
        website = db.query(Website).filter(
            Website.user_id == user_id,
            Website.name == website_name
        ).first()
        
        if not website:
            raise ValueError(f"Website {website_name} not found for user {user_id}")
        
        port = website.port
        site_dir = self._get_site_path(user.full_name, website_name)
        
        with self._log_execution(user.full_name, website_name) as log_f:
            try:
                # Clean and prepare directory
                if site_dir.exists():
                    subprocess.run(["rm", "-rf", str(site_dir)], check=True)
                
                site_dir.mkdir(parents=True, exist_ok=True)

                # Clone repository
                log_f.write(f"Cloning repository: {git_repo}\n")
                clone_result = subprocess.run(
                    ["git", "clone", "--depth", "1", git_repo, str(site_dir)],
                    stdout=subprocess.PIPE,
                    stderr=subprocess.PIPE,
                    text=True
                )
                
                if clone_result.returncode != 0:
                    error_msg = f"Git clone failed: {clone_result.stderr}"
                    log_f.write(error_msg)
                    website.status = WebsiteStatus.ERROR
                    website.deployment_log = error_msg
                    db.commit()
                    raise RuntimeError(error_msg)

                # Start HTTP server - using sys.executable for reliability
                python_executable = sys.executable
                log_f.write(f"Starting server on port {port} using {python_executable}\n")
                process = subprocess.Popen(
                    [
                        python_executable, "-m", "http.server", 
                        str(port), 
                        "--directory", str(site_dir)
                    ],
                    cwd=site_dir,
                    preexec_fn=os.setsid,
                    stdout=log_f,
                    stderr=subprocess.STDOUT
                )
                
                self.processes[port] = process
                
                # Update website status
                website.status = WebsiteStatus.RUNNING
                website.pid = process.pid
                db.commit()
                
                return port

            except Exception as e:
                # Update website status and log error
                website.status = WebsiteStatus.ERROR
                website.deployment_log = str(e)
                db.commit()
                
                # Clean up if deployment fails
                if site_dir.exists():
                    subprocess.run(["rm", "-rf", str(site_dir)], check=True)
                raise

    def stop_site(self, port: int) -> bool:
        """Gracefully stop a running site"""
        if port not in self.processes:
            # Process might not be in memory but still running (e.g. after server restart)
            try:
                # Try to find pid by port through netstat or lsof
                pid_check = subprocess.run(
                    ["lsof", "-i", f":{port}", "-t"],
                    stdout=subprocess.PIPE,
                    stderr=subprocess.PIPE,
                    text=True
                )
                
                if pid_check.returncode == 0 and pid_check.stdout.strip():
                    pid = int(pid_check.stdout.strip())
                    logger.info(f"Found process {pid} on port {port} - attempting to kill")
                    try:
                        os.kill(pid, signal.SIGTERM)
                        # Wait a bit to make sure the process has time to terminate
                        subprocess.run(
                            ["sleep", "2"],
                            stdout=subprocess.PIPE,
                            stderr=subprocess.PIPE
                        )
                        return True
                    except ProcessLookupError:
                        logger.warning(f"Process {pid} not found")
                    except Exception as e:
                        logger.error(f"Error killing process {pid}: {str(e)}")
                
                # If we're here, either no process was found or we couldn't kill it
                # But we'll return True so the user can continue with other operations
                return True
            except Exception as e:
                logger.error(f"Error checking for process on port {port}: {str(e)}")
                # Return True to allow operations to continue
                return True
            
        try:
            process = self.processes[port]
            os.killpg(os.getpgid(process.pid), signal.SIGTERM)
            process.wait(timeout=10)
            del self.processes[port]
            return True
        except Exception as e:
            logger.error(f"Error stopping site on port {port}: {str(e)}")
            # Return True anyway to avoid blocking operations
            return True

    def delete_site(
        self,
        db: Session,
        website_name: str,
        port: int,
        user_id: int
    ) -> bool:
        """Completely remove a site and its resources"""
        try:
            user = db.query(User).filter(User.id == user_id).first()
            if not user:
                logger.warning(f"User {user_id} not found when trying to delete site {website_name}")
                return False
            
            # Stop the site regardless of whether it's running or not
            self.stop_site(port)
            
            # Find and remove the site directory
            site_dir = self._get_site_path(user.full_name, website_name)
            if site_dir.exists():
                try:
                    subprocess.run(["rm", "-rf", str(site_dir)], check=True)
                    logger.info(f"Removed site directory for {website_name}")
                except subprocess.CalledProcessError as e:
                    logger.error(f"Error removing site directory: {str(e)}")
                    # Continue with deletion even if directory removal fails
            
            return True
        except Exception as e:
            logger.error(f"Error in delete_site for {website_name} (port {port}): {str(e)}")
            # Return True anyway to prevent blocking the database deletion
            return True