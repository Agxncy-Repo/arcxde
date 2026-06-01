import { IdentityProvider } from '@prisma/client';
export interface CreateIndividualInput {
  email: string;
  passwordHash: string;
  firstName: string | null;
  lastName: string | null;
}

export interface UpsertUserIdentityAndMembershipData {
  userId?: string | null; // Present if linking to an existing account
  email: string;
  fullName: string | null;
  avatarUrl?: string | null;
  provider: IdentityProvider;
  providerId: string;
  passwordHash?: string;
  organizationId?: string | null;
}

export interface NormalizedProfile {
  provider: IdentityProvider;
  providerId: string;
  email: string; // Nullable to securely support privacy cloaks like Apple Sign-In
  emailVerified: boolean;
  fullName: string | null;
  avatarUrl?: string | null;
}

export interface SessionCreationData {
  userId: string;
  tokenHash: string;
  expiresAt: Date;
}

export interface WorkspaceMatchResult {
  organizationId: string;
}

export type IdentityResolution =
  | {
      type: 'EXISTING_IDENTITY';
      userId: string;
      provider: IdentityProvider;
    }
  | {
      type: 'EXISTING_USER_NO_IDENTITY';
      userId: string;
      email: string;
    }
  | {
      type: 'NEW_USER';
      email: string;
      provider: IdentityProvider;
      providerId: string;
      domain: string | null;
    };
