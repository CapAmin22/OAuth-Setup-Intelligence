import os
import json
import urllib.request
import urllib.error
from typing import List, Dict, Any, Optional

class TavilyAdapter:
    def __init__(self, api_key: Optional[str] = None):
        self.api_key = api_key or os.getenv("TAVILY_API_KEY", "")
        self.base_url = "https://api.tavily.com"

    def search(
        self,
        query: str,
        max_results: int = 5,
        include_domains: Optional[List[str]] = None
    ) -> List[Dict[str, Any]]:
        url = f"{self.base_url}/search"
        payload: Dict[str, Any] = {
            "api_key": self.api_key,
            "query": query,
            "max_results": max_results,
            "search_depth": "advanced"
        }
        if include_domains:
            payload["include_domains"] = include_domains

        req = urllib.request.Request(
            url,
            data=json.dumps(payload).encode("utf-8"),
            headers={"Content-Type": "application/json"},
            method="POST"
        )

        try:
            with urllib.request.urlopen(req, timeout=30) as response:
                data = json.loads(response.read().decode("utf-8"))
                return data.get("results", [])
        except urllib.error.HTTPError as e:
            if e.code == 429:
                raise RuntimeError("quota_exhausted: Tavily search quota exceeded")
            raise RuntimeError(f"Tavily Search HTTP {e.code}: {e.read().decode('utf-8')}")

    def extract(self, urls: List[str]) -> List[Dict[str, Any]]:
        url = f"{self.base_url}/extract"
        payload = {
            "api_key": self.api_key,
            "urls": urls[:6]
        }

        req = urllib.request.Request(
            url,
            data=json.dumps(payload).encode("utf-8"),
            headers={"Content-Type": "application/json"},
            method="POST"
        )

        try:
            with urllib.request.urlopen(req, timeout=45) as response:
                data = json.loads(response.read().decode("utf-8"))
                return data.get("results", [])
        except urllib.error.HTTPError as e:
            if e.code == 429:
                raise RuntimeError("quota_exhausted: Tavily extract quota exceeded")
            raise RuntimeError(f"Tavily Extract HTTP {e.code}: {e.read().decode('utf-8')}")

