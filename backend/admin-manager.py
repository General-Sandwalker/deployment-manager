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
            print(f"Database connection error: {str(e)}")
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
            print(f"Database error: {str(e)}")
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
                    status = "ADMIN" if result['is_admin'] else "NORMAL"
                    print(f"\nUser {result['email']} status set to {status}")
                    return True
                print(f"\nUser with ID {user_id} not found")
                return False
        except psycopg2.Error as e:
            print(f"\nDatabase error: {str(e)}")
            return False
    
    def delete_user(self, user_id: int) -> bool:
        """Delete a user account"""
        try:
            with self.conn.cursor(cursor_factory=RealDictCursor) as cursor:
                # Check if user exists
                cursor.execute("SELECT email FROM users WHERE id = %s", (user_id,))
                user = cursor.fetchone()
                if not user:
                    print(f"\nUser with ID {user_id} not found")
                    return False
                
                # Confirm deletion
                if not confirm(f"Are you sure you want to delete user {user['email']}? This will also delete all their websites and reviews!"):
                    print("\nDeletion cancelled")
                    return False
                
                # First delete related data
                print("\nDeleting user's websites and reviews...")
                cursor.execute("DELETE FROM websites WHERE user_id = %s", (user_id,))
                cursor.execute("DELETE FROM reviews WHERE user_id = %s", (user_id,))
                
                # Then delete the user
                cursor.execute("DELETE FROM users WHERE id = %s", (user_id,))
                print(f"\nUser {user['email']} deleted successfully")
                return True
        except psycopg2.Error as e:
            print(f"\nDatabase error: {str(e)}")
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
            print(f"Database error: {str(e)}")
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
                    print(f"\nWebsite with ID {website_id} not found")
                    return False
                
                # Confirm deletion
                if not confirm(f"Are you sure you want to delete website '{website['name']}' owned by {website['email']}?"):
                    print("\nDeletion cancelled")
                    return False
                
                # Try to stop the website process if running
                port = website['port']
                print(f"\nStopping website on port {port}...")
                try:
                    import subprocess
                    import signal
                    subprocess.run(["lsof", "-i", f":{port}", "-t"], stdout=subprocess.PIPE, stderr=subprocess.PIPE)
                except:
                    pass  # If lsof fails, just continue with deletion
                
                # Delete the website
                cursor.execute("DELETE FROM websites WHERE id = %s", (website_id,))
                print(f"\nWebsite '{website['name']}' deleted successfully")
                return True
        except psycopg2.Error as e:
            print(f"\nDatabase error: {str(e)}")
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
            print(f"Database error: {str(e)}")
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
                    print(f"\nReview with ID {review_id} not found")
                    return False
                
                # Confirm deletion
                if not confirm(f"Are you sure you want to delete review by {review['email']} for {review['name']}?"):
                    print("\nDeletion cancelled")
                    return False
                
                # Delete the review
                cursor.execute("DELETE FROM reviews WHERE id = %s", (review_id,))
                print(f"\nReview deleted successfully")
                return True
        except psycopg2.Error as e:
            print(f"\nDatabase error: {str(e)}")
            return False

    def print_users(self, users: List[Dict]):
        """Display users in a formatted table"""
        if not users:
            print("No users found")
            return
        
        print("\n{:<5} {:<30} {:<25} {:<10} {:<10} {:<20} {:<20}".format(
            "ID", "Email", "Name", "Admin", "Active", "Created At", "Plan Expires"
        ))
        print("-" * 120)
        for user in users:
            expires_at = user['plan_expires_at'].strftime('%Y-%m-%d') if user['plan_expires_at'] else "Never"
            print("{:<5} {:<30} {:<25} {:<10} {:<10} {:<20} {:<20}".format(
                user['id'],
                user['email'],
                user.get('full_name', ''),
                "Yes" if user['is_admin'] else "No",
                "Yes" if user['is_active'] else "No",
                user['created_at'].strftime('%Y-%m-%d %H:%M'),
                expires_at
            ))
        print()
    
    def print_websites(self, websites: List[Dict]):
        """Display websites in a formatted table"""
        if not websites:
            print("No websites found")
            return
        
        print("\n{:<5} {:<25} {:<30} {:<8} {:<12} {:<25} {:<20}".format(
            "ID", "Name", "Git Repo", "Port", "Status", "Owner", "Created At"
        ))
        print("-" * 130)
        for website in websites:
            print("{:<5} {:<25} {:<30} {:<8} {:<12} {:<25} {:<20}".format(
                website['id'],
                website['name'][:25],
                website['git_repo'][:30],
                website['port'],
                website['status'],
                website['owner_email'][:25],
                website['created_at'].strftime('%Y-%m-%d %H:%M')
            ))
        print()
    
    def print_reviews(self, reviews: List[Dict]):
        """Display reviews in a formatted table"""
        if not reviews:
            print("No reviews found")
            return
        
        print("\n{:<5} {:<6} {:<30} {:<25} {:<25} {:<20}".format(
            "ID", "Rating", "Comment", "Website", "Reviewer", "Created At"
        ))
        print("-" * 120)
        for review in reviews:
            print("{:<5} {:<6} {:<30} {:<25} {:<25} {:<20}".format(
                review['id'],
                review['rating'],
                review['comment'][:30] + ("..." if len(review['comment']) > 30 else ""),
                review['website_name'][:25],
                review['reviewer_email'][:25],
                review['created_at'].strftime('%Y-%m-%d %H:%M')
            ))
        print()

    def admin_status_menu(self, user_id: int):
        """Menu for managing admin status"""
        while True:
            choice = self.session.prompt(
                "\nAdmin Status Management\n"
                "1. Toggle admin status\n"
                "2. Back to main menu\n\n"
                "Enter your choice (1-2): ",
                completer=WordCompleter(['1', '2']),
            ).strip()

            if choice == '1':
                if self.toggle_admin(user_id):
                    return
            elif choice == '2':
                return
            else:
                print("Invalid choice. Please try again.")
    
    def user_management_menu(self):
        """Menu for user management"""
        while True:
            choice = self.session.prompt(
                "\nUser Management Menu\n"
                "1. List all users\n"
                "2. Toggle admin status\n"
                "3. Delete user\n"
                "4. Back to main menu\n\n"
                "Enter your choice (1-4): ",
                completer=WordCompleter(['1', '2', '3', '4']),
            ).strip()

            if choice == '1':
                users = self.list_users()
                self.print_users(users)
            elif choice in ['2', '3']:
                users = self.list_users()
                if not users:
                    print("No users available")
                    continue
                    
                self.print_users(users)
                try:
                    user_id = int(self.session.prompt(
                        "Enter ID of user to manage: ",
                    ).strip())
                except ValueError:
                    print("Invalid ID. Please enter a number.")
                    continue
                    
                if not any(u['id'] == user_id for u in users):
                    print(f"No user found with ID {user_id}")
                    continue
                
                if choice == '2':
                    self.toggle_admin(user_id)
                else:  # choice == '3'
                    self.delete_user(user_id)
            elif choice == '4':
                return
            else:
                print("Invalid choice. Please try again.")
    
    def website_management_menu(self):
        """Menu for website management"""
        while True:
            choice = self.session.prompt(
                "\nWebsite Management Menu\n"
                "1. List all websites\n"
                "2. Delete website\n"
                "3. Back to main menu\n\n"
                "Enter your choice (1-3): ",
                completer=WordCompleter(['1', '2', '3']),
            ).strip()

            if choice == '1':
                websites = self.list_websites()
                self.print_websites(websites)
            elif choice == '2':
                websites = self.list_websites()
                if not websites:
                    print("No websites available")
                    continue
                    
                self.print_websites(websites)
                try:
                    website_id = int(self.session.prompt(
                        "Enter ID of website to delete: ",
                    ).strip())
                except ValueError:
                    print("Invalid ID. Please enter a number.")
                    continue
                    
                if not any(w['id'] == website_id for w in websites):
                    print(f"No website found with ID {website_id}")
                    continue
                
                self.delete_website(website_id)
            elif choice == '3':
                return
            else:
                print("Invalid choice. Please try again.")
    
    def review_management_menu(self):
        """Menu for review management"""
        while True:
            choice = self.session.prompt(
                "\nReview Management Menu\n"
                "1. List all reviews\n"
                "2. Delete review\n"
                "3. Back to main menu\n\n"
                "Enter your choice (1-3): ",
                completer=WordCompleter(['1', '2', '3']),
            ).strip()

            if choice == '1':
                reviews = self.list_reviews()
                self.print_reviews(reviews)
            elif choice == '2':
                reviews = self.list_reviews()
                if not reviews:
                    print("No reviews available")
                    continue
                    
                self.print_reviews(reviews)
                try:
                    review_id = int(self.session.prompt(
                        "Enter ID of review to delete: ",
                    ).strip())
                except ValueError:
                    print("Invalid ID. Please enter a number.")
                    continue
                    
                if not any(r['id'] == review_id for r in reviews):
                    print(f"No review found with ID {review_id}")
                    continue
                
                self.delete_review(review_id)
            elif choice == '3':
                return
            else:
                print("Invalid choice. Please try again.")

    def run(self):
        """Main application loop"""
        print("\n" + "=" * 50)
        print("Deployment Manager Admin Console".center(50))
        print("=" * 50 + "\n")
        
        while True:
            choice = self.session.prompt(
                "\nAdmin Manager - Main Menu\n"
                "1. User Management\n"
                "2. Website Management\n"
                "3. Review Management\n"
                "4. Exit\n\n"
                "Enter your choice (1-4): ",
                completer=WordCompleter(['1', '2', '3', '4']),
            ).strip()

            if choice == '1':
                self.user_management_menu()
            elif choice == '2':
                self.website_management_menu()
            elif choice == '3':
                self.review_management_menu()
            elif choice == '4':
                print("Exiting Admin Manager...")
                self.close()
                sys.exit(0)
            else:
                print("Invalid choice. Please try again.")

if __name__ == "__main__":
    try:
        manager = AdminManager()
        manager.run()
    except KeyboardInterrupt:
        print("\nOperation cancelled by user")
        sys.exit(0)
    except Exception as e:
        print(f"Unexpected error: {str(e)}", file=sys.stderr)
        sys.exit(1)