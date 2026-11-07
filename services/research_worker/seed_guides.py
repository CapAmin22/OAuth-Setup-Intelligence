import os
import json
import urllib.request
from pathlib import Path

from pathlib import Path
from dotenv import load_dotenv

# Load credentials from local .env (never committed to git)
env_path = Path(__file__).resolve().parent / ".env"
load_dotenv(dotenv_path=env_path)

SUPABASE_URL = os.getenv("SUPABASE_URL", "")
SERVICE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY", "")

HEADERS = {
    "apikey": SERVICE_KEY,
    "Authorization": f"Bearer {SERVICE_KEY}",
    "Content-Type": "application/json",
    "Prefer": "resolution=merge-duplicates,return=representation"
}

def request(endpoint, method="GET", body=None):
    url = f"{SUPABASE_URL}/rest/v1/{endpoint}"
    data = json.dumps(body).encode() if body else None
    req = urllib.request.Request(url, data=data, headers=HEADERS, method=method)
    with urllib.request.urlopen(req) as resp:
        res = resp.read().decode()
        return json.loads(res) if res else None

def seed():
    # 1. Fetch provider IDs
    providers = request("providers?select=id,slug")
    slug_to_id = {p["slug"]: p["id"] for p in providers}
    print("Found providers in DB:", slug_to_id)

    fixtures_dir = Path(__file__).resolve().parent.parent.parent / "fixtures"
    fixture_files = list(fixtures_dir.glob("*_oauth_guide.json"))
    print(f"Found {len(fixture_files)} fixtures in {fixtures_dir}")

    for fpath in fixture_files:
        with open(fpath, "r", encoding="utf-8") as f:
            data = json.load(f)

        slug = data["providerSlug"]
        if slug not in slug_to_id:
            # Auto-provision provider in database
            prov_payload = {
                "slug": slug,
                "display_name": data["providerName"],
                "canonical_domain": data.get("canonicalDomain", f"{slug}.com"),
                "is_curated": True,
                "logo_url": f"https://{slug}.com/favicon.ico"
            }
            try:
                new_p = request("providers", method="POST", body=prov_payload)
                if new_p:
                    provider_id = new_p[0]["id"]
                    slug_to_id[slug] = provider_id
                    print(f"[OK] Provisioned provider {slug} (ID: {provider_id})")
                else:
                    print(f"Skipping {slug} (could not provision provider)")
                    continue
            except Exception as e:
                print(f"Failed to provision provider {slug}: {e}")
                continue

        provider_id = slug_to_id[slug]

        # Prepare guide version payload
        gv_payload = {
            "provider_id": provider_id,
            "version": data.get("version", 1),
            "schema_version": data.get("schemaVersion", "1.0"),
            "status": "published",
            "content": data,
            "evidence_quality": data.get("evidenceQuality"),
            "checked_at": data.get("checkedAt"),
            "published_at": data.get("checkedAt")
        }

        # Upsert guide version
        try:
            # Check if exists
            existing = request(f"guide_versions?provider_id=eq.{provider_id}&version=eq.{data.get('version', 1)}&select=id")
            if existing:
                guide_id = existing[0]["id"]
                request(f"guide_versions?id=eq.{guide_id}", method="PATCH", body=gv_payload)
                print(f"[OK] Updated guide_version for {slug} (ID: {guide_id})")
            else:
                res = request("guide_versions", method="POST", body=gv_payload)
                guide_id = res[0]["id"]
                print(f"[OK] Created guide_version for {slug} (ID: {guide_id})")

            # Clean and insert sources
            request(f"sources?guide_version_id=eq.{guide_id}", method="DELETE")
            src_records = []
            for s in data.get("sources", []):
                src_records.append({
                    "guide_version_id": guide_id,
                    "final_url": s["url"],
                    "publisher": s.get("publisher", "Official Docs"),
                    "retrieved_at": s.get("retrievedAt"),
                    "content_hash": s.get("contentHash", "sha256:unknown"),
                    "selected_passages": s.get("selectedPassages", [])
                })
            if src_records:
                request("sources", method="POST", body=src_records)

            # Clean and insert claims
            request(f"claims?guide_version_id=eq.{guide_id}", method="DELETE")
            claim_records = []
            for c in data.get("claims", []):
                ev_status = c.get("evidenceStatus", "documented")
                if ev_status not in ['documented', 'attempted', 'observed_working', 'estimated', 'unknown']:
                    ev_status = 'documented'
                claim_records.append({
                    "guide_version_id": guide_id,
                    "claim_ref": c.get("id", "claim"),
                    "text": c["text"],
                    "context": c.get("context"),
                    "evidence_status": ev_status,
                    "critical": c.get("critical", False)
                })
            if claim_records:
                request("claims", method="POST", body=claim_records)

            print(f"[OK] Seeded {len(src_records)} sources and {len(claim_records)} claims for {slug}")

        except Exception as e:
            print(f"[ERROR] Failed to seed {slug}:", e)

if __name__ == "__main__":
    seed()

