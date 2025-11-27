import { Module } from '@nestjs/common';
import { ApplicationService } from './application.service';
import { ApplicationController } from './application.controller';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationService } from '../notification/notification.service';

@Module({
  controllers: [ApplicationController],
  providers: [ApplicationService, PrismaService, NotificationService],
})
export class ApplicationModule {}
