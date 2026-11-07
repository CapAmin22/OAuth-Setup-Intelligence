import os
import json
import urllib.request
import urllib.error
from typing import List, Dict, Any, Optional

class CloudflareAIAdapter:
    def __init__(
        self,
        account_id: Optional[str] = None,
        api_token: Optional[str] = None,
        model_id: Optional[str] = None
    ):
        self.account_id = account_id or os.getenv("CLOUDFLARE_ACCOUNT_ID", "28e175bfb93db0520b232bf112a131fd")
        self.api_token = api_token or os.getenv("CLOUDFLARE_API_TOKEN", "")
        self.model_id = model_id or os.getenv("MODEL_ID", "@cf/meta/llama-3.1-8b-instruct-fp8")
        self.base_url = f"https://api.cloudflare.com/client/v4/accounts/{self.account_id}/ai/run"

    def generate(
        self,
        messages: List[Dict[str, str]],
        max_tokens: int = 2500,
        temperature: float = 0.1
    ) -> str:
        url = f"{self.base_url}/{self.model_id}"
        payload = {
            "messages": messages,
            "max_tokens": max_tokens,
            "temperature": temperature
        }
        headers = {
            "Authorization": f"Bearer {self.api_token}",
            "Content-Type": "application/json"
        }
        
        req = urllib.request.Request(
            url,
            data=json.dumps(payload).encode("utf-8"),
            headers=headers,
            method="POST"
        )
        
        try:
            with urllib.request.urlopen(req, timeout=45) as response:
                result = json.loads(response.read().decode("utf-8"))
                if result.get("success"):
                    return result.get("result", {}).get("response", "")
                raise RuntimeError(f"Cloudflare AI Error: {result.get('errors')}")
        except urllib.error.HTTPError as e:
            error_body = e.read().decode("utf-8")
            if e.code == 429:
                raise RuntimeError("quota_exhausted: Cloudflare Workers AI neuron quota reached")
            raise RuntimeError(f"Cloudflare AI HTTP {e.code}: {error_body}")

