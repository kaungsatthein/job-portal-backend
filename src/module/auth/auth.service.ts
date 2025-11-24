import { Injectable } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { LoginUserDto } from './dto/login-user.dto';
import { GoogleAuthDto } from './dto/google-auth.dto';

@Injectable()
export class AuthService {
  constructor(private readonly userService: UserService) {}

  async login(
    loginUserDto: LoginUserDto,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const user = await this.userService.findUserByEmail(loginUserDto.email);
    const result = await this.userService.verifyPassword(
      user.passwordHash,
      loginUserDto.password,
    );
    const tokens = await this.userService.generateTokens(user);
    return tokens;
  }

  async validateGoogleUser(googleUserData: GoogleAuthDto): Promise<any> {
    const { googleId, email, firstName, lastName, picture, role } =
      googleUserData;

    // Check if user exists by Google ID
    let user = await this.userService.findUserByGoogleId(googleId);

    if (user) {
      user = await this.userService.updateGoogleUser(user.id, {
        googleId,
        email,
        firstName,
        lastName,
        picture,
        role,
      });
    } else {
      const existingUser = await this.userService.findUserByGoogleEmail(email);

      if (existingUser) {
        user = await this.userService.updateGoogleUser(existingUser.id, {
          googleId,
          email,
          firstName,
          lastName,
          picture,
          role,
        });
      } else {
        user = await this.userService.createGoogleUser({
          googleId,
          email,
          firstName,
          lastName,
          picture,
          role,
        });
      }
    }

    return user;
  }

  async generateTokens(
    user: any,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    return this.userService.generateTokens(user);
  }
}
