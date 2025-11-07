import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './module/auth/auth.module';

import { PrismaModule } from './module/prisma/prisma.module';
import { UserModule } from './module/user/user.module';
import { IndustryModule } from './module/industry/industry.module';
import { CompanyModule } from './module/company/company.module';
import { JobPostingModule } from './module/job-posting/job-posting.module';

@Module({
  imports: [AuthModule, PrismaModule, UserModule, IndustryModule, CompanyModule, JobPostingModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
