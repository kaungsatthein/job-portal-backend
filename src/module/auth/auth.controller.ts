import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Post,
  Req,
  Res,
  UseGuards,
  UnauthorizedException,
} from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { LoginUserDto } from './dto/login-user.dto';
import { AuthService } from './auth.service';
import type { Response, Request } from 'express';
import { Public } from 'src/common/decorators/public';
import { AuthGuard } from '@nestjs/passport';
import { GoogleAuthGuard } from 'src/common/guards/google-auth.guard';
import { PrismaService } from '../prisma/prisma.service';
import { User } from '@prisma/client';
import { getCookieDomain } from 'src/common/utils/helper';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  private readonly domain?: string;
  constructor(
    private readonly authService: AuthService,
    private readonly prismaService: PrismaService,
  ) {
    const envMode = process.env.NODE_ENV?.trim();
    this.domain =
      envMode === 'production'
        ? getCookieDomain(process.env.FRONTEND_PORTAL_PROD_URL)
        : undefined;
  }

  @Public()
  @Post('login')
  @ApiOperation({ summary: 'Login user' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'User logged in successfully',
  })
  async login(
    @Body() loginUserDto: LoginUserDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<{}> {
    const { accessToken, refreshToken } =
      await this.authService.login(loginUserDto);
    const envMode = process.env.NODE_ENV?.trim();
    console.log(
      'process.env.FRONTEND_PORTAL_PROD_URL',
      process.env.FRONTEND_PORTAL_PROD_URL,
    );

    res.cookie(`portal_access_token_${envMode}`, accessToken, {
      httpOnly: true,
      secure: envMode === 'production',
      domain: envMode === 'production' ? this.domain : undefined,
      sameSite: envMode === 'production' ? 'none' : 'lax',
    });

    res.cookie(`portal_refresh_token_${envMode}`, refreshToken, {
      httpOnly: true,
      secure: envMode === 'production',
      domain: envMode === 'production' ? this.domain : undefined,
      sameSite: envMode === 'production' ? 'none' : 'lax',
    });

    return {
      message: 'User logged in successfully',
      tokens: {
        accessToken,
        refreshToken,
      },
    };
  }

  @Public()
  @Post('logout')
  @ApiOperation({ summary: 'Logout user' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'User logged out successfully',
  })
  async logout(
    @Res({ passthrough: true }) res: Response,
  ): Promise<{ message: string }> {
    const envMode = process.env.NODE_ENV?.trim();

    res.clearCookie(`portal_access_token_${envMode}`, {
      httpOnly: true,
      secure: envMode === 'production',
      domain: envMode === 'production' ? this.domain : undefined,
      sameSite: envMode === 'production' ? 'none' : 'lax',
    });

    res.clearCookie(`portal_refresh_token_${envMode}`, {
      httpOnly: true,
      secure: envMode === 'production',
      domain: envMode === 'production' ? this.domain : undefined,
      sameSite: envMode === 'production' ? 'none' : 'lax',
    });

    return { message: 'User logged out successfully' };
  }

  @Public()
  @Post('logout-google')
  @ApiOperation({ summary: 'Logout user from Google' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'User logged out from Google successfully',
  })
  async logoutGoogle(
    @Res({ passthrough: true }) res: Response,
  ): Promise<{ message: string }> {
    const envMode = process.env.NODE_ENV?.trim();

    res.clearCookie(`access_token_${envMode}`, {
      httpOnly: true,
      secure: envMode === 'production',
      domain: envMode === 'production' ? this.domain : undefined,
      sameSite: envMode === 'production' ? 'none' : 'lax',
    });

    res.clearCookie(`refresh_token_${envMode}`, {
      httpOnly: true,
      secure: envMode === 'production',
      domain: envMode === 'production' ? this.domain : undefined,
      sameSite: envMode === 'production' ? 'none' : 'lax',
    });

    return { message: 'User logged out from Google successfully' };
  }

  @Public()
  @Get('google')
  // @UseGuards(AuthGuard('google'))
  @UseGuards(GoogleAuthGuard)
  @ApiQuery({
    name: 'role',
    required: false,
    description:
      'User role (admin, recruiter, researcher). Defaults to researcher.',
    enum: ['admin', 'recruiter', 'researcher'],
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Redirects to Google OAuth',
  })
  async googleAuth(@Req() req: Request) {
    // This endpoint initiates the Google OAuth flow
    // The user will be redirected to Google for authentication
    //front-end will send like this /auth/google?role=admin
  }

  @Public()
  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleAuthRedirect(@Req() req: Request, @Res() res: Response) {
    try {
      const user = req.user as any;
      const state = req.query.state
        ? JSON.parse(req.query.state as string)
        : {};

      const requestedRole = state.role || 'researcher';

      // Fetch current roles
      const currentUser = await this.prismaService.user.findUnique({
        where: { id: user.id },
        select: { role: true },
      });

      const currentRoles = currentUser?.role || [];

      // Prepare updated roles
      const updatedRoles = currentRoles.includes(requestedRole)
        ? currentRoles
        : [...currentRoles, requestedRole];

      // Update user: roles + login count
      await this.prismaService.user.update({
        where: { id: user.id },
        data: {
          role: updatedRoles,
          loginCount: { increment: 1 },
        },
      });

      // Generate tokens etc...
      const updatedUser = await this.prismaService.user.findUnique({
        where: { id: user.id },
      });
      const tokens = await this.authService.generateTokens(updatedUser);

      const envMode = process.env.NODE_ENV?.trim();
      const frontendUrl = process.env.FRONTEND_URL!;

      res.cookie(`access_token_${envMode}`, tokens.accessToken, {
        httpOnly: false,
        domain: envMode === 'production' ? this.domain : undefined,
        secure: envMode === 'production',
        sameSite: envMode === 'production' ? 'none' : 'lax',
        maxAge: 24 * 60 * 60 * 1000,
      });

      res.cookie(`refresh_token_${envMode}`, tokens.refreshToken, {
        httpOnly: false,
        domain: envMode === 'production' ? this.domain : undefined,
        secure: envMode === 'production',
        sameSite: envMode === 'production' ? 'none' : 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      res.redirect(`${frontendUrl}?success=true`);
      return { message: 'User logged into Google successfully' };
    } catch (error) {
      console.error('Google OAuth callback error:', error);
      const frontendUrl = process.env.FRONTEND_URL!;
      res.redirect(`${frontendUrl}?success=false`);
    }
  }

  @Get('me')
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Current user profile',
  })
  async getCurrentUser(@Req() req: Request): Promise<any> {
    if (!req.user) {
      throw new UnauthorizedException('Not authenticated');
    }

    const user = req.user as User;
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      avatar_url: user.avatar_url,
      provider: user.provider,
      role: user.role,
      loginCount: user.loginCount,
    };
  }
}
