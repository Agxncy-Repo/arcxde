import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/*
 * This guard is exported and used in controllers to protect routes that require authentication.
 * It uses the 'jwt' strategy defined in JwtStrategy to validate incoming JWTs
 * and ensure that only authenticated users can access those routes.
 *
 * For example, in a controller you might have:
 *
 * @UseGuards(JwtAuthGuard)
 */
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  // 🚀 Override handleRequest to capture hidden Passport errors
  override handleRequest(err: any, user: any, info: any) {
    if (info) {
      console.log('\n🔒 [JWT Guard Debug] --- Verification Failure ---');
      console.log('Reason:', info.message); // 👈 Tells us exactly what failed
      console.log('Details:', info);
      console.log('---------------------------------------------\n');
    }

    if (err || !user) {
      // Return the specific error message to Swagger instead of a generic "Unauthorized"
      throw err || new UnauthorizedException(info?.message || 'Unauthorized');
    }
    return user;
  }
}
