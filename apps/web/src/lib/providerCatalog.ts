export interface CatalogProvider {
  slug: string;
  displayName: string;
  canonicalDomain: string;
  developerPortalUrl: string;
  docUrl: string;
  category: string;
  aliases: string[];
  defaultScopes?: string[];
  scopeDelimiter?: string;
  authMethod?: 'basic' | 'body';
  authUrl?: string;
  tokenUrl?: string;
  description?: string;
}

export const POPULAR_PROVIDER_CATALOG: CatalogProvider[] = [
  // 1. Enterprise Identity & Cloud Platforms
  {
    slug: 'microsoft',
    displayName: 'Microsoft',
    canonicalDomain: 'microsoft.com',
    developerPortalUrl: 'https://entra.microsoft.com/#view/Microsoft_AAD_RegisteredApps/ApplicationsListBlade',
    docUrl: 'https://learn.microsoft.com/en-us/entra/identity-platform/v2-overview',
    category: 'Enterprise Identity & Cloud',
    aliases: ['azure', 'azure ad', 'entra', 'microsoft entra', 'microsoft graph', 'office 365', 'msft'],
    defaultScopes: ['openid', 'profile', 'email', 'offline_access', 'User.Read'],
    scopeDelimiter: ' ',
    authMethod: 'body',
    authUrl: 'https://login.microsoftonline.com/common/oauth2/v2.0/authorize',
    tokenUrl: 'https://login.microsoftonline.com/common/oauth2/v2.0/token',
    description: 'Microsoft Entra ID (Azure AD) and Microsoft Graph API OAuth 2.0 authentication for work, school, and personal accounts.',
  },
  {
    slug: 'x',
    displayName: 'X',
    canonicalDomain: 'x.com',
    developerPortalUrl: 'https://developer.x.com/en/portal/dashboard',
    docUrl: 'https://developer.x.com/en/docs/authentication/oauth-2-0',
    category: 'Social & Developer API',
    aliases: ['twitter', 'twitter api', 'x api', 'x oauth', 'twitter oauth'],
    defaultScopes: ['tweet.read', 'tweet.write', 'users.read', 'offline.access'],
    scopeDelimiter: ' ',
    authMethod: 'basic',
    authUrl: 'https://twitter.com/i/oauth2/authorize',
    tokenUrl: 'https://api.twitter.com/2/oauth2/token',
    description: 'X (formerly Twitter) API v2 OAuth 2.0 with mandatory PKCE authorization code grant and token rotation.',
  },
  {
    slug: 'zoho',
    displayName: 'Zoho',
    canonicalDomain: 'zoho.com',
    developerPortalUrl: 'https://api-console.zoho.com',
    docUrl: 'https://www.zoho.com/accounts/protocol/oauth.html',
    category: 'CRM & Business Apps',
    aliases: ['zoho crm', 'zoho api', 'zoho accounts', 'zoho oauth'],
    defaultScopes: ['ZohoCRM.modules.ALL', 'ZohoCRM.users.READ', 'AaaServer.profile.READ'],
    scopeDelimiter: ' ',
    authMethod: 'body',
    authUrl: 'https://accounts.zoho.com/oauth/v2/auth',
    tokenUrl: 'https://accounts.zoho.com/oauth/v2/token',
    description: 'Zoho Accounts OAuth 2.0 for accessing Zoho CRM, Desk, Creator, and Analytics APIs across multi-region datacenters.',
  },

  // 2. Video, Media & Design
  {
    slug: 'loom',
    displayName: 'Loom',
    canonicalDomain: 'loom.com',
    developerPortalUrl: 'https://www.loom.com/developers',
    docUrl: 'https://docs.loom.com',
    category: 'Video & Screen Recording',
    aliases: ['loom sdk', 'loom video', 'loom app'],
    defaultScopes: ['video:read', 'video:write'],
    scopeDelimiter: ' ',
    authMethod: 'body',
    authUrl: 'https://www.loom.com/oauth/authorize',
    tokenUrl: 'https://www.loom.com/oauth/token',
    description: 'Loom RecordSDK and Developer API for embedding video messaging into web applications.',
  },
  {
    slug: 'figma',
    displayName: 'Figma',
    canonicalDomain: 'figma.com',
    developerPortalUrl: 'https://www.figma.com/developers/api#oauth2',
    docUrl: 'https://www.figma.com/developers/api',
    category: 'Design & Prototyping',
    aliases: ['figma api', 'figma plugin'],
    defaultScopes: ['file_read'],
    scopeDelimiter: ' ',
    authMethod: 'basic',
    authUrl: 'https://www.figma.com/oauth',
    tokenUrl: 'https://www.figma.com/api/v1/oauth/token',
    description: 'Figma REST API for programmatic access to vector files, styles, components, and webhooks.',
  },
  {
    slug: 'miro',
    displayName: 'Miro',
    canonicalDomain: 'miro.com',
    developerPortalUrl: 'https://miro.com/app/dashboard/?createApp=true',
    docUrl: 'https://developers.miro.com/docs/getting-started-with-oauth',
    category: 'Visual Collaboration',
    aliases: ['miro board', 'miro api'],
    defaultScopes: ['boards:read', 'boards:write'],
    scopeDelimiter: ' ',
    authMethod: 'body',
    authUrl: 'https://miro.com/oauth/authorize',
    tokenUrl: 'https://api.miro.com/v1/oauth/token',
    description: 'Miro REST API & Web SDK for visual whiteboards, sticky notes, and team collaboration.',
  },
  {
    slug: 'canva',
    displayName: 'Canva',
    canonicalDomain: 'canva.com',
    developerPortalUrl: 'https://www.canva.com/developers',
    docUrl: 'https://www.canva.dev/docs/connect',
    category: 'Design & Graphics',
    aliases: ['canva connect', 'canva api'],
    defaultScopes: ['design:content:read', 'design:content:write'],
    scopeDelimiter: ' ',
    authMethod: 'basic',
    authUrl: 'https://www.canva.com/api/oauth/authorize',
    tokenUrl: 'https://api.canva.com/rest/v1/oauth/token',
  },

  // 2. Developer Tools & Infrastructure
  {
    slug: 'supabase',
    displayName: 'Supabase',
    canonicalDomain: 'supabase.com',
    developerPortalUrl: 'https://supabase.com/dashboard/account/me',
    docUrl: 'https://supabase.com/docs/guides/platform/oauth-apps',
    category: 'Cloud Database & Auth',
    aliases: ['supabase oauth', 'supabase management api'],
    defaultScopes: ['all'],
    scopeDelimiter: ' ',
    authMethod: 'body',
    authUrl: 'https://api.supabase.com/v1/oauth/authorize',
    tokenUrl: 'https://api.supabase.com/v1/oauth/token',
    description: 'Supabase Management API OAuth 2.0 for automating database projects, migrations, and storage.',
  },
  {
    slug: 'github',
    displayName: 'GitHub',
    canonicalDomain: 'github.com',
    developerPortalUrl: 'https://github.com/settings/developers',
    docUrl: 'https://docs.github.com/en/apps/oauth-apps/building-oauth-apps',
    category: 'Code Hosting & CI/CD',
    aliases: ['gh', 'github apps', 'github api'],
    defaultScopes: ['read:user', 'user:email', 'repo'],
    scopeDelimiter: ',',
    authMethod: 'body',
    authUrl: 'https://github.com/login/oauth/authorize',
    tokenUrl: 'https://github.com/login/oauth/access_token',
  },
  {
    slug: 'gitlab',
    displayName: 'GitLab',
    canonicalDomain: 'gitlab.com',
    developerPortalUrl: 'https://gitlab.com/-/user_settings/applications',
    docUrl: 'https://docs.gitlab.com/ee/api/oauth2.html',
    category: 'DevOps & Git',
    aliases: ['gitlab api', 'gitlab oauth'],
    defaultScopes: ['read_user', 'api'],
    scopeDelimiter: ' ',
    authMethod: 'body',
    authUrl: 'https://gitlab.com/oauth/authorize',
    tokenUrl: 'https://gitlab.com/oauth/token',
  },
  {
    slug: 'bitbucket',
    displayName: 'Bitbucket',
    canonicalDomain: 'bitbucket.org',
    developerPortalUrl: 'https://bitbucket.org/account/settings/api',
    docUrl: 'https://support.atlassian.com/bitbucket-cloud/docs/use-oauth-on-bitbucket-cloud/',
    category: 'DevOps & Git',
    aliases: ['atlassian bitbucket'],
    defaultScopes: ['account', 'repository'],
    scopeDelimiter: ' ',
    authMethod: 'basic',
    authUrl: 'https://bitbucket.org/site/oauth2/authorize',
    tokenUrl: 'https://bitbucket.org/site/oauth2/access_token',
  },
  {
    slug: 'linear',
    displayName: 'Linear',
    canonicalDomain: 'linear.app',
    developerPortalUrl: 'https://linear.app/settings/api',
    docUrl: 'https://developers.linear.app/docs/oauth/authentication',
    category: 'Issue Tracking',
    aliases: ['linear api', 'linear app'],
    defaultScopes: ['read', 'write', 'issues:create'],
    scopeDelimiter: ',',
    authMethod: 'body',
    authUrl: 'https://linear.app/oauth/authorize',
    tokenUrl: 'https://api.linear.app/oauth/token',
  },
  {
    slug: 'sentry',
    displayName: 'Sentry',
    canonicalDomain: 'sentry.io',
    developerPortalUrl: 'https://sentry.io/settings/developer-settings/',
    docUrl: 'https://docs.sentry.io/product/integrations/integration-platform/',
    category: 'Error Monitoring',
    aliases: ['sentry api', 'sentry integration'],
    defaultScopes: ['project:read', 'event:read'],
    scopeDelimiter: ' ',
    authMethod: 'body',
    authUrl: 'https://sentry.io/oauth/authorize/',
    tokenUrl: 'https://sentry.io/oauth/token/',
  },

  // 3. Productivity & Workspaces
  {
    slug: 'google-calendar',
    displayName: 'Google Calendar',
    canonicalDomain: 'google.com',
    developerPortalUrl: 'https://console.cloud.google.com/apis/credentials',
    docUrl: 'https://developers.google.com/calendar/api/guides/overview',
    category: 'Calendars & Scheduling',
    aliases: ['gcal', 'google cal', 'calendar'],
    defaultScopes: ['https://www.googleapis.com/auth/calendar.readonly'],
    scopeDelimiter: ' ',
    authMethod: 'body',
    authUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
    tokenUrl: 'https://oauth2.googleapis.com/token',
  },
  {
    slug: 'notion',
    displayName: 'Notion',
    canonicalDomain: 'notion.so',
    developerPortalUrl: 'https://www.notion.so/my-integrations',
    docUrl: 'https://developers.notion.com/docs/authorization',
    category: 'Wikis & Knowledge',
    aliases: ['notion api', 'notion integrations'],
    defaultScopes: [],
    scopeDelimiter: ' ',
    authMethod: 'basic',
    authUrl: 'https://api.notion.com/v1/oauth/authorize',
    tokenUrl: 'https://api.notion.com/v1/oauth/token',
  },
  {
    slug: 'airtable',
    displayName: 'Airtable',
    canonicalDomain: 'airtable.com',
    developerPortalUrl: 'https://airtable.com/create/oauth',
    docUrl: 'https://airtable.com/developers/web/api/oauth-reference',
    category: 'No-Code Database',
    aliases: ['airtable api', 'airtable oauth'],
    defaultScopes: ['data.records:read', 'data.records:write', 'schema.bases:read'],
    scopeDelimiter: ' ',
    authMethod: 'basic',
    authUrl: 'https://airtable.com/oauth2/v1/authorize',
    tokenUrl: 'https://airtable.com/oauth2/v1/token',
  },
  {
    slug: 'asana',
    displayName: 'Asana',
    canonicalDomain: 'asana.com',
    developerPortalUrl: 'https://app.asana.com/0/my-apps',
    docUrl: 'https://developers.asana.com/docs/oauth',
    category: 'Project Management',
    aliases: ['asana api', 'asana app'],
    defaultScopes: ['default'],
    scopeDelimiter: ' ',
    authMethod: 'body',
    authUrl: 'https://app.asana.com/-/oauth_authorize',
    tokenUrl: 'https://app.asana.com/-/oauth_token',
  },
  {
    slug: 'clickup',
    displayName: 'ClickUp',
    canonicalDomain: 'clickup.com',
    developerPortalUrl: 'https://app.clickup.com/settings/apps',
    docUrl: 'https://clickup.com/api/developer-portal/authentication/',
    category: 'Task Management',
    aliases: ['clickup api'],
    defaultScopes: [],
    scopeDelimiter: ' ',
    authMethod: 'body',
    authUrl: 'https://app.clickup.com/api',
    tokenUrl: 'https://api.clickup.com/api/v2/oauth/token',
  },
  {
    slug: 'monday',
    displayName: 'Monday.com',
    canonicalDomain: 'monday.com',
    developerPortalUrl: 'https://auth.monday.com/apps',
    docUrl: 'https://developer.monday.com/apps/docs/oauth',
    category: 'Work OS',
    aliases: ['monday api'],
    defaultScopes: ['boards:read', 'boards:write', 'me:read'],
    scopeDelimiter: ' ',
    authMethod: 'body',
    authUrl: 'https://auth.monday.com/oauth2/authorize',
    tokenUrl: 'https://auth.monday.com/oauth2/token',
  },

  // 4. E-Commerce, Billing & Payments
  {
    slug: 'shopify',
    displayName: 'Shopify',
    canonicalDomain: 'shopify.com',
    developerPortalUrl: 'https://partners.shopify.com',
    docUrl: 'https://shopify.dev/docs/apps/auth/oauth',
    category: 'E-Commerce Platform',
    aliases: ['shopify api', 'shopify app'],
    defaultScopes: ['read_products', 'write_orders'],
    scopeDelimiter: ',',
    authMethod: 'body',
    authUrl: 'https://{shop}.myshopify.com/admin/oauth/authorize',
    tokenUrl: 'https://{shop}.myshopify.com/admin/oauth/access_token',
  },
  {
    slug: 'stripe',
    displayName: 'Stripe',
    canonicalDomain: 'stripe.com',
    developerPortalUrl: 'https://dashboard.stripe.com/settings/connect',
    docUrl: 'https://docs.stripe.com/connect/oauth-reference',
    category: 'Payments & Billing',
    aliases: ['stripe connect', 'stripe oauth'],
    defaultScopes: ['read_write'],
    scopeDelimiter: ' ',
    authMethod: 'body',
    authUrl: 'https://connect.stripe.com/oauth/authorize',
    tokenUrl: 'https://connect.stripe.com/oauth/token',
  },

  // 5. Cloud Storage & Content
  {
    slug: 'box',
    displayName: 'Box',
    canonicalDomain: 'box.com',
    developerPortalUrl: 'https://app.box.com/developers/console',
    docUrl: 'https://developer.box.com/guides/authentication/oauth2/',
    category: 'Cloud Storage & Content',
    aliases: ['box api', 'box cloud'],
    defaultScopes: ['root_readwrite'],
    scopeDelimiter: ' ',
    authMethod: 'body',
    authUrl: 'https://account.box.com/api/oauth2/authorize',
    tokenUrl: 'https://api.box.com/oauth2/token',
  },
  {
    slug: 'dropbox',
    displayName: 'Dropbox',
    canonicalDomain: 'dropbox.com',
    developerPortalUrl: 'https://www.dropbox.com/developers/apps',
    docUrl: 'https://developers.dropbox.com/oauth-guide',
    category: 'Cloud Storage & Files',
    aliases: ['dropbox api', 'dropbox oauth'],
    defaultScopes: ['files.content.read', 'files.content.write'],
    scopeDelimiter: ' ',
    authMethod: 'basic',
    authUrl: 'https://www.dropbox.com/oauth2/authorize',
    tokenUrl: 'https://api.dropboxapi.com/oauth2/token',
  },

  // 6. CRM, Marketing & Sales
  {
    slug: 'hubspot',
    displayName: 'HubSpot',
    canonicalDomain: 'hubspot.com',
    developerPortalUrl: 'https://app.hubspot.com/developer/',
    docUrl: 'https://developers.hubspot.com/docs/api/working-with-oauth',
    category: 'CRM & Marketing',
    aliases: ['hubspot api', 'hubspot crm'],
    defaultScopes: ['crm.objects.contacts.read', 'crm.objects.contacts.write'],
    scopeDelimiter: ' ',
    authMethod: 'body',
    authUrl: 'https://app.hubspot.com/oauth/authorize',
    tokenUrl: 'https://api.hubapi.com/oauth/v1/token',
  },
  {
    slug: 'salesforce',
    displayName: 'Salesforce',
    canonicalDomain: 'salesforce.com',
    developerPortalUrl: 'https://login.salesforce.com/',
    docUrl: 'https://developer.salesforce.com/docs/atlas.en-us.api_rest.meta/api_rest/intro_understanding_oauth_endpoints.htm',
    category: 'Enterprise CRM',
    aliases: ['sfdc', 'connected apps', 'salesforce oauth'],
    defaultScopes: ['api', 'refresh_token', 'offline_access'],
    scopeDelimiter: ' ',
    authMethod: 'body',
    authUrl: 'https://login.salesforce.com/services/oauth2/authorize',
    tokenUrl: 'https://login.salesforce.com/services/oauth2/token',
  },
  {
    slug: 'zendesk',
    displayName: 'Zendesk',
    canonicalDomain: 'zendesk.com',
    developerPortalUrl: 'https://developer.zendesk.com',
    docUrl: 'https://developer.zendesk.com/documentation/ticketing/working-with-oauth/creating-and-using-oauth-tokens-with-the-api/',
    category: 'Customer Support',
    aliases: ['zendesk api', 'zendesk support'],
    defaultScopes: ['read', 'write'],
    scopeDelimiter: ' ',
    authMethod: 'body',
    authUrl: 'https://{subdomain}.zendesk.com/oauth/authorizations/new',
    tokenUrl: 'https://{subdomain}.zendesk.com/oauth/tokens',
  },
  {
    slug: 'intercom',
    displayName: 'Intercom',
    canonicalDomain: 'intercom.com',
    developerPortalUrl: 'https://app.intercom.com/a/apps/_/developer-hub',
    docUrl: 'https://developers.intercom.com/docs/build-an-app/learn-more/authentication/',
    category: 'Customer Messaging',
    aliases: ['intercom api'],
    defaultScopes: [],
    scopeDelimiter: ' ',
    authMethod: 'body',
    authUrl: 'https://app.intercom.com/oauth',
    tokenUrl: 'https://api.intercom.io/auth/eagle/token',
  },
  {
    slug: 'mailchimp',
    displayName: 'Mailchimp',
    canonicalDomain: 'mailchimp.com',
    developerPortalUrl: 'https://admin.mailchimp.com/account/api/',
    docUrl: 'https://mailchimp.com/developer/marketing/guides/access-user-data-oauth-2/',
    category: 'Email Marketing',
    aliases: ['mailchimp api'],
    defaultScopes: [],
    scopeDelimiter: ' ',
    authMethod: 'body',
    authUrl: 'https://login.mailchimp.com/oauth2/authorize',
    tokenUrl: 'https://login.mailchimp.com/oauth2/token',
  },

  // 7. Communication & Telephony
  {
    slug: 'slack',
    displayName: 'Slack',
    canonicalDomain: 'slack.com',
    developerPortalUrl: 'https://api.slack.com/apps',
    docUrl: 'https://api.slack.com/authentication/oauth-v2',
    category: 'Team Communication',
    aliases: ['slack api', 'slack bot'],
    defaultScopes: ['chat:write', 'users:read', 'channels:read'],
    scopeDelimiter: ',',
    authMethod: 'body',
    authUrl: 'https://slack.com/oauth/v2/authorize',
    tokenUrl: 'https://slack.com/api/oauth.v2.access',
  },
  {
    slug: 'discord',
    displayName: 'Discord',
    canonicalDomain: 'discord.com',
    developerPortalUrl: 'https://discord.com/developers/applications',
    docUrl: 'https://discord.com/developers/docs/topics/oauth2',
    category: 'Voice & Community Chat',
    aliases: ['discord bot', 'discord api'],
    defaultScopes: ['identify', 'email', 'guilds'],
    scopeDelimiter: ' ',
    authMethod: 'body',
    authUrl: 'https://discord.com/api/oauth2/authorize',
    tokenUrl: 'https://discord.com/api/oauth2/token',
  },
  {
    slug: 'twilio',
    displayName: 'Twilio',
    canonicalDomain: 'twilio.com',
    developerPortalUrl: 'https://console.twilio.com',
    docUrl: 'https://www.twilio.com/docs/usage/api',
    category: 'SMS & Voice APIs',
    aliases: ['twilio api', 'twilio console'],
    defaultScopes: [],
    scopeDelimiter: ' ',
    authMethod: 'basic',
    authUrl: 'https://www.twilio.com/authorize',
    tokenUrl: 'https://api.twilio.com/oauth/token',
  },
  {
    slug: 'zoom',
    displayName: 'Zoom',
    canonicalDomain: 'zoom.us',
    developerPortalUrl: 'https://marketplace.zoom.us/',
    docUrl: 'https://developers.zoom.us/docs/integrations/oauth/',
    category: 'Video Conferencing',
    aliases: ['zoom marketplace', 'zoom api'],
    defaultScopes: ['user:read'],
    scopeDelimiter: ' ',
    authMethod: 'basic',
    authUrl: 'https://zoom.us/oauth/authorize',
    tokenUrl: 'https://zoom.us/oauth/token',
  },

  // 7. Identity, Developer Platforms & Payments Expansion
  {
    slug: 'google',
    displayName: 'Google',
    canonicalDomain: 'google.com',
    developerPortalUrl: 'https://console.cloud.google.com/apis/credentials',
    docUrl: 'https://developers.google.com/identity/protocols/oauth2',
    category: 'Enterprise Identity & Cloud',
    aliases: ['google identity', 'google oauth', 'gsuite', 'google apis'],
    defaultScopes: ['openid', 'email', 'profile'],
    scopeDelimiter: ' ',
    authMethod: 'body',
    authUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
    tokenUrl: 'https://oauth2.googleapis.com/token',
  },
  {
    slug: 'spotify',
    displayName: 'Spotify',
    canonicalDomain: 'spotify.com',
    developerPortalUrl: 'https://developer.spotify.com/dashboard',
    docUrl: 'https://developer.spotify.com/documentation/web-api/tutorials/code-flow',
    category: 'Music & Streaming Media',
    aliases: ['spotify web api', 'spotify music', 'spotify app'],
    defaultScopes: ['user-read-private', 'user-read-email'],
    scopeDelimiter: ' ',
    authMethod: 'basic',
    authUrl: 'https://accounts.spotify.com/authorize',
    tokenUrl: 'https://accounts.spotify.com/api/token',
  },
  {
    slug: 'atlassian',
    displayName: 'Atlassian',
    canonicalDomain: 'atlassian.com',
    developerPortalUrl: 'https://developer.atlassian.com/console/myapps/',
    docUrl: 'https://developer.atlassian.com/cloud/jira/platform/oauth-2-3lo-apps/',
    category: 'Developer Tools & Workspace',
    aliases: ['jira', 'confluence', 'atlassian cloud', 'jira oauth'],
    defaultScopes: ['read:jira-work', 'read:jira-user', 'offline_access'],
    scopeDelimiter: ' ',
    authMethod: 'body',
    authUrl: 'https://auth.atlassian.com/authorize',
    tokenUrl: 'https://auth.atlassian.com/oauth/token',
  },
  {
    slug: 'okta',
    displayName: 'Okta',
    canonicalDomain: 'okta.com',
    developerPortalUrl: 'https://developer.okta.com/',
    docUrl: 'https://developer.okta.com/docs/guides/implement-oauth-for-okta/',
    category: 'Identity & Access Management',
    aliases: ['okta sso', 'okta identity', 'okta auth'],
    defaultScopes: ['openid', 'profile', 'email', 'offline_access'],
    scopeDelimiter: ' ',
    authMethod: 'basic',
    authUrl: 'https://{yourOktaDomain}/oauth2/v1/authorize',
    tokenUrl: 'https://{yourOktaDomain}/oauth2/v1/token',
  },
  {
    slug: 'auth0',
    displayName: 'Auth0',
    canonicalDomain: 'auth0.com',
    developerPortalUrl: 'https://manage.auth0.com/',
    docUrl: 'https://auth0.com/docs/authenticate/protocols/oauth',
    category: 'Identity & Authentication',
    aliases: ['auth0 okta', 'auth0 oidc', 'auth0 universal login'],
    defaultScopes: ['openid', 'profile', 'email', 'offline_access'],
    scopeDelimiter: ' ',
    authMethod: 'body',
    authUrl: 'https://{yourDomain}.auth0.com/authorize',
    tokenUrl: 'https://{yourDomain}.auth0.com/oauth/token',
  },
  {
    slug: 'posthog',
    displayName: 'PostHog',
    canonicalDomain: 'posthog.com',
    developerPortalUrl: 'https://app.posthog.com/project/settings',
    docUrl: 'https://posthog.com/docs/api',
    category: 'Product Analytics & DevTools',
    aliases: ['posthog api', 'posthog analytics'],
    defaultScopes: ['project:read', 'user:read'],
    scopeDelimiter: ' ',
    authMethod: 'body',
    authUrl: 'https://us.posthog.com/oauth/authorize/',
    tokenUrl: 'https://us.posthog.com/oauth/token/',
  },
  {
    slug: 'paypal',
    displayName: 'PayPal',
    canonicalDomain: 'paypal.com',
    developerPortalUrl: 'https://developer.paypal.com/dashboard/',
    docUrl: 'https://developer.paypal.com/api/rest/authentication/',
    category: 'Payments & Financial Services',
    aliases: ['paypal developer', 'paypal checkout', 'paypal rest api'],
    defaultScopes: ['openid', 'profile', 'email'],
    scopeDelimiter: ' ',
    authMethod: 'basic',
    authUrl: 'https://www.paypal.com/signin/authorize',
    tokenUrl: 'https://api-m.paypal.com/v1/oauth2/token',
  },
  {
    slug: 'square',
    displayName: 'Square',
    canonicalDomain: 'squareup.com',
    developerPortalUrl: 'https://developer.squareup.com/apps',
    docUrl: 'https://developer.squareup.com/docs/oauth-api/overview',
    category: 'Payments & Point of Sale',
    aliases: ['square pos', 'square developer', 'block square'],
    defaultScopes: ['MERCHANT_PROFILE_READ', 'PAYMENTS_READ'],
    scopeDelimiter: ' ',
    authMethod: 'body',
    authUrl: 'https://connect.squareup.com/oauth2/authorize',
    tokenUrl: 'https://connect.squareup.com/oauth2/token',
  },
  {
    slug: 'paddle',
    displayName: 'Paddle',
    canonicalDomain: 'paddle.com',
    developerPortalUrl: 'https://vendors.paddle.com/authentication',
    docUrl: 'https://developer.paddle.com/api-reference/overview',
    category: 'Billing & Merchant of Record',
    aliases: ['paddle billing', 'paddle payments'],
    defaultScopes: ['read:transactions', 'read:customers'],
    scopeDelimiter: ' ',
    authMethod: 'body',
  },
  {
    slug: 'docusign',
    displayName: 'DocuSign',
    canonicalDomain: 'docusign.com',
    developerPortalUrl: 'https://admindemo.docusign.com/',
    docUrl: 'https://developers.docusign.com/platform/auth/authcode_grant/',
    category: 'Digital Signatures & Documents',
    aliases: ['docusign esignature', 'docusign api'],
    defaultScopes: ['signature', 'extended'],
    scopeDelimiter: ' ',
    authMethod: 'body',
    authUrl: 'https://account.docusign.com/oauth/auth',
    tokenUrl: 'https://account.docusign.com/oauth/token',
  },
  {
    slug: 'quickbooks',
    displayName: 'QuickBooks',
    canonicalDomain: 'intuit.com',
    developerPortalUrl: 'https://developer.intuit.com/app/developer/dashboard',
    docUrl: 'https://developer.intuit.com/app/developer/qbo/docs/develop/authentication-and-authorization/oauth-2.0',
    category: 'Accounting & Finance',
    aliases: ['intuit', 'quickbooks online', 'qbo'],
    defaultScopes: ['com.intuit.quickbooks.accounting'],
    scopeDelimiter: ' ',
    authMethod: 'basic',
    authUrl: 'https://appcenter.intuit.com/connect/oauth2',
    tokenUrl: 'https://oauth.platform.intuit.com/oauth2/v1/tokens/bearer',
  },
  {
    slug: 'xero',
    displayName: 'Xero',
    canonicalDomain: 'xero.com',
    developerPortalUrl: 'https://developer.xero.com/app/manage/',
    docUrl: 'https://developer.xero.com/documentation/guides/oauth2/overview/',
    category: 'Accounting & Small Business',
    aliases: ['xero api', 'xero accounting'],
    defaultScopes: ['openid', 'profile', 'email', 'accounting.transactions', 'offline_access'],
    scopeDelimiter: ' ',
    authMethod: 'basic',
    authUrl: 'https://login.xero.com/identity/connect/authorize',
    tokenUrl: 'https://identity.xero.com/connect/token',
  },
  {
    slug: 'calendly',
    displayName: 'Calendly',
    canonicalDomain: 'calendly.com',
    developerPortalUrl: 'https://calendly.com/integrations/api_webhooks',
    docUrl: 'https://developer.calendly.com/api-docs/docs/generate-api-keys/OAuth-2.0.md',
    category: 'Scheduling & Calendar',
    aliases: ['calendly api', 'calendly oauth'],
    defaultScopes: ['default'],
    scopeDelimiter: ' ',
    authMethod: 'body',
    authUrl: 'https://auth.calendly.com/oauth/authorize',
    tokenUrl: 'https://auth.calendly.com/oauth/token',
  },
  {
    slug: 'linkedin',
    displayName: 'LinkedIn',
    canonicalDomain: 'linkedin.com',
    developerPortalUrl: 'https://www.linkedin.com/developers/apps',
    docUrl: 'https://learn.microsoft.com/en-us/linkedin/shared/authentication/authorization-code-flow',
    category: 'Professional Network & Identity',
    aliases: ['linkedin oidc', 'linkedin signin', 'linkedin api'],
    defaultScopes: ['openid', 'profile', 'email'],
    scopeDelimiter: ' ',
    authMethod: 'body',
    authUrl: 'https://www.linkedin.com/oauth/v2/authorization',
    tokenUrl: 'https://www.linkedin.com/oauth/v2/accessToken',
  },
  {
    slug: 'reddit',
    displayName: 'Reddit',
    canonicalDomain: 'reddit.com',
    developerPortalUrl: 'https://www.reddit.com/prefs/apps',
    docUrl: 'https://github.com/reddit-archive/reddit/wiki/OAuth2',
    category: 'Social & Community API',
    aliases: ['reddit api', 'reddit app'],
    defaultScopes: ['identity', 'read', 'submit'],
    scopeDelimiter: ' ',
    authMethod: 'basic',
    authUrl: 'https://www.reddit.com/api/v1/authorize',
    tokenUrl: 'https://www.reddit.com/api/v1/access_token',
  },
  {
    slug: 'odoo',
    displayName: 'Odoo',
    canonicalDomain: 'odoo.com',
    developerPortalUrl: 'https://www.odoo.com/documentation/17.0/developer/reference/external_api.html',
    docUrl: 'https://www.odoo.com/documentation/17.0/applications/general/auth/oauth.html',
    category: 'Enterprise ERP & Business Apps',
    aliases: ['odoo erp', 'odoo crm', 'odoo oauth', 'odoo api', 'docs.odoo.com'],
    defaultScopes: ['userinfo'],
    scopeDelimiter: ' ',
    authMethod: 'body',
    authUrl: 'https://www.odoo.com/web/oauth2/auth',
    tokenUrl: 'https://www.odoo.com/web/oauth2/token',
    description: 'Odoo OAuth 2.0 / OpenID Connect authentication provider for ERP apps, accounting, CRM, and inventory databases.',
  },
  {
    slug: 'clickup',
    displayName: 'ClickUp',
    canonicalDomain: 'clickup.com',
    developerPortalUrl: 'https://app.clickup.com/api',
    docUrl: 'https://clickup.com/api/developer-portal/authentication/',
    category: 'Productivity & Project Management',
    aliases: ['clickup api', 'clickup app'],
    defaultScopes: ['task:read', 'task:write'],
    scopeDelimiter: ' ',
    authMethod: 'body',
    authUrl: 'https://app.clickup.com/api/v2/oauth',
    tokenUrl: 'https://api.clickup.com/api/v2/oauth/token',
  },
  {
    slug: 'monday',
    displayName: 'Monday.com',
    canonicalDomain: 'monday.com',
    developerPortalUrl: 'https://developer.monday.com/apps/docs',
    docUrl: 'https://developer.monday.com/apps/docs/oauth-and-permissions',
    category: 'Work OS & Team Management',
    aliases: ['monday', 'monday.com', 'monday api'],
    defaultScopes: ['boards:read', 'boards:write', 'users:read'],
    scopeDelimiter: ' ',
    authMethod: 'body',
    authUrl: 'https://auth.monday.com/oauth2/authorize',
    tokenUrl: 'https://auth.monday.com/oauth2/token',
  },
  {
    slug: 'zendesk',
    displayName: 'Zendesk',
    canonicalDomain: 'zendesk.com',
    developerPortalUrl: 'https://developer.zendesk.com/',
    docUrl: 'https://developer.zendesk.com/documentation/ticketing/using-the-rest-api/understanding-oauth/',
    category: 'Customer Support & Helpdesk',
    aliases: ['zendesk api', 'zendesk support'],
    defaultScopes: ['read', 'write'],
    scopeDelimiter: ' ',
    authMethod: 'body',
    authUrl: 'https://{subdomain}.zendesk.com/oauth/authorizations/new',
    tokenUrl: 'https://{subdomain}.zendesk.com/oauth/tokens',
  },
  {
    slug: 'intercom',
    displayName: 'Intercom',
    canonicalDomain: 'intercom.com',
    developerPortalUrl: 'https://developers.intercom.com/',
    docUrl: 'https://developers.intercom.com/docs/build-an-integration/learn-more/authentication/',
    category: 'Customer Messaging & Support',
    aliases: ['intercom api', 'intercom messenger'],
    defaultScopes: ['read'],
    scopeDelimiter: ' ',
    authMethod: 'body',
    authUrl: 'https://app.intercom.com/oauth',
    tokenUrl: 'https://api.intercom.io/auth/eagle/token',
  },
];

