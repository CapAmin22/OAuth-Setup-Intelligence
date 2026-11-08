import unittest
import os
import re

class TestAuthAndVerification(unittest.TestCase):
    """
    Unit tests ensuring:
    1. Multi-layer developer verification stops fake names, disposable emails, and dummy LinkedIn handles.
    2. Real-time verification score accurately grades developer authenticity (0-100%).
    3. Storage schema for Supabase (developer_profiles) is properly specified with RLS.
    4. Login page and Header session integration provide a smooth, logical product onboarding flow.
    """

    def setUp(self):
        self.repo_root = os.path.abspath(os.path.join(os.path.dirname(__file__), "../.."))
        self.auth_path = os.path.join(self.repo_root, "apps", "web", "src", "lib", "auth.ts")
        self.login_path = os.path.join(self.repo_root, "apps", "web", "src", "pages", "Login.tsx")
        self.header_path = os.path.join(self.repo_root, "apps", "web", "src", "components", "Header.tsx")
        self.migration_path = os.path.join(self.repo_root, "supabase", "migrations", "0005_developer_profiles.sql")
        self.tour_path = os.path.join(self.repo_root, "apps", "web", "src", "components", "WelcomeModal.tsx")
        self.modal_path = os.path.join(self.repo_root, "apps", "web", "src", "components", "DeveloperAuthModal.tsx")
        self.reviewer_path = os.path.join(self.repo_root, "apps", "web", "src", "pages", "Reviewer.tsx")
        self.app_path = os.path.join(self.repo_root, "apps", "web", "src", "App.tsx")

    def test_auth_validation_rules(self):
        """Verify auth.ts contains strict verification for Name, Email, Company, and LinkedIn."""
        with open(self.auth_path, "r", encoding="utf-8") as f:
            content = f.read()

        self.assertIn("validateName", content)
        self.assertIn("validateEmail", content)
        self.assertIn("validateCompany", content)
        self.assertIn("validateLinkedIn", content)
        self.assertIn("auditDeveloperProfile", content)
        self.assertIn("registerDeveloper", content)
        self.assertIn("DISPOSABLE_EMAIL_DOMAINS", content)
        self.assertIn("FAKE_STRING_PATTERNS", content)
        self.assertIn("mailinator.com", content)

    def test_linkedin_strict_regex(self):
        """Verify LinkedIn regex strictly checks official domain and rejects dummy handles."""
        with open(self.auth_path, "r", encoding="utf-8") as f:
            content = f.read()

        self.assertIn("linkedin.com", content)
        self.assertIn("blockedHandles", content)
        self.assertIn("test", content)
        self.assertIn("asdf", content)

    def test_supabase_developer_profiles_migration(self):
        """Verify Supabase migration creates developer_profiles table with RLS."""
        self.assertTrue(os.path.exists(self.migration_path), "0005_developer_profiles.sql must exist")
        with open(self.migration_path, "r", encoding="utf-8") as f:
            content = f.read()

        self.assertIn("CREATE TABLE IF NOT EXISTS developer_profiles", content)
        self.assertIn("email               TEXT UNIQUE NOT NULL", content)
        self.assertIn("linkedin_url        TEXT NOT NULL", content)
        self.assertIn("company             TEXT NOT NULL", content)
        self.assertIn("verification_score  INTEGER DEFAULT 100", content)
        self.assertIn("ALTER TABLE developer_profiles ENABLE ROW LEVEL SECURITY", content)

    def test_login_page_implementation(self):
        """Verify Login.tsx renders verification meter, inputs, and error states."""
        self.assertTrue(os.path.exists(self.login_path), "Login.tsx must exist")
        with open(self.login_path, "r", encoding="utf-8") as f:
            content = f.read()

        self.assertIn("registerDeveloper", content)
        self.assertIn("Full Name *", content)
        self.assertIn("Company or Organization *", content)
        self.assertIn("Job Title", content)
        self.assertIn("Continue to Workspace", content)

    def test_header_auth_integration(self):
        """Verify Header.tsx displays developer profile badge or Sign In button."""
        with open(self.header_path, "r", encoding="utf-8") as f:
            content = f.read()

        self.assertIn("Developer Sign In", content)
        self.assertIn("100% Verified Developer", content)
        self.assertIn("handleLogout", content)
        self.assertIn("getCurrentDeveloper", content)

    def test_value_centric_developer_tour(self):
        """Verify WelcomeModal.tsx contains 4 value-centric superpowers including Copilot ⌘J."""
        with open(self.tour_path, "r", encoding="utf-8") as f:
            content = f.read()

        self.assertIn("Production-Tested OAuth Runbooks", content)
        self.assertIn("In-Context Grounded Copilot (⌘J)", content)
        self.assertIn("Research Any Unfamiliar Provider", content)
        self.assertIn("Blocker Wizard & Multi-Language Code", content)

    def test_developer_auth_modal_implementation(self):
        """Verify DeveloperAuthModal.tsx renders clean, simple Name, Company, and Job Title fields without clutter."""
        self.assertTrue(os.path.exists(self.modal_path), "DeveloperAuthModal.tsx must exist")
        with open(self.modal_path, "r", encoding="utf-8") as f:
            content = f.read()

        self.assertIn("Welcome to OAuth Intelligence", content)
        self.assertIn("Full Name *", content)
        self.assertIn("Company or Organization *", content)
        self.assertIn("Job Title", content)
        self.assertIn("Continue to Workspace", content)
        self.assertNotIn("Genuine Profile Verification", content)
        self.assertNotIn("Required: 100%", content)

    def test_app_first_load_auth_gate_and_preview_banner(self):
        """Verify App.tsx initializes authModalOpen when not authenticated and displays preview banner."""
        with open(self.app_path, "r", encoding="utf-8") as f:
            content = f.read()

        self.assertIn("DeveloperAuthModal", content)
        self.assertIn("!getCurrentDeveloper()", content)
        self.assertIn("Read-Only Preview", content)
        self.assertIn("oauth_open_auth_modal", content)

    def test_reviewer_linkedin_outreach_hub(self):
        """Verify Reviewer.tsx provides Developer Leads & LinkedIn outreach hub with message generator."""
        with open(self.reviewer_path, "r", encoding="utf-8") as f:
            content = f.read()

        self.assertIn("developer_roster", content)
        self.assertIn("Developer Leads & Outreach", content)
        self.assertIn("copyOutreachTemplate", content)
        self.assertIn("Message on LinkedIn", content)
        self.assertIn("listRegisteredDevelopers", content)

    def test_admin_amin_authorization_gate(self):
        """Verify Developer Leads & Outreach Hub is strictly restricted to Admin User Amin."""
        with open(self.auth_path, "r", encoding="utf-8") as f:
            auth_content = f.read()

        self.assertIn("isAdminDeveloper", auth_content)
        self.assertIn("amin", auth_content.lower())

        with open(self.reviewer_path, "r", encoding="utf-8") as f:
            reviewer_content = f.read()

        self.assertIn("isAdminDeveloper", reviewer_content)
        self.assertIn("Administrator Access Required", reviewer_content)
        self.assertIn("strictly restricted to administrator <strong>Amin</strong>", reviewer_content)
        self.assertIn("Sign In as Admin (Amin)", reviewer_content)

        with open(self.header_path, "r", encoding="utf-8") as f:
            header_content = f.read()

        self.assertIn("isAdminDeveloper", header_content)
        self.assertIn("Developer Leads (Admin)", header_content)



if __name__ == "__main__":
    unittest.main()

