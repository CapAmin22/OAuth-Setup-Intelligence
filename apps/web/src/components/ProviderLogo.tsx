import React, { useState } from 'react';

interface ProviderLogoProps {
  slug?: string;
  name?: string;
  logoUrl?: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

function getInitials(text: string): string {
  const parts = text.trim().split(/[\s-_.]+/).filter(Boolean);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return text.slice(0, 2).toUpperCase();
}

function getGradient(name: string): { bg: string; text: string } {
  const gradients = [
    { bg: 'from-blue-600 to-indigo-700', text: 'text-white' },
    { bg: 'from-emerald-500 to-teal-700', text: 'text-white' },
    { bg: 'from-violet-600 to-purple-800', text: 'text-white' },
    { bg: 'from-amber-500 to-orange-600', text: 'text-white' },
    { bg: 'from-rose-500 to-pink-700', text: 'text-white' },
    { bg: 'from-cyan-500 to-blue-600', text: 'text-white' },
    { bg: 'from-sky-500 to-indigo-600', text: 'text-white' },
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const idx = Math.abs(hash) % gradients.length;
  return gradients[idx];
}

/**
 * Extracts normalized provider key by stripping subdomains (docs., api., login., etc.)
 * and TLD extensions (.com, .org, .io, etc.).
 * Guarantees that 'docs.odoo.com', 'odoo.com', and 'odoo' all resolve to 'odoo'.
 */
function extractBaseSlug(raw: string): string {
  if (!raw) return '';
  let clean = raw.toLowerCase().trim();
  clean = clean.replace(/^https?:\/\//, '');
  clean = clean.replace(/\/.*$/, '');
  clean = clean.replace(/^(p-|custom-|oauth-|guid-)*/, '');
  clean = clean.replace(/^(docs|api|app|developer|developers|login|console|accounts|auth|web|www)[.\-_]/, '');
  clean = clean.replace(/[.\-_](com|org|net|io|dev|app|co|us|eu|in|ai|so|to)$/, '');
  clean = clean.replace(/[.\-_](oauth|api|app|sdk|connect|login|auth)$/, '');
  clean = clean.replace(/[^a-z0-9]/g, '');
  return clean;
}

export const ProviderLogo: React.FC<ProviderLogoProps> = ({
  slug = '',
  name = '',
  logoUrl,
  className = '',
  size = 'md',
}) => {
  const [imgAttempt, setImgAttempt] = useState(0);

  const baseSlug = extractBaseSlug(slug) || extractBaseSlug(name) || '';
  const normSlug = (slug || name || '').toLowerCase().replace(/[^a-z0-9]/g, '');
  const rawTarget = `${slug} ${name} ${logoUrl || ''}`.toLowerCase();

  // Direct authentic brand keyword resolution - bulletproof against any custom slug/URL variant
  let effectiveKey = baseSlug || normSlug;
  if (rawTarget.includes('odoo')) effectiveKey = 'odoo';
  else if (rawTarget.includes('loom')) effectiveKey = 'loom';
  else if (rawTarget.includes('airtable')) effectiveKey = 'airtable';
  else if (rawTarget.includes('supabase')) effectiveKey = 'supabase';
  else if (rawTarget.includes('slack')) effectiveKey = 'slack';
  else if (rawTarget.includes('discord')) effectiveKey = 'discord';
  else if (rawTarget.includes('github')) effectiveKey = 'github';
  else if (rawTarget.includes('notion')) effectiveKey = 'notion';
  else if (rawTarget.includes('linear')) effectiveKey = 'linear';
  else if (rawTarget.includes('salesforce') || rawTarget.includes('sfdc')) effectiveKey = 'salesforce';
  else if (rawTarget.includes('spotify')) effectiveKey = 'spotify';
  else if (rawTarget.includes('zoom')) effectiveKey = 'zoom';
  else if (rawTarget.includes('hubspot')) effectiveKey = 'hubspot';
  else if (rawTarget.includes('zoho')) effectiveKey = 'zoho';
  else if (rawTarget.includes('stripe')) effectiveKey = 'stripe';
  else if (rawTarget.includes('shopify')) effectiveKey = 'shopify';
  else if (rawTarget.includes('figma')) effectiveKey = 'figma';
  else if (rawTarget.includes('miro')) effectiveKey = 'miro';
  else if (rawTarget.includes('canva')) effectiveKey = 'canva';
  else if (rawTarget.includes('atlassian') || rawTarget.includes('jira') || rawTarget.includes('confluence')) effectiveKey = 'atlassian';
  else if (rawTarget.includes('okta')) effectiveKey = 'okta';
  else if (rawTarget.includes('auth0')) effectiveKey = 'auth0';
  else if (rawTarget.includes('posthog')) effectiveKey = 'posthog';
  else if (rawTarget.includes('linkedin')) effectiveKey = 'linkedin';
  else if (rawTarget.includes('paypal')) effectiveKey = 'paypal';
  else if (rawTarget.includes('square')) effectiveKey = 'square';
  else if (rawTarget.includes('quickbooks') || rawTarget.includes('intuit')) effectiveKey = 'quickbooks';
  else if (rawTarget.includes('xero')) effectiveKey = 'xero';
  else if (rawTarget.includes('calendly')) effectiveKey = 'calendly';
  else if (rawTarget.includes('reddit')) effectiveKey = 'reddit';
  else if (rawTarget.includes('docusign')) effectiveKey = 'docusign';
  else if (rawTarget.includes('clickup')) effectiveKey = 'clickup';
  else if (rawTarget.includes('monday')) effectiveKey = 'monday';
  else if (rawTarget.includes('zendesk')) effectiveKey = 'zendesk';
  else if (rawTarget.includes('intercom')) effectiveKey = 'intercom';
  else if (rawTarget.includes('box')) effectiveKey = 'box';
  else if (rawTarget.includes('twilio')) effectiveKey = 'twilio';
  else if (rawTarget.includes('asana')) effectiveKey = 'asana';
  else if (rawTarget.includes('dropbox')) effectiveKey = 'dropbox';
  else if (rawTarget.includes('gitlab')) effectiveKey = 'gitlab';
  else if (rawTarget.includes('twitter') || rawTarget.includes('x.com') || rawTarget.split(/[^a-z0-9]/).includes('x')) effectiveKey = 'x';
  else if (rawTarget.includes('calendar') || rawTarget.includes('gcal')) effectiveKey = 'googlecalendar';
  else if (rawTarget.includes('google')) effectiveKey = 'google';
  else if (rawTarget.includes('microsoft') || rawTarget.includes('azure') || rawTarget.includes('entra') || rawTarget.includes('msft')) effectiveKey = 'microsoft';

  const key = effectiveKey;

  const sizeClasses = {
    sm: 'w-5 h-5 text-xs',
    md: 'w-6 h-6 text-sm',
    lg: 'w-8 h-8 text-base',
    xl: 'w-10 h-10 text-lg',
  }[size];

  // Embedded official vector SVGs for curated and top requested providers (0 network dependency, 0 broken images)
  switch (key) {
    // 1. Odoo (Enterprise ERP, CRM & Business Suite)
    case 'odoo':
    case 'docsodoo':
    case 'docsodoocom':
      return (
        <svg viewBox="0 0 100 100" className={`${sizeClasses} ${className}`} fill="none">
          <rect width="100" height="100" rx="20" fill="#714B67" />
          <path
            d="M31 66c-9.4 0-17-7.6-17-17s7.6-17 17-17 17 7.6 17 17-7.6 17-17 17zm0-8c5 0 9-4 9-9s-4-9-9-9-9 4-9 9 4 9 9 9z"
            fill="#FFFFFF"
          />
          <path
            d="M52 32h8v10.5c2.5-3.5 6.5-5.5 11-5.5 8.3 0 15 6.7 15 15s-6.7 15-15 15c-4.5 0-8.5-2-11-5.5V66h-8V32zm19 26c4.4 0 8-3.6 8-8s-3.6-8-8-8-8 3.6-8 8 3.6 8 8 8z"
            fill="#FFFFFF"
          />
          <circle cx="84" cy="51" r="5" fill="#017E84" />
        </svg>
      );

    // 2. Discord
    case 'discord':
      return (
        <svg viewBox="0 0 127.14 96.36" className={`${sizeClasses} ${className}`} fill="#5865F2">
          <path d="M107.7,8.07A105.15,105.15,0,0,0,81.47,0a72.06,72.06,0,0,0-3.36,6.83A97.68,97.68,0,0,0,49,6.83,72.37,72.37,0,0,0,45.64,0,105.89,105.89,0,0,0,19.39,8.09C2.79,32.65-1.71,56.6.54,80.21h0A105.73,105.73,0,0,0,32.71,96.36,77.7,77.7,0,0,0,39.6,85.25a68.42,68.42,0,0,1-10.85-5.18c.91-.66,1.8-1.34,2.66-2a75.57,75.57,0,0,0,64.32,0c.87.71,1.76,1.39,2.66,2a68.68,68.68,0,0,1-10.87,5.19,77,77,0,0,0,6.89,11.1A105.25,105.25,0,0,0,126.6,80.22h0C129.24,52.84,122.09,29.11,107.7,8.07ZM42.45,65.69C36.18,65.69,31,60,31,53s5-12.74,11.43-12.74S54,46,53.86,53,48.81,65.69,42.45,65.69Zm42.24,0C78.41,65.69,73.25,60,73.25,53s5-12.74,11.44-12.74S96.23,46,96.12,53,91.08,65.69,84.69,65.69Z" />
        </svg>
      );

    // 3. GitHub
    case 'github':
      return (
        <svg viewBox="0 0 98 96" className={`${sizeClasses} ${className}`} fill="#24292F">
          <path fillRule="evenodd" clipRule="evenodd" d="M48.854 0C21.839 0 0 22 0 49.217c0 21.756 13.993 40.172 33.405 46.69 2.427.49 3.316-1.059 3.316-2.362 0-1.141-.08-5.052-.08-9.127-13.59 2.934-16.42-5.867-16.42-5.867-2.184-5.704-5.42-7.17-5.42-7.17-4.448-3.015.324-3.015.324-3.015 4.934.326 7.523 5.052 7.523 5.052 4.367 7.496 11.404 5.378 14.235 4.074.404-3.178 1.699-5.378 3.074-6.6-10.839-1.141-22.243-5.378-22.243-24.283 0-5.378 1.94-9.778 5.014-13.2-.485-1.222-2.184-6.275.486-13.038 0 0 4.125-1.304 13.426 5.052a46.97 46.97 0 0 1 12.214-1.63c4.125 0 8.33.571 12.213 1.63 9.302-6.356 13.427-5.052 13.427-5.052 2.67 6.763.97 11.816.485 13.038 3.155 3.422 5.015 7.822 5.015 13.2 0 18.905-11.404 23.06-22.324 24.283 1.78 1.548 3.316 4.481 3.316 9.126 0 6.6-.08 11.897-.08 13.526 0 1.304.89 2.853 3.316 2.364 19.412-6.52 33.405-24.935 33.405-46.691C97.707 22 75.788 0 48.854 0z" />
        </svg>
      );

    // 4. Google
    case 'google':
      return (
        <svg viewBox="0 0 48 48" className={`${sizeClasses} ${className}`}>
          <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
          <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
          <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
          <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
        </svg>
      );

    // 5. Google Calendar
    case 'googlecalendar':
    case 'gcal':
    case 'calendar':
      return (
        <svg viewBox="0 0 48 48" className={`${sizeClasses} ${className}`}>
          <path fill="#1976D2" d="M38 42H10a4 4 0 0 1-4-4V14a4 4 0 0 1 4-4h28a4 4 0 0 1 4 4v24a4 4 0 0 1-4 4z"/>
          <path fill="#42A5F5" d="M38 10H10a4 4 0 0 0-4 4v2h36v-2a4 4 0 0 0-4-4z"/>
          <rect width="4" height="8" x="12" y="4" fill="#0D47A1" rx="2"/>
          <rect width="4" height="8" x="32" y="4" fill="#0D47A1" rx="2"/>
          <text x="24" y="32" fill="#FFFFFF" fontSize="16" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">31</text>
        </svg>
      );

    // 6. Supabase
    case 'supabase':
      return (
        <svg viewBox="0 0 106 107" className={`${sizeClasses} ${className}`} fill="none">
          <path d="M58.455 106.12c-2.31 2.57-6.53.94-6.53-2.52V58.74h37.49c4.27 0 6.64 4.96 3.98 8.3L58.455 106.12z" fill="#3ECF8E"/>
          <path d="M47.545.88c2.31-2.57 6.53-.94 6.53 2.52v44.86H16.585c-4.27 0-6.64-4.96-3.98-8.3L47.545.88z" fill="#3ECF8E" fillOpacity=".8"/>
        </svg>
      );

    // 7. Airtable
    case 'airtable':
      return (
        <svg viewBox="0 0 40 33" className={`${sizeClasses} ${className}`} fill="none">
          <path fillRule="evenodd" clipRule="evenodd" d="M18.59.35a2.5 2.5 0 0 1 2.82 0l16.88 11.25a2.5 2.5 0 0 1-1.41 4.56H3.12a2.5 2.5 0 0 1-1.41-4.56L18.59.35z" fill="#FCB400"/>
          <path fillRule="evenodd" clipRule="evenodd" d="M17.82 17.65 1.5 24.36A2.5 2.5 0 0 0 0 26.68v4.45a2.5 2.5 0 0 0 3.39 2.35l14.43-5.22v-10.6z" fill="#18BFFF"/>
          <path fillRule="evenodd" clipRule="evenodd" d="m22.18 17.65 16.32 6.71a2.5 2.5 0 0 1 1.5 2.32v4.45a2.5 2.5 0 0 1-3.39 2.35l-14.43-5.22v-10.6z" fill="#ED3C4A"/>
        </svg>
      );

    // 8. Slack
    case 'slack':
      return (
        <svg viewBox="0 0 127 127" className={`${sizeClasses} ${className}`}>
          <path d="M27.2 80c0 7.3-5.9 13.2-13.2 13.2C6.7 93.2.8 87.3.8 80c0-7.3 5.9-13.2 13.2-13.2h13.2V80zm6.6 0c0-7.3 5.9-13.2 13.2-13.2 7.3 0 13.2 5.9 13.2 13.2v33c0 7.3-5.9 13.2-13.2 13.2-7.3 0-13.2-5.9-13.2-13.2V80z" fill="#E01E5A"/>
          <path d="M47 27.2c-7.3 0-13.2-5.9-13.2-13.2C33.8 6.7 39.7.8 47 .8c7.3 0 13.2 5.9 13.2 13.2v13.2H47zm0 6.6c7.3 0 13.2 5.9 13.2 13.2 0 7.3-5.9 13.2-13.2 13.2H14c-7.3 0-13.2-5.9-13.2-13.2 0-7.3 5.9-13.2 13.2-13.2h33z" fill="#36C5F0"/>
          <path d="M99.8 47c0-7.3 5.9-13.2 13.2-13.2 7.3 0 13.2 5.9 13.2 13.2 0 7.3-5.9 13.2-13.2 13.2H99.8V47zm-6.6 0c0 7.3-5.9 13.2-13.2 13.2-7.3 0-13.2-5.9-13.2-13.2V14c0-7.3 5.9-13.2 13.2-13.2 7.3 0 13.2 5.9 13.2 13.2v33z" fill="#2EB67D"/>
          <path d="M80 99.8c7.3 0 13.2 5.9 13.2 13.2 0 7.3-5.9 13.2-13.2 13.2-7.3 0-13.2-5.9-13.2-13.2V99.8H80zm0-6.6c-7.3 0-13.2-5.9-13.2-13.2 0-7.3 5.9-13.2 13.2-13.2h33c7.3 0 13.2 5.9 13.2 13.2 0 7.3-5.9 13.2-13.2 13.2H80z" fill="#ECB22E"/>
        </svg>
      );

    // 9. Notion
    case 'notion':
      return (
        <svg viewBox="0 0 100 100" className={`${sizeClasses} ${className}`} fill="#000000">
          <path d="M6.3 12.2l56.8-5.6c4.7-.5 7.8 1.3 9.7 4.9l20.4 30.5c1.8 2.7 2 6 .5 9.1L78 89.2c-2.3 4.4-6.5 6.9-11.4 6.9H13.8c-5.7 0-9.8-3.9-10.4-9.6L.2 21.6c-.6-5.4 2.6-9 6.1-9.4zm54.3 9.7L22.2 25.7c-2 .2-3.1 1.6-2.9 3.6l4.2 46.9c.2 2 1.8 3.3 3.8 3.1l38.4-3.8c2-.2 3.1-1.6 2.9-3.6l-4.2-46.9c-.2-2-1.9-3.2-3.8-3.1zM34.4 36.4h9.8v29.1h-7.7l-8.6-16.1v16.1h-8.9V36.4h9.3l8.1 15.6V36.4z" />
        </svg>
      );

    // 10. Salesforce
    case 'salesforce':
      return (
        <svg viewBox="0 0 24 24" className={`${sizeClasses} ${className}`} fill="#00A1E0">
          <path d="M19.34 9.17a6.22 6.22 0 0 0-4.63-2.07 6.15 6.15 0 0 0-2.3.45 7.42 7.42 0 0 0-6.9-2.08 7.38 7.38 0 0 0-4.66 4.7A5.44 5.44 0 0 0 0 15.42a5.49 5.49 0 0 0 5.48 5.48h13.2A5.3 5.3 0 0 0 24 15.6a5.27 5.27 0 0 0-4.66-6.43z" />
        </svg>
      );

    // 11. HubSpot
    case 'hubspot':
      return (
        <svg viewBox="0 0 512 512" className={`${sizeClasses} ${className}`} fill="#FF7A59">
          <path d="M381.1 184.2V136c13.7-7.9 23-22.7 23-39.7 0-25.5-20.7-46.3-46.3-46.3s-46.3 20.7-46.3 46.3c0 17 9.3 31.8 23 39.7v48.2c-23.7 7.7-43.7 22.8-56.9 42.4L165.2 142c2.4-5.2 3.8-11 3.8-17.1 0-23.4-19-42.4-42.4-42.4-23.4 0-42.4 19-42.4 42.4 0 23.4 19 42.4 42.4 42.4 7.6 0 14.7-2 20.9-5.5l110.8 83.1c-14.8 21.6-23.5 47.7-23.5 75.8 0 74.2 60.1 134.3 134.3 134.3s134.3-60.1 134.3-134.3c0-67.6-50.1-123.5-115.5-132.8l-6.9-43.9zm-23.3-99c9.3 0 16.9 7.6 16.9 16.9s-7.6 16.9-16.9 16.9-16.9-7.6-16.9-16.9 7.6-16.9 16.9-16.9zm11.3 331.4c-56.7 0-102.7-46-102.7-102.7 0-56.7 46-102.7 102.7-102.7 56.7 0 102.7 46 102.7 102.7s-46 102.7-102.7 102.7z" />
        </svg>
      );

    // 12. Linear
    case 'linear':
      return (
        <svg viewBox="0 0 100 100" className={`${sizeClasses} ${className}`} fill="#5E6AD2">
          <path d="M1.2 56.6C.4 54.4 0 52 0 49.5 0 22.2 22.2 0 49.5 0c2.5 0 4.9.4 7.1 1.2L1.2 56.6zM2.8 71.3l68.5-68.5C65 1.5 57.5 0 49.5 0 22.2 0 0 22.2 0 49.5c0 8 1.5 15.5 4.1 22.1l-1.3-.3zM98.8 43.4C99.6 45.6 100 48 100 50.5 100 77.8 77.8 100 50.5 100c-2.5 0-4.9-.4-7.1-1.2l55.4-55.4zM97.2 28.7L28.7 97.2c6.3 1.3 12.8 2.8 20.8 2.8 27.3 0 49.5-22.2 49.5-49.5 0-8-1.5-15.5-4.1-22.1l2.3.3zM85.4 14.6L14.6 85.4c9.8 9.3 22.9 14.6 36.9 14.6 27.3 0 49.5-22.2 49.5-49.5 0-14-5.3-27.1-15.6-35.9z" />
        </svg>
      );

    // 13. Shopify
    case 'shopify':
      return (
        <svg viewBox="0 0 109 123" className={`${sizeClasses} ${className}`}>
          <path fill="#95BF47" d="M79.5 120.3L9.6 106.6C4.4 105.6 0 99.8 0 94.6L0 27.5C0 22.3 4.4 18.9 9.6 19.9L79.5 33.6C84.7 34.6 89.1 40.4 89.1 45.6L89.1 112.7C89.1 117.9 84.7 121.3 79.5 120.3Z"/>
          <path fill="#5E8E3E" d="M79.5 33.6L67.5 7.7C65.5 3.3 61.1 0 56.4 0L32.7 0C28 0 23.6 3.3 21.6 7.7L9.6 33.6"/>
          <path fill="#FFFFFF" d="M57.6 66.8C54.4 65.5 50.8 64.9 47.3 64.9C40.6 64.9 36.6 68.3 36.6 73.1C36.6 82.5 54.3 80.5 54.3 93.4C54.3 100.8 48.3 105.5 39.5 105.5C33.3 105.5 28.5 103.9 24.3 101.4L26.7 92.5C30.3 94.7 34.9 96.3 39.3 96.3C45.3 96.3 48.7 93.3 48.7 89.1C48.7 80.2 31.2 81.7 31.2 69.1C31.2 62.4 36.8 56.9 46.5 56.9C51.6 56.9 56.1 58.1 59.5 59.9L57.6 66.8Z"/>
        </svg>
      );

    // 14. Stripe
    case 'stripe':
      return (
        <svg viewBox="0 0 40 40" className={`${sizeClasses} ${className}`}>
          <rect width="40" height="40" rx="8" fill="#635BFF"/>
          <path d="M19.4 15.6c0-1.7 1.4-2.3 3.6-2.3 3.2 0 7.3 1 10.4 2.7V8.5c-3.4-1.4-7.1-2-10.4-2-8.5 0-14.3 4.4-14.3 12 0 11.6 15.9 9.8 15.9 14.8 0 2-1.8 2.7-4.4 2.7-3.8 0-8.7-1.6-12.5-3.7v7.7c4 1.7 8.3 2.5 12.5 2.5 8.8 0 14.9-4.3 14.9-12.1-.1-12.2-15.7-10.3-15.7-14.9z" fill="#FFFFFF"/>
        </svg>
      );

    // 15. Box
    case 'box':
      return (
        <svg viewBox="0 0 32 32" className={`${sizeClasses} ${className}`}>
          <rect width="32" height="32" rx="6" fill="#0061D5"/>
          <path fill="#FFFFFF" d="M10 9a3 3 0 0 0-3 3v8a3 3 0 0 0 3 3h3v-2h-3a1 1 0 0 1-1-1v-8a1 1 0 0 1 1-1h3V9h-3zm12 0h-3v2h3a1 1 0 0 1 1 1v8a1 1 0 0 1-1 1h-3v2h3a3 3 0 0 0 3-3v-8a3 3 0 0 0-3-3zM13 14h6v4h-6z"/>
        </svg>
      );

    // 16. Twilio
    case 'twilio':
      return (
        <svg viewBox="0 0 32 32" className={`${sizeClasses} ${className}`}>
          <circle cx="16" cy="16" r="16" fill="#F22F46"/>
          <circle cx="12" cy="12" r="3" fill="#FFFFFF"/>
          <circle cx="20" cy="12" r="3" fill="#FFFFFF"/>
          <circle cx="12" cy="20" r="3" fill="#FFFFFF"/>
          <circle cx="20" cy="20" r="3" fill="#FFFFFF"/>
        </svg>
      );

    // 17. Asana
    case 'asana':
      return (
        <svg viewBox="0 0 32 32" className={`${sizeClasses} ${className}`}>
          <circle cx="16" cy="10" r="5" fill="#F06A6A"/>
          <circle cx="9.5" cy="21" r="5" fill="#F06A6A"/>
          <circle cx="22.5" cy="21" r="5" fill="#F06A6A"/>
        </svg>
      );

    // 18. Dropbox
    case 'dropbox':
      return (
        <svg viewBox="0 0 40 40" className={`${sizeClasses} ${className}`} fill="#0061FE">
          <path d="M12.5 8 5 13l7.5 5 7.5-5-7.5-5zm15 0-7.5 5 7.5 5 7.5-5-7.5-5zM5 23l7.5 5 7.5-5-7.5-5L5 23zm27.5-5-7.5 5 7.5 5 7.5-5-7.5-5zM12.5 30.5l7.5 5 7.5-5-7.5-5-7.5 5z"/>
        </svg>
      );

    // 19. GitLab
    case 'gitlab':
      return (
        <svg viewBox="0 0 36 36" className={`${sizeClasses} ${className}`}>
          <path fill="#E24329" d="m18 33.2-6.5-20H24.5L18 33.2z"/>
          <path fill="#FC6D26" d="m18 33.2-6.5-20h-7.9l14.4 20z"/>
          <path fill="#FCA326" d="m3.6 13.2-1.9 5.8a1.5 1.5 0 0 0 .5 1.7L18 33.2 3.6 13.2z"/>
          <path fill="#E24329" d="M3.6 13.2h7.9l-3.9-12a.8.8 0 0 0-1.5 0l-2.5 12z"/>
          <path fill="#FC6D26" d="m18 33.2 6.5-20h7.9L18 33.2z"/>
          <path fill="#FCA326" d="m32.4 13.2 1.9 5.8a1.5 1.5 0 0 1-.5 1.7L18 33.2 32.4 13.2z"/>
          <path fill="#E24329" d="M32.4 13.2h-7.9l3.9-12a.8.8 0 0 1 1.5 0l2.5 12z"/>
        </svg>
      );

    // 20. Figma
    case 'figma':
      return (
        <svg viewBox="0 0 38 57" className={`${sizeClasses} ${className}`}>
          <path fill="#1ABCFE" d="M19 28.5a9.5 9.5 0 1 1 19 0 9.5 9.5 0 0 1-19 0z"/>
          <path fill="#0ACF83" d="M0 47.5A9.5 9.5 0 0 1 9.5 38H19v9.5a9.5 9.5 0 1 1-19 0z"/>
          <path fill="#FF7262" d="M19 0v19h9.5a9.5 9.5 0 1 0 0-19H19z"/>
          <path fill="#F24E1E" d="M0 9.5A9.5 9.5 0 0 0 9.5 19H19V0H9.5A9.5 9.5 0 0 0 0 9.5z"/>
          <path fill="#A259FF" d="M0 28.5A9.5 9.5 0 0 0 9.5 38H19V19H9.5A9.5 9.5 0 0 0 0 28.5z"/>
        </svg>
      );

    // 21. Spotify
    case 'spotify':
      return (
        <svg viewBox="0 0 168 168" className={`${sizeClasses} ${className}`} fill="#1DB954">
          <circle cx="84" cy="84" r="84" />
          <path d="M127.3 120.9c-1.8 2.9-5.5 3.8-8.4 2-23-14.1-52-17.3-86.1-9.5-3.3.7-6.5-1.4-7.3-4.7s1.4-6.5 4.7-7.3c37.5-8.6 69.6-5 95.1 10.7 2.9 1.8 3.8 5.7 2 8.8zm11.2-24.9c-2.2 3.6-6.9 4.8-10.5 2.5-26.3-16.2-66.5-20.9-97.7-11.4-4 1.2-8.3-1.1-9.5-5.1-1.2-4 1.1-8.3 5.1-9.5 35.6-10.8 79.9-5.6 110.1 13 3.6 2.2 4.7 6.9 2.5 10.5zm1.2-26C108.2 51.1 56.4 49.3 26.5 58.4c-4.8 1.5-9.9-1.3-11.3-6.1s1.3-9.9 6.1-11.3C55.2 29.5 112.5 31.6 148.6 53c4.3 2.6 5.8 8.2 3.2 12.5-2.6 4.3-8.2 5.8-12.1 4.5z" fill="#FFFFFF"/>
        </svg>
      );

    // 22. Zoom
    case 'zoom':
      return (
        <svg viewBox="0 0 24 24" className={`${sizeClasses} ${className}`}>
          <circle cx="12" cy="12" r="12" fill="#0B5CFF" />
          <path d="M5.5 8.5C5.5 7.67 6.17 7 7 7H14C14.83 7 15.5 7.67 15.5 8.5V15.5C15.5 16.33 14.83 17 14 17H7C6.17 17 5.5 16.33 5.5 15.5V8.5ZM16.5 10.2L19.2 8.3C19.64 7.99 20.25 8.3 20.25 8.84V15.16C20.25 15.7 19.64 16.01 19.2 15.7L16.5 13.8V10.2Z" fill="#FFFFFF" />
        </svg>
      );

    // 23. Loom
    case 'loom':
      return (
        <svg viewBox="0 0 40 40" className={`${sizeClasses} ${className}`} fill="none">
          <rect width="40" height="40" rx="8" fill="#625DF5" />
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M20 10c1.1 0 2 .9 2 2v6.6l4.6-4.6c.8-.8 2-.8 2.8 0s.8 2 0 2.8L24.8 21.4H30c1.1 0 2 .9 2 2s-.9 2-2 2h-5.2l4.6 4.6c.8.8.8 2 0 2.8-.8.8-2 .8-2.8 0L22 28.2V30c0 1.1-.9 2-2 2s-2-.9-2-2v-1.8l-4.6 4.6c-.8.8-2 .8-2.8 0-.8-.8-.8-2 0-2.8l4.6-4.6H10c-1.1 0-2-.9-2-2s.9-2 2-2h5.2l-4.6-4.6c-.8-.8-.8-2 0-2.8.8-.8 2-.8 2.8 0l4.6 4.6V12c0-1.1.9-2 2-2z"
            fill="#FFFFFF"
          />
        </svg>
      );

    // 24. Microsoft / Azure / Entra ID
    case 'microsoft':
    case 'azure':
    case 'entra':
    case 'msft':
      return (
        <svg viewBox="0 0 23 23" className={`${sizeClasses} ${className}`}>
          <path fill="#F25022" d="M1 1h10v10H1z" />
          <path fill="#7FBA00" d="M12 1h10v10H12z" />
          <path fill="#00A4EF" d="M1 12h10v10H1z" />
          <path fill="#FFB900" d="M12 12h10v10H12z" />
        </svg>
      );

    // 25. X / Twitter
    case 'x':
    case 'twitter':
      return (
        <svg viewBox="0 0 24 24" className={`${sizeClasses} ${className}`} fill="#000000">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      );

    // 26. Zoho
    case 'zoho':
      return (
        <svg viewBox="0 0 32 32" className={`${sizeClasses} ${className}`}>
          <rect width="13" height="13" x="2" y="2" rx="2.5" fill="#E42528" />
          <rect width="13" height="13" x="17" y="2" rx="2.5" fill="#148943" />
          <rect width="13" height="13" x="2" y="17" rx="2.5" fill="#0070BA" />
          <rect width="13" height="13" x="17" y="17" rx="2.5" fill="#F4AB20" />
        </svg>
      );

    // 27. Miro
    case 'miro':
      return (
        <svg viewBox="0 0 24 24" className={`${sizeClasses} ${className}`}>
          <rect width="24" height="24" rx="4" fill="#FFD02F" />
          <path
            d="M5.5 16.5l3.2-9h2.8l-3.2 9H5.5zm4.8 0l3.2-9h2.8l-3.2 9h-2.8zm4.8 0l3.2-9h2.8l-3.2 9h-2.8z"
            fill="#050038"
          />
        </svg>
      );

    // 28. Canva
    case 'canva':
      return (
        <svg viewBox="0 0 32 32" className={`${sizeClasses} ${className}`}>
          <circle cx="16" cy="16" r="16" fill="#00C4CC" />
          <path
            d="M17.8 22.4c-4.2 0-7.3-3.2-7.3-7.5s3.3-7.5 7.6-7.5c2.5 0 4.6 1.1 5.7 2.8l-2.4 1.7c-.8-1.2-2-1.9-3.3-1.9-2.5 0-4.5 1.9-4.5 4.9s1.9 4.9 4.4 4.9c1.6 0 2.8-.7 3.5-1.9l2.4 1.7c-1.3 1.8-3.5 2.8-6.1 2.8z"
            fill="#FFFFFF"
          />
        </svg>
      );

    // 29. Atlassian / Jira / Confluence
    case 'atlassian':
    case 'jira':
    case 'confluence':
      return (
        <svg viewBox="0 0 32 32" className={`${sizeClasses} ${className}`}>
          <rect width="32" height="32" rx="6" fill="#0052CC" />
          <path d="M15.8 7.5c-.3-.5-.9-.8-1.5-.7-.6.1-1.1.5-1.3 1.1L8.5 22.8c-.2.5 0 1.1.4 1.5.4.4 1 .5 1.5.3l6.2-2.5c.6-.2 1-.8 1-1.4V8.5c0-.4-.3-.8-.8-1z" fill="#2684FF" />
          <path d="M16.2 7.5c.3-.5.9-.8 1.5-.7.6.1 1.1.5 1.3 1.1l4.5 14.9c.2.5 0 1.1-.4 1.5-.4.4-1 .5-1.5.3l-6.2-2.5c-.6-.2-1-.8-1-1.4V8.5c0-.4.3-.8.8-1z" fill="#FFFFFF" />
        </svg>
      );

    // 30. Okta
    case 'okta':
      return (
        <svg viewBox="0 0 32 32" className={`${sizeClasses} ${className}`}>
          <circle cx="16" cy="16" r="16" fill="#007DC1" />
          <circle cx="16" cy="16" r="8" fill="#FFFFFF" />
        </svg>
      );

    // 31. Auth0
    case 'auth0':
      return (
        <svg viewBox="0 0 32 32" className={`${sizeClasses} ${className}`}>
          <rect width="32" height="32" rx="6" fill="#16214C" />
          <path d="M16 6.5l7 3.5v6.5c0 4.5-3 8.7-7 9.8-4-1.1-7-5.3-7-9.8V10l7-3.5z" fill="#EB5424" />
          <path d="M16 8.5L11 11v5.5c0 3.3 2.1 6.4 5 7.2 2.9-.8 5-3.9 5-7.2V11l-5-2.5z" fill="#FFFFFF" />
        </svg>
      );

    // 32. PostHog
    case 'posthog':
      return (
        <svg viewBox="0 0 32 32" className={`${sizeClasses} ${className}`}>
          <rect width="32" height="32" rx="6" fill="#1D1F27" />
          <path d="M7 16c0-4.4 3.6-8 8-8h2v4h-2c-2.2 0-4 1.8-4 4v1h-4v-1zm14-4v1h4v-1c0-4.4-3.6-8-8-8h-2v4h2c2.2 0 4 1.8 4 4zm-8 12c-2.2 0-4-1.8-4-4v-1H5v1c0 4.4 3.6 8 8 8h2v-4h-2zm12-4c0 2.2-1.8 4-4 4h-2v4h2c4.4 0 8-3.6 8-8v-1h-4v1z" fill="#F54E00" />
          <circle cx="16" cy="16" r="3" fill="#FFD02F" />
        </svg>
      );

    // 33. LinkedIn
    case 'linkedin':
      return (
        <svg viewBox="0 0 32 32" className={`${sizeClasses} ${className}`}>
          <rect width="32" height="32" rx="6" fill="#0A66C2" />
          <path d="M9 13h3.5v11H9V13zm1.8-5.5a2 2 0 1 1 0 4 2 2 0 0 1 0-4zm4.7 5.5h3.3v1.5h.1c.5-.9 1.7-1.8 3.4-1.8 3.6 0 4.3 2.4 4.3 5.5V24h-3.5v-5.2c0-1.2 0-2.8-1.7-2.8s-2 1.3-2 2.7V24h-3.5V13z" fill="#FFFFFF" />
        </svg>
      );

    // 34. PayPal
    case 'paypal':
      return (
        <svg viewBox="0 0 32 32" className={`${sizeClasses} ${className}`}>
          <rect width="32" height="32" rx="6" fill="#003087" />
          <path d="M12 7h6c2.8 0 5 1.8 5 4.5 0 3.2-2.3 5.5-5.5 5.5h-2.3l-1.2 7H10l3-17h-1zm3.8 2.2l-1.2 6.6h2.2c1.8 0 3.2-1.3 3.2-3.3 0-1.8-1.4-3.3-3.2-3.3h-1z" fill="#0079C1" />
          <path d="M14.5 11h5.5c2.5 0 4.5 1.6 4.5 4 0 2.8-2 4.8-4.8 4.8h-2l-1 6H13l2.5-14.8h-1zm3.2 2l-1 5.8h1.8c1.5 0 2.8-1.1 2.8-2.9 0-1.6-1.2-2.9-2.8-2.9h-.8z" fill="#FFFFFF" />
        </svg>
      );

    // 35. Square
    case 'square':
      return (
        <svg viewBox="0 0 32 32" className={`${sizeClasses} ${className}`}>
          <rect width="32" height="32" rx="8" fill="#000000" />
          <rect x="7" y="7" width="18" height="18" rx="4" fill="#FFFFFF" />
          <rect x="11" y="11" width="10" height="10" rx="2" fill="#000000" />
        </svg>
      );

    // 36. QuickBooks / Intuit
    case 'quickbooks':
    case 'intuit':
      return (
        <svg viewBox="0 0 32 32" className={`${sizeClasses} ${className}`}>
          <circle cx="16" cy="16" r="16" fill="#2CA01C" />
          <path d="M12 10c-3.3 0-6 2.7-6 6s2.7 6 6 6h1v-2.2h-1c-2.1 0-3.8-1.7-3.8-3.8s1.7-3.8 3.8-3.8h1V10h-1zm8 0h-1v2.2h1c2.1 0 3.8 1.7 3.8 3.8s-1.7 3.8-3.8 3.8h-1V22h1c3.3 0 6-2.7 6-6s-2.7-6-6-6z" fill="#FFFFFF" />
          <rect x="11" y="10" width="2.2" height="9" fill="#FFFFFF" rx="1" />
          <rect x="18.8" y="13" width="2.2" height="9" fill="#FFFFFF" rx="1" />
        </svg>
      );

    // 37. Xero
    case 'xero':
      return (
        <svg viewBox="0 0 32 32" className={`${sizeClasses} ${className}`}>
          <circle cx="16" cy="16" r="16" fill="#13B5EA" />
          <path d="M10 12l4 4-4 4h2.5l2.75-2.75L18 20h2.5l-4-4 4-4H18l-2.75 2.75L12.5 12H10z" fill="#FFFFFF" />
        </svg>
      );

    // 38. Calendly
    case 'calendly':
      return (
        <svg viewBox="0 0 32 32" className={`${sizeClasses} ${className}`}>
          <circle cx="16" cy="16" r="16" fill="#006BFF" />
          <path d="M16 8c-4.4 0-8 3.6-8 8s3.6 8 8 8c3.2 0 6-1.9 7.2-4.6l-3.2-1.3c-.7 1.6-2.3 2.7-4 2.7-2.5 0-4.5-2-4.5-4.8s2-4.8 4.5-4.8c1.7 0 3.3 1.1 4 2.7l3.2-1.3C22 9.9 19.2 8 16 8z" fill="#FFFFFF" />
        </svg>
      );

    // 39. Reddit
    case 'reddit':
      return (
        <svg viewBox="0 0 32 32" className={`${sizeClasses} ${className}`}>
          <circle cx="16" cy="16" r="16" fill="#FF4500" />
          <path d="M24 16a2 2 0 0 0-2-2c-.3 0-.6.1-.8.2-1.3-.9-3-1.5-4.9-1.6l1-4 2.7.6a1.5 1.5 0 1 0 1.5-1.5 1.5 1.5 0 0 0-1.4 1l-3.1-.7c-.3-.1-.5.1-.6.4l-1.2 4.8c-2 .1-3.8.7-5.1 1.6-.2-.1-.5-.2-.8-.2a2 2 0 0 0 0 4c0 .3 0 .6.1.9-.1.3-.1.6-.1.9 0 2.8 3.1 5 7 5s7-2.2 7-5c0-.3 0-.6-.1-.9.1-.3.1-.6.1-.9a2 2 0 0 0 1.8-2.2zm-11.5 1a1.2 1.2 0 1 1 0 2.4 1.2 1.2 0 0 1 0-2.4zm7 5.2c-1 .8-2.3 1.2-3.5 1.2s-2.5-.4-3.5-1.2a.5.5 0 0 1 .7-.7c.8.6 1.8.9 2.8.9s2-.3 2.8-.9a.5.5 0 0 1 .7.7zm-.5-2.8a1.2 1.2 0 1 1 0-2.4 1.2 1.2 0 0 1 0 2.4z" fill="#FFFFFF" />
        </svg>
      );

    // 40. DocuSign
    case 'docusign':
      return (
        <svg viewBox="0 0 32 32" className={`${sizeClasses} ${className}`}>
          <rect width="32" height="32" rx="6" fill="#1E2832" />
          <path d="M8 10h16v3H8v-3zm0 5h16v3H8v-3zm0 5h10v3H8v-3z" fill="#FFCE00" />
          <path d="M21 19l4 4-4 4" stroke="#FFCE00" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        </svg>
      );

    // 41. ClickUp
    case 'clickup':
      return (
        <svg viewBox="0 0 32 32" className={`${sizeClasses} ${className}`}>
          <rect width="32" height="32" rx="6" fill="#7B68EE" />
          <path d="M9 19l7-6 7 6" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none" />
          <circle cx="16" cy="22" r="2.5" fill="#FFDD00" />
        </svg>
      );

    // 42. Monday.com
    case 'monday':
    case 'mondaycom':
      return (
        <svg viewBox="0 0 32 32" className={`${sizeClasses} ${className}`}>
          <rect width="32" height="32" rx="6" fill="#FFFFFF" stroke="#E5E7EB" />
          <circle cx="9" cy="16" r="3.5" fill="#FF3D57" />
          <circle cx="16" cy="16" r="3.5" fill="#FFCB00" />
          <circle cx="23" cy="16" r="3.5" fill="#00CA72" />
        </svg>
      );

    // 43. Zendesk
    case 'zendesk':
      return (
        <svg viewBox="0 0 32 32" className={`${sizeClasses} ${className}`}>
          <rect width="32" height="32" rx="6" fill="#03363D" />
          <circle cx="11" cy="11" r="4" fill="#FFFFFF" />
          <path d="M21 7v8h-8a8 8 0 0 1 8-8z" fill="#FFFFFF" />
          <circle cx="21" cy="21" r="4" fill="#FFFFFF" />
          <path d="M11 25v-8h8a8 8 0 0 1-8 8z" fill="#FFFFFF" />
        </svg>
      );

    // 44. Intercom
    case 'intercom':
      return (
        <svg viewBox="0 0 32 32" className={`${sizeClasses} ${className}`}>
          <rect width="32" height="32" rx="6" fill="#286EFA" />
          <path d="M10 10v7c0 3.3 2.7 6 6 6s6-2.7 6-6v-7" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" fill="none" />
          <path d="M13 14v4M16 13v5M19 14v4" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" />
        </svg>
      );

    default: {
      // Dynamic fallback for any uncataloged or custom provider:
      // 1. Try Google Favicon CDN with apex domain resolution
      // 2. Try DuckDuckGo Favicon CDN
      // 3. Fall back to styled monogram avatar with rich gradient
      const cleanSlug = slug.toLowerCase().replace(/[^a-z0-9-.]/g, '');
      const rawDomain = cleanSlug.includes('.')
        ? cleanSlug
        : cleanSlug.replace(/-oauth|-api|-app/g, '') + '.com';

      // Extract apex domain if domain has subdomains (e.g. docs.foo.com -> foo.com)
      const domainParts = rawDomain.split('.').filter(Boolean);
      const apexDomain = domainParts.length > 2 ? domainParts.slice(-2).join('.') : rawDomain;

      const primaryLogo = logoUrl || `https://www.google.com/s2/favicons?domain=${apexDomain}&sz=128`;
      const fallbackLogo = `https://icons.duckduckgo.com/ip3/${apexDomain}.ico`;

      const resolvedLogo = imgAttempt === 0 ? primaryLogo : imgAttempt === 1 ? fallbackLogo : null;

      if (resolvedLogo && imgAttempt < 2) {
        return (
          <img
            src={resolvedLogo}
            alt={name || slug}
            onError={() => setImgAttempt((prev) => prev + 1)}
            className={`${sizeClasses} object-contain ${className}`}
            loading="lazy"
          />
        );
      }

      const initials = getInitials(name || slug || '?');
      const gradient = getGradient(name || slug || '?');

      return (
        <div
          className={`rounded-md bg-gradient-to-br ${gradient.bg} ${gradient.text} flex items-center justify-center font-bold font-mono tracking-wider shadow-inner select-none ${sizeClasses} ${className}`}
          title={name || slug}
        >
          {initials}
        </div>
      );
    }
  }
};
