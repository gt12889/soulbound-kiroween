"""
Test script for Einstein API
Run this to verify your API is working
"""

import requests
import json
import sys

# Get API URL from command line or use default
API_URL = sys.argv[1] if len(sys.argv) > 1 else 'http://localhost:5000'

print(f"🧪 Testing Einstein API at: {API_URL}\n")

# Test 1: Health Check
print("1️⃣ Testing Health Endpoint...")
try:
    response = requests.get(f"{API_URL}/health", timeout=10)
    if response.status_code == 200:
        data = response.json()
        print(f"   ✅ Health check passed!")
        print(f"   Status: {data.get('status')}")
        print(f"   Model loaded: {data.get('model_loaded', 'N/A')}")
        print(f"   Model: {data.get('model', 'N/A')}\n")
    else:
        print(f"   ❌ Health check failed: {response.status_code}")
        print(f"   Response: {response.text}\n")
        sys.exit(1)
except Exception as e:
    print(f"   ❌ Error: {e}\n")
    sys.exit(1)

# Test 2: Generate Response
print("2️⃣ Testing Generate Endpoint...")
try:
    payload = {
        "question": "What is relativity?",
        "history": [],
        "max_length": 100,
        "temperature": 0.7
    }
    
    print(f"   Sending request: {payload['question']}")
    response = requests.post(
        f"{API_URL}/generate",
        json=payload,
        headers={"Content-Type": "application/json"},
        timeout=30
    )
    
    if response.status_code == 200:
        data = response.json()
        print(f"   ✅ Generate request successful!")
        print(f"   Model: {data.get('model')}")
        print(f"   Response: {data.get('response')}\n")
    else:
        print(f"   ❌ Generate request failed: {response.status_code}")
        print(f"   Response: {response.text}\n")
        sys.exit(1)
except Exception as e:
    print(f"   ❌ Error: {e}\n")
    sys.exit(1)

# Test 3: With Conversation History
print("3️⃣ Testing with Conversation History...")
try:
    payload = {
        "question": "Can you explain it more simply?",
        "history": [
            {"role": "user", "content": "What is relativity?"},
            {"role": "assistant", "content": "Relativity is a theory..."}
        ],
        "max_length": 80,
        "temperature": 0.7
    }
    
    response = requests.post(
        f"{API_URL}/generate",
        json=payload,
        headers={"Content-Type": "application/json"},
        timeout=30
    )
    
    if response.status_code == 200:
        data = response.json()
        print(f"   ✅ Conversation test successful!")
        print(f"   Response: {data.get('response')}\n")
    else:
        print(f"   ⚠️ Conversation test failed: {response.status_code}")
        print(f"   Response: {response.text}\n")
except Exception as e:
    print(f"   ⚠️ Conversation test error: {e}\n")

print("🎉 All tests completed!")
print(f"\n📝 Your API is ready to use!")
print(f"   Add to frontend .env:")
print(f"   VITE_EINSTEIN_API_URL={API_URL}")

