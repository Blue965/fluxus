// ══════════════════════════════════════════════════════════════
// ULTIMATE PLATFORM FLUXUS - Toutes les fonctionnalités restantes
// ══════════════════════════════════════════════════════════════

// ── SYSTÈME DE MESSAGERIE PRIVÉE AVANCÉE ─────────────────────
let _privateChats = [];
let _activeChatId = null;

window.openPrivateChat = (userId) => {
  const existing = _privateChats.find(c => c.userId === userId);
  if (existing) {
    _activeChatId = existing.id;
  } else {
    const newChat = {
      id: 'chat_' + Date.now(),
      userId,
      messages: [],
      unread: 0
    };
    _privateChats.push(newChat);
    _activeChatId = newChat.id;
  }
  
  renderPrivateChat();
};

window.renderPrivateChat = () => {
  const container = document.getElementById('privateChatContainer');
  if (!container) return;

  const chat = _privateChats.find(c => c.id === _activeChatId);
  if (!chat) return;

  container.innerHTML = `
    <div class="private-chat-header">
      <div class="chat-user-info">
        <div class="chat-avatar">👤</div>
        <div class="chat-user-name">Utilisateur</div>
      </div>
      <button class="chat-close-btn" onclick="closePrivateChat()">✕</button>
    </div>
    <div class="private-chat-messages">
      ${chat.messages.map(m => `
        <div class="chat-message ${m.fromMe ? 'sent' : 'received'}">
          <div class="message-content">${m.text}</div>
          <div class="message-time">${m.time}</div>
        </div>
      `).join('')}
    </div>
    <div class="private-chat-input">
      <input type="text" placeholder="Écris un message..." 
             onkeydown="if(event.key==='Enter')sendPrivateMessage()">
      <button onclick="sendPrivateMessage()">→</button>
    </div>
  `;
};

window.sendPrivateMessage = () => {
  const input = document.querySelector('.private-chat-input input');
  const text = input?.value?.trim();
  if (!text || !_activeChatId) return;

  const chat = _privateChats.find(c => c.id === _activeChatId);
  if (chat) {
    chat.messages.push({
      text,
      fromMe: true,
      time: new Date().toLocaleTimeString()
    });
    renderPrivateChat();
  }

  input.value = '';
};

window.closePrivateChat = () => {
  _activeChatId = null;
  document.getElementById('privateChatContainer')?.remove();
};

// ── SYSTÈME DE GROUPES/COMMUNAUTÉS ───────────────────────────
const COMMUNITIES = [
  { id: 1, name: 'Gaming Hub', members: 12500, icon: '🎮', category: 'Gaming' },
  { id: 2, name: 'Dev Community', members: 8900, icon: '💻', category: 'Dev' },
  { id: 3, name: 'Music Lovers', members: 5600, icon: '🎵', category: 'Music' },
  { id: 4, name: 'Art Gallery', members: 3200, icon: '🎨', category: 'Art' },
  { id: 5, name: 'Crypto Traders', members: 7800, icon: '💎', category: 'Crypto' },
  { id: 6, name: 'Sports Fans', members: 9100, icon: '⚽', category: 'Sports' }
];

window.renderCommunities = () => {
  const container = document.getElementById('communitiesSection');
  if (!container) return;

  container.innerHTML = `
    <div class="sidebar-title">Communautés</div>
    ${COMMUNITIES.map(c => `
      <div class="community-item" onclick="joinCommunity(${c.id})">
        <div class="community-icon">${c.icon}</div>
        <div class="community-info">
          <div class="community-name">${c.name}</div>
          <div class="community-members">${c.members.toLocaleString()} membres</div>
        </div>
        <button class="community-join-btn">Rejoindre</button>
      </div>
    `).join('')}
  `;
};

window.joinCommunity = (communityId) => {
  const community = COMMUNITIES.find(c => c.id === communityId);
  if (community) {
    toast(`Rejoint ${community.name} !`, 'success');
  }
};

// ── SYSTÈME DE GAMING INTÉGRÉ ─────────────────────────────────
const GAMES = [
  { id: 1, name: 'Valorant', players: '2.5M', status: 'online' },
  { id: 2, name: 'League of Legends', players: '3.2M', status: 'online' },
  { id: 3, name: 'Fortnite', players: '4.1M', status: 'online' },
  { id: 4, name: 'Minecraft', players: '1.8M', status: 'online' },
  { id: 5, name: 'CS:GO', players: '1.2M', status: 'online' },
  { id: 6, name: 'Apex Legends', players: '980K', status: 'online' }
];

