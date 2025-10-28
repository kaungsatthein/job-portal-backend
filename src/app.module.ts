import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './module/auth/auth.module';

import { PrismaModule } from './module/prisma/prisma.module';
import { UserModule } from './module/user/user.module';

@Module({
  imports: [AuthModule, PrismaModule, UserModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
