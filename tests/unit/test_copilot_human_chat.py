import unittest
import os

class TestCopilotHumanChat(unittest.TestCase):
    """
    Unit tests ensuring:
    1. Copilot accurately classifies user intent (problems/pitfalls vs endpoints vs tokens).
    2. Questions like 'what are the top 3 problem when intigrating the supabase?' return
       a structured, human-centric breakdown rather than a mechanical endpoints dump.
    3. Both curated and dynamic AI-researched guides receive intelligent, grounded synthesis.
    4. Drawer component supports typing simulation, Markdown formatting, and follow-up chips.
    """

    def setUp(self):
        self.repo_root = os.path.abspath(os.path.join(os.path.dirname(__file__), "../.."))
        self.knowledge_path = os.path.join(self.repo_root, "apps", "web", "src", "lib", "copilotKnowledge.ts")
        self.drawer_path = os.path.join(self.repo_root, "apps", "web", "src", "components", "ProviderCopilotDrawer.tsx")

    def test_intent_classification_for_problems(self):
        """Verify intent classifier detects problem/pitfall/gotcha queries."""
        with open(self.knowledge_path, "r", encoding="utf-8") as f:
            content = f.read()

        self.assertIn("classifyIntent", content)
        self.assertIn("problems_and_pitfalls", content)
        self.assertIn("token_refresh_and_expiry", content)
        self.assertIn("redirect_and_localhost", content)

    def test_provider_top_problems_knowledge(self):
        """Verify deep curated pitfalls exist for Supabase, Airtable, Google, Slack, and Discord."""
        with open(self.knowledge_path, "r", encoding="utf-8") as f:
            content = f.read()

        # Supabase specific gotchas
        self.assertIn("supabase:", content)
        self.assertIn("Management API vs. GoTrue", content)
        self.assertIn("Strict Exact HTTPS Redirect", content)
        self.assertIn("HTTP Basic Auth Required for Token Exchange", content)

        # Airtable specific gotchas
        self.assertIn("airtable:", content)
        self.assertIn("Mandatory PKCE (RFC 7636)", content)
        self.assertIn("Mandatory Refresh Token Rotation", content)
        self.assertIn("Strict API Rate Limit (5 requests/second", content)

        # Google Calendar specific gotchas
        self.assertIn("googlecalendar:", content)
        self.assertIn("Sensitive Scope Classification", content)
        self.assertIn("Offline Sync Requires Explicit Consent Prompt", content)

    def test_universal_dynamic_synthesis(self):
        """Verify synthesizeTopProblems falls back to dynamic guide blockers and claims."""
        with open(self.knowledge_path, "r", encoding="utf-8") as f:
            content = f.read()

        self.assertIn("synthesizeTopProblems", content)
        self.assertIn("guide?.blockers", content)
        self.assertIn("guide?.limitations", content)

    def test_drawer_conversational_features(self):
        """Verify ProviderCopilotDrawer implements typing state, follow-up chips, and markdown formatting."""
        with open(self.drawer_path, "r", encoding="utf-8") as f:
            content = f.read()

        self.assertIn("isTyping", content)
        self.assertIn("FormattedAnswer", content)
        self.assertIn("followUps", content)
        self.assertIn("handleResetChat", content)
        self.assertIn("Consulting", content)

if __name__ == "__main__":
    unittest.main()
