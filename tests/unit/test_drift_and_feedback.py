import unittest
import hashlib
from services.research_worker.worker.stages.drift import audit_source_drift

class TestDriftAndFeedback(unittest.TestCase):
    def test_hash_drift_detection(self):
        content = "Original OAuth 2.0 authorization endpoint: https://example.com/oauth/authorize"
        original_hash = "sha256:" + hashlib.sha256(content.encode("utf-8")).hexdigest()

        class MockTavilyFresh:
            def extract(self, urls):
                return [{"raw_content": content}]

        fresh, h, drift = audit_source_drift("https://example.com/docs", original_hash, MockTavilyFresh())
        self.assertTrue(fresh)
        self.assertEqual(drift, 0.0)
        self.assertEqual(h, original_hash)

        class MockTavilyChanged:
            def extract(self, urls):
                return [{"raw_content": "Altered content v2"}]

        fresh2, h2, drift2 = audit_source_drift("https://example.com/docs", original_hash, MockTavilyChanged())
        self.assertFalse(fresh2)
        self.assertEqual(drift2, 100.0)
        self.assertNotEqual(h2, original_hash)

    def test_secret_redaction_patterns(self):
        import re
        def redact(text):
            return re.sub(
                r'(client_secret|clientsecret|secret|password|bearer|api_key|apikey|token)[=:\s]+[A-Za-z0-9_\-\.]{8,}',
                r'\1=[REDACTED]',
                text,
                flags=re.IGNORECASE
            )

        sample = "Error with client_secret=GOCSPX-abc123secret999 during token exchange"
        redacted = redact(sample)
        self.assertNotIn("GOCSPX-abc123secret999", redacted)
        self.assertIn("client_secret=[REDACTED]", redacted)

if __name__ == "__main__":
    unittest.main()

