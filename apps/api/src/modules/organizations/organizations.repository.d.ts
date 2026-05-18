import type { Organization } from '@app/contracts';
import { PrismaService } from '../prisma/prisma.service.js';
export interface CreateOrganizationInput {
  name: string;
  slug: string;
  billingEmail?: string | undefined;
}
export interface UpdateOrganizationInput {
  name?: string | undefined;
  slug?: string | undefined;
  billingEmail?: string | undefined;
}
export interface ListOrganizationsInput {
  cursor?: string | undefined;
  limit: number;
}
export interface ListOrganizationsResult {
  items: Organization[];
  nextCursor: string | null;
}
export declare class OrganizationsRepository {
  private readonly prisma;
  constructor(prisma: PrismaService);
  findById(id: string): Promise<Organization | null>;
  findBySlug(slug: string): Promise<Organization | null>;
  /**
   * Cursor-paginated list, ordered by createdAt desc, id desc to break ties.
   * See docs/architecture/database.md "Cursor pagination".
   */
  list(input: ListOrganizationsInput): Promise<ListOrganizationsResult>;
  create(input: CreateOrganizationInput): Promise<Organization>;
  update(id: string, input: UpdateOrganizationInput): Promise<Organization>;
  delete(id: string): Promise<void>;
  /**
   * Maps the Prisma row to the public domain shape (which is what @app/contracts
   * declares). Critical conversion: `Date` → ISO string. The contract package
   * declares `createdAt: string`, not `Date`, because that's what JSON serializes to
   * and we want server-side code to manipulate the same shape clients see.
   */
  private toDomain;
}
//# sourceMappingURL=organizations.repository.d.ts.map
