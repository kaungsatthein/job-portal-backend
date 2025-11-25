import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Status, User, UserRole } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { GetUsersQueryDto } from './dto/get-users-query.dto';
import { UpdateUserStatusDto } from './dto/update-user-status.dto';

@Injectable()
export class UserService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  public async findUserByEmail(email: string): Promise<any> {
    const user = await this.prismaService.user.findFirst({
      where: {
        email,
        status: { not: Status.DELETE },
      },
    });
    if (!user) {
      throw new BadRequestException('Check your email or password');
    }
    if (!user.passwordHash) {
      throw new BadRequestException(
        'This account uses Google login. Please use Google to sign in.',
      );
    }
    return user;
  }

  public async verifyPassword(
    hashedPassword: string,
    plainPassword: string,
  ): Promise<void> {
    const isValid = await bcrypt.compare(plainPassword, hashedPassword);
    if (!isValid) throw new BadRequestException('Check your email or password');
  }

  public async generateTokens(
    user: User,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const payload = {
      sub: user.id,
      email: user.email,
      fullName: user.name,
      status: user.status,
      avatar_url: user.avatar_url,
    };

    const payloadForRefresh = {
      sub: user.id,
    };

    const accessToken = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('ACCESS_TOKEN_SECRET'),
      expiresIn: this.configService.get<string>(
        'ACCESS_TOKEN_EXPIRE_IN',
      ) as any,
    });

    const refreshToken = this.jwtService.sign(payloadForRefresh, {
      secret: this.configService.get<string>('REFRESH_TOKEN_SECRET'),
      expiresIn: this.configService.get<string>(
        'REFRESH_TOKEN_EXPIRE_IN',
      ) as any,
    });

    return { accessToken, refreshToken };
  }

  public async findUserByGoogleId(googleId: string): Promise<User | null> {
    return this.prismaService.user.findFirst({
      where: {
        google_id: googleId,
        status: { not: Status.DELETE },
      },
    });
  }

  public async updateGoogleUser(
    userId: string,
    googleUserData: {
      googleId: string;
      email: string;
      firstName: string;
      lastName: string;
      picture?: string;
      role: UserRole;
    },
  ): Promise<User> {
    const fullName = `${googleUserData.firstName} ${googleUserData.lastName}`;

    return this.prismaService.user.update({
      where: { id: userId },
      data: {
        google_id: googleUserData.googleId,
        google_email: googleUserData.email,
        avatar_url: googleUserData.picture,
        name: fullName,
        provider: 'google',
      },
      // include: {
      //   role: true,
      //   department: true,
      // }, //can include some relation fields
    });
  }

  public async findUserByGoogleEmail(
    googleEmail: string,
  ): Promise<User | null> {
    return this.prismaService.user.findFirst({
      where: {
        google_email: googleEmail,
        status: { not: Status.DELETE },
      },
    });
  }

  public async createGoogleUser(googleUserData: {
    googleId: string;
    email: string;
    firstName: string;
    lastName: string;
    picture?: string;
    role?: UserRole;
  }): Promise<User> {
    const { googleId, email, firstName, lastName, picture, role } =
      googleUserData;

    const existingUser = await this.prismaService.user.findUnique({
      where: { google_id: googleId },
    });
    if (existingUser) return existingUser;

    return this.prismaService.user.create({
      data: {
        google_id: googleId,
        google_email: email,
        email, // ✅ Add this line — Prisma requires it
        name: `${firstName} ${lastName}`,
        avatar_url: picture,
        provider: 'google',
        emailVerified: true,
        role: role || 'researcher', // fallback to researcher,
        status: 'ACTIVE', // or Status.ACTIVE if it’s an enum
      },
    });
  }

  public async findUserById(userId: string): Promise<User | null> {
    const user = await this.prismaService.user.findFirst({
      where: {
        id: userId,
        status: { not: 'DELETE' },
      },
    });

    if (!user) {
      throw new BadRequestException('User not found or deleted');
    }

    return user;
  }

  async getAllUsers(query: GetUsersQueryDto) {
    const { page = 1, limit = 10, search, role, status } = query;
    const skip = (page - 1) * limit;

    // Build where condition dynamically
    const where: any = {};
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }
    if (role) where.role = role;
    if (status) where.status = status;

    const [data, total] = await Promise.all([
      this.prismaService.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prismaService.user.count({ where }),
    ]);

    return {
      data,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  updateStatus(id: string, dto: UpdateUserStatusDto) {
    return this.prismaService.user.update({
      where: { id },
      data: { status: dto.status },
    });
  }
}
