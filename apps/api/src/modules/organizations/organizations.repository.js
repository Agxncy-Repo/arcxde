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
exports.OrganizationsRepository = void 0;
/**
 * OrganizationsRepository.
 *
 * The ONLY file in this module that touches Prisma directly. Everything above
 * (service, controller) consumes a typed, intention-revealing API.
 *
 * Why: keeps the query surface auditable in one place, makes it easy to swap
 * storage implementations under test, and prevents "import the prisma client
 * anywhere it's convenient" sprawl.
 *
 * See docs/architecture/backend.md "Layering".
 */
const common_1 = require('@nestjs/common');
const prisma_service_js_1 = require('../prisma/prisma.service.js');
let OrganizationsRepository = class OrganizationsRepository {
  constructor(prisma) {
    this.prisma = prisma;
  }
  async findById(id) {
    const row = await this.prisma.organization.findUnique({ where: { id } });
    return row ? this.toDomain(row) : null;
  }
  async findBySlug(slug) {
    const row = await this.prisma.organization.findUnique({ where: { slug } });
    return row ? this.toDomain(row) : null;
  }
  /**
   * Cursor-paginated list, ordered by createdAt desc, id desc to break ties.
   * See docs/architecture/database.md "Cursor pagination".
   */
  async list(input) {
    // Fetch limit+1 to know if there's a next page without a second query.
    const rows = await this.prisma.organization.findMany({
      take: input.limit + 1,
      ...(input.cursor ? { cursor: { id: input.cursor }, skip: 1 } : {}),
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
    });
    const hasMore = rows.length > input.limit;
    const sliced = hasMore ? rows.slice(0, input.limit) : rows;
    return {
      items: sliced.map((r) => this.toDomain(r)),
      nextCursor: hasMore ? (sliced[sliced.length - 1]?.id ?? null) : null,
    };
  }
  async create(input) {
    const row = await this.prisma.organization.create({
      data: {
        name: input.name,
        slug: input.slug,
        ...(input.billingEmail !== undefined ? { billingEmail: input.billingEmail } : {}),
      },
    });
    return this.toDomain(row);
  }
  async update(id, input) {
    const row = await this.prisma.organization.update({
      where: { id },
      data: {
        ...(input.name !== undefined ? { name: input.name } : {}),
        ...(input.slug !== undefined ? { slug: input.slug } : {}),
        ...(input.billingEmail !== undefined ? { billingEmail: input.billingEmail } : {}),
      },
    });
    return this.toDomain(row);
  }
  async delete(id) {
    await this.prisma.organization.delete({ where: { id } });
  }
  /**
   * Maps the Prisma row to the public domain shape (which is what @app/contracts
   * declares). Critical conversion: `Date` → ISO string. The contract package
   * declares `createdAt: string`, not `Date`, because that's what JSON serializes to
   * and we want server-side code to manipulate the same shape clients see.
   */
  toDomain(row) {
    return {
      id: row.id,
      name: row.name,
      slug: row.slug,
      plan: row.plan,
      billingEmail: row.billingEmail,
      createdAt: row.createdAt.toISOString(),
      updatedAt: row.updatedAt.toISOString(),
    };
  }
};
exports.OrganizationsRepository = OrganizationsRepository;
exports.OrganizationsRepository = OrganizationsRepository = __decorate(
  [
    (0, common_1.Injectable)(),
    __metadata('design:paramtypes', [prisma_service_js_1.PrismaService]),
  ],
  OrganizationsRepository,
);
//# sourceMappingURL=organizations.repository.js.map
