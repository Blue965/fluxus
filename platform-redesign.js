// ══════════════════════════════════════════════════════════════
// PLATFORM REDESIGN FLUXUS - JavaScript
// Discord-like + Facebook-like + X-like
// ══════════════════════════════════════════════════════════════

// ── SYSTÈME DE SERVEURS (Discord-like) ─────────────────────────
const SERVERS = [
  { id: 'home', name: 'Accueil', icon: '🏠', type: 'home' },
  { id: 'gaming', name: 'Gaming Hub', icon: '🎮', type: 'server' },
  { id: 'dev', name: 'Dev Community', icon: '💻', type: 'server' },
  { id: 'music', name: 'Music Lovers', icon: '🎵', type: 'server' },
  { id: 'art', name: 'Art Gallery', icon: '🎨', type: 'server' },
  { id: 'sports', name: 'Sports', icon: '⚽', type: 'server' },
  { id: 'crypto', name: 'Crypto', icon: '💎', type: 'server' }
];

let _currentServer = 'home';

window.renderServers = () => {
  const container = document.getElementById('serverSidebar');
  if (!container) return;

  container.innerHTML = SERVERS.map(server => `
    <div class="server-icon ${server.type} ${server.id === _currentServer ? 'active' : ''}" 
         onclick="selectServer('${server.id}')"
         title="${server.name}">
      ${server.icon}
    </div>
  `).join('') + `
    <div class="server-divider"></div>
    <div class="server-icon add" onclick="createServer()" title="Ajouter un serveur">
      <svg viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
    </div>
  `;
};

window.selectServer = (serverId) => {
  _currentServer = serverId;
  renderServers();
  renderChannels();
  loadServerContent(serverId);
};

window.createServer = () => {
  const name = prompt('Nom du serveur:');
  if (!name) return;

  const icon = prompt('Icone (emoji):', '🎮') || '🎮';
  
  SERVERS.push({
    id: 'server_' + Date.now(),
    name,
    icon,
    type: 'server'
  });

  renderServers();
  toast('Serveur créé !', 'success');
};

// ── SYSTÈME DE CHANNELS (Discord-like) ───────────────────────
const CHANNELS = {
  home: {
    'general': { name: 'Général', type: 'text', unread: 0 },
    'announcements': { name: 'Annonces', type: 'text', unread: 3 },
    'rules': { name: 'Règles', type: 'text', unread: 0 },
    'voice-general': { name: 'Général', type: 'voice' },
    'voice-gaming': { name: 'Gaming', type: 'voice' }
  },
  gaming: {
    'general': { name: 'Général', type: 'text', unread: 12 },
    'lfg': { name: 'Looking for Group', type: 'text', unread: 5 },
    'clips': { name: 'Clips', type: 'text', unread: 0 },
    'voice-lounge': { name: 'Lounge', type: 'voice' },
    'voice-gaming': { name: 'Gaming', type: 'voice' }
  },
  dev: {
    'general': { name: 'Général', type: 'text', unread: 8 },
    'help': { name: 'Aide', type: 'text', unread: 2 },
    'showcase': { name: 'Showcase', type: 'text', unread: 0 },
    'voice-collab': { name: 'Collaboration', type: 'voice' }
  }
};

let _currentChannel = 'general';