/**
 * Returns probable platforms matching the query:
 * 1. Matching catalog items (exact, prefix, aliases, categories)
 * 2. If GitHub repository URL, cleanly extracts repo name and synthesizes candidate
 * 3. If uncataloged or sparse matches, synthesizes smart probable candidate configurations
 */
export function getProbableProviderCandidates(query: string): CatalogProvider[] {
  const clean = query.trim().toLowerCase();
  if (!clean) return [];

  // Detect GitHub repository URLs (e.g. github.com/owner/repo or https://github.com/owner/repo)
  const ghMatch = clean.match(/(?:https?:\/\/)?(?:www\.)?github\.com\/([a-zA-Z0-9_\-\.]+)\/([a-zA-Z0-9_\-\.]+)/i);
  if (ghMatch) {
    const org = ghMatch[1];
    const repo = ghMatch[2].replace(/\.git$/i, '');
    const cleanRepoSlug = repo.toLowerCase().replace(/[^a-z0-9]/g, '');
    const repoDisplayName = repo.charAt(0).toUpperCase() + repo.slice(1);
    const domain = `${cleanRepoSlug}.com`;

    // Check if repo matches an existing catalog provider
    const existing = POPULAR_PROVIDER_CATALOG.find(
      (p) => p.slug === cleanRepoSlug || p.aliases.some((a) => a.includes(cleanRepoSlug))
    );

    return [
      existing || {
        slug: cleanRepoSlug,
        displayName: repoDisplayName,
        canonicalDomain: domain,
        developerPortalUrl: `https://github.com/${org}/${repo}`,
        docUrl: `https://github.com/${org}/${repo}#readme`,
        category: 'Developer Platform',
        aliases: [`${org}/${repo}`, cleanRepoSlug, `github.com/${org}/${repo}`],
        defaultScopes: ['read', 'write'],
        scopeDelimiter: ' ',
        authMethod: 'body',
        description: `OAuth integration and developer portal for ${repoDisplayName} (${org}/${repo}).`,
      },
    ];
  }

  const catalogMatches = searchProviderCatalog(query);
  if (catalogMatches.length >= 3) {
    return catalogMatches.slice(0, 6);
  }

  // Generate smart fallback candidates if uncataloged or sparse matches
  const cleanSlug = clean.replace(/[^a-z0-9]/g, '');
  const rootDomain = clean.includes('.') ? clean : `${cleanSlug}.com`;
  const displayName = query.trim().charAt(0).toUpperCase() + query.trim().slice(1);

  const smartCandidates: CatalogProvider[] = [
    ...catalogMatches,
    {
      slug: cleanSlug,
      displayName: displayName,
      canonicalDomain: rootDomain,
      developerPortalUrl: `https://${rootDomain}/developers`,
      docUrl: `https://docs.${rootDomain}`,
      category: 'Web & SaaS Platform',
      aliases: [clean],
      description: `Official OAuth 2.0 integration for ${displayName} (${rootDomain}).`,
      authMethod: 'body',
      scopeDelimiter: ' ',
    },
    {
      slug: `${cleanSlug}-developer`,
      displayName: `${displayName} Developer Portal`,
      canonicalDomain: `developer.${rootDomain}`,
      developerPortalUrl: `https://developer.${rootDomain}`,
      docUrl: `https://developer.${rootDomain}/oauth`,
      category: 'Developer API Console',
      aliases: [`${clean} developer`],
      description: `Developer portal authorization and app console for ${displayName}.`,
      authMethod: 'basic',
      scopeDelimiter: ' ',
    },
    {
      slug: `${cleanSlug}-api`,
      displayName: `${displayName} API Services`,
      canonicalDomain: `api.${rootDomain}`,
      developerPortalUrl: `https://${rootDomain}/api-docs`,
      docUrl: `https://api.${rootDomain}/v1/oauth`,
      category: 'REST & OAuth 2.0 API',
      aliases: [`${clean} api`],
      description: `REST API authorization endpoint specification for ${displayName}.`,
      authMethod: 'body',
      scopeDelimiter: ' ',
    },
  ];

  // Deduplicate by slug
  const seen = new Set<string>();
  return smartCandidates.filter((c) => {
    if (seen.has(c.slug)) return false;
    seen.add(c.slug);
    return true;
  }).slice(0, 5);
}

