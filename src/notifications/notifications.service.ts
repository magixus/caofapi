import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(private readonly prisma: PrismaService) {}

  async getUserNotifications(userId: number) {
    this.logger.log(`Fetching notifications for user: ${userId}`);
    try {
      const notifications = await this.prisma.notificationRecipient.findMany({
        where: { userId },
        include: { notification: true },
        orderBy: { notification: { createdAt: 'desc' } },
      });

      return notifications;
    } catch (error) {
      this.logger.error(`Failed to fetch notifications: ${error.message}`, error.stack);
      throw error;
    }
  }

  async getUnreadCount(userId: number) {
    this.logger.log(`Fetching unread count for user: ${userId}`);
    try {
      const count = await this.prisma.notificationRecipient.count({
        where: { userId, acknowledged: false },
      });

      return { count };
    } catch (error) {
      this.logger.error(`Failed to fetch unread count: ${error.message}`, error.stack);
      throw error;
    }
  }

  async acknowledgeNotification(notificationId: number, userId: number) {
    this.logger.log(`Acknowledging notification ${notificationId} for user ${userId}`);
    try {
      await this.prisma.notificationRecipient.update({
        where: {
          notificationId_userId: {
            notificationId,
            userId,
          },
        },
        data: { acknowledged: true },
      });

      return { success: true };
    } catch (error) {
      this.logger.error(`Failed to acknowledge notification: ${error.message}`, error.stack);
      throw error;
    }
  }

  async broadcastNotification(message: string, userIds: number[]) {
    this.logger.log(`Broadcasting notification to ${userIds.length} users`);
    try {
      const notification = await this.prisma.notification.create({
        data: {
          message,
          recipients: {
            create: userIds.map(userId => ({
              userId,
              acknowledged: false,
            })),
          },
        },
        include: { recipients: true },
      });

      return notification;
    } catch (error) {
      this.logger.error(`Failed to broadcast notification: ${error.message}`, error.stack);
      throw error;
    }
  }
}
