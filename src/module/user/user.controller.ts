import { Controller, Get, Query } from '@nestjs/common';
import { UserService } from './user.service';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { GetUsersQueryDto } from './dto/get-users-query.dto';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}
  @Get()
  @ApiOperation({ summary: 'Get all users with pagination & search' })
  @ApiResponse({ status: 200, description: 'List of users with pagination' })
  async getAllUsers(@Query() query: GetUsersQueryDto) {
    return this.userService.getAllUsers(query);
  }
}
