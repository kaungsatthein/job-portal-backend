import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Patch,
  Req,
  UnauthorizedException,
} from '@nestjs/common';
import { NotificationService } from './notification.service';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import type { Request } from 'express';

@ApiTags('Notifications')
@Controller('notifications')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Post()
  @ApiOperation({ summary: 'Create new notification' })
  @ApiResponse({ status: 201, description: 'Notification created' })
  create(@Body() dto: CreateNotificationDto) {
    return this.notificationService.create(dto);
  }

  @Get('me')
  @ApiOperation({ summary: 'Get all notifications of the current user' })
  async findMyNotifications(@Req() req: Request) {
    if (!req.user) throw new UnauthorizedException();

    const user = req.user as any;
    return this.notificationService.findAllByUser(user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single notification detail' })
  async findOne(@Param('id') id: string, @Req() req: Request) {
    if (!req.user) throw new UnauthorizedException();
    const user = req.user as any;

    return this.notificationService.findOne(id, user.id);
  }

  @Patch(':id/read')
  @ApiOperation({ summary: 'Mark notification as read' })
  async markRead(@Param('id') id: string, @Req() req: Request) {
    if (!req.user) throw new UnauthorizedException();
    const user = req.user as any;

    return this.notificationService.markRead(id, user.id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a notification' })
  async remove(@Param('id') id: string, @Req() req: Request) {
    if (!req.user) throw new UnauthorizedException();
    const user = req.user as any;

    return this.notificationService.remove(id, user.id);
  }
}
