const socketClient = {
  socket: null,

  connect(token) {
    this.socket = io('/chat', {
      auth: { token },
      transports: ['websocket'],
    });

    this.socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
    });

    return this.socket;
  },

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  },

  joinRoom(roomId) {
    if (this.socket) {
      this.socket.emit('room:join', roomId);
    }
  },

  leaveRoom(roomId) {
    if (this.socket) {
      this.socket.emit('room:leave', roomId);
    }
  },

  sendMessage(roomId, content) {
    if (this.socket) {
      this.socket.emit('message:send', { roomId, content });
    }
  },

  onMessage(callback) {
    if (this.socket) {
      this.socket.on('message:receive', callback);
    }
  },

  onRoomUsers(callback) {
    if (this.socket) {
      this.socket.on('room:users', callback);
    }
  },

  onRoomJoined(callback) {
    if (this.socket) {
      this.socket.on('room:joined', callback);
    }
  },

  onRoomLeft(callback) {
    if (this.socket) {
      this.socket.on('room:left', callback);
    }
  },

  onUserOnline(callback) {
    if (this.socket) {
      this.socket.on('user:online', callback);
    }
  },

  onUserOffline(callback) {
    if (this.socket) {
      this.socket.on('user:offline', callback);
    }
  },

  onError(callback) {
    if (this.socket) {
      this.socket.on('error', callback);
    }
  },
};
