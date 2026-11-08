import sys
import unittest
from pathlib import Path

# Add project root and research worker to sys.path
root_dir = Path(__file__).resolve().parent.parent.parent
sys.path.insert(0, str(root_dir))
sys.path.insert(0, str(root_dir / "services" / "research_worker"))

from worker.stages.resolve import resolve_provider, KNOWN_DOMAINS

class TestAppRecognitionAndFirewall(unittest.TestCase):
    def test_loom_resolution(self):
        """Verify that Loom is recognized with its official canonical domain."""
        res, ok = resolve_provider("Loom")
        self.assertTrue(ok)
        self.assertEqual(res["slug"], "loom")
        self.assertEqual(res["display_name"], "Loom")
        self.assertEqual(res["canonical_domain"], "loom.com")
        self.assertIn("loom.com", res["official_domains"])

    def test_contamination_firewall_drops_stale_supabase_url(self):
        """CRITICAL: If a user enters 'Loom' but has a stale 'supabase.com/docs' URL,
        the contamination firewall MUST discard the Supabase URL and use loom.com."""
        res, ok = resolve_provider("Loom", "https://supabase.com/docs/guides/auth/social-login")
        self.assertTrue(ok)
        self.assertEqual(res["slug"], "loom")
        self.assertEqual(res["canonical_domain"], "loom.com")
        self.assertNotIn("supabase.com", res["official_domains"])

    def test_compatible_domain_accepted(self):
        """Verify that legitimate developer subdomains are accepted."""
        res, ok = resolve_provider("Google Calendar", "https://developers.google.com/calendar/api")
        self.assertTrue(ok)
        self.assertEqual(res["slug"], "google-calendar")
        self.assertEqual(res["canonical_domain"], "developers.google.com")

    def test_unknown_app_with_mismatched_url_firewalled(self):
        """Verify an unknown app 'Acme' rejects a stale Supabase URL."""
        res, ok = resolve_provider("Acme", "https://supabase.com/docs")
        self.assertTrue(ok)
        self.assertEqual(res["slug"], "acme")
        self.assertEqual(res["canonical_domain"], "acme.com")
        self.assertNotIn("supabase.com", res["official_domains"])

    def test_provider_catalog_file(self):
        """Verify providerCatalog.ts has comprehensive catalog and search helpers."""
        catalog_file = root_dir / "apps" / "web" / "src" / "lib" / "providerCatalog.ts"
        self.assertTrue(catalog_file.exists(), "providerCatalog.ts must exist")
        content = catalog_file.read_text(encoding="utf-8")

        # Must contain Loom, Figma, Supabase, Canva, Miro
        for p in ["loom", "figma", "supabase", "canva", "miro", "stripe", "shopify"]:
            self.assertIn(f"slug: '{p}'", content, f"Provider {p} must be in POPULAR_PROVIDER_CATALOG")

        self.assertIn("https://docs.loom.com", content)
        self.assertIn("searchProviderCatalog", content)
        self.assertIn("resolveProviderFromCatalog", content)

    def test_guide_generator_contamination_firewall(self):
        """Verify guideGenerator.ts contains the contamination firewall and Loom profile."""
        guide_gen = root_dir / "apps" / "web" / "src" / "lib" / "guideGenerator.ts"
        self.assertTrue(guide_gen.exists())
        content = guide_gen.read_text(encoding="utf-8")

        self.assertIn("loom:", content)
        self.assertIn("domain: 'loom.com'", content)
        self.assertIn("resolveProviderFromCatalog", content)
        self.assertIn("safeWebsite = undefined", content)

    def test_intake_page_intelligence(self):
        """Verify Intake page contains live autocomplete, doc test link, and contamination firewall."""
        intake_file = root_dir / "apps" / "web" / "src" / "pages" / "Intake.tsx"
        self.assertTrue(intake_file.exists())
        content = intake_file.read_text(encoding="utf-8")

        self.assertIn("searchProviderCatalog", content)
        self.assertIn("resolveProviderFromCatalog", content)
        self.assertIn("isWebsiteCompatibleWithQuery", content)
        self.assertIn("Catalog Verified", content)
        self.assertIn("Test URL", content)
        self.assertIn("Test Official Doc", content)
        self.assertIn("name: 'Loom'", content)

if __name__ == "__main__":
    unittest.main()

