import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class NotificationService {
  constructor(private prisma: PrismaService) {}

  // Create a notification
  async create(dto: CreateNotificationDto) {
    return this.prisma.notification.create({
      data: {
        type: dto.type,
        message: dto.message,
        userId: dto.userId,
      },
    });
  }

  // Get notifications of a user
  async findAllByUser(userId: string) {
    return this.prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  // Get single notification
  async findOne(id: string, userId: string) {
    const noti = await this.prisma.notification.findFirst({
      where: { id, userId },
    });

    if (!noti) throw new NotFoundException('Notification not found');
    return noti;
  }

  // Mark notification as read
  async markRead(id: string, userId: string) {
    const noti = await this.findOne(id, userId);

    return this.prisma.notification.update({
      where: { id: noti.id },
      data: { readAt: new Date() },
    });
  }

  // Delete notification
  async remove(id: string, userId: string) {
    await this.findOne(id, userId);

    return this.prisma.notification.delete({
      where: { id },
    });
  }
}