window.renderGamingHub = () => {
  const container = document.getElementById('gamingHubSection');
  if (!container) return;

  container.innerHTML = `
    <div class="sidebar-title">Gaming Hub</div>
    <div class="games-list">
      ${GAMES.map(g => `
        <div class="game-item">
          <div class="game-info">
            <div class="game-name">${g.name}</div>
            <div class="game-players">👥 ${g.players} en ligne</div>
          </div>
          <button class="game-launch-btn" onclick="launchGame('${g.name}')">▶</button>
        </div>
      `).join('')}
    </div>
  `;
};

window.launchGame = (gameName) => {
  toast(`Lancement de ${gameName}...`, 'success');
};

// ── SYSTÈME DE LIVE STREAMING AVANCÉ ─────────────────────────
const STREAMERS = [
  { id: 1, name: 'ProGamer', game: 'Valorant', viewers: 15420, thumbnail: '🎮' },
  { id: 2, name: 'SpeedRunner', game: 'Minecraft', viewers: 8930, thumbnail: '⛏️' },
  { id: 3, name: 'ArtistLive', game: 'Art Stream', viewers: 5210, thumbnail: '🎨' },
  { id: 4, name: 'MusicDJ', game: 'DJ Set', viewers: 3200, thumbnail: '🎵' }
];

window.renderLiveStreams = () => {
  const container = document.getElementById('liveStreamsSection');
  if (!container) return;

  container.innerHTML = `
    <div class="sidebar-title">Live Streams</div>
    <div class="streams-list">
      ${STREAMERS.map(s => `
        <div class="stream-item" onclick="watchStream(${s.id})">
          <div class="stream-thumbnail">${s.thumbnail}</div>
          <div class="stream-info">
            <div class="stream-name">${s.name}</div>
            <div class="stream-game">${s.game}</div>
            <div class="stream-viewers">👁 ${s.viewers.toLocaleString()}</div>
          </div>
          <div class="stream-live-badge">LIVE</div>
        </div>
      `).join('')}
    </div>
  `;
};

window.watchStream = (streamId) => {
  const stream = STREAMERS.find(s => s.id === streamId);
  if (stream) {
    openStreamModal();
  }
};

// ── SYSTÈME DE VOICE CHANNELS ───────────────────────────────
let _inVoiceChannel = null;

window.joinVoiceChannel = (channelId) => {
  _inVoiceChannel = channelId;
  toast(`Rejoint le canal vocal: ${channelId}`, 'success');
  
  // Afficher les participants du canal vocal
  renderVoiceParticipants();
};

window.renderVoiceParticipants = () => {
  const container = document.getElementById('voiceParticipants');
  if (!container) return;

  const participants = [
    { name: 'Moi', avatar: '👤', speaking: false },
    { name: 'Alice', avatar: '👩', speaking: true },
    { name: 'Bob', avatar: '👨', speaking: false },
    { name: 'Charlie', avatar: '🧑', speaking: false }
  ];

  container.innerHTML = `
    <div class="voice-header">
      <span>🎤 Canal Vocal</span>
      <button onclick="leaveVoiceChannel()">✕</button>
    </div>
    <div class="voice-participants">
      ${participants.map(p => `
        <div class="voice-participant ${p.speaking ? 'speaking' : ''}">
          <div class="participant-avatar">${p.avatar}</div>
          <div class="participant-name">${p.name}</div>
          ${p.speaking ? '<div class="speaking-indicator">🔊</div>' : ''}
        </div>
      `).join('')}
    </div>
  `;
};

window.leaveVoiceChannel = () => {
  _inVoiceChannel = null;
  toast('Quitté le canal vocal', '');
  document.getElementById('voiceParticipants')?.remove();
};

// ── SYSTÈME D'EVENTS/CALENDRIER ───────────────────────────────
const EVENTS = [
  { id: 1, name: 'Gaming Tournament', date: '2024-06-15', time: '18:00', type: 'gaming' },
  { id: 2, name: 'Dev Meetup', date: '2024-06-20', time: '14:00', type: 'dev' },
  { id: 3, name: 'Music Festival', date: '2024-06-25', time: '20:00', type: 'music' },
  { id: 4, name: 'Art Exhibition', date: '2024-07-01', time: '10:00', type: 'art' }
];

window.renderEvents = () => {
  const container = document.getElementById('eventsSection');
  if (!container) return;

  container.innerHTML = `
    <div class="sidebar-title">Événements à venir</div>
    <div class="events-list">
      ${EVENTS.map(e => `
        <div class="event-item">
          <div class="event-date">
            <div class="event-day">${new Date(e.date).getDate()}</div>
            <div class="event-month">${new Date(e.date).toLocaleString('fr', { month: 'short' })}</div>
          </div>
          <div class="event-info">
            <div class="event-name">${e.name}</div>
            <div class="event-time">${e.time}</div>
          </div>
          <button class="event-rsvp-btn" onclick="rsvpEvent(${e.id})">Participer</button>
        </div>
      `).join('')}
    </div>
  `;
};

