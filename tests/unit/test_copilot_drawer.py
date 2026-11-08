import sys
import unittest
from pathlib import Path

root_dir = Path(__file__).resolve().parent.parent.parent
sys.path.insert(0, str(root_dir))

class TestCopilotDrawer(unittest.TestCase):
    def test_copilot_knowledge_base(self):
        """Verify grounded Q&A knowledge exists with zero-hallucination RFC parameters."""
        knowledge_file = root_dir / "apps" / "web" / "src" / "lib" / "copilotKnowledge.ts"
        self.assertTrue(knowledge_file.exists(), "copilotKnowledge.ts must exist")
        content = knowledge_file.read_text(encoding="utf-8")

        # Required provider knowledge
        for prov in ["google", "discord", "slack", "github", "spotify", "linear", "notion", "zoom"]:
            self.assertIn(f"{prov}:", content, f"Provider {prov} must be present in PROVIDER_SEED_FAQS")

        # Crucial RFC / OAuth parameters
        self.assertIn("access_type=offline", content, "Google refresh token param must be documented")
        self.assertIn("prompt=consent", content, "Google consent prompt param must be documented")
        self.assertIn("xoxb-", content, "Slack bot token prefix must be documented")
        self.assertIn("xoxp-", content, "Slack user token prefix must be documented")
        self.assertIn("code_challenge", content, "Discord PKCE must be documented")
        self.assertIn("Basic", content, "Spotify / Notion Basic Auth must be documented")

    def test_copilot_drawer_component(self):
        """Verify ProviderCopilotDrawer has slide-over structure, pills, and copy actions."""
        drawer_file = root_dir / "apps" / "web" / "src" / "components" / "ProviderCopilotDrawer.tsx"
        self.assertTrue(drawer_file.exists(), "ProviderCopilotDrawer.tsx must exist")
        content = drawer_file.read_text(encoding="utf-8")

        self.assertIn("ProviderCopilotDrawer", content)
        self.assertIn("seedFaqs", content)
        self.assertIn("handleCopyCode", content)
        self.assertIn("sourceUrl", content)
        self.assertIn("Escape", content)

    def test_guide_integration(self):
        """Verify Guide.tsx integrates ProviderCopilotDrawer and keyboard shortcut."""
        guide_file = root_dir / "apps" / "web" / "src" / "pages" / "Guide.tsx"
        self.assertTrue(guide_file.exists(), "Guide.tsx must exist")
        content = guide_file.read_text(encoding="utf-8")

        self.assertIn("ProviderCopilotDrawer", content)
        self.assertIn("copilotOpen", content)
        self.assertIn("Ask", content)
        self.assertIn("⌘J", content)

if __name__ == "__main__":
    unittest.main()
