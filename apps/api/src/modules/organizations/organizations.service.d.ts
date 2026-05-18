import type {
  CreateOrganizationBody,
  Organization,
  PaginationMeta,
  UpdateOrganizationBody,
} from '@app/contracts';
import { ListOrganizationsInput, OrganizationsRepository } from './organizations.repository.js';
export declare class OrganizationsService {
  private readonly repo;
  constructor(repo: OrganizationsRepository);
  getById(id: string): Promise<Organization>;
  list(input: ListOrganizationsInput): Promise<{
    data: Organization[];
    pagination: PaginationMeta;
  }>;
  create(input: CreateOrganizationBody): Promise<Organization>;
  update(id: string, input: UpdateOrganizationBody): Promise<Organization>;
  delete(id: string): Promise<void>;
}
//# sourceMappingURL=organizations.service.d.ts.map
