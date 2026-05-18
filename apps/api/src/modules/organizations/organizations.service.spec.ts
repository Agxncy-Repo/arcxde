/**
 * Service-layer test.
 *
 * Pattern (see docs/conventions/testing.md):
 *   - Mock the repository (port of the system under test), not Prisma directly.
 *   - Test domain behaviour: ordering, error mapping, the "slug already taken" rule.
 *   - One assertion theme per test.
 */
import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { Organization } from '@app/contracts';

import type { OrganizationsRepository } from './organizations.repository.js';
import { OrganizationsService } from './organizations.service.js';

const fixture = (overrides: Partial<Organization> = {}): Organization => ({
  id: 'org_abcdefghijklmnop123456',
  name: 'Acme',
  slug: 'acme',
  plan: 'free',
  billingEmail: null,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
  ...overrides,
});

const makeRepo = (): OrganizationsRepository =>
  ({
    findById: vi.fn(),
    findBySlug: vi.fn(),
    list: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  }) as unknown as OrganizationsRepository;

describe('OrganizationsService', () => {
  let repo: OrganizationsRepository;
  let service: OrganizationsService;

  beforeEach(() => {
    repo = makeRepo();
    service = new OrganizationsService(repo);
  });

  describe('getById', () => {
    it('returns the organization when it exists', async () => {
      const org = fixture();
      vi.mocked(repo.findById).mockResolvedValue(org);

      await expect(service.getById(org.id)).resolves.toEqual(org);
    });

    it('throws NOT_FOUND DomainError when missing', async () => {
      vi.mocked(repo.findById).mockResolvedValue(null);

      // Use toMatchObject instead of instanceof/isDomainError to avoid
      // cross-module identity issues with NodeNext resolution
      await expect(service.getById('org_missing0000000000000')).rejects.toMatchObject({
        code: 'ORGANIZATION_NOT_FOUND',
        kind: 'NOT_FOUND',
        httpStatus: 404,
      });
    });
  });

  describe('create', () => {
    it('creates when slug is free', async () => {
      const created = fixture();
      vi.mocked(repo.findBySlug).mockResolvedValue(null);
      vi.mocked(repo.create).mockResolvedValue(created);

      const result = await service.create({ name: 'Acme', slug: 'acme' });

      expect(result).toEqual(created);
      expect(repo.create).toHaveBeenCalledWith({ name: 'Acme', slug: 'acme' });
    });

    it('throws CONFLICT when slug is taken', async () => {
      vi.mocked(repo.findBySlug).mockResolvedValue(fixture());

      // Assert everything in one rejects chain — re-awaiting a settled
      // rejection produces inconsistent results across Vitest versions
      await expect(service.create({ name: 'Acme', slug: 'acme' })).rejects.toMatchObject({
        code: 'ORGANIZATION_SLUG_TAKEN',
        kind: 'CONFLICT',
        httpStatus: 409,
      });

      expect(repo.create).not.toHaveBeenCalled();
    });
  });

  describe('update', () => {
    it('allows updating fields including slug to its current value', async () => {
      const existing = fixture();
      vi.mocked(repo.findById).mockResolvedValue(existing);
      vi.mocked(repo.findBySlug).mockResolvedValue(existing); // same record
      vi.mocked(repo.update).mockResolvedValue({ ...existing, name: 'Acme Inc' });

      const result = await service.update(existing.id, { name: 'Acme Inc', slug: existing.slug });

      expect(result.name).toBe('Acme Inc');
    });

    it('rejects slug change that collides with another record', async () => {
      const a = fixture({ id: 'org_aaaaaaaaaaaaaaaaaaaaaaaa' });
      const b = fixture({ id: 'org_bbbbbbbbbbbbbbbbbbbbbbbb', slug: 'beta' });
      vi.mocked(repo.findById).mockResolvedValue(a);
      vi.mocked(repo.findBySlug).mockResolvedValue(b);

      await expect(service.update(a.id, { slug: 'beta' })).rejects.toMatchObject({
        code: 'ORGANIZATION_SLUG_TAKEN',
      });
    });
  });

  describe('list', () => {
    it('flips hasMore based on nextCursor presence', async () => {
      vi.mocked(repo.list).mockResolvedValue({
        items: [fixture()],
        nextCursor: 'org_next000000000000000000',
      });
      const result = await service.list({ limit: 20 });
      expect(result.pagination.hasMore).toBe(true);
    });

    it('returns hasMore=false when at the end', async () => {
      vi.mocked(repo.list).mockResolvedValue({ items: [fixture()], nextCursor: null });
      const result = await service.list({ limit: 20 });
      expect(result.pagination.hasMore).toBe(false);
    });
  });
});
