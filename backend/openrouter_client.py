"""OpenRouter chat client wrapper.

Provides a simple `chat` function that accepts a list of messages
[{"role": "user"|"assistant"|"system", "content": "..."}, ...]
and returns the assistant reply string.

Loads OPENROUTER_API_KEY from a .env file (python-dotenv).
"""
from __future__ import annotations

import os
import json
import time
from typing import List, Dict, Any

import requests
from dotenv import load_dotenv

# Load .env from the backend folder so the key is found regardless of process cwd
_here = os.path.dirname(os.path.abspath(__file__))
load_dotenv(dotenv_path=os.path.join(_here, ".env"))

BASE_URL = "https://openrouter.ai/api/v1/chat/completions"
# Use OPENROUTER_MODEL from .env, or fall back to this default
DEFAULT_MODEL = os.getenv("OPENROUTER_MODEL", "tngtech/deepseek-r1t2-chimera:free")
SYSTEM_PROMPT = (
    "Talk like Robert Downey Jr. Increase the humor and sarcasm to the max. Your name is Tagore AI. Do not refer to yourself as anything else other than this"
    "You are an expert multi-domain assistant: writing assistant, writing expert, mathematics expert, physics expert, chemistry expert, biology expert, literature expert, computer science expert. " "Primary goals: provide accurate, clear, and concise guidance. For writing: assist with character development, " "plot structure, stylistic refinement, dialogue improvement, scene pacing, and consistent tone. For STEM: show key formulas, " "concept breakdowns, and step-by-step reasoning only when the user asks for working; otherwise give succinct results. " "For code/computer science: give idiomatic examples, prefer clarity over cleverness. Always use markdown for structure; limit unordered lists to <=5 items unless explicitly asked for more. " "If a question spans multiple domains, segment the answer with short domain headings. Avoid hallucinating sources; if unsure, state uncertainty briefly."
)



class OpenRouterError(Exception):
    pass

def _get_api_key() -> str:
    key = (os.getenv("OPENROUTER_API_KEY") or "").strip()
    if not key or key == "your_openrouter_api_key_here":
        raise OpenRouterError("Missing or invalid OPENROUTER_API_KEY. Set it in backend/.env")
    return key

def chat(messages: List[Dict[str, str]], *, model: str = DEFAULT_MODEL, temperature: float = 0.7, max_tokens: int = 3000) -> str:
    """Send a chat completion request to OpenRouter.

    Args:
        messages: List of {role, content}. A system prompt is injected if not already present.
        model: Model identifier.
        temperature: Sampling temperature.
        max_tokens: Response token cap (advisory depending on model behavior).
    Returns:
        Assistant message content string.
    Raises:
        OpenRouterError on any failure.
    """
    if not isinstance(messages, list):  # Basic validation
        raise OpenRouterError("messages must be a list")

    # Shallow copy & ensure system prompt present
    prepared: List[Dict[str, str]] = []
    saw_system = False
    for m in messages:
        role = m.get("role", "user")
        content = m.get("content", "")
        if role == "system":
            saw_system = True
        prepared.append({"role": role, "content": content})
    if not saw_system:
        prepared.insert(0, {"role": "system", "content": SYSTEM_PROMPT})

    payload: Dict[str, Any] = {
        "model": model,
        "messages": prepared,
        "temperature": temperature,
        "max_tokens": max_tokens,
    }

    headers = {
        "Authorization": f"Bearer {_get_api_key()}",
        "HTTP-Referer": "http://localhost:3000",
        "X-Title": "Tagore Writing Assistant",
        "Content-Type": "application/json",
    }

    try:
        start = time.time()
        # Use a session that ignores system proxy (trust_env=False) so OpenRouter is reached directly
        session = requests.Session()
        session.trust_env = False
        resp = session.post(
            BASE_URL,
            headers=headers,
            data=json.dumps(payload),
            timeout=60,
        )
        duration = time.time() - start
    except requests.RequestException as e:
        raise OpenRouterError(f"Network error: {e}") from e

    if resp.status_code >= 400:
        # Try to parse JSON error detail
        try:
            detail = resp.json()
        except Exception:  # pragma: no cover - defensive
            detail = resp.text
        raise OpenRouterError(f"OpenRouter error {resp.status_code}: {detail}")

    try:
        data = resp.json()
    except ValueError as e:
        raise OpenRouterError(f"Invalid JSON response: {resp.text[:200]}") from e

    # Expected structure: { choices: [ { message: { role: 'assistant', content: '...' } } ] }
    choices = data.get("choices") or []
    if not choices:
        raise OpenRouterError(f"No choices returned (elapsed {duration:.2f}s)")

    msg = choices[0].get("message", {})
    content = msg.get("content", "").strip()
    if not content:
        raise OpenRouterError("Empty assistant response")
    return content

__all__ = ["chat", "OpenRouterError"]