window.renderChannels = () => {
  const container = document.getElementById('channelSidebar');
  if (!container) return;

  const serverChannels = CHANNELS[_currentServer] || CHANNELS.home;
  
  container.innerHTML = `
    <div class="channel-header">
      <svg viewBox="0 0 24 24"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/></svg>
      ${SERVERS.find(s => s.id === _currentServer)?.name || 'Accueil'}
    </div>
    <div class="channel-list">
      <div class="channel-category">
        <div class="category-header" onclick="toggleCategory(this)">
          <svg viewBox="0 0 24 24"><polyline points="6 9 12 15 18 9"/></svg>
          Canaux textuels
        </div>
        ${Object.entries(serverChannels)
          .filter(([id, ch]) => ch.type === 'text')
          .map(([id, ch]) => `
            <div class="channel-item ${id === _currentChannel ? 'active' : ''} ${ch.unread ? 'unread' : ''}" 
                 onclick="selectChannel('${id}')">
              <svg viewBox="0 0 24 24"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>
              ${ch.name}
              ${ch.unread ? `<span class="unread-badge">${ch.unread}</span>` : ''}
            </div>
          `).join('')}
      </div>
      <div class="channel-category">
        <div class="category-header" onclick="toggleCategory(this)">
          <svg viewBox="0 0 24 24"><polyline points="6 9 12 15 18 9"/></svg>
          Canaux vocaux
        </div>
        ${Object.entries(serverChannels)
          .filter(([id, ch]) => ch.type === 'voice')
          .map(([id, ch]) => `
            <div class="channel-item" onclick="joinVoiceChannel('${id}')">
              <svg viewBox="0 0 24 24"><path d="M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3z"/><path d="M19 10v2a7 7 0 01-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg>
              ${ch.name}
            </div>
          `).join('')}
      </div>
    </div>
    <div class="user-panel">
      <div class="user-panel-avatar">${PROF?.name?.charAt(0) || ME?.displayName?.charAt(0) || '?'}</div>
      <div class="user-panel-info">
        <div class="user-panel-name">${PROF?.name || ME?.displayName || 'Utilisateur'}</div>
        <div class="user-panel-status">En ligne</div>
      </div>
      <div class="user-panel-controls">
        <button class="user-panel-btn" onclick="toggleMic()" title="Micro">
          <svg viewBox="0 0 24 24"><path d="M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3z"/><path d="M19 10v2a7 7 0 01-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg>
        </button>
        <button class="user-panel-btn" onclick="toggleSound()" title="Son">
          <svg viewBox="0 0 24 24"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M19.07 4.93a10 10 0 010 14.14M15.54 8.46a5 5 0 010 7.07"/></svg>
        </button>
        <button class="user-panel-btn" onclick="openSettings()" title="Paramètres">
          <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z"/></svg>
        </button>
      </div>
    </div>
  `;
};

window.selectChannel = (channelId) => {
  _currentChannel = channelId;
  
  // Marquer comme lu
  const serverChannels = CHANNELS[_currentServer];
  if (serverChannels?.[channelId]) {
    serverChannels[channelId].unread = 0;
  }
  
  renderChannels();
  loadChannelContent(channelId);
};

window.toggleCategory = (header) => {
  header.classList.toggle('collapsed');
  const content = header.nextElementSibling;
  content.style.display = header.classList.contains('collapsed') ? 'none' : 'block';
};

window.joinVoiceChannel = (channelId) => {
  toast(`Rejoint le canal vocal: ${channelId}`, 'success');
  // Ici, on pourrait implémenter WebRTC pour le voice
};

// ── FEED TWITTER-LIKE AVEC TIMELINE INFINIE ───────────────────
let _feedPosts = [];
let _feedPage = 0;
let _isLoadingFeed = false;

window.loadInfiniteFeed = async () => {
  if (_isLoadingFeed) return;
  _isLoadingFeed = true;

  const container = document.getElementById('feedContainer');
  if (!container) return;

  // Simuler le chargement de posts
  await new Promise(r => setTimeout(r, 1000));

  const newPosts = generateMockPosts(10);
  _feedPosts = [..._feedPosts, ...newPosts];

  newPosts.forEach(post => {
    container.appendChild(createPostElement(post));
  });

  _isLoadingFeed = false;
  _feedPage++;
};

function generateMockPosts(count) {
  const mockUsers = [
    { name: 'GamerPro', handle: '@gamerpro', avatar: '🎮' },
    { name: 'DevMaster', handle: '@devmaster', avatar: '💻' },
    { name: 'ArtistX', handle: '@artistx', avatar: '🎨' },
    { name: 'MusicFan', handle: '@musicfan', avatar: '🎵' },
    { name: 'CryptoKing', handle: '@cryptoking', avatar: '💎' }
  ];

  const mockTexts = [
    'Juste battu mon record sur le nouveau jeu ! 🎮🔥',
    'Nouveau projet en cours de dev, ça va être incroyable ! 💻✨',
    'J\'ai fini mon dessin aujourd\'hui, qu\'en pensez-vous ? 🎨',
    'Cette nouvelle chanson est incroyable, écoutez-la ! 🎵',
    'Le marché est en feu aujourd\'hui ! 💹🚀',
    'Streaming ce soir à 20h, soyez là ! 📺',
    'Nouveau record personnel ! 🏆',
    'Qui est down pour une game ? 🎮',
    'Juste découvert ce truc incroyable ! 🤯',
    'Weekend gaming commence maintenant ! 🎉'
  ];

  return Array.from({ length: count }, (_, i) => ({
    id: `post_${Date.now()}_${i}`,
    user: mockUsers[Math.floor(Math.random() * mockUsers.length)],
    text: mockTexts[Math.floor(Math.random() * mockTexts.length)],
    time: `${Math.floor(Math.random() * 23)}h`,
    likes: Math.floor(Math.random() * 1000),
    retweets: Math.floor(Math.random() * 500),
    replies: Math.floor(Math.random() * 100)
  }));
}

