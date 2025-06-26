import { Server as HttpServer } from 'http';
import { Server as WebSocketServer } from 'socket.io';
import { notificationService } from '../services/Notification.service';
import jwt from 'jsonwebtoken';

// Store active connections with userId as key
const activeConnections: Map<number, string[]> = new Map();

export const setupWebsocket = (server: HttpServer) => {
  const io = new WebSocketServer(server, {
    cors: {
      origin: process.env.FRONTEND_URL,
      methods: ['GET', 'POST'],
      credentials: true
    }
  });
  // Authentication middleware
  io.use((socket, next) => {
    // Get token from auth or cookies
    const token = socket.handshake.auth.token ||
      socket.handshake.headers.cookie?.split(';')
        .find(c => c.trim().startsWith('accessToken='))
        ?.split('=')[1]
        ?.trim();  // trim to remove any whitespace

    if (!token) {
      return next(new Error('Authentication error: Token missing'));
    }

    try {
      const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET || "hhello") as { id: number };
      socket.data.userId = decoded.id;
      next();
    } catch (error) {
      next(new Error('Authentication error: Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    const userId = socket.data.userId;
    console.log(`User ${userId} connected`);

    // Store the connection
    if (!activeConnections.has(userId)) {
      activeConnections.set(userId, []);
    }
    activeConnections.get(userId)?.push(socket.id);

    // Send unread notifications count on connection
    sendUnreadNotificationsCount(socket, userId);

    // Handle disconnect
    socket.on('disconnect', () => {
      console.log(`User ${userId} disconnected`);

      // Remove socket from active connections
      const userSockets = activeConnections.get(userId) || [];
      const updatedSockets = userSockets.filter(id => id !== socket.id);

      if (updatedSockets.length === 0) {
        activeConnections.delete(userId);
      } else {
        activeConnections.set(userId, updatedSockets);
      }
    });

    // Handle mark notification as read
    socket.on('markNotificationAsRead', async (notificationId: number) => {
      try {
        await notificationService.markNotificationAsRead(notificationId, userId);
        sendUnreadNotificationsCount(socket, userId);
      } catch (error) {
        console.error('Error marking notification as read:', error);
      }
    });

    // Handle mark all notifications as read
    socket.on('markAllNotificationsAsRead', async () => {
      try {
        await notificationService.markAllNotificationsAsRead(userId);
        sendUnreadNotificationsCount(socket, userId);
      } catch (error) {
        console.error('Error marking all notifications as read:', error);
      }
    });
  });

  return io;
};

// Helper function to send unread notifications count
async function sendUnreadNotificationsCount(socket: any, userId: number) {
  try {
    const count = await notificationService.getUnreadNotificationsCount(userId);
    socket.emit('unreadNotificationsCount', { count });
  } catch (error) {
    console.error('Error getting unread notifications count:', error);
  }
}

// Function to send a notification to a specific user
export async function sendNotificationToUser(userId: number, notification: any) {
  const socketIds = activeConnections.get(userId);
  if (!socketIds || socketIds.length === 0) {
    return; // User not connected
  }

  const io = global.io;
  if (!io) {
    console.error('Socket.io instance not available');
    return;
  }

  // Send to all active connections for this user
  socketIds.forEach(socketId => {
    io.to(socketId).emit('notification', notification);
  });

  // Update unread count
  const count = await notificationService.getUnreadNotificationsCount(userId);
  console.log("🚀 ~ sendNotificationToUser ~ count:", count)
  socketIds.forEach(socketId => {
    io.to(socketId).emit('unreadNotificationsCount', { count });
  });
} 