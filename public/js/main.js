const state = {
  user: null,
  rooms: [],
  myRoomIds: new Set(),
  currentRoom: null,
  members: [],
  onlineIds: new Set(),
  pendingRoom: null,
};

// Страница авторизации
const authForm = document.getElementById('auth-form');
if (authForm) {
  document.getElementById('tab-login')?.addEventListener('click', () => ui.switchTab('login'));
  document.getElementById('tab-register')?.addEventListener('click', () => ui.switchTab('register'));

  authForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    ui.clearError();

    const email = document.getElementById('input-email').value.trim();
    const password = document.getElementById('input-password').value.trim();

    try {
      if (ui.currentTab === 'register') {
        const name = document.getElementById('input-name').value.trim();
        await api.register(email, password, name);
      }

      const data = await api.login(email, password);
      localStorage.setItem('token', data.data.session.access_token);
      localStorage.setItem('user_email', email);
      window.location.href = '/chat.html';
    } catch (err) {
      ui.showError(err.message);
    }
  });
}

// Страница чата
const roomsList = document.getElementById('rooms-list');
if (roomsList) {
  const token = api.getToken();
  if (!token) {
    window.location.href = '/login.html';
  } else {
    initChat();
  }
}

async function initChat() {
  const token = api.getToken();

  state.user = await api.getMe();
  ui.setUser(state.user);

  socketClient.connect(token);

  socketClient.onMessage((msg) => {
    if (msg.roomId === state.currentRoom?.id) {
      ui.appendMessage(msg, state.user?.id);
    }
  });

  socketClient.onRoomUsers((members) => {
    state.members = members;
    state.onlineIds.clear();
    members.forEach(m => state.onlineIds.add(m.id));
    ui.renderMembers(state.members, state.onlineIds);
  });

  socketClient.onUserOnline(({ userId, username }) => {
    if (state.currentRoom) {
      state.onlineIds.add(userId);
      if (!state.members.find(m => m.id === userId)) {
        state.members.push({ id: userId, name: username });
      }
      ui.renderMembers(state.members, state.onlineIds);
    }
  });

  socketClient.onUserOffline(({ userId }) => {
    if (state.currentRoom) {
      state.onlineIds.delete(userId);
      ui.renderMembers(state.members, state.onlineIds);
    }
  });

  socketClient.onError(({ message }) => {
    console.error('Socket error:', message);
  });

  socketClient.onRoomJoined(({ roomId }) => {
    if (state.myRoomIds && !state.myRoomIds.has(roomId)) {
      state.myRoomIds.add(roomId);
      ui.renderRooms(state.rooms, state.currentRoom?.id, selectRoom);
    }
  });

  socketClient.onRoomLeft(({ roomId }) => {
    if (state.myRoomIds) {
      state.myRoomIds.delete(roomId);
      ui.renderRooms(state.rooms, state.currentRoom?.id, selectRoom);
      if (state.currentRoom?.id === roomId) {
        state.currentRoom = null;
        state.members = [];
        state.onlineIds.clear();
        ui.setRoomHeader(null);
        ui.setInputEnabled(false);
        ui.clearMessages();
        ui.showEmptyState();
        localStorage.removeItem('currentRoomId');
      }
    }
  });

  await loadRooms();

  document.getElementById('btn-logout')?.addEventListener('click', async () => {
    try {
      await api.logout();
    } finally {
      localStorage.clear();
      socketClient.disconnect();
      window.location.href = '/login.html';
    }
  });

  document.getElementById('btn-create-room')?.addEventListener('click', () => ui.showModal());
  document.getElementById('btn-cancel-room')?.addEventListener('click', () => ui.hideModal());
  document.getElementById('btn-confirm-room')?.addEventListener('click', async () => {
    const name = document.getElementById('input-room-name').value.trim();
    if (!name) return;

    try {
      const room = await api.createRoom(name);
      state.rooms.unshift(room);
      ui.renderRooms(state.rooms, state.currentRoom?.id, selectRoom);
      ui.hideModal();
      await loadRooms();
    } catch (err) {
      const errEl = document.getElementById('room-error');
      if (errEl) {
        errEl.textContent = err.message;
        errEl.classList.remove('hidden');
      }
    }
  });

  document.getElementById('btn-leave-room')?.addEventListener('click', () => {
    if (!state.currentRoom) return;
    const roomId = state.currentRoom.id;
    socketClient.leaveRoom(roomId);
    state.currentRoom = null;
    state.members = [];
    state.onlineIds.clear();
    localStorage.removeItem('currentRoomId');
    if (state.myRoomIds) state.myRoomIds.delete(roomId);
    ui.setRoomHeader(null);
    ui.setInputEnabled(false);
    ui.renderMembers([], new Set());
    ui.clearMessages();
    ui.showEmptyState();
    ui.renderRooms(state.rooms, null, selectRoom);
  });

  const messageInput = document.getElementById('message-input');
  document.getElementById('btn-send')?.addEventListener('click', sendMessage);
  messageInput?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') sendMessage();
  });
}

async function loadRooms() {
  const [rooms, myRoomIds] = await Promise.all([api.getRooms(), api.getMyRooms()]);
  state.rooms = rooms;
  state.myRoomIds = new Set(myRoomIds);

  const savedRoomId = localStorage.getItem('currentRoomId');
  if (savedRoomId && state.myRoomIds.has(savedRoomId)) {
    const room = state.rooms.find(r => r.id === savedRoomId);
    if (room) await joinRoom(room);
  } else {
    ui.renderRooms(state.rooms, state.currentRoom?.id, selectRoom);
  }
}

function selectRoom(room) {
  if (state.currentRoom?.id === room.id) return;

  if (state.currentRoom) {
    state.currentRoom = null;
    state.members = [];
    state.onlineIds.clear();
    ui.setRoomHeader(null);
    ui.setInputEnabled(false);
    ui.renderMembers([], new Set());
    ui.clearMessages();
    ui.showEmptyState();
  }

  if (state.myRoomIds.has(room.id)) {
    joinRoom(room);
  } else {
    state.pendingRoom = room;
    ui.showJoinState(() => joinRoom(room));
  }
}

async function joinRoom(room) {
  state.currentRoom = room;
  localStorage.setItem('currentRoomId', room.id);
  ui.setRoomHeader(room);
  ui.setInputEnabled(true);
  ui.clearMessages();
  ui.showEmptyState();

  socketClient.joinRoom(room.id);

  const messages = await api.getMessages(room.id);
  if (messages.length > 0) {
    ui.renderMessages(messages, state.user.id);
  } else {
    ui.showEmptyState();
  }

  ui.renderRooms(state.rooms, room.id, selectRoom);
}

function sendMessage() {
  const input = document.getElementById('message-input');
  const content = input?.value.trim();
  if (!content || !state.currentRoom) return;

  socketClient.sendMessage(state.currentRoom.id, content);
  input.value = '';
}
