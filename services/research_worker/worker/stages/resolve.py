import re
from urllib.parse import urlparse
from typing import Dict, Any, Tuple

def resolve_provider(query: str, website: str = "") -> Tuple[Dict[str, Any], bool]:
    clean_query = query.strip()
    
    # Extract domain if website provided
    canonical_domain = None
    if website and website.strip():
        parsed = urlparse(website.strip() if "://" in website else f"https://{website.strip()}")
        canonical_domain = parsed.netloc.lower()
        if canonical_domain.startswith("www."):
            canonical_domain = canonical_domain[4:]

    # Generate slug from query or domain
    slug_base = clean_query if not canonical_domain else canonical_domain.split(".")[0]
    slug = re.sub(r"[^a-z0-9]+", "-", slug_base.lower()).strip("-")
    display_name = clean_query.title() if clean_query else slug_base.title()

    if not canonical_domain:
        canonical_domain = f"{slug}.com"

    return {
        "slug": slug,
        "display_name": display_name,
        "canonical_domain": canonical_domain,
        "official_domains": [canonical_domain],
        "aliases": [clean_query.lower(), f"{slug} oauth", f"{slug} api"]
    }, True
