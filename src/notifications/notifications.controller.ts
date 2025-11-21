import { Controller, Get, Patch, Post, Param, Body, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { NotificationsService } from './notifications.service';

@ApiTags('notifications')
@ApiBearerAuth()
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get('user/:userId')
  @ApiOperation({ summary: 'Get notifications for a user' })
  @ApiResponse({ status: 200, description: 'User notifications' })
  getUserNotifications(@Param('userId') userId: string) {
    return this.notificationsService.getUserNotifications(parseInt(userId, 10));
  }

  @Get('user/:userId/unread-count')
  @ApiOperation({ summary: 'Get unread notification count for a user' })
  @ApiResponse({ status: 200, description: 'Unread count' })
  getUnreadCount(@Param('userId') userId: string) {
    return this.notificationsService.getUnreadCount(parseInt(userId, 10));
  }

  @Patch(':notificationId/acknowledge')
  @ApiOperation({ summary: 'Acknowledge a notification' })
  @ApiResponse({ status: 200, description: 'Notification acknowledged' })
  acknowledgeNotification(
    @Param('notificationId') notificationId: string,
    @Body() body: { userId: number },
  ) {
    return this.notificationsService.acknowledgeNotification(parseInt(notificationId, 10), body.userId);
  }

  @Post('broadcast')
  @ApiOperation({ summary: 'Broadcast notification to multiple users' })
  @ApiResponse({ status: 201, description: 'Notification sent' })
  broadcastNotification(@Body() body: { message: string; userIds: number[] }) {
    return this.notificationsService.broadcastNotification(body.message, body.userIds);
  }
}
