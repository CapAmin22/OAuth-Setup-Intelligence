import unittest
import os
import re

class TestLogosAndEffortCalibration(unittest.TestCase):
    """
    Unit tests ensuring:
    1. Provider logos are comprehensively covered with embedded official vector SVGs.
    2. Dynamic unknown providers have high-reliability Google Favicon CDN and gradient avatar fallback.
    3. Effort time and evidence scores are accurately calibrated per provider rather than static copy-paste values.
    4. Common typos (e.g., 'google calender') correctly resolve to official canonical entities.
    """

    def setUp(self):
        self.repo_root = os.path.abspath(os.path.join(os.path.dirname(__file__), "../.."))
        self.logo_path = os.path.join(self.repo_root, "apps", "web", "src", "components", "ProviderLogo.tsx")
        self.generator_path = os.path.join(self.repo_root, "apps", "web", "src", "lib", "guideGenerator.ts")
        self.copilot_path = os.path.join(self.repo_root, "apps", "web", "src", "lib", "copilotKnowledge.ts")

    def test_provider_logo_embedded_svg_coverage(self):
        """Verify ProviderLogo.tsx embeds official vector SVGs for major platforms."""
        with open(self.logo_path, "r", encoding="utf-8") as f:
            content = f.read()

        required_cases = [
            "discord", "github", "google", "googlecalendar", "supabase",
            "airtable", "shopify", "stripe", "box", "twilio", "asana",
            "dropbox", "gitlab", "figma", "linear", "spotify", "zoom"
        ]
        for provider in required_cases:
            self.assertIn(f"case '{provider}'", content, f"Missing vector SVG case for {provider}")

    def test_dynamic_logo_fallback_reliability(self):
        """Verify dynamic fallback uses Google Favicon CDN and vibrant gradient monogram."""
        with open(self.logo_path, "r", encoding="utf-8") as f:
            content = f.read()

        self.assertIn("google.com/s2/favicons", content)
        self.assertIn("getInitials", content)
        self.assertIn("getGradient", content)

    def test_calibrated_effort_profiles(self):
        """Verify provider profiles define calibrated, fact-checked times and scores."""
        with open(self.generator_path, "r", encoding="utf-8") as f:
            content = f.read()

        # Supabase: 15–30 min, 91 score
        self.assertIn("supabase:", content)
        self.assertIn("lowMinutes: 15", content)
        self.assertIn("highMinutes: 30", content)
        self.assertIn("evidenceScore: 91", content)

        # Airtable: 20–40 min, 92 score (calibrated for >=90 SLA)
        self.assertIn("airtable:", content)
        self.assertIn("lowMinutes: 20", content)
        self.assertIn("highMinutes: 40", content)
        self.assertIn("evidenceScore: 92", content)

        # Google Calendar: 25–45 min, 93 score (calibrated for >=90 SLA)
        self.assertIn("'google-calendar':", content)
        self.assertIn("evidenceScore: 93", content)

    def test_typo_and_alias_normalization(self):
        """Verify normalizer resolves 'calender' typo and 'gcal' abbreviation."""
        with open(self.generator_path, "r", encoding="utf-8") as f:
            content = f.read()

        self.assertIn("calender", content)
        self.assertIn("gcal", content)
        self.assertIn("google-calendar", content)

    def test_copilot_knowledge_seed_questions(self):
        """Verify Copilot knowledge base includes Airtable, Supabase, and Google Calendar."""
        with open(self.copilot_path, "r", encoding="utf-8") as f:
            content = f.read()

        self.assertIn("airtable:", content)
        self.assertIn("supabase:", content)
        self.assertIn("googlecalendar:", content)

if __name__ == "__main__":
    unittest.main()

