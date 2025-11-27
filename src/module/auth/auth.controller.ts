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
import { User, UserRole } from '@prisma/client';
import { getCookieDomain } from 'src/common/utils/helper';
import { UserService } from '../user/user.service';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  private readonly portaldomain?: string;
  private readonly publicdomain?: string;
  constructor(
    private readonly authService: AuthService,
    private readonly prismaService: PrismaService,
    private readonly userService: UserService,
  ) {
    const envMode = process.env.NODE_ENV?.trim();
    this.portaldomain =
      envMode === 'production'
        ? getCookieDomain(process.env.FRONTEND_PORTAL_PROD_URL)
        : undefined;
    this.publicdomain =
      envMode === 'production'
        ? getCookieDomain(process.env.FRONTEND_PUBLIC_PROD_URL)
        : undefined;

    console.log('this.portaldomain', this.portaldomain);
    console.log('this.publicdomain', this.publicdomain);
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
      domain: envMode === 'production' ? this.portaldomain : undefined,
      sameSite: envMode === 'production' ? 'none' : 'lax',
    });

    res.cookie(`portal_refresh_token_${envMode}`, refreshToken, {
      httpOnly: true,
      secure: envMode === 'production',
      domain: envMode === 'production' ? this.portaldomain : undefined,
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
      domain: envMode === 'production' ? this.portaldomain : undefined,
      sameSite: envMode === 'production' ? 'none' : 'lax',
    });

    res.clearCookie(`portal_refresh_token_${envMode}`, {
      httpOnly: true,
      secure: envMode === 'production',
      domain: envMode === 'production' ? this.portaldomain : undefined,
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
      domain: envMode === 'production' ? this.publicdomain : undefined,
      sameSite: envMode === 'production' ? 'none' : 'lax',
    });

    res.clearCookie(`refresh_token_${envMode}`, {
      httpOnly: true,
      secure: envMode === 'production',
      domain: envMode === 'production' ? this.publicdomain : undefined,
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
    enum: UserRole,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Redirects to Google OAuth',
  })
  async googleAuth(@Req() req: Request) {}

  @Public()
  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleAuthRedirect(@Req() req: Request, @Res() res: Response) {
    try {
      const user = req.user as User;
      const state = req.query.state
        ? JSON.parse(req.query.state as string)
        : {};

      const requestedRole = state.role || 'researcher';

      // Fetch current user role
      const currentUser = await this.prismaService.user.findUnique({
        where: { id: user.id },
        select: { role: true },
      });

      const roleToUse = currentUser?.role ?? requestedRole;

      await this.prismaService.user.update({
        where: { id: user.id },
        data: {
          role: roleToUse,
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
        httpOnly: true,
        domain: envMode === 'production' ? this.publicdomain : undefined,
        secure: envMode === 'production',
        sameSite: envMode === 'production' ? 'none' : 'lax',
        maxAge: 24 * 60 * 60 * 1000,
      });

      res.cookie(`refresh_token_${envMode}`, tokens.refreshToken, {
        httpOnly: true,
        domain: envMode === 'production' ? this.publicdomain : undefined,
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
  @ApiOperation({ summary: 'Get current user profile with relations' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Current user profile with related data',
  })
  async getCurrentUser(@Req() req: Request): Promise<any> {
    const reqUser = req.user as User;
    if (!reqUser) {
      throw new UnauthorizedException('Not authenticated');
    }

    const userId = reqUser.id;

    const user = await this.userService.findUserWithRelations(userId);

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return user;
  }
}
