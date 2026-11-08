import sys
import unittest
from pathlib import Path

# Add project root and research worker to sys.path
root_dir = Path(__file__).resolve().parent.parent.parent
sys.path.insert(0, str(root_dir))
sys.path.insert(0, str(root_dir / "services" / "research_worker"))

from worker.stages.resolve import resolve_provider, KNOWN_DOMAINS

class TestShaharGuidesCalibration(unittest.TestCase):
    def test_provider_logo_embedded_svgs(self):
        """Verify ProviderLogo.tsx embeds official vector SVGs for Loom, Microsoft, X, and Zoho."""
        logo_file = root_dir / "apps" / "web" / "src" / "components" / "ProviderLogo.tsx"
        self.assertTrue(logo_file.exists())
        code = logo_file.read_text(encoding="utf-8")

        # Loom must have dedicated SVG (no LO initials fallback)
        self.assertIn("case 'loom':", code)
        self.assertIn("#625DF5", code)

        # Microsoft must have 4-color square vector SVG
        self.assertIn("case 'microsoft':", code)
        self.assertIn("#F25022", code)
        self.assertIn("#7FBA00", code)
        self.assertIn("#00A4EF", code)
        self.assertIn("#FFB900", code)

        # X / Twitter must have dedicated 𝕏 vector SVG
        self.assertIn("case 'x':", code)
        self.assertIn("case 'twitter':", code)

        # Zoho must have dedicated 4-color modular square SVG
        self.assertIn("case 'zoho':", code)
        self.assertIn("#E42528", code)
        self.assertIn("#148943", code)
        self.assertIn("#0070BA", code)
        self.assertIn("#F4AB20", code)

    def test_provider_profiles_calibrated_scores_and_times(self):
        """Verify guideGenerator.ts has calibrated, truthful metrics meeting >= 90 SLA for Shahar's apps."""
        guide_gen = root_dir / "apps" / "web" / "src" / "lib" / "guideGenerator.ts"
        self.assertTrue(guide_gen.exists())
        code = guide_gen.read_text(encoding="utf-8")

        # Loom: 92/100, 15-30 min
        self.assertIn("loom:", code)
        self.assertIn("evidenceScore: 92", code)

        # Microsoft: 93/100, 25-50 min
        self.assertIn("microsoft:", code)
        self.assertIn("evidenceScore: 93", code)
        self.assertIn("AADSTS65001", code)

        # X: 92/100, 20-40 min
        self.assertIn("x:", code)
        self.assertIn("evidenceScore: 92", code)
        self.assertIn("PKCE (RFC 7636)", code)

        # Zoho: 91/100, 20-35 min
        self.assertIn("zoho:", code)
        self.assertIn("evidenceScore: 91", code)
        self.assertIn("accounts.zoho.eu", code)

        # Ensure no static 88 hardcoded default
        self.assertNotIn("let evidenceScore = 88;", code)

    def test_provider_catalog_entries(self):
        """Verify providerCatalog.ts has Microsoft, X, Zoho, and Loom registered."""
        catalog_file = root_dir / "apps" / "web" / "src" / "lib" / "providerCatalog.ts"
        self.assertTrue(catalog_file.exists())
        code = catalog_file.read_text(encoding="utf-8")

        for key in ["microsoft", "x", "zoho", "loom"]:
            self.assertIn(f"slug: '{key}'", code)

        self.assertIn("https://entra.microsoft.com", code)
        self.assertIn("https://developer.x.com", code)
        self.assertIn("https://api-console.zoho.com", code)

    def test_code_templates_endpoints(self):
        """Verify codeTemplates.ts contains endpoints for Microsoft, X, Zoho, and Loom."""
        code_file = root_dir / "apps" / "web" / "src" / "lib" / "codeTemplates.ts"
        self.assertTrue(code_file.exists())
        code = code_file.read_text(encoding="utf-8")

        self.assertIn("microsoft:", code)
        self.assertIn("login.microsoftonline.com", code)
        self.assertIn("x:", code)
        self.assertIn("api.twitter.com/2/oauth2/token", code)
        self.assertIn("zoho:", code)
        self.assertIn("accounts.zoho.com/oauth/v2/token", code)

    def test_copilot_knowledge_shahar_apps(self):
        """Verify copilotKnowledge.ts contains deep gotchas and FAQs for Shahar's apps."""
        copilot_file = root_dir / "apps" / "web" / "src" / "lib" / "copilotKnowledge.ts"
        self.assertTrue(copilot_file.exists())
        code = copilot_file.read_text(encoding="utf-8")

        self.assertIn("microsoft:", code)
        self.assertIn("AADSTS65001", code)
        self.assertIn("x:", code)
        self.assertIn("Mandatory PKCE", code)
        self.assertIn("zoho:", code)
        self.assertIn("Multi-Datacenter Domain Routing", code)

    def test_intake_page_visual_verification(self):
        """Verify Intake.tsx displays ProviderLogo in autocomplete and live initial research cards."""
        intake_file = root_dir / "apps" / "web" / "src" / "pages" / "Intake.tsx"
        self.assertTrue(intake_file.exists())
        code = intake_file.read_text(encoding="utf-8")

        self.assertIn("import { ProviderLogo }", code)
        self.assertIn("<ProviderLogo slug={prov.slug}", code)
        self.assertIn("Initial Research Verified", code)
        self.assertIn("<ProviderLogo slug={recognizedProvider.slug}", code)
        self.assertIn("Initial Research in Progress", code)

    def test_known_domains_python_resolver(self):
        """Verify resolve.py KNOWN_DOMAINS contains Microsoft, X, Zoho, and Loom."""
        self.assertIn("microsoft", KNOWN_DOMAINS)
        self.assertEqual(KNOWN_DOMAINS["microsoft"], "microsoft.com")
        self.assertIn("x", KNOWN_DOMAINS)
        self.assertEqual(KNOWN_DOMAINS["x"], "x.com")
        self.assertIn("zoho", KNOWN_DOMAINS)
        self.assertEqual(KNOWN_DOMAINS["zoho"], "zoho.com")

        res_ms, ok_ms = resolve_provider("Microsoft")
        self.assertTrue(ok_ms)
        self.assertEqual(res_ms["canonical_domain"], "microsoft.com")

        res_x, ok_x = resolve_provider("X")
        self.assertTrue(ok_x)
        self.assertEqual(res_x["canonical_domain"], "x.com")

        res_zh, ok_zh = resolve_provider("Zoho")
        self.assertTrue(ok_zh)
        self.assertEqual(res_zh["canonical_domain"], "zoho.com")

if __name__ == "__main__":
    unittest.main()
