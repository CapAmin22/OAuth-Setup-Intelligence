import hashlib
from datetime import datetime, timezone
from typing import List, Dict, Any
from ..adapters.tavily import TavilyAdapter

def retrieve_content(
    sources: List[Dict[str, Any]],
    tavily: TavilyAdapter
) -> List[Dict[str, Any]]:
    urls = [s["url"] for s in sources]
    if not urls:
        return []

    extracted_pages = []
    try:
        results = tavily.extract(urls)
        for r in results:
            content = r.get("raw_content", "") or r.get("content", "")
            if not content:
                continue
            
            # Bound content size to ~10,000 chars per page to respect token limits
            truncated_content = content[:10000]
            content_hash = "sha256:" + hashlib.sha256(truncated_content.encode("utf-8")).hexdigest()
            
            extracted_pages.append({
                "url": r.get("url", ""),
                "content": truncated_content,
                "content_hash": content_hash,
                "retrieved_at": datetime.now(timezone.utc).isoformat()
            })
    except Exception as e:
        print(f"Extraction failed: {e}")

    # Fallback to snippet if extraction returned empty
    if not extracted_pages:
        for s in sources:
            snippet = s.get("snippet", "")
            if snippet:
                content_hash = "sha256:" + hashlib.sha256(snippet.encode("utf-8")).hexdigest()
                extracted_pages.append({
                    "url": s["url"],
                    "content": snippet,
                    "content_hash": content_hash,
                    "retrieved_at": datetime.now(timezone.utc).isoformat()
                })

    return extracted_pages

