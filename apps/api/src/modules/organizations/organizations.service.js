'use strict';
var __decorate =
  (this && this.__decorate) ||
  function (decorators, target, key, desc) {
    var c = arguments.length,
      r =
        c < 3
          ? target
          : desc === null
            ? (desc = Object.getOwnPropertyDescriptor(target, key))
            : desc,
      d;
    if (typeof Reflect === 'object' && typeof Reflect.decorate === 'function')
      r = Reflect.decorate(decorators, target, key, desc);
    else
      for (var i = decorators.length - 1; i >= 0; i--)
        if ((d = decorators[i]))
          r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return (c > 3 && r && Object.defineProperty(target, key, r), r);
  };
var __metadata =
  (this && this.__metadata) ||
  function (k, v) {
    if (typeof Reflect === 'object' && typeof Reflect.metadata === 'function')
      return Reflect.metadata(k, v);
  };
Object.defineProperty(exports, '__esModule', { value: true });
exports.OrganizationsService = void 0;
/**
 * OrganizationsService.
 *
 * Application/domain layer:
 *   - Knows nothing about HTTP (no Request, Response, status codes).
 *   - Knows nothing about Prisma (only the repository).
 *   - Throws DomainError for expected failure paths (not-found, slug taken).
 *
 * This is the layer that's directly unit-tested. Controllers and repositories
 * are wired in higher-level tests.
 */
const common_1 = require('@nestjs/common');
const domain_error_js_1 = require('../../common/errors/domain-error.js');
const organizations_repository_js_1 = require('./organizations.repository.js');
let OrganizationsService = class OrganizationsService {
  constructor(repo) {
    this.repo = repo;
  }
  async getById(id) {
    const org = await this.repo.findById(id);
    if (!org) {
      throw domain_error_js_1.DomainError.notFound('Organization');
    }
    return org;
  }
  async list(input) {
    const { items, nextCursor } = await this.repo.list(input);
    return {
      data: items,
      pagination: {
        nextCursor,
        hasMore: nextCursor !== null,
        limit: input.limit,
      },
    };
  }
  async create(input) {
    // Uniqueness is enforced at the DB level too, but checking here gives a
    // clean DomainError with field-level details instead of a P2002 leak.
    const existing = await this.repo.findBySlug(input.slug);
    if (existing) {
      throw domain_error_js_1.DomainError.conflict(
        'ORGANIZATION_SLUG_TAKEN',
        'Slug is already in use',
        {
          details: { field: 'slug', value: input.slug },
        },
      );
    }
    return this.repo.create(input);
  }
  async update(id, input) {
    // Ensure exists first so we get a clean 404, not a Prisma "record to update not found" 500.
    await this.getById(id);
    if (input.slug) {
      const collide = await this.repo.findBySlug(input.slug);
      if (collide && collide.id !== id) {
        throw domain_error_js_1.DomainError.conflict(
          'ORGANIZATION_SLUG_TAKEN',
          'Slug is already in use',
          {
            details: { field: 'slug', value: input.slug },
          },
        );
      }
    }
    return this.repo.update(id, input);
  }
  async delete(id) {
    await this.getById(id);
    await this.repo.delete(id);
  }
};
exports.OrganizationsService = OrganizationsService;
exports.OrganizationsService = OrganizationsService = __decorate(
  [
    (0, common_1.Injectable)(),
    __metadata('design:paramtypes', [organizations_repository_js_1.OrganizationsRepository]),
  ],
  OrganizationsService,
);
//# sourceMappingURL=organizations.service.js.map
