import re
from urllib.parse import urlparse
from typing import Dict, Any, Tuple

KNOWN_DOMAINS = {
    "microsoft": "microsoft.com",
    "azure": "microsoft.com",
    "entra": "microsoft.com",
    "x": "x.com",
    "twitter": "x.com",
    "zoho": "zoho.com",
    "loom": "loom.com",
    "figma": "figma.com",
    "miro": "miro.com",
    "canva": "canva.com",
    "supabase": "supabase.com",
    "airtable": "airtable.com",
    "shopify": "shopify.com",
    "stripe": "stripe.com",
    "google-calendar": "google.com",
    "gcal": "google.com",
    "slack": "slack.com",
    "discord": "discord.com",
    "github": "github.com",
    "gitlab": "gitlab.com",
    "notion": "notion.so",
    "asana": "asana.com",
    "box": "box.com",
    "dropbox": "dropbox.com",
    "zoom": "zoom.us",
    "twilio": "twilio.com",
    "hubspot": "hubspot.com",
    "salesforce": "salesforce.com",
    "linear": "linear.app",
    "zendesk": "zendesk.com",
    "intercom": "intercom.com",
    "mailchimp": "mailchimp.com",
    "sentry": "sentry.io",
    "odoo": "odoo.com",
    "clickup": "clickup.com",
    "monday": "monday.com",
    "okta": "okta.com",
    "auth0": "auth0.com",
    "atlassian": "atlassian.com",
    "jira": "atlassian.com",
    "autonoma": "autonoma.app",
}

def resolve_provider(query: str, website: str = "") -> Tuple[Dict[str, Any], bool]:
    clean_query = query.strip()

    # Strip web protocol and trailing slash if user entered a full URL as query
    clean_query = re.sub(r"^https?://", "", clean_query, flags=re.IGNORECASE).rstrip("/")

    # Detect GitHub repository URLs (e.g. github.com/autonoma-ai/autonoma or https://github.com/autonoma-ai/autonoma)
    gh_match = re.search(r"github\.com/([a-zA-Z0-9_\-\.]+)/([a-zA-Z0-9_\-\.]+)", clean_query, re.IGNORECASE)
    if gh_match:
        org_name = gh_match.group(1)
        repo_name = re.sub(r"\.git$", "", gh_match.group(2), flags=re.IGNORECASE)
        slug = re.sub(r"[^a-z0-9]+", "-", repo_name.lower()).strip("-")
        display_name = repo_name.title()
        canonical_domain = KNOWN_DOMAINS.get(slug, f"{slug}.app")
        return ({
            "slug": slug,
            "display_name": display_name,
            "canonical_domain": canonical_domain,
            "official_domains": [f"github.com/{org_name}/{repo_name}", canonical_domain],
            "aliases": [f"{org_name}/{repo_name}", f"github.com/{org_name}/{repo_name}", f"{slug} oauth", f"{slug} api"],
        }, True)

    # Strip common TLDs from slug base (e.g. "airtable.com" -> "airtable")
    query_no_tld = re.sub(r"\.(com|org|net|io|app|dev|co|ai|us|me)$", "", clean_query, flags=re.IGNORECASE)

    # Generate slug and display name strictly from the query
    slug = re.sub(r"[^a-z0-9]+", "-", query_no_tld.lower()).strip("-")
    if not slug:
        slug = "provider"
    display_name = query_no_tld.title() if query_no_tld else slug.title()

    # Extract domain if website provided, with cross-provider contamination firewall
    canonical_domain = None
    if website and website.strip():
        parsed = urlparse(website.strip() if "://" in website else f"https://{website.strip()}")
        netloc = parsed.netloc.lower()
        if netloc.startswith("www."):
            netloc = netloc[4:]
        
        # Verify compatibility: host must match query or slug to avoid cross-contamination
        clean_slug_root = slug.replace("-", "")
        slug_parts = [p for p in slug.split("-") if len(p) >= 3]
        is_compatible = False
        if clean_slug_root in netloc or netloc.split(".")[0] in clean_slug_root:
            is_compatible = True
        elif any(part in netloc for part in slug_parts):
            is_compatible = True
        elif netloc == "github.com" and any(part in parsed.path.lower() for part in [slug, clean_slug_root]):
            is_compatible = True

        if is_compatible:
            canonical_domain = netloc
        else:
            # Incompatible website URL detected (e.g. Supabase doc passed with Loom query)
            canonical_domain = None

    if not canonical_domain:
        canonical_domain = KNOWN_DOMAINS.get(slug, f"{slug}.com")

    return {
        "slug": slug,
        "display_name": display_name,
        "canonical_domain": canonical_domain,
        "official_domains": [canonical_domain],
        "aliases": [clean_query.lower(), f"{slug} oauth", f"{slug} api"]
    }, True
