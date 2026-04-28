const ui = {
  currentTab: 'login',

  switchTab(tab) {
    this.currentTab = tab;
    const loginTab = document.getElementById('tab-login');
    const registerTab = document.getElementById('tab-register');
    const nameField = document.getElementById('name-field');
    const submitBtn = document.querySelector('#auth-form button[type="submit"]');

    if (tab === 'login') {
      loginTab.className = 'flex-1 py-2 text-center text-white font-semibold border-b-2 border-[#5865f2]';
      registerTab.className = 'flex-1 py-2 text-center text-[#949ba4] font-semibold hover:text-white';
      nameField?.classList.add('hidden');
      submitBtn.textContent = 'Войти';
    } else {
      loginTab.className = 'flex-1 py-2 text-center text-[#949ba4] font-semibold hover:text-white';
      registerTab.className = 'flex-1 py-2 text-center text-white font-semibold border-b-2 border-[#5865f2]';
      nameField?.classList.remove('hidden');
      submitBtn.textContent = 'Зарегистрироваться';
    }
    this.clearError();
  },

  showError(message, context = 'auth') {
    const errorEl = context === 'room' ? document.getElementById('room-error') : document.getElementById('auth-error');
    if (errorEl) {
      errorEl.textContent = message;
      errorEl.classList.remove('hidden');
    }
  },

  clearError(context = 'auth') {
    const errorEl = context === 'room' ? document.getElementById('room-error') : document.getElementById('auth-error');
    if (errorEl) {
      errorEl.classList.add('hidden');
    }
  },

  renderRooms(rooms, currentRoomId, onSelectRoom) {
    const list = document.getElementById('rooms-list');
    if (!list) return;
    list.innerHTML = '';
    rooms.forEach(room => {
      const li = document.createElement('li');
      li.className = `px-2 py-1.5 rounded cursor-pointer transition-colors ${currentRoomId === room.id ? 'bg-[#404249]' : 'hover:bg-[#3b3d43]'}`;
      li.innerHTML = `
        <div class="flex items-center gap-2">
          <span class="text-[#949ba4]">#</span>
          <span class="text-white text-sm truncate">${escapeHtml(room.name)}</span>
        </div>
      `;
      li.addEventListener('click', () => onSelectRoom(room));
      list.appendChild(li);
    });
  },

  renderMessages(messages, currentUserId) {
    const area = document.getElementById('messages-area');
    if (!area) return;
    Array.from(area.children).forEach(el => {
      if (el.id !== 'empty-state' && el.id !== 'join-state') el.remove();
    });
    messages.forEach(msg => {
      area.appendChild(this.createMessageEl(msg, currentUserId));
    });
    area.scrollTop = area.scrollHeight;
  },

  clearMessages() {
    const area = document.getElementById('messages-area');
    if (!area) return;
    Array.from(area.children).forEach(el => {
      if (el.id !== 'empty-state' && el.id !== 'join-state') el.remove();
    });
  },

  appendMessage(msg, currentUserId) {
    const area = document.getElementById('messages-area');
    if (!area) return;
    const emptyState = document.getElementById('empty-state');
    if (emptyState) emptyState.remove();
    const joinState = document.getElementById('join-state');
    if (joinState && joinState.isConnected === true) joinState.remove();
    area.appendChild(this.createMessageEl(msg, currentUserId));
    area.scrollTop = area.scrollHeight;
  },

  createMessageEl(msg, currentUserId) {
    const isOwn = msg.senderId === currentUserId;
    const div = document.createElement('div');
    div.className = `flex flex-col ${isOwn ? 'items-end' : 'items-start'}`;
    div.innerHTML = `
      <span class="text-[#949ba4] text-xs mb-1">${escapeHtml(msg.sender?.name || msg.senderName || 'Пользователь')}</span>
      <div class="max-w-xs lg:max-w-md px-3 py-2 rounded-lg text-sm text-white ${isOwn ? 'bg-[#5865f2]' : 'bg-[#383a40]'}">
        ${escapeHtml(msg.content)}
      </div>
    `;
    return div;
  },

  renderMembers(members, onlineIds) {
    const list = document.getElementById('members-list');
    if (!list) return;
    list.innerHTML = '';
    members.forEach(user => {
      const isOnline = onlineIds.has(user.id);
      const li = document.createElement('li');
      li.className = 'flex items-center gap-2 px-2 py-1.5 rounded text-xs text-[#949ba4]';
      li.innerHTML = `
        <div class="relative shrink-0">
          <div class="w-7 h-7 rounded-full bg-[#5865f2] flex items-center justify-center text-white text-xs font-bold">
            ${escapeHtml((user.name || user.email || '?').charAt(0).toUpperCase())}
          </div>
          <span class="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-[#2b2d31] ${isOnline ? 'bg-green-500' : 'bg-[#747f8d]'}"></span>
        </div>
        <span class="truncate">${escapeHtml(user.name || user.email || user.id)}</span>
      `;
      list.appendChild(li);
    });
  },

  setRoomHeader(room) {
    const roomNameEl = document.getElementById('room-name');
    const leaveBtn = document.getElementById('btn-leave-room');
    if (roomNameEl) {
      roomNameEl.textContent = room ? room.name : 'Выберите комнату';
    }
    if (leaveBtn) {
      if (room) leaveBtn.classList.remove('hidden');
      else leaveBtn.classList.add('hidden');
    }
  },

  setInputEnabled(enabled) {
    const input = document.getElementById('message-input');
    const btn = document.getElementById('btn-send');
    if (input) {
      input.disabled = !enabled;
      input.placeholder = enabled ? 'Введите сообщение...' : 'Сначала выберите комнату';
    }
    if (btn) btn.disabled = !enabled;
  },

  showEmptyState() {
    const area = document.getElementById('messages-area');
    if (!area) return;
    if (document.getElementById('empty-state')) return;
    const div = document.createElement('div');
    div.id = 'empty-state';
    div.className = 'flex flex-col items-center justify-center h-full text-center';
    div.innerHTML = `
      <p class="text-[#949ba4] text-sm">Здесь пока нет сообщений</p>
      <p class="text-[#6d6f78] text-xs mt-1">Напишите что-нибудь, чтобы начать общение</p>
    `;
    area.appendChild(div);
  },

  showJoinState(onJoin) {
    const area = document.getElementById('messages-area');
    if (!area) return;
    if (document.getElementById('join-state')) return;
    const div = document.createElement('div');
    div.id = 'join-state';
    div.className = 'flex flex-col items-center justify-center h-full text-center';
    div.innerHTML = `
      <p class="text-[#949ba4] text-sm mb-3">Вы не состоите в этой комнате</p>
      <button id="btn-join-room" class="bg-[#5865f2] hover:bg-[#4752c4] text-white font-semibold py-2 px-4 rounded transition-colors text-sm">Присоединиться</button>
    `;
    area.appendChild(div);
    document.getElementById('btn-join-room')?.addEventListener('click', onJoin);
  },

  showModal() {
    const modal = document.getElementById('modal-create-room');
    const input = document.getElementById('input-room-name');
    if (modal) modal.classList.remove('hidden');
    if (input) {
      input.value = '';
      input.focus();
    }
    this.clearError('room');
  },

  hideModal() {
    const modal = document.getElementById('modal-create-room');
    if (modal) modal.classList.add('hidden');
  },

  setUser(user) {
    const nameEl = document.getElementById('user-name');
    const avatarEl = document.getElementById('user-avatar');
    if (nameEl) nameEl.textContent = user.name || user.email || 'Пользователь';
    if (avatarEl) avatarEl.textContent = (user.name || user.email || '?').charAt(0).toUpperCase();
  },
};

function escapeHtml(str) {
  if (!str) return '';
  return str.replace(/[&<>]/g, function(m) {
    if (m === '&') return '&amp;';
    if (m === '<') return '&lt;';
    if (m === '>') return '&gt;';
    return m;
  });
}
