import json
import os
import uuid
import threading
from datetime import datetime
from typing import Dict, List, Any, Optional, Union
from contextlib import contextmanager

from ..core.config import settings

class JSONDatabase:
    def __init__(self, db_file: str = settings.DB_FILE):
        self.db_file = db_file
        self._lock = threading.RLock()  # Thread-safe lock
        self._ensure_db_exists()
    
    def _ensure_db_exists(self):
        """Create database file and structure if it doesn't exist"""
        os.makedirs(os.path.dirname(self.db_file), exist_ok=True)
        
        if not os.path.exists(self.db_file):
            initial_data = {
                "users": [],
                "queries": [],
                "notifications": []
            }
            with open(self.db_file, 'w') as f:
                json.dump(initial_data, f, indent=4)
    
    def _read_db(self) -> Dict[str, List]:
        """Read the entire database with thread safety"""
        with self._lock:
            try:
                with open(self.db_file, 'r') as f:
                    return json.load(f)
            except (json.JSONDecodeError, FileNotFoundError):
                # If file is corrupted or doesn't exist, create a new one
                self._ensure_db_exists()
                return {"users": [], "queries": [], "notifications": []}
    
    def _write_db(self, data: Dict[str, List]):
        """Write data to the database with thread safety"""
        with self._lock:
            # Create backup before writing
            backup_file = f"{self.db_file}.backup"
            if os.path.exists(self.db_file):
                import shutil
                shutil.copy2(self.db_file, backup_file)
            
            try:
                with open(self.db_file, 'w') as f:
                    json.dump(data, f, indent=4)
            except Exception as e:
                # Restore backup if write fails
                if os.path.exists(backup_file):
                    shutil.copy2(backup_file, self.db_file)
                raise e
            finally:
                # Clean up backup file
                if os.path.exists(backup_file):
                    os.remove(backup_file)
    
    def add_user(self, user_data: Dict[str, Any]) -> str:
        """Add a new user to the database"""
        db = self._read_db()
        
        # Check if user already exists
        for user in db["users"]:
            if user.get("user_id") == user_data.get("user_id"):
                return user.get("user_id")
        
        # Generate ID if not provided
        if "user_id" not in user_data:
            user_data["user_id"] = str(uuid.uuid4())
        
        db["users"].append(user_data)
        self._write_db(db)
        return user_data["user_id"]
    
    def get_user(self, user_id: str) -> Optional[Dict[str, Any]]:
        """Get user by ID"""
        db = self._read_db()
        for user in db["users"]:
            if user.get("user_id") == user_id:
                return user
        return None
    
    def add_query(self, query_data: Dict[str, Any]) -> str:
        """Add a new query to the database"""
        db = self._read_db()
        
        # Generate ID if not provided
        if "id" not in query_data:
            query_data["id"] = str(uuid.uuid4())
        
        # Add timestamp if not provided
        if "timestamp" not in query_data:
            query_data["timestamp"] = datetime.now().isoformat()
        
        db["queries"].append(query_data)
        
        # Update user history if user exists
        user_id = query_data.get("user_id")
        if user_id:
            for user in db["users"]:
                if user.get("user_id") == user_id:
                    if "history" not in user:
                        user["history"] = []
                    user["history"].append(query_data["id"])
                    break
        
        self._write_db(db)
        return query_data["id"]
    
    def get_query(self, query_id: str) -> Optional[Dict[str, Any]]:
        """Get query by ID"""
        db = self._read_db()
        for query in db["queries"]:
            if query.get("id") == query_id:
                return query
        return None
    
    def get_user_queries(self, user_id: str) -> List[Dict[str, Any]]:
        """Get all queries for a specific user"""
        db = self._read_db()
        return [q for q in db["queries"] if q.get("user_id") == user_id]
    
    def add_notification(self, notification_data: Dict[str, Any]) -> str:
        """Add a new notification to the database"""
        db = self._read_db()
        
        # Generate ID if not provided
        if "id" not in notification_data:
            notification_data["id"] = str(uuid.uuid4())
        
        # Add timestamp if not provided
        if "timestamp" not in notification_data:
            notification_data["timestamp"] = datetime.now().isoformat()
        
        db["notifications"].append(notification_data)
        self._write_db(db)
        return notification_data["id"]
    
    def update_query(self, query_id: str, update_data: Dict[str, Any]) -> bool:
        """Update an existing query"""
        db = self._read_db()
        for i, query in enumerate(db["queries"]):
            if query.get("id") == query_id:
                db["queries"][i].update(update_data)
                self._write_db(db)
                return True
        return False
    
    def update_user(self, user_id: str, update_data: Dict[str, Any]) -> bool:
        """Update an existing user"""
        db = self._read_db()
        for i, user in enumerate(db["users"]):
            if user.get("user_id") == user_id:
                db["users"][i].update(update_data)
                self._write_db(db)
                return True
        return False
    
    def update_notification(self, notification_id: str, update_data: Dict[str, Any]) -> bool:
        """Update an existing notification"""
        db = self._read_db()
        for i, notification in enumerate(db["notifications"]):
            if notification.get("id") == notification_id:
                db["notifications"][i].update(update_data)
                self._write_db(db)
                return True
        return False
    
    def get_database_stats(self) -> Dict[str, Any]:
        """Get database statistics"""
        db = self._read_db()
        return {
            "total_users": len(db["users"]),
            "total_queries": len(db["queries"]),
            "total_notifications": len(db["notifications"]),
            "database_size": os.path.getsize(self.db_file) if os.path.exists(self.db_file) else 0,
            "last_updated": datetime.now().isoformat()
        }
    
    def cleanup_old_data(self, days_to_keep: int = 30) -> Dict[str, int]:
        """Clean up old data based on timestamp"""
        cutoff_date = datetime.now().timestamp() - (days_to_keep * 24 * 60 * 60)
        db = self._read_db()
        
        cleaned = {"queries": 0, "notifications": 0}
        
        # Clean old queries
        original_count = len(db["queries"])
        db["queries"] = [
            q for q in db["queries"] 
            if datetime.fromisoformat(q.get("timestamp", "1970-01-01")).timestamp() > cutoff_date
        ]
        cleaned["queries"] = original_count - len(db["queries"])
        
        # Clean old notifications
        original_count = len(db["notifications"])
        db["notifications"] = [
            n for n in db["notifications"] 
            if datetime.fromisoformat(n.get("timestamp", "1970-01-01")).timestamp() > cutoff_date
        ]
        cleaned["notifications"] = original_count - len(db["notifications"])
        
        if cleaned["queries"] > 0 or cleaned["notifications"] > 0:
            self._write_db(db)
        
        return cleaned
    
    @contextmanager
    def get_db_context(self):
        """Context manager for database operations"""
        try:
            yield self
        except Exception as e:
            # Log error if needed
            raise e