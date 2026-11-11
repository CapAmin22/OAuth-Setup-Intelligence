import { redactSensitiveData } from '../pages/Feedback';
import { supabase, isSupabaseConfigured } from './supabase';

export interface DeveloperFeedbackItem {
  id: string;
  rating: number; // 1 to 5 stars
  helpfulFeatures: string[]; // max 3 features selected
  improvementSuggestion?: string; // 1-2 lines on what to improve
  featureIdeas?: string; // 1-2 lines on what to add or remove
  providerSlug?: string;
  providerName?: string;
  developerName?: string;
  developerCompany?: string;
  developerRole?: string;
  developerEmail?: string;
  createdAt: string;
}

export const FEEDBACK_FEATURE_OPTIONS = [
  'Verified Endpoints & .env Exporter',
  'In-Context Copilot (⌘J)',
  'Interactive Step Checklist & Effort Timer',
  'Blocker Wizard (Wrong vs Fixed Diffs)',
  'Multi-Language Code Snippets (Node, Python, cURL)',
  'Autonomous Research for Unlisted APIs',
  'Redirect URI & PKCE Spec Warnings',
];

const FEEDBACK_STORAGE_KEY = 'oauth_developer_feedback_v2';

/**
 * Returns genuine, authentic developer feedback submitted by real users.
 * Never inserts or displays mock, seed, or fabricated data.
 */
export function getDeveloperFeedbackList(): DeveloperFeedbackItem[] {
  try {
    const raw = localStorage.getItem(FEEDBACK_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    // Strictly filter out any legacy synthetic/seed data
    return parsed.filter(
      (item) => item && typeof item.id === 'string' && !item.id.startsWith('fb-seed-')
    );
  } catch {
    return [];
  }
}

/**
 * Persists authentic developer feedback from live user interactions.
 */
export async function saveDeveloperFeedback(
  data: Omit<DeveloperFeedbackItem, 'id' | 'createdAt'>
): Promise<DeveloperFeedbackItem> {
  const sanitizedImprovement = data.improvementSuggestion
    ? redactSensitiveData(data.improvementSuggestion.trim())
    : undefined;
  const sanitizedIdeas = data.featureIdeas
    ? redactSensitiveData(data.featureIdeas.trim())
    : undefined;

  const newItem: DeveloperFeedbackItem = {
    id: `fb-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    rating: Math.max(1, Math.min(5, data.rating || 5)),
    helpfulFeatures: (data.helpfulFeatures || []).slice(0, 3),
    improvementSuggestion: sanitizedImprovement,
    featureIdeas: sanitizedIdeas,
    providerSlug: data.providerSlug || 'general',
    providerName: data.providerName || 'General',
    developerName: data.developerName?.trim() || 'Anonymous Developer',
    developerCompany: data.developerCompany?.trim() || 'Developer Project',
    developerRole: data.developerRole?.trim() || 'Software Engineer',
    developerEmail: data.developerEmail?.trim() || undefined,
    createdAt: new Date().toISOString(),
  };

  try {
    const existing = getDeveloperFeedbackList();
    const updated = [newItem, ...existing.filter((item) => item.id !== newItem.id)];
    localStorage.setItem(FEEDBACK_STORAGE_KEY, JSON.stringify(updated));

    // Also push to legacy list for backwards compatibility
    try {
      const rawLegacy = localStorage.getItem('oauth_feedback_list');
      const legacyList = rawLegacy ? JSON.parse(rawLegacy) : [];
      const cleanLegacy = Array.isArray(legacyList)
        ? legacyList.filter((item: any) => item && typeof item.id === 'string' && !item.id.startsWith('fb-seed-'))
        : [];
      cleanLegacy.unshift({
        id: newItem.id,
        provider: newItem.providerName,
        classification: 'developer_satisfaction',
        message: `[${newItem.rating}★ Rating] Features: ${newItem.helpfulFeatures.join(', ')} | Improvement: ${newItem.improvementSuggestion || 'None'} | Add/Remove: ${newItem.featureIdeas || 'None'}`,
        status: 'reviewed',
        createdAt: newItem.createdAt,
      });
      localStorage.setItem('oauth_feedback_list', JSON.stringify(cleanLegacy));
    } catch {}

    // Persist to Supabase if configured
    if (isSupabaseConfigured()) {
      try {
        await supabase.from('feedback').insert({
          redacted_message: `[${newItem.providerName} - ${newItem.rating} Stars] ${sanitizedImprovement || ''} | Ideas: ${sanitizedIdeas || ''}`,
          step_ref: newItem.helpfulFeatures.join(', '),
          classification: 'developer_feedback_v2',
        });
      } catch (dbErr) {
        console.warn('Supabase feedback insert non-fatal warning:', dbErr);
      }
    }

    // Trigger cross-component reactive update
    window.dispatchEvent(new CustomEvent('oauth_feedback_updated', { detail: newItem }));
  } catch (err) {
    console.warn('Error saving developer feedback:', err);
  }

  return newItem;
}

/**
 * Computes authentic statistics over real user submissions only.
 */
export function getFeedbackStats(items?: DeveloperFeedbackItem[]) {
  const list = items || getDeveloperFeedbackList();
  if (!list.length) {
    return {
      avgRating: null,
      totalCount: 0,
      featureCounts: {},
      topFeatures: [],
    };
  }

  const totalRating = list.reduce((acc, curr) => acc + (curr.rating || 5), 0);
  const avgRating = Number((totalRating / list.length).toFixed(1));

  const featureCounts: Record<string, number> = {};
  list.forEach((item) => {
    (item.helpfulFeatures || []).forEach((feat) => {
      featureCounts[feat] = (featureCounts[feat] || 0) + 1;
    });
  });

  const topFeatures = Object.entries(featureCounts)
    .map(([name, count]) => ({
      name,
      count,
      percentage: Math.round((count / list.length) * 100),
    }))
    .sort((a, b) => b.count - a.count);

  return {
    avgRating,
    totalCount: list.length,
    featureCounts,
    topFeatures,
  };
}
