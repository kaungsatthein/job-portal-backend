import { Module } from '@nestjs/common';
import { JobPostingService } from './job-posting.service';
import { JobPostingController } from './job-posting.controller';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  controllers: [JobPostingController],
  providers: [JobPostingService, PrismaService],
})
export class JobPostingModule {}
