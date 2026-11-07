import socket
from urllib.parse import urlparse
from typing import List, Dict, Any
from ..adapters.tavily import TavilyAdapter

RESERVED_NETWORKS = ["127.", "10.", "192.168.", "169.254.", "0.0.0.0"]

def is_safe_url(url: str) -> bool:
    try:
        parsed = urlparse(url)
        if parsed.scheme not in ("http", "https"):
            return False
        host = (parsed.hostname or "").lower()
        if not host:
            return False
        if any(host.startswith(prefix) for prefix in RESERVED_NETWORKS) or host == "localhost":
            return False
        try:
            ip = socket.gethostbyname(host)
            if any(ip.startswith(prefix) for prefix in RESERVED_NETWORKS) or ip.startswith("172."):
                return False
        except socket.gaierror:
            # If DNS resolution is blocked (e.g. offline/sandbox test), rely on hostname pattern
            pass
        return True
    except Exception:
        return False

def discover_sources(
    provider: Dict[str, Any],
    tavily: TavilyAdapter,
    max_urls: int = 6
) -> List[Dict[str, Any]]:
    display_name = provider.get("display_name", "")
    domain = provider.get("canonical_domain", "")

    queries = [
        f"{display_name} OAuth 2.0 app setup developer documentation",
        f"{display_name} create connected app client ID redirect URI site:{domain}" if domain else f"{display_name} OAuth app registration guide",
        f"{display_name} OAuth scopes and app verification requirements"
    ]

    discovered = {}
    for q in queries:
        try:
            results = tavily.search(q, max_results=4)
            for r in results:
                url = r.get("url", "")
                if is_safe_url(url) and url not in discovered:
                    discovered[url] = {
                        "url": url,
                        "title": r.get("title", ""),
                        "snippet": r.get("content", ""),
                        "score": r.get("score", 0.5)
                    }
        except Exception as e:
            print(f"Discovery query '{q}' failed: {e}")

    # Prioritize official domain matches
    sorted_sources = sorted(
        discovered.values(),
        key=lambda x: (
            1 if (domain and domain in x["url"]) else 0,
            x.get("score", 0)
        ),
        reverse=True
    )
    return sorted_sources[:max_urls]
