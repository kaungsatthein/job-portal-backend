import { ClassSerializerInterceptor, Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './module/auth/auth.module';

import { PrismaModule } from './module/prisma/prisma.module';
import { UserModule } from './module/user/user.module';
import { IndustryModule } from './module/industry/industry.module';
import { CompanyModule } from './module/company/company.module';
import { JobPostingModule } from './module/job-posting/job-posting.module';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { ApplicationModule } from './module/application/application.module';
import { UploadModule } from './module/uploads/upload.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    AuthModule,
    PrismaModule,
    UserModule,
    IndustryModule,
    CompanyModule,
    JobPostingModule,
    ApplicationModule,
    UploadModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    // {
    //   provide: APP_GUARD,
    //   useClass: JwtAuthGuard,
    // },
    {
      provide: APP_INTERCEPTOR,
      useClass: ClassSerializerInterceptor,
    },
  ],
})
export class AppModule {}
