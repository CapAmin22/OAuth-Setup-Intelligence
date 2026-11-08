import sys
import unittest
from pathlib import Path

# Add project root to sys.path
root_dir = Path(__file__).resolve().parent.parent.parent
sys.path.insert(0, str(root_dir))

class TestIntakeAndGeneration(unittest.TestCase):
    def test_known_domains_and_portals(self):
        """Verify code templates and guide generator know official portals for dynamic services."""
        code_templates_file = root_dir / "apps" / "web" / "src" / "lib" / "codeTemplates.ts"
        self.assertTrue(code_templates_file.exists(), "codeTemplates.ts must exist")
        content = code_templates_file.read_text(encoding="utf-8")

        for key in ["airtable", "shopify", "supabase", "box", "asana"]:
            self.assertIn(f"{key}:", content, f"Provider {key} must have configured endpoints in codeTemplates.ts")
        self.assertIn("google-calendar", content)

    def test_quick_endpoints_card_portals(self):
        """Verify QuickEndpointsCard has direct console links for dynamic providers."""
        quick_card_file = root_dir / "apps" / "web" / "src" / "components" / "QuickEndpointsCard.tsx"
        self.assertTrue(quick_card_file.exists(), "QuickEndpointsCard.tsx must exist")
        content = quick_card_file.read_text(encoding="utf-8")

        for key in ["airtable", "shopify", "supabase", "box", "asana"]:
            self.assertIn(f"{key}:", content, f"Portal link for {key} must be defined in QuickEndpointsCard.tsx")
        self.assertIn("google-calendar", content)

    def test_intake_page_suggestions_and_shortcuts(self):
        """Verify Intake page contains popular suggestion chips and Cmd+Enter support."""
        intake_file = root_dir / "apps" / "web" / "src" / "pages" / "Intake.tsx"
        self.assertTrue(intake_file.exists(), "Intake.tsx must exist")
        content = intake_file.read_text(encoding="utf-8")

        self.assertIn("POPULAR_SUGGESTIONS", content)
        self.assertIn("Google Calendar", content)
        self.assertIn("Shopify", content)
        self.assertIn("customScopes", content)
        self.assertIn("metaKey", content)

if __name__ == "__main__":
    unittest.main()
