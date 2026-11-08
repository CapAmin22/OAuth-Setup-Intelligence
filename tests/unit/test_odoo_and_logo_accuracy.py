"""
Unit Tests for Odoo Integration, Brand Logo Accuracy, and Subdomain Normalization

Validates:
1. Accurate official vector brand marks in ProviderLogo.tsx (Odoo, Atlassian, Okta, Auth0, etc.)
2. Domain and subdomain normalization (docs.odoo.com -> odoo, odoo.com -> odoo)
3. Multi-CDN fallback chain (Google Favicon 128px + DuckDuckGo Favicon CDN)
4. Odoo grounded SLA-compliant calibration (evidence score >= 90)
5. Odoo code templates and Copilot knowledge resolution
6. Research worker resolve stage domain mapping
"""

import unittest
import os
import re

WEB_SRC_DIR = os.path.join(os.path.dirname(__file__), "..", "..", "apps", "web", "src")
WORKER_DIR = os.path.join(os.path.dirname(__file__), "..", "..", "services", "research_worker")


class TestOdooAndLogoAccuracy(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        logo_path = os.path.join(WEB_SRC_DIR, "components", "ProviderLogo.tsx")
        catalog_path = os.path.join(WEB_SRC_DIR, "lib", "providerCatalog.ts")
        guide_gen_path = os.path.join(WEB_SRC_DIR, "lib", "guideGenerator.ts")
        code_templates_path = os.path.join(WEB_SRC_DIR, "lib", "codeTemplates.ts")
        copilot_path = os.path.join(WEB_SRC_DIR, "lib", "copilotKnowledge.ts")
        resolve_path = os.path.join(WORKER_DIR, "worker", "stages", "resolve.py")

        with open(logo_path, "r", encoding="utf-8") as f:
            cls.logo_content = f.read()

        with open(catalog_path, "r", encoding="utf-8") as f:
            cls.catalog_content = f.read()

        with open(guide_gen_path, "r", encoding="utf-8") as f:
            cls.guide_gen_content = f.read()

        with open(code_templates_path, "r", encoding="utf-8") as f:
            cls.code_templates_content = f.read()

        with open(copilot_path, "r", encoding="utf-8") as f:
            cls.copilot_content = f.read()

        with open(resolve_path, "r", encoding="utf-8") as f:
            cls.resolve_content = f.read()

    def test_extract_base_slug_logic_in_provider_logo(self):
        """Ensure extractBaseSlug handles subdomains and TLD extensions."""
        self.assertIn("function extractBaseSlug(raw: string): string", self.logo_content)
        # Check that common subdomains are stripped
        self.assertIn("docs|api|app|developer|developers|login|console|accounts|auth|web|www", self.logo_content)

    def test_odoo_official_vector_logo_present(self):
        """Ensure Odoo vector SVG with authentic brand colors (#714B67 and #017E84) is embedded."""
        self.assertIn("case 'odoo':", self.logo_content)
        self.assertIn("#714B67", self.logo_content, "Odoo brand purple (#714B67) missing")
        self.assertIn("#017E84", self.logo_content, "Odoo brand teal (#017E84) missing")

    def test_top_developer_platform_logos_embedded(self):
        """Verify vector SVGs are embedded for top developer and SaaS platforms."""
        expected_platforms = [
            "atlassian", "jira", "okta", "auth0", "posthog", "paypal",
            "square", "quickbooks", "xero", "calendly", "linkedin",
            "reddit", "docusign", "clickup", "monday", "zendesk", "intercom"
        ]
        for platform in expected_platforms:
            self.assertIn(f"case '{platform}':", self.logo_content, f"Missing vector logo for {platform}")

    def test_direct_brand_keyword_resolution(self):
        """Ensure ProviderLogo resolves direct brand keywords (e.g. odoo, loom, airtable, etc.)."""
        self.assertIn("rawTarget.includes('odoo')", self.logo_content)
        self.assertIn("rawTarget.includes('loom')", self.logo_content)
        self.assertIn("rawTarget.includes('airtable')", self.logo_content)
        self.assertIn("rawTarget.includes('supabase')", self.logo_content)


    def test_multi_cdn_fallback_chain(self):
        """Verify fallback chain uses apex domain and DuckDuckGo Favicon CDN."""
        self.assertIn("google.com/s2/favicons", self.logo_content)
        self.assertIn("icons.duckduckgo.com/ip3", self.logo_content)
        self.assertIn("imgAttempt", self.logo_content)

    def test_odoo_in_provider_catalog(self):
        """Ensure Odoo is cataloged with canonicalDomain 'odoo.com' and OAuth endpoints."""
        self.assertIn("slug: 'odoo'", self.catalog_content)
        self.assertIn("canonicalDomain: 'odoo.com'", self.catalog_content)
        self.assertIn("https://www.odoo.com/web/oauth2/auth", self.catalog_content)
        self.assertIn("https://www.odoo.com/web/oauth2/token", self.catalog_content)

    def test_odoo_evidence_score_meets_sla(self):
        """Verify Odoo evidence score meets the >= 90 SLA."""
        match = re.search(r"odoo:\s*\{[^}]*evidenceScore:\s*(\d+)", self.guide_gen_content, re.DOTALL)
        self.assertIsNotNone(match, "Odoo profile not found in guideGenerator.ts")
        score = int(match.group(1))
        self.assertGreaterEqual(score, 90, f"Odoo evidence score {score} must be >= 90")
        self.assertEqual(score, 92, "Odoo evidence score should be 92")

    def test_odoo_calibration_routing(self):
        """Verify calibrateGuideMetrics routes odoo domains correctly."""
        self.assertIn("normSlug.includes('odoo')", self.guide_gen_content)

    def test_odoo_code_templates_endpoints(self):
        """Verify codeTemplates.ts contains odoo endpoints."""
        self.assertIn("odoo: {", self.code_templates_content)
        self.assertIn("https://www.odoo.com/web/oauth2/auth", self.code_templates_content)
        self.assertIn("https://www.odoo.com/web/oauth2/token", self.code_templates_content)

    def test_odoo_copilot_knowledge(self):
        """Verify copilotKnowledge.ts contains odoo problems and FAQs with sub-slug extraction."""
        self.assertIn("export function extractKnowledgeSlug", self.copilot_content)
        self.assertIn("odoo: {", self.copilot_content)
        self.assertIn("Multi-Database Routing", self.copilot_content)
        self.assertIn("OAuth Provider Module Activation", self.copilot_content)

    def test_research_worker_resolve_known_domains(self):
        """Verify KNOWN_DOMAINS in resolve.py includes odoo."""
        self.assertIn('"odoo": "odoo.com"', self.resolve_content)


if __name__ == "__main__":
    unittest.main()

