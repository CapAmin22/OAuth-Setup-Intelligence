import os
import json
import urllib.request
import urllib.error
from typing import Optional, Dict, Any, List

class DatabaseClient:
    def __init__(self, supabase_url: Optional[str] = None, service_key: Optional[str] = None):
        self.supabase_url = (supabase_url or os.getenv("SUPABASE_URL", "")).rstrip("/")
        self.service_key = service_key or os.getenv("SUPABASE_SERVICE_ROLE_KEY", "")
        self.headers = {
            "apikey": self.service_key,
            "Authorization": f"Bearer {self.service_key}",
            "Content-Type": "application/json",
            "Prefer": "return=representation"
        }

    def _request(self, endpoint: str, method: str = "GET", body: Optional[Any] = None) -> Any:
        url = f"{self.supabase_url}/rest/v1/{endpoint}"
        data = json.dumps(body).encode("utf-8") if body is not None else None
        req = urllib.request.Request(url, data=data, headers=self.headers, method=method)
        try:
            with urllib.request.urlopen(req, timeout=20) as resp:
                raw = resp.read().decode("utf-8")
                return json.loads(raw) if raw else None
        except urllib.error.HTTPError as e:
            err_msg = e.read().decode("utf-8")
            raise RuntimeError(f"Database error ({e.code}): {err_msg}")

    def claim_next_job(self, worker_id: str, lease_secs: int = 120) -> Optional[Dict[str, Any]]:
        url = f"{self.supabase_url}/rest/v1/rpc/claim_next_job"
        payload = {"p_worker_id": worker_id, "p_lease_secs": lease_secs}
        data = json.dumps(payload).encode("utf-8")
        req = urllib.request.Request(url, data=data, headers=self.headers, method="POST")
        try:
            with urllib.request.urlopen(req, timeout=20) as resp:
                res = json.loads(resp.read().decode("utf-8"))
                return res[0] if (res and isinstance(res, list)) else None
        except urllib.error.HTTPError as e:
            print("claim_next_job error:", e.read().decode("utf-8"))
            return None

    def renew_lease(self, job_id: str, worker_id: str, lease_secs: int = 120) -> bool:
        url = f"{self.supabase_url}/rest/v1/rpc/renew_job_lease"
        payload = {"p_job_id": job_id, "p_worker_id": worker_id, "p_lease_secs": lease_secs}
        data = json.dumps(payload).encode("utf-8")
        req = urllib.request.Request(url, data=data, headers=self.headers, method="POST")
        try:
            with urllib.request.urlopen(req, timeout=10) as resp:
                res = json.loads(resp.read().decode("utf-8"))
                return bool(res)
        except Exception:
            return False

    def update_job_state(
        self,
        job_id: str,
        state: str,
        checkpoint: Optional[Dict[str, Any]] = None,
        error_code: Optional[str] = None,
        error_detail: Optional[str] = None,
        result_id: Optional[str] = None
    ) -> None:
        url = f"{self.supabase_url}/rest/v1/rpc/update_job_state"
        payload = {
            "p_job_id": job_id,
            "p_state": state,
            "p_checkpoint": checkpoint,
            "p_error_code": error_code,
            "p_error_detail": error_detail,
            "p_result_id": result_id
        }
        data = json.dumps(payload).encode("utf-8")
        req = urllib.request.Request(url, data=data, headers=self.headers, method="POST")
        with urllib.request.urlopen(req, timeout=15) as resp:
            resp.read()

    def record_event(
        self,
        job_id: str,
        sequence: int,
        stage: str,
        event_type: str,
        safe_details: Optional[Dict[str, Any]] = None
    ) -> None:
        url = f"{self.supabase_url}/rest/v1/rpc/record_job_event"
        payload = {
            "p_job_id": job_id,
            "p_sequence": sequence,
            "p_stage": stage,
            "p_event_type": event_type,
            "p_safe_details": safe_details or {}
        }
        data = json.dumps(payload).encode("utf-8")
        req = urllib.request.Request(url, data=data, headers=self.headers, method="POST")
        try:
            with urllib.request.urlopen(req, timeout=10) as resp:
                resp.read()
        except Exception as e:
            print(f"record_event non-fatal error: {e}")

    def find_provider(self, slug: str) -> Optional[Dict[str, Any]]:
        res = self._request(f"providers?slug=eq.{slug}&select=*")
        return res[0] if res else None

    def upsert_provider(self, data: Dict[str, Any]) -> str:
        res = self._request("providers", method="POST", body=data)
        return res[0]["id"] if res else ""

    def persist_guide(self, guide_data: Dict[str, Any], provider_id: str) -> str:
        gv_payload = {
            "provider_id": provider_id,
            "version": guide_data.get("version", 1),
            "schema_version": "1.0",
            "status": "awaiting_review",
            "content": guide_data,
            "evidence_quality": guide_data.get("evidenceQuality"),
            "checked_at": guide_data.get("checkedAt")
        }
        res = self._request("guide_versions", method="POST", body=gv_payload)
        guide_id = res[0]["id"]

        # Insert sources
        src_payloads = []
        for s in guide_data.get("sources", []):
            src_payloads.append({
                "guide_version_id": guide_id,
                "final_url": s["url"],
                "publisher": s.get("publisher", "Official Docs"),
                "retrieved_at": s.get("retrievedAt"),
                "content_hash": s.get("contentHash", "sha256:generated"),
                "selected_passages": s.get("selectedPassages", [])
            })
        if src_payloads:
            self._request("sources", method="POST", body=src_payloads)

        # Insert claims
        claim_payloads = []
        for c in guide_data.get("claims", []):
            claim_payloads.append({
                "guide_version_id": guide_id,
                "claim_ref": c.get("id", "c1"),
                "text": c["text"],
                "context": c.get("context"),
                "evidence_status": c.get("evidenceStatus", "documented"),
                "critical": c.get("critical", False)
            })
        if claim_payloads:
            self._request("claims", method="POST", body=claim_payloads)

        return guide_id

