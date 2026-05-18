/**
 * OrganizationsController.
 *
 * Thin HTTP layer:
 *   - Validates inputs with @ZodBody / @ZodQuery / @ZodParam (single source of
 *     truth: @app/contracts).
 *   - Calls the service. Does NOT contain business logic.
 *   - Lets DomainError propagate; the global HttpExceptionFilter takes care
 *     of mapping to the envelope.
 *
 * Response shapes intentionally match the contract envelopes in
 * docs/conventions/api-design.md.
 */
import {
  type CreateOrganizationBody,
  createOrganizationBodySchema,
  type Organization,
  type OrganizationParams,
  organizationParamsSchema,
  type PaginationMeta,
  type PaginationQuery,
  paginationQuerySchema,
  type UpdateOrganizationBody,
  updateOrganizationBodySchema,
} from '@app/contracts';
import { Controller, Delete, Get, HttpCode, Post, Put } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { ZodBody, ZodParam, ZodQuery } from '../../common/validation/zod.decorators.js';

import { OrganizationsService } from './organizations.service.js';

@ApiTags('organizations')
@Controller({ path: 'organizations', version: '1' })
export class OrganizationsController {
  constructor(private readonly service: OrganizationsService) {}

  @Get()
  async list(
    @ZodQuery(paginationQuerySchema) query: PaginationQuery,
  ): Promise<{ data: Organization[]; pagination: PaginationMeta }> {
    return this.service.list(query);
  }

  @Get(':id')
  async getOne(
    @ZodParam(organizationParamsSchema) params: OrganizationParams,
  ): Promise<{ data: Organization }> {
    return { data: await this.service.getById(params.id) };
  }

  @Post()
  @HttpCode(201)
  async create(
    @ZodBody(createOrganizationBodySchema) body: CreateOrganizationBody,
  ): Promise<{ data: Organization }> {
    return { data: await this.service.create(body) };
  }

  @Put(':id')
  async update(
    @ZodParam(organizationParamsSchema) params: OrganizationParams,
    @ZodBody(updateOrganizationBodySchema) body: UpdateOrganizationBody,
  ): Promise<{ data: Organization }> {
    return { data: await this.service.update(params.id, body) };
  }

  @Delete(':id')
  @HttpCode(204)
  async delete(@ZodParam(organizationParamsSchema) params: OrganizationParams): Promise<void> {
    await this.service.delete(params.id);
  }
}
