import unittest
from services.research_worker.worker.stages.resolve import resolve_provider
from services.research_worker.worker.stages.discover import is_safe_url
from services.research_worker.worker.stages.verify import verify_and_score

class TestWorkerPipeline(unittest.TestCase):
    def test_resolve_provider_query(self):
        info, ok = resolve_provider("Discord", "https://discord.com")
        self.assertTrue(ok)
        self.assertEqual(info["slug"], "discord")
        self.assertEqual(info["display_name"], "Discord")
        self.assertEqual(info["canonical_domain"], "discord.com")

    def test_ssrf_safety(self):
        self.assertFalse(is_safe_url("http://127.0.0.1:8080/admin"))
        self.assertFalse(is_safe_url("http://localhost:3000"))
        self.assertFalse(is_safe_url("http://192.168.1.1/secret"))
        self.assertFalse(is_safe_url("ftp://example.com"))
        self.assertTrue(is_safe_url("https://api.slack.com/legacy/oauth"))

    def test_verify_and_score(self):
        mock_guide = {
            "steps": [
                {"id": "s1", "title": "Step 1", "instructions": "Do this"}
            ],
            "claims": [
                {"id": "c1", "text": "Claim 1", "sourceIds": ["src-1"], "critical": True}
            ],
            "sources": [
                {"id": "src-1", "url": "https://example.com/docs"}
            ]
        }
        passed, score, issues = verify_and_score(mock_guide)
        self.assertIsInstance(score, int)
        self.assertGreater(score, 0)
        self.assertIn("evidenceQuality", mock_guide)

if __name__ == "__main__":
    unittest.main()

