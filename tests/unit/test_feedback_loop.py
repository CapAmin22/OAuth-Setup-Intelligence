import os
import unittest

class TestFeedbackLoop(unittest.TestCase):
    def setUp(self):
        self.repo_root = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
        self.feedback_widget_path = os.path.join(self.repo_root, "apps", "web", "src", "components", "GuideFeedbackWidget.tsx")
        self.feedback_store_path = os.path.join(self.repo_root, "apps", "web", "src", "lib", "feedbackStore.ts")
        self.reviewer_path = os.path.join(self.repo_root, "apps", "web", "src", "pages", "Reviewer.tsx")
        self.guide_path = os.path.join(self.repo_root, "apps", "web", "src", "pages", "Guide.tsx")
        self.feedback_page_path = os.path.join(self.repo_root, "apps", "web", "src", "pages", "Feedback.tsx")

    def test_feedback_widget_questions_and_ui(self):
        """Verify GuideFeedbackWidget contains 5-star UI, max-3 features question, improvement, and add/remove."""
        self.assertTrue(os.path.exists(self.feedback_widget_path), "GuideFeedbackWidget.tsx must exist")
        with open(self.feedback_widget_path, "r", encoding="utf-8") as f:
            content = f.read()

        # Primary Question & 5-Star UI
        self.assertIn("Was this OAuth runbook helpful?", content)
        self.assertIn("Rate", content)
        self.assertIn("Exceptional · Saved hours!", content)

        # Question 2: What helped them most (Max 3)
        self.assertIn("What helped you the most?", content)
        self.assertIn("Select up to 3", content)
        self.assertIn("Max 3 features allowed", content)

        # Question 3: Improvement feedback (1-2 lines)
        self.assertIn("Suggest an improvement", content)
        self.assertIn("1–2 lines", content)

        # Question 4: Add or remove (1-2 lines)
        self.assertIn("What can be added more, or removed?", content)

        # Submit
        self.assertIn("Submit Developer Feedback", content)

    def test_feedback_store_schema_and_methods(self):
        """Verify feedbackStore provides typed storage, stats calculation, and authentic data only."""
        self.assertTrue(os.path.exists(self.feedback_store_path), "feedbackStore.ts must exist")
        with open(self.feedback_store_path, "r", encoding="utf-8") as f:
            content = f.read()

        self.assertIn("FEEDBACK_FEATURE_OPTIONS", content)
        self.assertIn("saveDeveloperFeedback", content)
        self.assertIn("getDeveloperFeedbackList", content)
        self.assertIn("getFeedbackStats", content)
        self.assertIn("oauth_feedback_updated", content)
        # Ensure no fabricated or mock seed feedback exists
        self.assertNotIn("SEED_FEEDBACK", content)
        self.assertNotIn("fb-seed-", content.replace("!item.id.startsWith('fb-seed-')", ""))

    def test_admin_reviewer_authentic_empty_state(self):
        """Verify Reviewer.tsx contains clean, authentic empty state with zero fake data."""
        with open(self.reviewer_path, "r", encoding="utf-8") as f:
            content = f.read()

        self.assertIn("No Developer Feedback Recorded Yet", content)
        self.assertIn("All feedback in this console is 100% authentic with zero fabricated reviews", content)
        self.assertNotIn("DEFAULT_FEEDBACK", content)

    def test_guide_page_embeds_feedback_widget(self):
        """Verify Guide.tsx embeds GuideFeedbackWidget at the conclusion of the runbook."""
        with open(self.guide_path, "r", encoding="utf-8") as f:
            content = f.read()

        self.assertIn("GuideFeedbackWidget", content)
        self.assertIn("providerSlug={guide.providerSlug}", content)
        self.assertIn("providerName={guide.providerName}", content)

    def test_admin_reviewer_displays_developer_feedback(self):
        """Verify Admin Reviewer panel displays feedback ratings, stats, and individual responses."""
        with open(self.reviewer_path, "r", encoding="utf-8") as f:
            content = f.read()

        # Admin subtabs & KPI strip
        self.assertIn("Developer Feedback & Ratings", content)
        self.assertIn("Avg Satisfaction", content)
        self.assertIn("Reviews Logged", content)
        self.assertIn("Top Rated Capability", content)

        # Feedback content fields
        self.assertIn("Most Helpful Capabilities", content)
        self.assertIn("Suggested Improvement", content)
        self.assertIn("What to Add or Remove", content)

    def test_feedback_page_dual_modes(self):
        """Verify Feedback.tsx supports satisfaction ratings alongside documentation drift reports."""
        with open(self.feedback_page_path, "r", encoding="utf-8") as f:
            content = f.read()

        self.assertIn("GuideFeedbackWidget", content)
        self.assertIn("Rate Tool", content)
        self.assertIn("Report Documentation Drift", content)

if __name__ == "__main__":
    unittest.main()
