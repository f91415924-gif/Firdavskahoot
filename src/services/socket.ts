import { io, Socket } from 'socket.io-client';

class SocketService {
  private socket: Socket | null = null;

  public getSocket(): Socket {
    if (!this.socket) {
      // Connect to same origin
      this.socket = io({
        autoConnect: true,
        reconnection: true,
        reconnectionAttempts: 10,
        reconnectionDelay: 1000,
      });
    }
    return this.socket;
  }

  public disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }
}

export const socketService = new SocketService();
