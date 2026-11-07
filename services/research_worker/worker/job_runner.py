import traceback
from typing import Dict, Any
from .adapters.cf_ai import CloudflareAIAdapter
from .adapters.tavily import TavilyAdapter
from .db import DatabaseClient
from .stages.resolve import resolve_provider
from .stages.discover import discover_sources
from .stages.retrieve import retrieve_content
from .stages.extract import extract_facts
from .stages.synthesize import synthesize_guide
from .stages.verify import verify_and_score

def run_job(job: Dict[str, Any], worker_id: str, db: DatabaseClient, cf_ai: CloudflareAIAdapter, tavily: TavilyAdapter) -> None:
    job_id = job["id"]
    job_input = job.get("input", {})
    query = job_input.get("query", "")
    website = job_input.get("website", "")
    intent = job_input.get("intent", {})

    print(f"\n[JOB {job_id[:8]}] Started processing query='{query}'...")

    try:
        # 1. Resolve
        db.update_job_state(job_id, "resolving")
        db.record_event(job_id, 1, "resolving", "started", {"query": query})
        provider_info, _ = resolve_provider(query, website)
        db.record_event(job_id, 2, "resolving", "completed", provider_info)
        db.renew_lease(job_id, worker_id)

        # 2. Discover
        db.update_job_state(job_id, "discovering")
        db.record_event(job_id, 3, "discovering", "started")
        sources = discover_sources(provider_info, tavily)
        if not sources:
            db.update_job_state(
                job_id,
                "unsupported_or_unverified",
                error_code="no_sources_found",
                error_detail="Could not find reliable official OAuth documentation."
            )
            db.record_event(job_id, 4, "discovering", "failed", {"reason": "no_sources"})
            return
        db.record_event(job_id, 4, "discovering", "completed", {"count": len(sources), "domains": [s["url"] for s in sources]})
        db.renew_lease(job_id, worker_id)

        # 3. Retrieve
        db.update_job_state(job_id, "retrieving")
        db.record_event(job_id, 5, "retrieving", "started")
        pages = retrieve_content(sources, tavily)
        if not pages:
            db.update_job_state(
                job_id,
                "unsupported_or_unverified",
                error_code="content_inaccessible",
                error_detail="Documentation pages were inaccessible or protected."
            )
            return
        db.record_event(job_id, 6, "retrieving", "completed", {"pages_retrieved": len(pages)})
        db.renew_lease(job_id, worker_id)

        # 4. Extract
        db.update_job_state(job_id, "extracting")
        db.record_event(job_id, 7, "extracting", "started")
        facts = extract_facts(pages, cf_ai)
        db.record_event(job_id, 8, "extracting", "completed")
        db.renew_lease(job_id, worker_id)

        # 5. Synthesize
        db.update_job_state(job_id, "synthesizing")
        db.record_event(job_id, 9, "synthesizing", "started")
        guide = synthesize_guide(provider_info, facts, pages, intent, cf_ai)
        db.record_event(job_id, 10, "synthesizing", "completed")
        db.renew_lease(job_id, worker_id)

        # 6. Verify
        db.update_job_state(job_id, "verifying")
        db.record_event(job_id, 11, "verifying", "started")
        passed, score, issues = verify_and_score(guide)
        db.record_event(job_id, 12, "verifying", "completed", {"score": score, "issues": issues})

        # 7. Persist
        db.update_job_state(job_id, "persisting")
        # Ensure provider exists in DB
        existing_prov = db.find_provider(provider_info["slug"])
        if existing_prov:
            prov_id = existing_prov["id"]
        else:
            prov_id = db.upsert_provider({
                "slug": provider_info["slug"],
                "display_name": provider_info["display_name"],
                "canonical_domain": provider_info["canonical_domain"],
                "aliases": provider_info["aliases"],
                "official_domains": provider_info["official_domains"],
                "is_curated": False
            })

        guide["providerId"] = prov_id
        guide_id = db.persist_guide(guide, prov_id)

        # Terminal state
        final_state = "awaiting_review"
        db.update_job_state(job_id, final_state, result_id=guide_id)
        db.record_event(job_id, 13, "completed", "completed", {"guide_id": guide_id, "score": score})
        print(f"[JOB {job_id[:8]}] SUCCESS! Guide persisted (ID: {guide_id}, Score: {score})")

    except Exception as e:
        err_str = str(e)
        traceback.print_exc()
        if "quota_exhausted" in err_str:
            db.update_job_state(job_id, "quota_exhausted", error_code="quota_exhausted", error_detail=err_str)
        else:
            db.update_job_state(job_id, "failed", error_code="internal_error", error_detail=err_str)
        db.record_event(job_id, 99, "failed", "failed", {"error": err_str})
