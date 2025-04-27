#!/usr/bin/env python3
import os
import sys
import re
from typing import List, Dict, Optional
from dotenv import load_dotenv
import psycopg2
from psycopg2.extras import RealDictCursor
from prompt_toolkit import PromptSession
from prompt_toolkit.completion import WordCompleter
from prompt_toolkit.shortcuts import confirm
from prompt_toolkit.styles import Style
from prompt_toolkit.formatted_text import HTML
from colorama import Fore, Back, Style as ColoramaStyle, init

# Initialize colorama
init(autoreset=True)

# Load environment variables
load_dotenv()

class DatabaseManager:
    """Handles database connection and basic operations"""
    
    def __init__(self):
        self.conn = self._create_connection()
        self.conn.autocommit = True

    def _create_connection(self):
        """Create a database connection"""
        try:
            return psycopg2.connect(self._get_db_connection_string())
        except psycopg2.Error as e:
            print(f"{Fore.RED}Database connection error: {str(e)}{Fore.RESET}")
            sys.exit(1)

    @staticmethod
    def _get_db_connection_string() -> str:
        """Convert SQLAlchemy URL to psycopg2 format"""
        db_url = os.getenv("DATABASE_URL")
        if not db_url:
            raise ValueError("DATABASE_URL not found in .env file")
        
        pattern = r'postgresql\+psycopg2://(?P<user>[^:]+):(?P<password>[^@]+)@(?P<host>[^:]+):(?P<port>\d+)/(?P<dbname>.+)'
        if match := re.match(pattern, db_url):
            return (
                f"host={match.group('host')} "
                f"port={match.group('port')} "
                f"dbname={match.group('dbname')} "
                f"user={match.group('user')} "
                f"password={match.group('password')}"
            )
        raise ValueError("Invalid DATABASE_URL format")

    def close(self):
        """Close database connection"""
        if hasattr(self, 'conn') and self.conn:
            self.conn.close()

