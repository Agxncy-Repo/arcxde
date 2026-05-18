/**
 * ZodValidationPipe — validates body/query/param using a Zod schema.
 *
 * Why not class-validator: ADR-0003. Short version: Zod schemas already exist
 * in @app/contracts as the single source of truth shared with the frontend.
 * Duplicating them as classes here would create drift.
 *
 * Usage:
 *
 *   @Post()
 *   create(@Body(new ZodValidationPipe(createOrganizationBodySchema)) body: CreateOrganizationBody) { ... }
 *
 * Or, more ergonomically, use the helper decorators in this file:
 *
 *   @Post()
 *   create(@ZodBody(createOrganizationBodySchema) body: CreateOrganizationBody) { ... }
 */
import { type ArgumentMetadata, type PipeTransform } from '@nestjs/common';
import type { ZodSchema } from 'zod';
export declare class ZodValidationPipe<T> implements PipeTransform<unknown, T> {
  private readonly schema;
  constructor(schema: ZodSchema<T>);
  transform(value: unknown, _metadata: ArgumentMetadata): T;
}
//# sourceMappingURL=zod-validation.pipe.d.ts.map
