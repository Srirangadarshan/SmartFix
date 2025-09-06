#!/usr/bin/env python3
"""
Basic test script for SmartFix-AI Backend
Tests core functionality and endpoints
"""

import requests
import json

BASE_URL = "http://127.0.0.1:8000"

def test_health():
    """Test health endpoint"""
    try:
        response = requests.get(f"{BASE_URL}/health")
        if response.status_code == 200:
            print("✅ Health check: PASSED")
            return True
        else:
            print(f"❌ Health check: FAILED ({response.status_code})")
            return False
    except Exception as e:
        print(f"❌ Health check: ERROR ({e})")
        return False

def test_text_query():
    """Test text query endpoint"""
    try:
        payload = {
            "text_query": "My computer is running slow",
            "user_id": "test_user"
        }
        response = requests.post(f"{BASE_URL}/api/v1/query/text", json=payload)
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Text query: PASSED (Query ID: {data.get('query_id', 'N/A')})")
            return True
        else:
            print(f"❌ Text query: FAILED ({response.status_code})")
            return False
    except Exception as e:
        print(f"❌ Text query: ERROR ({e})")
        return False

def test_database_stats():
    """Test database statistics endpoint"""
    try:
        response = requests.get(f"{BASE_URL}/api/v1/query/database/stats")
        if response.status_code == 200:
            data = response.json()
            stats = data.get('stats', {})
            print(f"✅ Database stats: PASSED (Queries: {stats.get('total_queries', 0)})")
            return True
        else:
            print(f"❌ Database stats: FAILED ({response.status_code})")
            return False
    except Exception as e:
        print(f"❌ Database stats: ERROR ({e})")
        return False

def main():
    """Run basic tests"""
    print("🧪 SmartFix-AI Backend - Basic Tests")
    print("=" * 40)
    
    tests = [
        ("Health Check", test_health),
        ("Text Query", test_text_query),
        ("Database Stats", test_database_stats)
    ]
    
    passed = 0
    total = len(tests)
    
    for test_name, test_func in tests:
        print(f"\n🔍 Testing: {test_name}")
        if test_func():
            passed += 1
    
    print("\n" + "=" * 40)
    print(f"📊 Results: {passed}/{total} tests passed")
    
    if passed == total:
        print("🎉 All tests passed! Backend is working correctly.")
    else:
        print("⚠️  Some tests failed. Check the backend logs.")

if __name__ == "__main__":
    main()

