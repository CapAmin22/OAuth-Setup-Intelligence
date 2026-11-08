import { supabase, isSupabaseConfigured } from './supabase';
import { GuideVersion, Provider, GenerationJob } from '../types';
import { calibrateGuideMetrics } from './guideGenerator';

// Embedded fallback fixtures for instant loading
import googleFixture from '../../../../fixtures/google_oauth_guide.json';
import slackFixture from '../../../../fixtures/slack_oauth_guide.json';
import githubFixture from '../../../../fixtures/github_oauth_guide.json';
import notionFixture from '../../../../fixtures/notion_oauth_guide.json';
import salesforceFixture from '../../../../fixtures/salesforce_oauth_guide.json';
import discordFixture from '../../../../fixtures/discord_oauth_guide.json';
import spotifyFixture from '../../../../fixtures/spotify_oauth_guide.json';
import linearFixture from '../../../../fixtures/linear_oauth_guide.json';
import hubspotFixture from '../../../../fixtures/hubspot_oauth_guide.json';
import zoomFixture from '../../../../fixtures/zoom_oauth_guide.json';

const CUSTOM_GUIDES_KEY = 'oauth_custom_guides';
const CUSTOM_PROVIDERS_KEY = 'oauth_custom_providers';

const FALLBACK_GUIDES: Record<string, GuideVersion> = {
  google: googleFixture as unknown as GuideVersion,
  slack: slackFixture as unknown as GuideVersion,
  github: githubFixture as unknown as GuideVersion,
  notion: notionFixture as unknown as GuideVersion,
  salesforce: salesforceFixture as unknown as GuideVersion,
  discord: discordFixture as unknown as GuideVersion,
  spotify: spotifyFixture as unknown as GuideVersion,
  linear: linearFixture as unknown as GuideVersion,
  hubspot: hubspotFixture as unknown as GuideVersion,
  zoom: zoomFixture as unknown as GuideVersion,
};

const FALLBACK_PROVIDERS: Provider[] = [
  { id: 'p-google', slug: 'google', displayName: 'Google', isCurated: true, canonicalDomain: 'accounts.google.com', aliases: ['google identity', 'gsuite'], officialDomains: ['developers.google.com'], createdAt: '2026-11-07T00:00:00Z', logoUrl: 'https://www.google.com/favicon.ico' },
  { id: 'p-slack', slug: 'slack', displayName: 'Slack', isCurated: true, canonicalDomain: 'slack.com', aliases: ['slack api', 'slack bot'], officialDomains: ['api.slack.com'], createdAt: '2026-11-07T00:00:00Z', logoUrl: 'https://a.slack-edge.com/80588/marketing/img/meta/favicon-32.png' },
  { id: 'p-github', slug: 'github', displayName: 'GitHub', isCurated: true, canonicalDomain: 'github.com', aliases: ['gh', 'github apps'], officialDomains: ['docs.github.com'], createdAt: '2026-11-07T00:00:00Z', logoUrl: 'https://github.githubassets.com/favicons/favicon.svg' },
  { id: 'p-notion', slug: 'notion', displayName: 'Notion', isCurated: true, canonicalDomain: 'api.notion.com', aliases: ['notion api', 'notion integrations'], officialDomains: ['developers.notion.com'], createdAt: '2026-11-07T00:00:00Z', logoUrl: 'https://www.notion.so/images/favicon.ico' },
  { id: 'p-salesforce', slug: 'salesforce', displayName: 'Salesforce', isCurated: true, canonicalDomain: 'login.salesforce.com', aliases: ['sfdc', 'connected apps'], officialDomains: ['developer.salesforce.com'], createdAt: '2026-11-07T00:00:00Z', logoUrl: 'https://www.salesforce.com/favicon.ico' },
  { id: 'p-discord', slug: 'discord', displayName: 'Discord', isCurated: true, canonicalDomain: 'discord.com', aliases: ['discord bot', 'discord api'], officialDomains: ['discord.com/developers/docs'], createdAt: '2026-11-07T00:00:00Z', logoUrl: 'https://discord.com/favicon.ico' },
  { id: 'p-spotify', slug: 'spotify', displayName: 'Spotify', isCurated: true, canonicalDomain: 'spotify.com', aliases: ['spotify web api', 'spotify pkce'], officialDomains: ['developer.spotify.com'], createdAt: '2026-11-07T00:00:00Z', logoUrl: 'https://developer.spotify.com/favicon.ico' },
  { id: 'p-linear', slug: 'linear', displayName: 'Linear', isCurated: true, canonicalDomain: 'linear.app', aliases: ['linear api', 'linear app'], officialDomains: ['developers.linear.app'], createdAt: '2026-11-07T00:00:00Z', logoUrl: 'https://linear.app/favicon.ico' },
  { id: 'p-hubspot', slug: 'hubspot', displayName: 'HubSpot', isCurated: true, canonicalDomain: 'hubspot.com', aliases: ['hubspot api', 'hubspot crm'], officialDomains: ['developers.hubspot.com'], createdAt: '2026-11-07T00:00:00Z', logoUrl: 'https://static.hsappstatic.net/StyleGuideUI/static-1.428/img/sprocket-favicon.ico' },
  { id: 'p-zoom', slug: 'zoom', displayName: 'Zoom', isCurated: true, canonicalDomain: 'zoom.us', aliases: ['zoom marketplace', 'zoom api'], officialDomains: ['developers.zoom.us'], createdAt: '2026-11-07T00:00:00Z', logoUrl: 'https://marketplace.zoom.us/favicon.ico' },
];

