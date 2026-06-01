import { applyDecorators } from '@nestjs/common';
import { ApiBody, ApiParam, ApiQuery } from '@nestjs/swagger';
import { zodToJsonSchema } from 'zod-to-json-schema';

/**
 * Automatically inspects a Zod schema and generates
 * fully interactive OpenAPI/Swagger Request Body documentation at runtime.
 * * @example
 * \@Post('refresh')
 * \@ApiZodBody(tokenRefreshSchema, 'Rotates session refresh token.')
 * async refreshSession(\@ZodBody(tokenRefreshSchema) body: TokenRefreshBody) {}
 */
// 1. For BODIES (POST, PUT, PATCH)
export function ApiZodBody(zodSchema: any, description?: string) {
  return ApiBody({
    ...(description ? { description } : {}),
    schema: zodToJsonSchema(zodSchema, { target: 'openApi3' }) as any,
  });
}

/**
 * Automatically inspects an object-based Zod schema and unpacks its properties
 * into individual input rows inside the Swagger UI Query Parameters panel.
 * Supports types, descriptions, defaults, and enums defined inside your contracts.
 * * @example
 * \@Get()
 * \@ApiZodQuery(paginationSchema)
 * async findAll(\@ZodQuery(paginationSchema) query: PaginationDto) {}
 */
// 2. For QUERIES (GET filtering & pagination lists)
export function ApiZodQuery(zodSchema: any) {
  const jsonSchema = zodToJsonSchema(zodSchema, { target: 'openApi3' }) as any;
  const properties = jsonSchema.properties ?? {};
  const requiredFields = jsonSchema.required ?? [];

  // Map each property of the Zod object to an individual NestJS @ApiQuery decorator
  const decorators = Object.keys(properties).map((key) => {
    const prop = properties[key];

    return ApiQuery({
      name: key,
      required: requiredFields.includes(key),
      type: prop.type,
      // Strict preservation of exactOptionalPropertyTypes:
      ...(prop.description ? { description: prop.description } : {}),
      ...(prop.enum ? { enum: prop.enum } : {}),
      ...(prop.default !== undefined ? { default: prop.default } : {}),
    });
  });

  // Dynamically flatten and apply all generated query rows onto the method context
  return applyDecorators(...decorators);
}

/**
 * Generates Swagger documentation rows for Route URL parameters (:id, :slug, etc.)
 * * @example
 * \@Get(':id')
 * \@ApiZodParam('id', 'The unique UUID of the organization.')
 * async findOne(\@ZodParam(idSchema) id: string) {}
 */
// 3. For PARAMS (GET, DELETE resource paths)
export function ApiZodParam(name: string, description?: string) {
  return ApiParam({
    name,
    type: 'string',
    ...(description ? { description } : {}),
  });
}