window.rsvpEvent = (eventId) => {
  const event = EVENTS.find(e => e.id === eventId);
  if (event) {
    toast(`Participation confirmée pour ${event.name}`, 'success');
  }
};

// ── SYSTÈME DE NEWS/ACTUALITÉS ────────────────────────────────
const NEWS = [
  { id: 1, title: 'Nouvelle mise à jour Fluxus 2.0', category: 'Update', time: '2h' },
  { id: 2, title: 'Tournoi gaming ce weekend', category: 'Gaming', time: '5h' },
  { id: 3, title: 'Nouveaux serveurs disponibles', category: 'Community', time: '1j' },
  { id: 4, title: 'Maintenance serveur prévue', category: 'System', time: '2j' }
];

window.renderNews = () => {
  const container = document.getElementById('newsSection');
  if (!container) return;

  container.innerHTML = `
    <div class="sidebar-title">Actualités</div>
    <div class="news-list">
      ${NEWS.map(n => `
        <div class="news-item">
          <div class="news-category">${n.category}</div>
          <div class="news-title">${n.title}</div>
          <div class="news-time">${n.time}</div>
        </div>
      `).join('')}
    </div>
  `;
};

// ── SYSTÈME DE DARK MODE AVANCÉ ───────────────────────────────
const THEME_PRESETS = {
  midnight: {
    bg: '#000000',
    bg2: '#0a0a0a',
    bg3: '#111111',
    accent: '#6366f1'
  },
  ocean: {
    bg: '#0f172a',
    bg2: '#1e293b',
    bg3: '#334155',
    accent: '#0ea5e9'
  },
  forest: {
    bg: '#052e16',
    bg2: '#14532d',
    bg3: '#166534',
    accent: '#22c55e'
  },
  sunset: {
    bg: '#1c1917',
    bg2: '#292524',
    bg3: '#44403c',
    accent: '#f59e0b'
  },
  cyberpunk: {
    bg: '#0a0a0f',
    bg2: '#1a1a2e',
    bg3: '#2d2d44',
    accent: '#ff00ff'
  },
  neon: {
    bg: '#000000',
    bg2: '#111111',
    bg3: '#222222',
    accent: '#00ff00'
  }
};

let _currentTheme = 'midnight';

window.openThemeSelector = () => {
  const modal = document.createElement('div');
  modal.className = 'overlay open';
  modal.id = 'themeSelectorModal';
  modal.innerHTML = `
    <div class="modal theme-selector-modal">
      <button class="modal-x" onclick="document.getElementById('themeSelectorModal').remove()">
        <svg viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
      </button>
      <h3 style="font-family:var(--font-d);font-size:20px;font-weight:700;margin-bottom:20px">🎨 Thèmes</h3>
      
      <div class="theme-grid">
        ${Object.entries(THEME_PRESETS).map(([name, theme]) => `
          <div class="theme-option ${name === _currentTheme ? 'active' : ''}" 
               onclick="applyTheme('${name}')">
            <div class="theme-preview" style="background:${theme.bg}">
              <div class="theme-accent" style="background:${theme.accent}"></div>
            </div>
            <div class="theme-name">${name}</div>
          </div>
        `).join('')}
      </div>
    </div>
  `;
  document.body.appendChild(modal);
};

window.applyTheme = (themeName) => {
  _currentTheme = themeName;
  const theme = THEME_PRESETS[themeName];
  
  document.documentElement.style.setProperty('--bg', theme.bg);
  document.documentElement.style.setProperty('--bg2', theme.bg2);
  document.documentElement.style.setProperty('--bg3', theme.bg3);
  document.documentElement.style.setProperty('--accent', theme.accent);
  
  localStorage.setItem('fluxus_theme', themeName);
  
  document.getElementById('themeSelectorModal')?.remove();
  toast(`Thème ${themeName} appliqué`, 'success');
};

// ── INITIALISATION ───────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  // Charger le thème sauvegardé
  const savedTheme = localStorage.getItem('fluxus_theme');
  if (savedTheme && THEME_PRESETS[savedTheme]) {
    applyTheme(savedTheme);
  }
  
  // Rendre toutes les sections
  renderCommunities();
  renderGamingHub();
  renderLiveStreams();
  renderEvents();
  renderNews();
  
  console.log('%c🚀 ULTIMATE PLATFORM FLUXUS CHARGÉ !', 'color:#a855f7;font-weight:800;font-size:14px');
});
