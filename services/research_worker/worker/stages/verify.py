from typing import Dict, Any, Tuple, List

def verify_and_score(guide: Dict[str, Any]) -> Tuple[bool, int, List[str]]:
    issues: List[str] = []
    
    steps = guide.get("steps", [])
    claims = guide.get("claims", [])
    sources = guide.get("sources", [])
    
    if len(steps) < 2:
        issues.append("Guide contains fewer than 2 steps.")
    if len(sources) < 1:
        issues.append("Guide contains no verified documentation sources.")
    if len(claims) < 1:
        issues.append("Guide contains no grounded claims.")

    # Cross-reference integrity check
    source_ids = {s["id"] for s in sources}
    for c in claims:
        for sid in c.get("sourceIds", []):
            if sid not in source_ids:
                issues.append(f"Claim references unknown source ID: {sid}")

    # Calculate evidence quality rubric
    total_critical = sum(1 for c in claims if c.get("critical", False))
    grounded_critical = sum(1 for c in claims if c.get("critical", False) and c.get("sourceIds"))
    critical_grounding_score = int((grounded_critical / max(total_critical, 1)) * 35)

    official_source_coverage = 25 if len(sources) >= 1 else 0
    completeness_score = min(int(len(steps) * 6), 20)
    freshness_score = 10
    consistency_score = 10 if not issues else 5

    total_score = min(
        100,
        critical_grounding_score + official_source_coverage + completeness_score + freshness_score + consistency_score
    )

    guide["evidenceQuality"] = {
        "score": total_score,
        "breakdown": {
            "criticalClaimGrounding": critical_grounding_score,
            "officialSourceCoverage": official_source_coverage,
            "completeness": completeness_score,
            "freshness": freshness_score,
            "consistency": consistency_score
        },
        "missingEvidence": issues
    }

    # Publication gate: Phase 1 MVP guides default to awaiting_review for safety
    passed = len(issues) == 0 and total_score >= 50
    return passed, total_score, issues

