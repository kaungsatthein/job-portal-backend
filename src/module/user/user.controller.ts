import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Query,
  UseGuards,
} from '@nestjs/common';
import { UserService } from './user.service';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { GetUsersQueryDto } from './dto/get-users-query.dto';
import { UpdateUserStatusDto } from './dto/update-user-status.dto';
import { UserRole } from '@prisma/client';
import { RolesGuard } from 'src/common/guards/permission.guard';
import { Roles } from 'src/common/decorators/roles.decorator';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}
  @UseGuards(RolesGuard)
  @Roles(UserRole.admin, UserRole.researcher)
  @Get()
  @ApiOperation({ summary: 'Get all users with pagination & search' })
  @ApiResponse({ status: 200, description: 'List of users with pagination' })
  async getAllUsers(@Query() query: GetUsersQueryDto) {
    return this.userService.getAllUsers(query);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Update User' })
  @ApiResponse({ status: 200, description: 'User updated successfully' })
  updateStatus(@Param('id') id: string, @Body() dto: UpdateUserStatusDto) {
    return this.userService.updateStatus(id, dto);
  }
}