function createPostElement(post) {
  const div = document.createElement('div');
  div.className = 'post';
  div.innerHTML = `
    <div class="post-avatar">${post.user.avatar}</div>
    <div class="post-content">
      <div class="post-header">
        <span class="post-name">${post.user.name}</span>
        <span class="post-handle">${post.user.handle}</span>
        <span class="post-time">· ${post.time}</span>
      </div>
      <div class="post-text">${post.text}</div>
      <div class="post-actions">
        <button class="post-action" onclick="toggleLike(this)">
          <svg viewBox="0 0 24 24"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg>
          ${post.likes}
        </button>
        <button class="post-action" onclick="toggleRetweet(this)">
          <svg viewBox="0 0 24 24"><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15"/></svg>
          ${post.retweets}
        </button>
        <button class="post-action" onclick="openReplyModal()">
          <svg viewBox="0 0 24 24"><path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z"/></svg>
          ${post.replies}
        </button>
        <button class="post-action" onclick="sharePost()">
          <svg viewBox="0 0 24 24"><path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" y1="2" x2="12" y2="15"/></svg>
        </button>
      </div>
    </div>
  `;
  return div;
}

window.toggleLike = (btn) => {
  btn.classList.toggle('liked');
  const count = parseInt(btn.textContent.trim());
  btn.innerHTML = btn.classList.contains('liked') 
    ? `<svg viewBox="0 0 24 24"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg> ${count + 1}`
    : `<svg viewBox="0 0 24 24"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg> ${count - 1}`;
};

window.toggleRetweet = (btn) => {
  btn.classList.toggle('retweeted');
  const count = parseInt(btn.textContent.trim());
  btn.innerHTML = btn.classList.contains('retweeted') 
    ? `<svg viewBox="0 0 24 24"><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15"/></svg> ${count + 1}`
    : `<svg viewBox="0 0 24 24"><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15"/></svg> ${count - 1}`;
};

// ── SYSTÈME DE STORIES (Facebook/Instagram-like) ─────────────
const STORIES = [
  { id: 1, user: { name: 'Moi', avatar: '👤' }, hasStory: false },
  { id: 2, user: { name: 'Alice', avatar: '👩' }, hasStory: true },
  { id: 3, user: { name: 'Bob', avatar: '👨' }, hasStory: true },
  { id: 4, user: { name: 'Charlie', avatar: '🧑' }, hasStory: true },
  { id: 5, user: { name: 'Diana', avatar: '👩‍🦰' }, hasStory: true },
  { id: 6, user: { name: 'Eve', avatar: '👧' }, hasStory: true },
  { id: 7, user: { name: 'Frank', avatar: '👨‍🦱' }, hasStory: true },
  { id: 8, user: { name: 'Grace', avatar: '👵' }, hasStory: true }
];

window.renderStories = () => {
  const container = document.getElementById('storiesBar');
  if (!container) return;

  container.innerHTML = STORIES.map(story => `
    <div class="story-item ${!story.hasStory ? 'add-story' : ''}" onclick="${story.hasStory ? `viewStory(${story.id})` : 'createStory()'}">
      <div class="story-ring">
        <div class="story-avatar">${story.user.avatar}</div>
      </div>
      <div class="story-name">${story.user.name}</div>
    </div>
  `).join('');
};

window.createStory = () => {
  toast('Créer une story - Fonctionnalité à venir', '');
};

window.viewStory = (storyId) => {
  toast(`Voir la story de ${STORIES.find(s => s.id === storyId)?.user.name}`, '');
};

