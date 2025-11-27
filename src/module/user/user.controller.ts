import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { UserService } from './user.service';
import { ApiBody, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { GetUsersQueryDto } from './dto/get-users-query.dto';
import { UpdateUserStatusDto } from './dto/update-user-status.dto';
import { User, UserRole } from '@prisma/client';
import { RolesGuard } from 'src/common/guards/permission.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { UpdateUserDto } from './dto/update-user.dto';
import type { Response, Request } from 'express';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}
  @UseGuards(RolesGuard)
  @Roles(UserRole.admin, UserRole.researcher)
  @Get()
  @ApiOperation({ summary: 'Get all users with pagination & search' })
  @ApiResponse({ status: 200, description: 'List of users with pagination' })
  async getAllUsers(@Query() query: GetUsersQueryDto) {
    const users = this.userService.getAllUsers(query);
    console.log('users :>> ', users);
    return users;
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Update User' })
  @ApiResponse({ status: 200, description: 'User updated successfully' })
  updateStatus(@Param('id') id: string, @Body() dto: UpdateUserStatusDto) {
    return this.userService.updateStatus(id, dto);
  }

  @Patch('profile')
  @ApiOperation({ summary: 'Update current user profile' })
  @ApiBody({ type: UpdateUserDto })
  @ApiResponse({
    status: 200,
    description: 'User profile updated successfully',
  })
  async updateProfile(
    @Req() req: Request,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    const user = req.user as User;
    if (!user?.id) {
      throw new UnauthorizedException('Not authenticated');
    }
    const currentUser = await this.userService.findUserById(user.id);

    const roleToKeep = currentUser?.role;

    const updatedUser = await this.userService.updateUser(user.id, {
      ...updateUserDto,
      role: roleToKeep,
    });

    return {
      message: 'Profile updated successfully',
      user: updatedUser,
    };
  }

  @Get('saved-jobs')
  @ApiOperation({ summary: 'Get all saved jobs for the current user' })
  @ApiResponse({ status: HttpStatus.OK, description: 'List of saved jobs' })
  async getSavedJobs(@Req() req: Request) {
    const user = req.user as any;
    if (!user) throw new UnauthorizedException('Not authenticated');

    return this.userService.getSavedJobs(user.id);
  }

  @Get('saved-jobs/:jobId')
  @ApiOperation({ summary: 'Get details of a saved job' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Saved job details' })
  async getSavedJobDetail(@Req() req: Request, @Param('jobId') jobId: string) {
    const user = req.user as any;
    if (!user) throw new UnauthorizedException('Not authenticated');

    return this.userService.getSavedJobDetail(user.id, jobId);
  }

  @Post('saved-jobs/:jobId')
  @ApiOperation({ summary: 'Save a job for the current user' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Job saved successfully' })
  async saveJob(@Req() req: Request, @Param('jobId') jobId: string) {
    const user = req.user as any;
    if (!user) throw new UnauthorizedException('Not authenticated');

    return this.userService.saveJob(user.id, jobId);
  }

  @Delete('saved-jobs/:jobId')
  @ApiOperation({ summary: 'Remove a saved job for the current user' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Job removed successfully',
  })
  async removeSavedJob(@Req() req: Request, @Param('jobId') jobId: string) {
    const user = req.user as any;
    if (!user) throw new UnauthorizedException('Not authenticated');

    return this.userService.removeSavedJob(user.id, jobId);
  }
}
