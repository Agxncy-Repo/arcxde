import type { Env } from './env.schema.js';
export declare class AppConfigService {
  private readonly env;
  constructor(env: Env);
  get<K extends keyof Env>(key: K): Env[K];
  get isProduction(): boolean;
  get isDevelopment(): boolean;
  get isTest(): boolean;
  get http(): {
    port: number;
    host: string;
    publicUrl: string;
    corsOrigins: string[];
  };
  get database(): {
    url: string;
  };
  get redis(): {
    url: string;
  };
  get auth(): {
    accessSecret: string;
    refreshSecret: string;
    accessTtl: string;
    refreshTtl: string;
  };
  get logging(): {
    level: Env['LOG_LEVEL'];
    pretty: boolean;
  };
  get rateLimits(): {
    globalPerMin: number;
    authPerMin: number;
  };
  get observability(): {
    otlpEndpoint?: string;
    serviceName: string;
    sentryDsn?: string;
  };
}
//# sourceMappingURL=app-config.service.d.ts.map
