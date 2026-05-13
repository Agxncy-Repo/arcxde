import { Global, Module } from '@nestjs/common';

import { AppConfigService } from './app-config.service.js';
import { parseEnv } from './env.schema.js';

/**
 * Global config module.
 *
 * Validates `process.env` once, exposes the typed AppConfigService everywhere.
 * Importing modules don't need to repeat the import — see @Global decorator.
 */
@Global()
@Module({
  providers: [
    {
      provide: AppConfigService,
      useFactory: () => new AppConfigService(parseEnv(process.env)),
    },
  ],
  exports: [AppConfigService],
})
export class AppConfigModule {}