class AdminManager(DatabaseManager):
    """Handles admin-specific operations"""
    
    def __init__(self):
        super().__init__()
        self.session = PromptSession()
        self.style = Style.from_dict({
            'dialog': 'bg:#88ff88',
            'dialog frame.label': 'bg:#ffffff #000000',
            'dialog.body': 'bg:#000000 #00ff00',
            'dialog shadow': 'bg:#00aa00',
        })

    def list_users(self) -> List[Dict]:
        """List all users in the system"""
        try:
            with self.conn.cursor(cursor_factory=RealDictCursor) as cursor:
                cursor.execute("""
                    SELECT id, email, full_name, is_admin, is_active, created_at, plan_expires_at
                    FROM users 
                    ORDER BY created_at DESC
                """)
                return cursor.fetchall()
        except psycopg2.Error as e:
            print(f"{Fore.RED}Database error: {str(e)}{Fore.RESET}")
            return []

    def toggle_admin(self, user_id: int) -> bool:
        """Toggle admin status for a user"""
        try:
            with self.conn.cursor(cursor_factory=RealDictCursor) as cursor:
                cursor.execute("""
                    UPDATE users 
                    SET is_admin = NOT is_admin
                    WHERE id = %s
                    RETURNING id, email, is_admin
                """, (user_id,))
                if result := cursor.fetchone():
                    status = f"{Fore.GREEN}ADMIN{Fore.RESET}" if result['is_admin'] else f"{Fore.YELLOW}NORMAL{Fore.RESET}"
                    print(f"\nUser {Fore.CYAN}{result['email']}{Fore.RESET} status set to {status}")
                    return True
                print(f"\n{Fore.RED}User with ID {user_id} not found{Fore.RESET}")
                return False
        except psycopg2.Error as e:
            print(f"\n{Fore.RED}Database error: {str(e)}{Fore.RESET}")
            return False
    
    def delete_user(self, user_id: int) -> bool:
        """Delete a user account"""
        try:
            with self.conn.cursor(cursor_factory=RealDictCursor) as cursor:
                # Check if user exists
                cursor.execute("SELECT email FROM users WHERE id = %s", (user_id,))
                user = cursor.fetchone()
                if not user:
                    print(f"\n{Fore.RED}User with ID {user_id} not found{Fore.RESET}")
                    return False
                
                # Confirm deletion
                if not confirm(f"Are you sure you want to delete user {Fore.CYAN}{user['email']}{Fore.RESET}? This will also delete all their websites and reviews!"):
                    print(f"\n{Fore.YELLOW}Deletion cancelled{Fore.RESET}")
                    return False
                
                # First delete related data
                print(f"\n{Fore.YELLOW}Deleting user's websites and reviews...{Fore.RESET}")
                cursor.execute("DELETE FROM websites WHERE user_id = %s", (user_id,))
                cursor.execute("DELETE FROM reviews WHERE user_id = %s", (user_id,))
                
                # Then delete the user
                cursor.execute("DELETE FROM users WHERE id = %s", (user_id,))
                print(f"\n{Fore.GREEN}User {user['email']} deleted successfully{Fore.RESET}")
                return True
        except psycopg2.Error as e:
            print(f"\n{Fore.RED}Database error: {str(e)}{Fore.RESET}")
            return False
    
    def list_websites(self) -> List[Dict]:
        """List all websites in the system"""
        try:
            with self.conn.cursor(cursor_factory=RealDictCursor) as cursor:
                cursor.execute("""
                    SELECT w.id, w.name, w.git_repo, w.port, w.status, w.user_id, 
                           u.email as owner_email, w.created_at, w.expires_at
                    FROM websites w
                    JOIN users u ON w.user_id = u.id
                    ORDER BY w.created_at DESC
                """)
                return cursor.fetchall()
        except psycopg2.Error as e:
            print(f"{Fore.RED}Database error: {str(e)}{Fore.RESET}")
            return []
    
    def delete_website(self, website_id: int) -> bool:
        """Delete a website"""
        try:
            with self.conn.cursor(cursor_factory=RealDictCursor) as cursor:
                # Check if website exists
                cursor.execute("""
                    SELECT w.name, w.port, u.email 
                    FROM websites w
                    JOIN users u ON w.user_id = u.id
                    WHERE w.id = %s
                """, (website_id,))
                website = cursor.fetchone()
                if not website:
                    print(f"\n{Fore.RED}Website with ID {website_id} not found{Fore.RESET}")
                    return False
                
                # Confirm deletion
                if not confirm(f"Are you sure you want to delete website '{Fore.CYAN}{website['name']}{Fore.RESET}' owned by {Fore.CYAN}{website['email']}{Fore.RESET}?"):
                    print(f"\n{Fore.YELLOW}Deletion cancelled{Fore.RESET}")
                    return False
                
                # Try to stop the website process if running
                port = website['port']
                print(f"\n{Fore.YELLOW}Stopping website on port {port}...{Fore.RESET}")
                try:
                    import subprocess
                    import signal
                    subprocess.run(["lsof", "-i", f":{port}", "-t"], stdout=subprocess.PIPE, stderr=subprocess.PIPE)
                except:
                    pass  # If lsof fails, just continue with deletion
                
                # Delete the website
                cursor.execute("DELETE FROM websites WHERE id = %s", (website_id,))
                print(f"\n{Fore.GREEN}Website '{website['name']}' deleted successfully{Fore.RESET}")
                return True
        except psycopg2.Error as e:
            print(f"\n{Fore.RED}Database error: {str(e)}{Fore.RESET}")
            return False
    
    def list_reviews(self) -> List[Dict]:
        """List all reviews in the system"""
        try:
            with self.conn.cursor(cursor_factory=RealDictCursor) as cursor:
                cursor.execute("""
                    SELECT r.id, r.rating, r.comment, r.user_id, u.email as reviewer_email,
                           r.website_id, w.name as website_name, r.created_at
                    FROM reviews r
                    JOIN users u ON r.user_id = u.id
                    JOIN websites w ON r.website_id = w.id
                    ORDER BY r.created_at DESC
                """)
                return cursor.fetchall()
        except psycopg2.Error as e:
            print(f"{Fore.RED}Database error: {str(e)}{Fore.RESET}")
            return []
    
    def delete_review(self, review_id: int) -> bool:
        """Delete a review"""
        try:
            with self.conn.cursor(cursor_factory=RealDictCursor) as cursor:
                # Check if review exists
                cursor.execute("""
                    SELECT r.comment, u.email, w.name 
                    FROM reviews r
                    JOIN users u ON r.user_id = u.id
                    JOIN websites w ON r.website_id = w.id
                    WHERE r.id = %s
                """, (review_id,))
                review = cursor.fetchone()
                if not review:
                    print(f"\n{Fore.RED}Review with ID {review_id} not found{Fore.RESET}")
                    return False
                
                # Confirm deletion
                if not confirm(f"Are you sure you want to delete review by {Fore.CYAN}{review['email']}{Fore.RESET} for {Fore.CYAN}{review['name']}{Fore.RESET}?"):
                    print(f"\n{Fore.YELLOW}Deletion cancelled{Fore.RESET}")
                    return False
                
                # Delete the review
                cursor.execute("DELETE FROM reviews WHERE id = %s", (review_id,))
                print(f"\n{Fore.GREEN}Review deleted successfully{Fore.RESET}")
                return True
        except psycopg2.Error as e:
            print(f"\n{Fore.RED}Database error: {str(e)}{Fore.RESET}")
            return False

    def print_users(self, users: List[Dict]):
        """Display users in a formatted table"""
        if not users:
            print(f"{Fore.YELLOW}No users found{Fore.RESET}")
            return
        
        print(f"\n{Fore.BLUE}{Back.WHITE}{ColoramaStyle.BRIGHT}{'ID':<5} {'Email':<30} {'Name':<25} {'Admin':<10} {'Active':<10} {'Created At':<20} {'Plan Expires':<20}{ColoramaStyle.RESET_ALL}")
        print(f"{Fore.BLUE}{'-' * 120}{Fore.RESET}")
        for i, user in enumerate(users):
            expires_at = user['plan_expires_at'].strftime('%Y-%m-%d') if user['plan_expires_at'] else "Never"
            bg_color = Fore.BLACK + Back.WHITE if i % 2 == 0 else ""
            admin_color = Fore.GREEN if user['is_admin'] else Fore.YELLOW
            active_color = Fore.GREEN if user['is_active'] else Fore.RED
            
            print(f"{bg_color}{user['id']:<5} {Fore.CYAN}{user['email']:<30}{Fore.RESET}{bg_color} "
                  f"{user.get('full_name', ''):<25} "
                  f"{admin_color}{'Yes' if user['is_admin'] else 'No':<10}{Fore.RESET}{bg_color} "
                  f"{active_color}{'Yes' if user['is_active'] else 'No':<10}{Fore.RESET}{bg_color} "
                  f"{user['created_at'].strftime('%Y-%m-%d %H:%M'):<20} "
                  f"{expires_at:<20}{Fore.RESET}")
        print()
    
    def print_websites(self, websites: List[Dict]):
        """Display websites in a formatted table"""
        if not websites:
            print(f"{Fore.YELLOW}No websites found{Fore.RESET}")
            return
        
        print(f"\n{Fore.BLUE}{Back.WHITE}{ColoramaStyle.BRIGHT}{'ID':<5} {'Name':<25} {'Git Repo':<30} {'Port':<8} {'Status':<12} {'Owner':<25} {'Created At':<20}{ColoramaStyle.RESET_ALL}")
        print(f"{Fore.BLUE}{'-' * 130}{Fore.RESET}")
        for i, website in enumerate(websites):
            bg_color = Fore.BLACK + Back.WHITE if i % 2 == 0 else ""
            status_color = Fore.GREEN if website['status'] == 'running' else (Fore.RED if website['status'] == 'error' else Fore.YELLOW)
            
            print(f"{bg_color}{website['id']:<5} {Fore.CYAN}{website['name'][:25]:<25}{Fore.RESET}{bg_color} "
                  f"{website['git_repo'][:30]:<30} "
                  f"{website['port']:<8} "
                  f"{status_color}{website['status']:<12}{Fore.RESET}{bg_color} "
                  f"{website['owner_email'][:25]:<25} "
                  f"{website['created_at'].strftime('%Y-%m-%d %H:%M'):<20}{Fore.RESET}")
        print()
    
    def print_reviews(self, reviews: List[Dict]):
        """Display reviews in a formatted table"""
        if not reviews:
            print(f"{Fore.YELLOW}No reviews found{Fore.RESET}")
            return
        
        print(f"\n{Fore.BLUE}{Back.WHITE}{ColoramaStyle.BRIGHT}{'ID':<5} {'Rating':<6} {'Comment':<30} {'Website':<25} {'Reviewer':<25} {'Created At':<20}{ColoramaStyle.RESET_ALL}")
        print(f"{Fore.BLUE}{'-' * 120}{Fore.RESET}")
        for i, review in enumerate(reviews):
            bg_color = Fore.BLACK + Back.WHITE if i % 2 == 0 else ""
            rating_color = Fore.GREEN if review['rating'] >= 4 else (Fore.RED if review['rating'] <= 2 else Fore.YELLOW)
            
            print(f"{bg_color}{review['id']:<5} {rating_color}{review['rating']:<6}{Fore.RESET}{bg_color} "
                  f"{review['comment'][:30] + ('...' if len(review['comment']) > 30 else ''):<30} "
                  f"{Fore.CYAN}{review['website_name'][:25]:<25}{Fore.RESET}{bg_color} "
                  f"{review['reviewer_email'][:25]:<25} "
                  f"{review['created_at'].strftime('%Y-%m-%d %H:%M'):<20}{Fore.RESET}")
        print()

    def admin_status_menu(self, user_id: int):
        """Menu for managing admin status"""
        while True:
            print(f"\n{Fore.MAGENTA}{ColoramaStyle.BRIGHT}Admin Status Management{ColoramaStyle.RESET_ALL}")
            print(f"{Fore.CYAN}1. Toggle admin status")
            print(f"{Fore.CYAN}2. Back to main menu{Fore.RESET}")
            
            choice = self.session.prompt(
                f"\n{Fore.GREEN}Enter your choice (1-2): {Fore.RESET}",
                completer=WordCompleter(['1', '2']),
            ).strip()

            if choice == '1':
                if self.toggle_admin(user_id):
                    return
            elif choice == '2':
                return
            else:
                print(f"{Fore.RED}Invalid choice. Please try again.{Fore.RESET}")
    
    def user_management_menu(self):
        """Menu for user management"""
        while True:
            print(f"\n{Fore.MAGENTA}{ColoramaStyle.BRIGHT}User Management Menu{ColoramaStyle.RESET_ALL}")
            print(f"{Fore.CYAN}1. List all users")
            print(f"{Fore.CYAN}2. Toggle admin status")
            print(f"{Fore.CYAN}3. Delete user")
            print(f"{Fore.CYAN}4. Back to main menu{Fore.RESET}")
            
            choice = self.session.prompt(
                f"\n{Fore.GREEN}Enter your choice (1-4): {Fore.RESET}",
                completer=WordCompleter(['1', '2', '3', '4']),
            ).strip()

            if choice == '1':
                users = self.list_users()
                self.print_users(users)
            elif choice in ['2', '3']:
                users = self.list_users()
                if not users:
                    print(f"{Fore.YELLOW}No users available{Fore.RESET}")
                    continue
                    
                self.print_users(users)
                try:
                    user_id = int(self.session.prompt(
                        f"{Fore.GREEN}Enter ID of user to manage: {Fore.RESET}",
                    ).strip())
                except ValueError:
                    print(f"{Fore.RED}Invalid ID. Please enter a number.{Fore.RESET}")
                    continue
                    
                if not any(u['id'] == user_id for u in users):
                    print(f"{Fore.RED}No user found with ID {user_id}{Fore.RESET}")
                    continue
                
                if choice == '2':
                    self.toggle_admin(user_id)
                else:  # choice == '3'
                    self.delete_user(user_id)
            elif choice == '4':
                return
            else:
                print(f"{Fore.RED}Invalid choice. Please try again.{Fore.RESET}")
    
    def website_management_menu(self):
        """Menu for website management"""
        while True:
            print(f"\n{Fore.MAGENTA}{ColoramaStyle.BRIGHT}Website Management Menu{ColoramaStyle.RESET_ALL}")
            print(f"{Fore.CYAN}1. List all websites")
            print(f"{Fore.CYAN}2. Delete website")
            print(f"{Fore.CYAN}3. Back to main menu{Fore.RESET}")
            
            choice = self.session.prompt(
                f"\n{Fore.GREEN}Enter your choice (1-3): {Fore.RESET}",
                completer=WordCompleter(['1', '2', '3']),
            ).strip()

            if choice == '1':
                websites = self.list_websites()
                self.print_websites(websites)
            elif choice == '2':
                websites = self.list_websites()
                if not websites:
                    print(f"{Fore.YELLOW}No websites available{Fore.RESET}")
                    continue
                    
                self.print_websites(websites)
                try:
                    website_id = int(self.session.prompt(
                        f"{Fore.GREEN}Enter ID of website to delete: {Fore.RESET}",
                    ).strip())
                except ValueError:
                    print(f"{Fore.RED}Invalid ID. Please enter a number.{Fore.RESET}")
                    continue
                    
                if not any(w['id'] == website_id for w in websites):
                    print(f"{Fore.RED}No website found with ID {website_id}{Fore.RESET}")
                    continue
                
                self.delete_website(website_id)
            elif choice == '3':
                return
            else:
                print(f"{Fore.RED}Invalid choice. Please try again.{Fore.RESET}")
    
    def review_management_menu(self):
        """Menu for review management"""
        while True:
            print(f"\n{Fore.MAGENTA}{ColoramaStyle.BRIGHT}Review Management Menu{ColoramaStyle.RESET_ALL}")
            print(f"{Fore.CYAN}1. List all reviews")
            print(f"{Fore.CYAN}2. Delete review")
            print(f"{Fore.CYAN}3. Back to main menu{Fore.RESET}")
            
            choice = self.session.prompt(
                f"\n{Fore.GREEN}Enter your choice (1-3): {Fore.RESET}",
                completer=WordCompleter(['1', '2', '3']),
            ).strip()

            if choice == '1':
                reviews = self.list_reviews()
                self.print_reviews(reviews)
            elif choice == '2':
                reviews = self.list_reviews()
                if not reviews:
                    print(f"{Fore.YELLOW}No reviews available{Fore.RESET}")
                    continue
                    
                self.print_reviews(reviews)
                try:
                    review_id = int(self.session.prompt(
                        f"{Fore.GREEN}Enter ID of review to delete: {Fore.RESET}",
                    ).strip())
                except ValueError:
                    print(f"{Fore.RED}Invalid ID. Please enter a number.{Fore.RESET}")
                    continue
                    
                if not any(r['id'] == review_id for r in reviews):
                    print(f"{Fore.RED}No review found with ID {review_id}{Fore.RESET}")
                    continue
                
                self.delete_review(review_id)
            elif choice == '3':
                return
            else:
                print(f"{Fore.RED}Invalid choice. Please try again.{Fore.RESET}")

    def run(self):
        """Main application loop"""
        print(f"\n{Fore.GREEN}" + "=" * 70 + Fore.RESET)
        print(f"{Fore.WHITE}{Back.BLUE}{ColoramaStyle.BRIGHT}{'Deployment Manager Admin Console':^70}{ColoramaStyle.RESET_ALL}")
        print(f"{Fore.GREEN}" + "=" * 70 + Fore.RESET)
        
        while True:
            print(f"\n{Fore.MAGENTA}{ColoramaStyle.BRIGHT}Admin Manager - Main Menu{ColoramaStyle.RESET_ALL}")
            print(f"{Fore.CYAN}1. User Management")
            print(f"{Fore.CYAN}2. Website Management")
            print(f"{Fore.CYAN}3. Review Management")
            print(f"{Fore.CYAN}4. Exit{Fore.RESET}")
            
            choice = self.session.prompt(
                f"\n{Fore.GREEN}Enter your choice (1-4): {Fore.RESET}",
                completer=WordCompleter(['1', '2', '3', '4']),
            ).strip()

            if choice == '1':
                self.user_management_menu()
            elif choice == '2':
                self.website_management_menu()
            elif choice == '3':
                self.review_management_menu()
            elif choice == '4':
                print(f"{Fore.YELLOW}Exiting Admin Manager...{Fore.RESET}")
                self.close()
                sys.exit(0)
            else:
                print(f"{Fore.RED}Invalid choice. Please try again.{Fore.RESET}")

if __name__ == "__main__":
    try:
        manager = AdminManager()
        manager.run()
    except KeyboardInterrupt:
        print(f"\n{Fore.YELLOW}Operation cancelled by user{Fore.RESET}")
        sys.exit(0)
    except Exception as e:
        print(f"{Fore.RED}Unexpected error: {str(e)}{Fore.RESET}", file=sys.stderr)
        sys.exit(1)