/**
 * Search the catalog with high tolerance for typos, prefixes, and aliases.
 */
export function searchProviderCatalog(query: string): CatalogProvider[] {
  const clean = query.trim().toLowerCase();
  if (!clean) return [];

  // If query is a GitHub repo URL, search by repository name to prevent false GitHub alias contamination
  const ghMatch = clean.match(/(?:https?:\/\/)?(?:www\.)?github\.com\/([a-zA-Z0-9_\-\.]+)\/([a-zA-Z0-9_\-\.]+)/i);
  const searchTerm = ghMatch ? ghMatch[2].replace(/\.git$/i, '').toLowerCase() : clean;

  // Exact or prefix match
  const matches = POPULAR_PROVIDER_CATALOG.filter((p) => {
    if (p.slug.toLowerCase().includes(searchTerm)) return true;
    if (p.displayName.toLowerCase().includes(searchTerm)) return true;
    if (p.canonicalDomain.toLowerCase().includes(searchTerm)) return true;
    if (p.category.toLowerCase().includes(searchTerm)) return true;
    return p.aliases.some(
      (a) =>
        a.toLowerCase().includes(searchTerm) ||
        (a.length >= 4 && searchTerm.includes(a.toLowerCase())) ||
        (a.toLowerCase() === searchTerm)
    );
  });

  return matches;
}

