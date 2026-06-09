// src/modules/auth/auth.module.ts
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';

import { EmailModule } from '../email/email.module.js';

import { GoogleAdapter } from './adapters/google.adapter.js';
import { AuthController } from './auth.controller.js';
import { AuthRepository } from './auth.repository.js';
import { AuthService } from './auth.service.js';
import { IdentityResolver } from './identity/identity.resolver.js';
import { JwtStrategy } from './strategies/jwt.strategy.js';

@Module({
  imports: [PassportModule, JwtModule.register({}), EmailModule],
  controllers: [AuthController],
  providers: [AuthService, AuthRepository, GoogleAdapter, JwtStrategy, IdentityResolver],
  exports: [AuthService, IdentityResolver], // Exporting AuthService and IdentityResolver for use in other modules like SignupModule
})
export class AuthModule {}
