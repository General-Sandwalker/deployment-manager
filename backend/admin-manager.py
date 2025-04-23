#!/usr/bin/env python3
import os
import sys
import re
from typing import List, Dict, Optional
from dotenv import load_dotenv
import psycopg2
from psycopg2.extras import DictCursor, RealDictCursor
from prompt_toolkit import PromptSession
from prompt_toolkit.completion import WordCompleter
from prompt_toolkit.shortcuts import confirm, radiolist_dialog, button_dialog
from prompt_toolkit.styles import Style
from datetime import datetime

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
                    SELECT id, email, full_name, is_admin, is_active, created_at
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
                    SET is_admin = NOT is_admin,
                        updated_at = %s
                    WHERE id = %s
                    RETURNING id, email, is_admin
                """, (datetime.utcnow(), user_id))
                if result := cursor.fetchone():
                    status = "ADMIN" if result['is_admin'] else "NORMAL"
                    print(f"\nUser {result['email']} status set to {status}")
                    return True
                print(f"\nUser with ID {user_id} not found")
                return False
        except psycopg2.Error as e:
            print(f"\nDatabase error: {str(e)}")
            return False

    def print_users(self, users: List[Dict]):
        """Display users in a formatted table"""
        if not users:
            print("No users found")
            return
        
        print("\n{:<5} {:<30} {:<25} {:<10} {:<10} {:<20}".format(
            "ID", "Email", "Name", "Admin", "Active", "Created At"
        ))
        print("-" * 100)
        for user in users:
            print("{:<5} {:<30} {:<25} {:<10} {:<10} {:<20}".format(
                user['id'],
                user['email'],
                user.get('full_name', ''),
                "Yes" if user['is_admin'] else "No",
                "Yes" if user['is_active'] else "No",
                user['created_at'].strftime('%Y-%m-%d %H:%M')
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

    def run(self):
        """Main application loop"""
        print("\n" + "=" * 50)
        print("User Admin Privileges Manager".center(50))
        print("=" * 50 + "\n")
        
        while True:
            choice = self.session.prompt(
                "\nAdmin Manager - Main Menu\n"
                "1. List all users\n"
                "2. Manage admin privileges\n"
                "3. Exit \n\n"
                "Enter your choice (1-3): ",
                completer=WordCompleter(['1', '2', '3']),
            ).strip()

            if choice == '1':
                users = self.list_users()
                self.print_users(users)
            elif choice == '2':
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
                    
                self.admin_status_menu(user_id)
            elif choice == '3':
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