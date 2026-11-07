import os
from pathlib import Path
from dotenv import load_dotenv

# Load local credentials
env_path = Path(__file__).resolve().parent.parent.parent / "services" / "research_worker" / ".env"
load_dotenv(dotenv_path=env_path)

from services.research_worker.worker.adapters.cf_ai import CloudflareAIAdapter
from services.research_worker.worker.adapters.tavily import TavilyAdapter
from services.research_worker.worker.stages.resolve import resolve_provider
from services.research_worker.worker.stages.discover import discover_sources
from services.research_worker.worker.stages.retrieve import retrieve_content
from services.research_worker.worker.stages.extract import extract_facts
from services.research_worker.worker.stages.synthesize import synthesize_guide
from services.research_worker.worker.stages.verify import verify_and_score

def test_live_research():
    print("=" * 60)
    print("LIVE RESEARCH PIPELINE TEST: Linear (Unfamiliar Provider)")
    print("=" * 60)

    cf_ai = CloudflareAIAdapter()
    tavily = TavilyAdapter()

    # 1. Resolve
    print("\n[Stage 1: Resolve]")
    provider_info, ok = resolve_provider("Linear", "https://linear.app")
    print(f"Resolved: {provider_info['display_name']} (slug: {provider_info['slug']}, domain: {provider_info['canonical_domain']})")
    assert ok, "Provider resolution failed"

    # 2. Discover
    print("\n[Stage 2: Discover]")
    sources = discover_sources(provider_info, tavily, max_urls=4)
    print(f"Found {len(sources)} candidate documentation sources:")
    for s in sources:
        print(f" - {s['url']}")
    assert len(sources) > 0, "No sources discovered"

    # 3. Retrieve
    print("\n[Stage 3: Retrieve]")
    pages = retrieve_content(sources[:2], tavily)
    print(f"Retrieved and parsed {len(pages)} pages.")
    assert len(pages) > 0, "No pages retrieved"

    # 4. Extract
    print("\n[Stage 4: Extract]")
    facts = extract_facts(pages, cf_ai)
    print("Extracted facts summary:")
    print(f" - App creation URL : {facts.get('app_creation_url')}")
    print(f" - Scopes found      : {facts.get('scopes')}")
    print(f" - Callback rules    : {facts.get('redirect_uri_rules')}")

    # 5. Synthesize
    print("\n[Stage 5: Synthesize]")
    intent = {"capabilities": ["Read issues", "Create comments"], "distribution": "external"}
    guide = synthesize_guide(provider_info, facts, pages, intent, cf_ai)
    print(f"Guide generated with {len(guide.get('steps', []))} steps and {len(guide.get('claims', []))} claims.")

    # 6. Verify
    print("\n[Stage 6: Verify]")
    passed, score, issues = verify_and_score(guide)
    print(f"Evidence Quality Score: {score}/100")
    print(f"Issues detected       : {issues}")
    print(f"Verification status   : {'PASSED' if passed else 'AWAITING_REVIEW'}")

    print("\n" + "=" * 60)
    print("✅ ALL 6 PIPELINE STAGES EXECUTED SUCCESSFULLY END-TO-END!")
    print("=" * 60)

if __name__ == "__main__":
    test_live_research()
