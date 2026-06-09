import { forwardRef, Module } from '@nestjs/common';

import { AuthModule } from '../auth/auth.module';
import { PrismaModule } from '../prisma/prisma.module'; // Adjust this path to match your global PrismaModule location

import { UsersController } from './users.controller';
import { UsersService } from './users.service';

@Module({
  imports: [
    PrismaModule,
    forwardRef(() => AuthModule), // Import AuthModule to access AuthService for token generation
  ],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService], // 💡 Exported so AuthService can access it for OAuth verification
})
export class UsersModule {}
