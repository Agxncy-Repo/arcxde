import { applyDecorators } from '@nestjs/common';
import { ApiBody, ApiParam, ApiQuery } from '@nestjs/swagger';
import { zodToJsonSchema } from 'zod-to-json-schema';
import type { ZodTypeAny } from 'zod';

type JsonSchema = {
  properties?: Record<string, JsonSchemaProperty>;
  required?: string[];
};

type JsonSchemaProperty = {
  type?: string;
  description?: string;
  enum?: string[];
  default?: unknown;
};

/**
 * Automatically inspects a Zod schema and generates
 * fully interactive OpenAPI/Swagger Request Body documentation at runtime.
 * * @example
 * \@Post('refresh')
 * \@ApiZodBody(tokenRefreshSchema, 'Rotates session refresh token.')
 * async refreshSession(\@ZodBody(tokenRefreshSchema) body: TokenRefreshBody) {}
 */
// 1. For BODIES (POST, PUT, PATCH)
export function ApiZodBody(zodSchema: ZodTypeAny, description?: string) {
  return ApiBody({
    ...(description ? { description } : {}),
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    schema: zodToJsonSchema(zodSchema, {
      target: 'openApi3',
    }) as JsonSchema,
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
export function ApiZodQuery(zodSchema: ZodTypeAny) {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
  const jsonSchema = zodToJsonSchema(zodSchema, { target: 'openApi3' }) as JsonSchema;
  const properties = jsonSchema.properties ?? {};
  const requiredFields = jsonSchema.required ?? [];

  // Map each property of the Zod object to an individual NestJS @ApiQuery decorator
  const decorators = Object.keys(properties).map((key) => {
    const prop = properties[key];
    if (!prop) {
      return ApiQuery({ name: key, required: false });
    }

    const options: {
      name: string;
      required: boolean;
      type: string;
      description?: string;
      enum?: string[];
      default?: unknown;
    } = {
      name: key,
      required: requiredFields.includes(key),
      type: prop.type ?? 'string',
    };
    if (prop.description) {
      options.description = prop.description;
    }
    if (prop.enum) {
      options.enum = prop.enum;
    }
    if (prop.default !== undefined) {
      options.default = prop.default;
    }

    return ApiQuery(options);
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