/**
 * Resolve provider metadata by query, domain, or website.
 */
export function resolveProviderFromCatalog(query: string, website?: string): CatalogProvider | null {
  const cleanQuery = query.trim().toLowerCase();
  const cleanWeb = website?.trim().toLowerCase() || '';

  // Extract GitHub repository name if a GitHub URL is passed
  const ghMatch = cleanQuery.match(/(?:https?:\/\/)?(?:www\.)?github\.com\/([a-zA-Z0-9_\-\.]+)\/([a-zA-Z0-9_\-\.]+)/i);
  const targetSlug = ghMatch ? ghMatch[2].replace(/\.git$/i, '').toLowerCase() : cleanQuery;

  // 1. If query is provided, match by slug, display name, or aliases FIRST
  if (targetSlug) {
    for (const p of POPULAR_PROVIDER_CATALOG) {
      if (p.slug === targetSlug || p.displayName.toLowerCase() === targetSlug) {
        return p;
      }
      if (p.aliases.some((a) => a.toLowerCase() === targetSlug)) {
        return p;
      }
    }

    // Substring matching against target slug
    for (const p of POPULAR_PROVIDER_CATALOG) {
      if (targetSlug.includes(p.slug) || (targetSlug.length >= 3 && p.slug.includes(targetSlug))) {
        return p;
      }
      if (targetSlug.length >= 3 && p.displayName.toLowerCase().includes(targetSlug)) {
        return p;
      }
    }
  }

  // 2. Only if query didn't match and website is provided, resolve by website domain
  if (cleanWeb) {
    const webGhMatch = cleanWeb.match(/(?:https?:\/\/)?(?:www\.)?github\.com\/([a-zA-Z0-9_\-\.]+)\/([a-zA-Z0-9_\-\.]+)/i);
    const targetWebSlug = webGhMatch ? webGhMatch[2].replace(/\.git$/i, '').toLowerCase() : cleanWeb;

    for (const p of POPULAR_PROVIDER_CATALOG) {
      if (p.slug === targetWebSlug) return p;
      if (cleanWeb.includes(p.canonicalDomain) || p.docUrl.toLowerCase().includes(cleanWeb)) {
        return p;
      }
    }
  }

  return null;
}