// ── SYSTÈME DE NOTIFICATIONS AVANCÉ ───────────────────────────
const NOTIFICATIONS = [
  { id: 1, type: 'like', user: 'Alice', message: 'a aimé ton post', time: '2m' },
  { id: 2, type: 'follow', user: 'Bob', message: 's\'est abonné à toi', time: '5m' },
  { id: 3, type: 'mention', user: 'Charlie', message: 't\'a mentionné', time: '15m' },
  { id: 4, type: 'message', user: 'Diana', message: 't\'a envoyé un message', time: '1h' },
  { id: 5, type: 'retweet', user: 'Eve', message: 'a retweeté ton post', time: '2h' }
];

window.renderNotifications = () => {
  const container = document.getElementById('notificationsDropdown');
  if (!container) return;

  container.innerHTML = `
    <div class="notifications-header">
      <h3>Notifications</h3>
      <button onclick="markAllAsRead()">Tout marquer comme lu</button>
    </div>
    <div class="notifications-list">
      ${NOTIFICATIONS.map(notif => `
        <div class="notification-item">
          <div class="notification-icon">${getNotificationIcon(notif.type)}</div>
          <div class="notification-content">
            <div class="notification-text">
              <strong>${notif.user}</strong> ${notif.message}
            </div>
            <div class="notification-time">${notif.time}</div>
          </div>
        </div>
      `).join('')}
    </div>
  `;
};

function getNotificationIcon(type) {
  const icons = {
    like: '❤️',
    follow: '👤',
    mention: '@',
    message: '💬',
    retweet: '🔄'
  };
  return icons[type] || '🔔';
}

window.markAllAsRead = () => {
  toast('Toutes les notifications marquées comme lues', 'success');
};

// ── TRENDING TOPICS (X-like) ─────────────────────────────────
const TRENDING = [
  { topic: '#Fluxus', count: '125K posts' },
  { topic: '#Gaming', count: '89K posts' },
  { topic: '#Dev', count: '45K posts' },
  { topic: '#Crypto', count: '32K posts' },
  { topic: '#Music', count: '28K posts' }
];

window.renderTrending = () => {
  const container = document.getElementById('trendingSection');
  if (!container) return;

  container.innerHTML = `
    <div class="sidebar-title">Tendances</div>
    ${TRENDING.map(t => `
      <div class="trending-item">
        <div class="trending-meta">Tendance</div>
        <div class="trending-topic">${t.topic}</div>
        <div class="trending-count">${t.count}</div>
      </div>
    `).join('')}
  `;
};

// ── SUGGESTIONS (Twitter-like) ────────────────────────────────
const SUGGESTIONS = [
  { name: 'GamerPro', handle: '@gamerpro', avatar: '🎮' },
  { name: 'DevMaster', handle: '@devmaster', avatar: '💻' },
  { name: 'ArtistX', handle: '@artistx', avatar: '🎨' }
];

window.renderSuggestions = () => {
  const container = document.getElementById('suggestionsSection');
  if (!container) return;

  container.innerHTML = `
    <div class="sidebar-title">À suivre</div>
    ${SUGGESTIONS.map(s => `
      <div class="suggestion-item">
        <div class="suggestion-avatar">${s.avatar}</div>
        <div class="suggestion-info">
          <div class="suggestion-name">${s.name}</div>
          <div class="suggestion-handle">${s.handle}</div>
        </div>
        <button class="suggestion-follow" onclick="followUser('${s.handle}')">Suivre</button>
      </div>
    `).join('')}
  `;
};

window.followUser = (handle) => {
  toast(`Tu suis maintenant ${handle}`, 'success');
};

// ── INITIALISATION ───────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  renderServers();
  renderChannels();
  renderStories();
  renderTrending();
  renderSuggestions();

  // Infinite scroll pour le feed
  const feedContainer = document.getElementById('feedContainer');
  if (feedContainer) {
    loadInfiniteFeed();
    
    feedContainer.addEventListener('scroll', () => {
      if (feedContainer.scrollTop + feedContainer.clientHeight >= feedContainer.scrollHeight - 100) {
        loadInfiniteFeed();
      }
    });
  }

  console.log('%c🚀 PLATFORM REDESIGN FLUXUS CHARGÉ !', 'color:#3b82f6;font-weight:800;font-size:14px');
});
