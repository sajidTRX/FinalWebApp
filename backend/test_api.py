"""Quick test script to verify OpenRouter API is working."""
import sys
from openrouter_client import chat, OpenRouterError

def test_api():
    """Test the OpenRouter API with a simple message."""
    try:
        print("Testing OpenRouter API...")
        print("Sending test message...")
        
        messages = [
            {"role": "user", "content": "Say hello in one sentence."}
        ]
        
        response = chat(messages)
        print(f"\n[OK] API is working!")
        print(f"Response: {response}\n")
        return True
        
    except OpenRouterError as e:
        print(f"\n[FAIL] API Error: {e}\n")
        return False
    except Exception as e:
        print(f"\n[FAIL] Unexpected error: {e}\n")
        return False

if __name__ == "__main__":
    success = test_api()
    sys.exit(0 if success else 1)


