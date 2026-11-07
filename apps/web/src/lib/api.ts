import { supabase, isSupabaseConfigured } from './supabase';
import { GuideVersion, Provider, GenerationJob } from '../types';

// Embedded fallback fixtures for instant loading
import googleFixture from '../../../../fixtures/google_oauth_guide.json';
import slackFixture from '../../../../fixtures/slack_oauth_guide.json';
import githubFixture from '../../../../fixtures/github_oauth_guide.json';
import notionFixture from '../../../../fixtures/notion_oauth_guide.json';
import salesforceFixture from '../../../../fixtures/salesforce_oauth_guide.json';

const FALLBACK_GUIDES: Record<string, GuideVersion> = {
  google: googleFixture as unknown as GuideVersion,
  slack: slackFixture as unknown as GuideVersion,
  github: githubFixture as unknown as GuideVersion,
  notion: notionFixture as unknown as GuideVersion,
  salesforce: salesforceFixture as unknown as GuideVersion,
};

const FALLBACK_PROVIDERS: Provider[] = [
  { id: 'p-google', slug: 'google', displayName: 'Google', isCurated: true, canonicalDomain: 'accounts.google.com', aliases: ['google identity'], officialDomains: ['developers.google.com'], createdAt: '2026-11-07T00:00:00Z', logoUrl: 'https://www.google.com/favicon.ico' },
  { id: 'p-slack', slug: 'slack', displayName: 'Slack', isCurated: true, canonicalDomain: 'slack.com', aliases: ['slack api'], officialDomains: ['api.slack.com'], createdAt: '2026-11-07T00:00:00Z', logoUrl: 'https://a.slack-edge.com/80588/marketing/img/meta/favicon-32.png' },
  { id: 'p-github', slug: 'github', displayName: 'GitHub', isCurated: true, canonicalDomain: 'github.com', aliases: ['gh'], officialDomains: ['docs.github.com'], createdAt: '2026-11-07T00:00:00Z', logoUrl: 'https://github.githubassets.com/favicons/favicon.svg' },
  { id: 'p-notion', slug: 'notion', displayName: 'Notion', isCurated: true, canonicalDomain: 'api.notion.com', aliases: ['notion api'], officialDomains: ['developers.notion.com'], createdAt: '2026-11-07T00:00:00Z', logoUrl: 'https://www.notion.so/images/favicon.ico' },
  { id: 'p-salesforce', slug: 'salesforce', displayName: 'Salesforce', isCurated: true, canonicalDomain: 'login.salesforce.com', aliases: ['sfdc'], officialDomains: ['developer.salesforce.com'], createdAt: '2026-11-07T00:00:00Z', logoUrl: 'https://www.salesforce.com/favicon.ico' },
];

export async function fetchProviders(): Promise<Provider[]> {
  if (!isSupabaseConfigured()) {
    return FALLBACK_PROVIDERS;
  }
  try {
    const { data, error } = await supabase
      .from('providers')
      .select('*')
      .order('is_curated', { ascending: false });

    if (error || !data || data.length === 0) {
      return FALLBACK_PROVIDERS;
    }
    return data.map((d) => ({
      id: d.id,
      slug: d.slug,
      displayName: d.display_name,
      canonicalDomain: d.canonical_domain,
      aliases: d.aliases || [],
      officialDomains: d.official_domains || [],
      isCurated: d.is_curated,
      logoUrl: d.logo_url,
      createdAt: d.created_at,
    }));
  } catch (err) {
    console.warn('Using fallback providers:', err);
    return FALLBACK_PROVIDERS;
  }
}

export async function fetchGuide(slug: string): Promise<GuideVersion | null> {
  const normalizedSlug = slug.toLowerCase().trim();

  if (isSupabaseConfigured()) {
    try {
      const { data: prov } = await supabase
        .from('providers')
        .select('id')
        .eq('slug', normalizedSlug)
        .maybeSingle();

      if (prov) {
        const { data: gv } = await supabase
          .from('guide_versions')
          .select('content')
          .eq('provider_id', prov.id)
          .eq('status', 'published')
          .order('version', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (gv && gv.content) {
          return gv.content as GuideVersion;
        }
      }
    } catch (e) {
      console.warn('Falling back to local fixture for guide:', normalizedSlug, e);
    }
  }

  return FALLBACK_GUIDES[normalizedSlug] || null;
}

export async function fetchAllGuides(): Promise<GuideVersion[]> {
  if (isSupabaseConfigured()) {
    try {
      const { data } = await supabase
        .from('guide_versions')
        .select('content')
        .eq('status', 'published')
        .order('published_at', { ascending: false });

      if (data && data.length > 0) {
        return data.map((d) => d.content as GuideVersion);
      }
    } catch (e) {
      console.warn('Falling back to local fixtures for all guides:', e);
    }
  }

  return Object.values(FALLBACK_GUIDES);
}

export async function enqueueJob(
  query: string,
  website?: string,
  intent?: Record<string, any>
): Promise<{ jobId: string; state: string }> {
  if (isSupabaseConfigured()) {
    const { data, error } = await supabase.rpc('enqueue_generation_job', {
      p_query: query,
      p_website: website || null,
      p_intent: intent || {},
    });

    if (!error && data) {
      return { jobId: data.job_id, state: data.state };
    }
  }

  // Simulated job if unauthenticated or offline
  const mockId = 'mock-' + Math.random().toString(36).substring(2, 9);
  return { jobId: mockId, state: 'resolving' };
}

export async function fetchJob(jobId: string): Promise<GenerationJob | null> {
  if (isSupabaseConfigured()) {
    const { data } = await supabase
      .from('generation_jobs')
      .select('*')
      .eq('id', jobId)
      .maybeSingle();

    if (data) {
      return {
        id: data.id,
        ownerId: data.owner_id,
        idempotencyKey: data.idempotency_key,
        state: data.state,
        input: data.input,
        resultGuideId: data.result_guide_id,
        attempt: data.attempt,
        checkpoint: data.checkpoint,
        errorCode: data.error_code,
        errorDetail: data.error_detail,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
      };
    }
  }

  return null;
}