function getLocalProviders(): Provider[] {
  try {
    const raw = localStorage.getItem(CUSTOM_PROVIDERS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function getLocalGuides(): Record<string, GuideVersion> {
  try {
    const raw = localStorage.getItem(CUSTOM_GUIDES_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function saveCustomGuide(rawGuide: GuideVersion, provider: Provider): void {
  const guide = calibrateGuideMetrics(rawGuide);
  try {
    // 1. Save provider to localStorage
    const providers = getLocalProviders();
    const existingPIdx = providers.findIndex((p) => p.slug === provider.slug);
    if (existingPIdx >= 0) {
      providers[existingPIdx] = provider;
    } else {
      providers.unshift(provider);
    }
    localStorage.setItem(CUSTOM_PROVIDERS_KEY, JSON.stringify(providers));

    // 2. Save guide to localStorage under multiple keys for resilient retrieval
    const guides = getLocalGuides();
    guides[guide.providerSlug] = guide;
    if (provider.canonicalDomain) {
      guides[provider.canonicalDomain.toLowerCase()] = guide;
    }
    if (guide.providerName) {
      guides[guide.providerName.toLowerCase()] = guide;
    }
    localStorage.setItem(CUSTOM_GUIDES_KEY, JSON.stringify(guides));

    // Notify any active components about updated custom guide
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('oauth_custom_guide_saved', { detail: { slug: provider.slug } }));
    }

    // 3. Attempt to save to Supabase (non-blocking)
    if (isSupabaseConfigured()) {
      (async () => {
        try {
          // Attempt stored procedure first
          const { error: rpcErr } = await supabase.rpc('save_researched_guide', {
            p_slug: provider.slug,
            p_display_name: provider.displayName,
            p_canonical_domain: provider.canonicalDomain,
            p_aliases: provider.aliases,
            p_official_domains: provider.officialDomains,
            p_content: guide,
            p_evidence_quality: guide.evidenceQuality || {},
          });

          if (rpcErr) {
            // Fallback to direct table upsert
            await supabase.from('providers').upsert({
              slug: provider.slug,
              display_name: provider.displayName,
              canonical_domain: provider.canonicalDomain,
              aliases: provider.aliases,
              official_domains: provider.officialDomains,
              is_curated: false,
              logo_url: provider.logoUrl,
            }, { onConflict: 'slug' });

            const { data: prov } = await supabase
              .from('providers')
              .select('id')
              .eq('slug', provider.slug)
              .maybeSingle();

            if (prov) {
              await supabase.from('guide_versions').upsert({
                provider_id: prov.id,
                version: guide.version,
                schema_version: '1.0',
                status: 'published',
                content: guide,
                evidence_quality: guide.evidenceQuality,
                checked_at: guide.checkedAt,
              }, { onConflict: 'provider_id,version' });
            }
          }
          console.log('Successfully synced guide to Supabase:', provider.slug);
        } catch (err) {
          console.warn('Could not sync to remote Supabase (using localStorage):', err);
        }
      })();
    }
  } catch (e) {
    console.error('Failed to save custom guide:', e);
  }
}

export async function fetchProviders(): Promise<Provider[]> {
  const localProviders = getLocalProviders();
  let baseProviders = FALLBACK_PROVIDERS;

  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase
        .from('providers')
        .select('*')
        .order('is_curated', { ascending: false });

      if (!error && data && data.length > 0) {
        baseProviders = data.map((d) => ({
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
      }
    } catch (err) {
      console.warn('Using fallback providers:', err);
    }
  }

  // Merge local providers with base providers (deduplicated by slug)
  const map = new Map<string, Provider>();
  for (const p of baseProviders) {
    map.set(p.slug, p);
  }
  for (const lp of localProviders) {
    map.set(lp.slug, lp);
  }

  return Array.from(map.values()).sort((a, b) => {
    if (a.isCurated !== b.isCurated) return a.isCurated ? -1 : 1;
    return a.displayName.localeCompare(b.displayName);
  });
}

export async function fetchGuide(slug: string): Promise<GuideVersion | null> {
  const normalizedSlug = slug.toLowerCase().trim();
  const rootSlug = normalizedSlug.replace(/\.[a-z0-9]+$/, '');

  // 1. Check localStorage custom guides first
  const localGuides = getLocalGuides();
  if (localGuides[normalizedSlug]) {
    return calibrateGuideMetrics(localGuides[normalizedSlug]);
  }
  if (localGuides[rootSlug]) {
    return calibrateGuideMetrics(localGuides[rootSlug]);
  }
  for (const g of Object.values(localGuides)) {
    if (
      g.providerSlug.toLowerCase() === normalizedSlug ||
      g.providerSlug.toLowerCase() === rootSlug ||
      g.providerName.toLowerCase() === normalizedSlug ||
      g.providerName.toLowerCase() === rootSlug
    ) {
      return calibrateGuideMetrics(g);
    }
  }

  // 2. Check Supabase
  if (isSupabaseConfigured()) {
    try {
      const { data: prov } = await supabase
        .from('providers')
        .select('id')
        .or(`slug.eq.${normalizedSlug},slug.eq.${rootSlug}`)
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
          return calibrateGuideMetrics(gv.content as GuideVersion);
        }
      }
    } catch (e) {
      console.warn('Falling back to local fixture for guide:', normalizedSlug, e);
    }
  }

  // 3. Check fallback fixtures
  const fallback = FALLBACK_GUIDES[normalizedSlug] || FALLBACK_GUIDES[rootSlug] || null;
  return fallback ? calibrateGuideMetrics(fallback) : null;
}

export async function fetchAllGuides(): Promise<GuideVersion[]> {
  const localGuides = Object.values(getLocalGuides());
  let baseGuides = Object.values(FALLBACK_GUIDES);

  if (isSupabaseConfigured()) {
    try {
      const { data } = await supabase
        .from('guide_versions')
        .select('content')
        .eq('status', 'published')
        .order('published_at', { ascending: false });

      if (data && data.length > 0) {
        baseGuides = data.map((d) => d.content as GuideVersion);
      }
    } catch (e) {
      console.warn('Falling back to local fixtures for all guides:', e);
    }
  }

  // Merge and deduplicate by providerSlug
  const map = new Map<string, GuideVersion>();
  for (const g of baseGuides) {
    map.set(g.providerSlug, calibrateGuideMetrics(g));
  }
  for (const lg of localGuides) {
    map.set(lg.providerSlug, calibrateGuideMetrics(lg));
  }

  return Array.from(map.values());
}

export async function enqueueJob(
  query: string,
  website?: string,
  intent?: Record<string, any>
): Promise<{ jobId: string; state: string }> {
  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase.rpc('enqueue_generation_job', {
        p_query: query,
        p_website: website || null,
        p_intent: intent || {},
      });

      if (!error && data) {
        return { jobId: data.job_id, state: data.state };
      }
    } catch {
      // Fallback
    }
  }

  const mockId = 'mock-' + Math.random().toString(36).substring(2, 9);
  return { jobId: mockId, state: 'resolving' };
}

export async function fetchJob(jobId: string): Promise<GenerationJob | null> {
  if (isSupabaseConfigured()) {
    try {
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
    } catch {
      return null;
    }
  }

  return null;
}
