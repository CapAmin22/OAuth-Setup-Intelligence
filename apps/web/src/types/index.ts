export type EvidenceStatus = 'documented' | 'attempted' | 'observed_working' | 'estimated' | 'unknown';
export type GuideStatus = 'draft' | 'awaiting_review' | 'published' | 'needs_clarification' | 'unsupported_or_unverified' | 'failed';
export type JobState = 'queued' | 'resolving' | 'discovering' | 'retrieving' | 'extracting' | 'synthesizing' | 'verifying' | 'persisting' | 'completed_draft' | 'awaiting_review' | 'published' | 'needs_clarification' | 'unsupported_or_unverified' | 'failed' | 'quota_exhausted';

export interface Source {
  id: string;
  url: string;
  publisher?: string;
  retrievedAt: string;
  contentHash: string;
  selectedPassages?: string[];
}

export interface Claim {
  id: string;
  text: string;
  context?: string;
  evidenceStatus: EvidenceStatus;
  critical?: boolean;
  sourceIds?: string[];
}

export interface Step {
  id: string;
  title: string;
  owner: 'developer' | 'admin' | 'either';
  instructions: string;
  completionCheck?: string;
  claimIds?: string[];
}

export interface Blocker {
  id: string;
  title: string;
  description: string;
  evidenceStatus: EvidenceStatus;
  sourceIds?: string[];
}

export interface Prerequisite {
  id: string;
  text: string;
  critical?: boolean;
}

export interface EffortEstimate {
  lowMinutes: number;
  highMinutes: number;
  assumptions?: string[];
  basis: 'estimated' | 'observed' | 'historical';
}

export interface ExternalWait {
  status: 'none' | 'known' | 'unknown' | 'optional';
  publishedRange?: string | null;
  sourceIds?: string[];
}

export interface EvidenceQuality {
  score: number;
  breakdown: {
    criticalClaimGrounding?: number;
    officialSourceCoverage?: number;
    completeness?: number;
    freshness?: number;
    consistency?: number;
  };
  missingEvidence?: string[];
}

export interface GuideVersion {
  id: string;
  providerId: string;
  providerSlug: string;
  providerName: string;
  version: number;
  schemaVersion: string;
  status: GuideStatus;
  intent?: {
    capabilities?: string[];
    distribution?: 'internal' | 'external' | 'both';
    environment?: string;
  };
  checkedAt?: string;
  limitations?: string[];
  evidenceQuality: EvidenceQuality;
  effort: EffortEstimate;
  externalWait?: ExternalWait;
  prerequisites: Prerequisite[];
  steps: Step[];
  blockers?: Blocker[];
  claims: Claim[];
  sources: Source[];
  attempts?: Record<string, any>[];
}

export interface Provider {
  id: string;
  slug: string;
  displayName: string;
  canonicalDomain?: string;
  aliases: string[];
  officialDomains: string[];
  isCurated: boolean;
  logoUrl?: string;
  createdAt: string;
}

export interface GenerationJob {
  id: string;
  ownerId: string;
  idempotencyKey: string;
  state: JobState;
  input: {
    query: string;
    website?: string;
    intent?: Record<string, any>;
  };
  resultGuideId?: string;
  attempt: number;
  checkpoint?: Record<string, any>;
  errorCode?: string;
  errorDetail?: string;
  createdAt: string;
  updatedAt: string;
}

export interface JobEvent {
  id: number;
  jobId: string;
  sequence: number;
  stage: string;
  eventType: 'started' | 'checkpoint' | 'completed' | 'failed' | 'info';
  safeDetails: Record<string, any>;
  createdAt: string;
}

