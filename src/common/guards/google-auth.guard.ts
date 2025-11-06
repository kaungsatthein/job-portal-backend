import { Injectable, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class GoogleAuthGuard extends AuthGuard('google') {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const result = (await super.canActivate(context)) as boolean;
    return result;
  }

  getAuthenticateOptions(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();
    const role = request.query.role || 'researcher';
    console.log('Passing role to Google as state:', role);

    return {
      scope: ['email', 'profile'],
      state: JSON.stringify({ role }), // 👈 This is the correct way!
    };
  }
}
