import {
  type CreateOrganizationBody,
  type Organization,
  type OrganizationParams,
  type PaginationMeta,
  type PaginationQuery,
  type UpdateOrganizationBody,
} from '@app/contracts';
import { OrganizationsService } from './organizations.service.js';
export declare class OrganizationsController {
  private readonly service;
  constructor(service: OrganizationsService);
  list(query: PaginationQuery): Promise<{
    data: Organization[];
    pagination: PaginationMeta;
  }>;
  getOne(params: OrganizationParams): Promise<{
    data: Organization;
  }>;
  create(body: CreateOrganizationBody): Promise<{
    data: Organization;
  }>;
  update(
    params: OrganizationParams,
    body: UpdateOrganizationBody,
  ): Promise<{
    data: Organization;
  }>;
  delete(params: OrganizationParams): Promise<void>;
}
//# sourceMappingURL=organizations.controller.d.ts.map
