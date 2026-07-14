import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { RequestsModule } from './requests/requests.module';
import { NotificationsModule } from './notifications/notifications.module';
import { DonorsModule } from './donors/donors.module';
import { PrismaServices } from '../prisma/prisma.service';
import { AnalyticsModule } from './analytics/analytics.module';
import { BullModule } from '@nestjs/bull';

@Module({
  imports: [
    BullModule.forRoot({
      url: process.env.REDIS_URL || 'redis://localhost:6379',
      redis: {
        maxRetriesPerRequest: null,
      },
    }),
    AuthModule,
    RequestsModule,
    NotificationsModule,
    DonorsModule,
    AnalyticsModule,
  ],
  controllers: [AppController],
  providers: [AppService, PrismaServices],
})
export class AppModule {}