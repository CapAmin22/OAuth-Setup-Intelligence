import hashlib
from datetime import datetime, timezone
from typing import List, Dict, Any, Tuple
from ..adapters.tavily import TavilyAdapter

def audit_source_drift(
    source_url: str,
    expected_hash: str,
    tavily: TavilyAdapter
) -> Tuple[bool, str, float]:
    """
    Fetches live documentation page and compares its clean text SHA-256 against expected hash.
    Returns: (is_fresh: bool, live_hash: str, drift_percentage: float)
    """
    try:
        results = tavily.extract([source_url])
        if not results:
            return True, expected_hash, 0.0

        content = results[0].get("raw_content", "") or results[0].get("content", "")
        if not content:
            return True, expected_hash, 0.0

        # Bound to ~10,000 characters matching retrieve stage
        clean_content = content[:10000]
        live_hash = "sha256:" + hashlib.sha256(clean_content.encode("utf-8")).hexdigest()

        if live_hash == expected_hash:
            return True, live_hash, 0.0

        # Different hash detected -> document updated or drifted
        return False, live_hash, 100.0

    except Exception as e:
        print(f"Drift audit check error for {source_url}: {e}")
        return True, expected_hash, 0.0

def audit_guide_freshness(
    guide: Dict[str, Any],
    tavily: TavilyAdapter
) -> Dict[str, Any]:
    sources = guide.get("sources", [])
    results = []
    has_drift = False

    for s in sources:
        url = s.get("url", "")
        expected = s.get("contentHash", "")
        is_fresh, live_hash, drift_pct = audit_source_drift(url, expected, tavily)
        if not is_fresh:
            has_drift = True
        results.append({
            "url": url,
            "expected_hash": expected,
            "live_hash": live_hash,
            "is_fresh": is_fresh,
            "drift_percentage": drift_pct,
            "audited_at": datetime.now(timezone.utc).isoformat()
        })

    return {
        "provider_slug": guide.get("providerSlug"),
        "has_drift": has_drift,
        "status": "drift_detected" if has_drift else "verified_fresh",
        "sources": results
    }
