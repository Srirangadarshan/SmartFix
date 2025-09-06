import requests
import json

def test_assistant_status():
    """Test the assistant status endpoint"""
    url = "http://localhost:8000/api/v1/assistant/status"
    
    try:
        response = requests.get(url)
        print(f"Status Code: {response.status_code}")
        print(json.dumps(response.json(), indent=2))
        return response.status_code == 200
    except Exception as e:
        print(f"Error: {e}")
        return False

def test_assistant_query():
    """Test the assistant query endpoint"""
    url = "http://localhost:8000/api/v1/assistant/local"
    data = {
        "query": "How do I fix my laptop that won't turn on?",
        "context": {"device_info": {"type": "laptop", "os": "windows"}}
    }
    
    try:
        response = requests.post(url, json=data)
        print(f"Status Code: {response.status_code}")
        print(json.dumps(response.json(), indent=2))
        return response.status_code == 200
    except Exception as e:
        print(f"Error: {e}")
        return False

if __name__ == "__main__":
    print("Testing Assistant API...")
    print("\n1. Testing status endpoint...")
    status_ok = test_assistant_status()
    
    print("\n2. Testing query endpoint...")
    query_ok = test_assistant_query()
    
    if status_ok and query_ok:
        print("\nSuccess! The assistant API is working correctly.")
    else:
        print("\nThere were issues with the assistant API.")
