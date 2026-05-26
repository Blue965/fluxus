// ══════════════════════════════════════════════════════════════
// MEGA AMÉLIORATIONS FLUXUS - Version MASSIVE
// ══════════════════════════════════════════════════════════════

// ── SYSTÈME DE RÉACTIONS (EMOJIS) SUR LES POSTS ───────────────────
const REACTIONS = [
  { emoji: '❤️', name: 'Love', color: '#ef4444' },
  { emoji: '🔥', name: 'Fire', color: '#f59e0b' },
  { emoji: '😂', name: 'Laugh', color: '#eab308' },
  { emoji: '😮', name: 'Wow', color: '#3b82f6' },
  { emoji: '😢', name: 'Sad', color: '#6366f1' },
  { emoji: '👍', name: 'Like', color: '#22c55e' },
  { emoji: '👎', name: 'Dislike', color: '#ef4444' },
  { emoji: '🎮', name: 'Game', color: '#8b5cf6' },
  { emoji: '💯', name: '100', color: '#ec4899' },
  { emoji: '🚀', name: 'Rocket', color: '#06b6d4' }
];

let _postReactions = JSON.parse(localStorage.getItem('flx_reactions') || '{}');

function _saveReactions() {
  localStorage.setItem('flx_reactions', JSON.stringify(_postReactions));
}

window.openReactionMenu = (postId, btn) => {
  const existing = document.getElementById('reactionMenu-' + postId);
  if (existing) {
    existing.remove();
    return;
  }

  const menu = document.createElement('div');
  menu.id = 'reactionMenu-' + postId;
  menu.className = 'reaction-menu';
  menu.innerHTML = REACTIONS.map(r => `
    <button class="reaction-btn" 
            onclick="addReaction('${postId}', '${r.emoji}')"
            title="${r.name}"
            style="--reaction-color: ${r.color}">
      ${r.emoji}
    </button>
  `).join('');

  const rect = btn.getBoundingClientRect();
  menu.style.top = (rect.top - 60) + 'px';
  menu.style.left = rect.left + 'px';

  document.body.appendChild(menu);

  setTimeout(() => menu.classList.add('open'), 10);

  document.addEventListener('click', function closeMenu(e) {
    if (!menu.contains(e.target) && e.target !== btn) {
      menu.remove();
      document.removeEventListener('click', closeMenu);
    }
  });
};

window.addReaction = async (postId, emoji) => {
  if (!ME) return;

  const ref = doc(db, 'posts', postId);
  const snap = await getDoc(ref);
  const data = snap.data();
  const reactions = data.reactions || {};

  const uid = ME.uid;
  const currentReaction = reactions[uid];

  if (currentReaction === emoji) {
    delete reactions[uid];
  } else {
    reactions[uid] = emoji;
  }

  await updateDoc(ref, { reactions });

  _postReactions[postId] = reactions;
  _saveReactions();

  document.getElementById('reactionMenu-' + postId)?.remove();
  updateReactionDisplay(postId, reactions);
};

function updateReactionDisplay(postId, reactions) {
  const container = document.getElementById('reactions-' + postId);
  if (!container) return;

  const counts = {};
  Object.values(reactions).forEach(emoji => {
    counts[emoji] = (counts[emoji] || 0) + 1;
  });

  container.innerHTML = Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .map(([emoji, count]) => `
      <span class="reaction-badge" onclick="openReactionMenu('${postId}', this)">
        ${emoji} ${count}
      </span>
    `).join('');
}

// ── SYSTÈME DE MENTIONS @ AVEC AUTOCOMPLÉTION ───────────────────
let _mentionUsers = [];
let _mentionIndex = -1;

window.initMentions = async () => {
  const snap = await getDocs(collection(db, 'users'));
  _mentionUsers = snap.docs.map(d => ({ id: d.id, ...d.data() }));
};

window.handleMentionInput = (e, postId) => {
  const input = e.target;
  const value = input.value;
  const cursor = input.selectionStart;
  const textBefore = value.slice(0, cursor);
  
  const mentionMatch = textBefore.match(/@(\w*)$/);
  
  if (mentionMatch) {
    const searchTerm = mentionMatch[1].toLowerCase();
    const matches = _mentionUsers.filter(u => 
      (u.name || '').toLowerCase().includes(searchTerm) ||
      (u.handle || '').toLowerCase().includes(searchTerm)
    ).slice(0, 5);

    if (matches.length > 0) {
      showMentionDropdown(matches, input, postId, mentionMatch[0]);
    } else {
      hideMentionDropdown();
    }
  } else {
    hideMentionDropdown();
  }
};

function showMentionDropdown(users, input, postId, mentionText) {
  let existing = document.getElementById('mentionDropdown');
  if (existing) existing.remove();

  const dropdown = document.createElement('div');
  dropdown.id = 'mentionDropdown';
  dropdown.className = 'mention-dropdown';
  
  dropdown.innerHTML = users.map((u, i) => `
    <div class="mention-item ${i === 0 ? 'selected' : ''}" 
         data-index="${i}"
         data-username="${u.handle || u.name}"
         data-userid="${u.id}"
         onclick="selectMention('${u.handle || u.name}', '${postId}')">
      <div class="mention-avatar">
        ${u.photoURL ? `<img src="${u.photoURL}">` : (u.name || '?').charAt(0)}
      </div>
      <div class="mention-info">
        <div class="mention-name">${u.name || 'Utilisateur'}</div>
        <div class="mention-handle">${u.handle || ''}</div>
      </div>
    </div>
  `).join('');

  const rect = input.getBoundingClientRect();
  dropdown.style.top = (rect.bottom + 5) + 'px';
  dropdown.style.left = rect.left + 'px';
  dropdown.style.width = rect.width + 'px';

  document.body.appendChild(dropdown);
  _mentionIndex = 0;

  input.addEventListener('keydown', handleMentionKeydown);
}

function hideMentionDropdown() {
  const dropdown = document.getElementById('mentionDropdown');
  if (dropdown) dropdown.remove();
  _mentionIndex = -1;
}

function handleMentionKeydown(e) {
  const dropdown = document.getElementById('mentionDropdown');
  if (!dropdown) return;

  const items = dropdown.querySelectorAll('.mention-item');

  if (e.key === 'ArrowDown') {
    e.preventDefault();
    _mentionIndex = Math.min(_mentionIndex + 1, items.length - 1);
    updateMentionSelection(items);
  } else if (e.key === 'ArrowUp') {
    e.preventDefault();
    _mentionIndex = Math.max(_mentionIndex - 1, 0);
    updateMentionSelection(items);
  } else if (e.key === 'Enter' || e.key === 'Tab') {
    e.preventDefault();
    const selected = items[_mentionIndex];
    if (selected) {
      const username = selected.dataset.username;
      const postId = selected.closest('.mention-dropdown').dataset.postId;
      selectMention(username, postId);
    }
  } else if (e.key === 'Escape') {
    hideMentionDropdown();
  }
}

function updateMentionSelection(items) {
  items.forEach((item, i) => {
    item.classList.toggle('selected', i === _mentionIndex);
  });
}

window.selectMention = (username, postId) => {
  const input = document.getElementById('cmtInp-' + postId);
  if (!input) return;

  const value = input.value;
  const cursor = input.selectionStart;
  const textBefore = value.slice(0, cursor);
  const textAfter = value.slice(cursor);

  const mentionMatch = textBefore.match(/@(\w*)$/);
  if (mentionMatch) {
    const newValue = textBefore.replace(/@\w*$/, '@' + username + ' ') + textAfter;
    input.value = newValue;
    input.focus();
    input.selectionStart = input.selectionEnd = textBefore.replace(/@\w*$/, '@' + username + ' ').length;
  }

  hideMentionDropdown();
};

// ── SYSTÈME DE SONDAGES/POLLS DANS LES POSTS ───────────────────
window.openPollCreator = () => {
  const pollModal = document.createElement('div');
  pollModal.className = 'overlay open';
  pollModal.id = 'pollModal';
  pollModal.innerHTML = `
    <div class="modal">
      <button class="modal-x" onclick="document.getElementById('pollModal').remove()">
        <svg viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
      </button>
      <h3 style="font-family:var(--font-d);font-size:20px;font-weight:700;margin-bottom:20px">Créer un sondage</h3>
      <div id="pollOptions">
        <input type="text" class="fi poll-option-input" placeholder="Option 1">
        <input type="text" class="fi poll-option-input" placeholder="Option 2">
      </div>
      <button class="btn-main" onclick="addPollOption()" style="margin:10px 0;width:auto;padding:8px 16px;font-size:13px">
        + Ajouter option
      </button>
      <div style="display:flex;gap:10px;margin-top:15px">
        <button class="btn-main" onclick="submitPoll()">Créer le sondage</button>
        <button class="btn-google" onclick="document.getElementById('pollModal').remove()">Annuler</button>
      </div>
    </div>
  `;
  document.body.appendChild(pollModal);
};

window.addPollOption = () => {
  const container = document.getElementById('pollOptions');
  const count = container.querySelectorAll('.poll-option-input').length + 1;
  const input = document.createElement('input');
  input.type = 'text';
  input.className = 'fi poll-option-input';
  input.placeholder = `Option ${count}`;
  container.appendChild(input);
};

window.submitPoll = async () => {
  const options = Array.from(document.querySelectorAll('.poll-option-input'))
    .map(input => input.value.trim())
    .filter(v => v);

  if (options.length < 2) {
    toast('Ajoute au moins 2 options', 'error');
    return;
  }

  const poll = {
    question: document.querySelector('#pollModal input')?.value || 'Sondage',
    options: options.map(text => ({ text, votes: 0, voters: [] })),
    totalVotes: 0,
    createdAt: serverTimestamp(),
    createdBy: ME.uid
  };

  // Stocker dans une variable globale pour l'ajouter au post
  window._currentPoll = poll;
  
  document.getElementById('pollModal').remove();
  toast('Sondage prêt à être ajouté au post', 'success');
};

window.votePoll = async (postId, optionIndex) => {
  if (!ME) return;

  const ref = doc(db, 'posts', postId);
  const snap = await getDoc(ref);
  const post = snap.data();
  const poll = post.poll;

  if (!poll) return;

  const uid = ME.uid;
  const hasVoted = poll.options.some(opt => opt.voters?.includes(uid));

  if (hasVoted) {
    toast('Tu as déjà voté', 'error');
    return;
  }

  poll.options[optionIndex].votes++;
  poll.options[optionIndex].voters = poll.options[optionIndex].voters || [];
  poll.options[optionIndex].voters.push(uid);
  poll.totalVotes++;

  await updateDoc(ref, { poll });
  renderPoll(postId, poll);
};

function renderPoll(postId, poll) {
  const container = document.getElementById('poll-' + postId);
  if (!container) return;

  const totalVotes = poll.totalVotes || 1;

  container.innerHTML = `
    <div class="poll-container">
      <div class="poll-question">${poll.question}</div>
      ${poll.options.map((opt, i) => {
        const percent = Math.round((opt.votes / totalVotes) * 100);
        const hasVoted = opt.voters?.includes(ME?.uid);
        return `
          <button class="poll-option ${hasVoted ? 'voted' : ''}" 
                  onclick="votePoll('${postId}', ${i})"
                  ${hasVoted ? 'disabled' : ''}>
            <div class="poll-option-text">${opt.text}</div>
            <div class="poll-option-bar" style="width: ${percent}%"></div>
            <div class="poll-option-percent">${percent}%</div>
          </button>
        `;
      }).join('')}
      <div class="poll-meta">${poll.totalVotes} votes</div>
    </div>
  `;
}

// ── MODE SOMBRE/CLAIR AUTOMATIQUE SELON L'HEURE ─────────────────
window.initAutoTheme = () => {
  const savedMode = localStorage.getItem('fluxus-auto-theme');
  if (savedMode === 'false') return;

  const hour = new Date().getHours();
  const isDay = hour >= 6 && hour < 20;

  const currentTheme = document.documentElement.hasAttribute('data-theme');
  if (isDay && !currentTheme) {
    document.documentElement.setAttribute('data-theme', 'light');
  } else if (!isDay && currentTheme) {
    document.documentElement.removeAttribute('data-theme');
  }

  // Vérifier toutes les 5 minutes
  setInterval(() => {
    const newHour = new Date().getHours();
    const newIsDay = newHour >= 6 && newHour < 20;
    const newTheme = document.documentElement.hasAttribute('data-theme');

    if (newIsDay && !newTheme) {
      document.documentElement.setAttribute('data-theme', 'light');
    } else if (!newIsDay && newTheme) {
      document.documentElement.removeAttribute('data-theme');
    }
  }, 300000);
};

// ── SYSTÈME DE NOTIFICATIONS SONORES ───────────────────────────
const NOTIFICATION_SOUNDS = {
  like: 'data:audio/wav;base64,UklGRl9vT19XQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YU',
  comment: 'data:audio/wav;base64,UklGRl9vT19XQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YU',
  follow: 'data:audio/wav;base64,UklGRl9vT19XQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YU',
  message: 'data:audio/wav;base64,UklGRl9vT19XQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YU'
};

let _soundEnabled = localStorage.getItem('flx_sound_enabled') !== 'false';

window.toggleSound = () => {
  _soundEnabled = !_soundEnabled;
  localStorage.setItem('flx_sound_enabled', _soundEnabled);
  toast(_soundEnabled ? 'Sons activés' : 'Sons désactivés', _soundEnabled ? 'success' : '');
};

window.playNotificationSound = (type) => {
  if (!_soundEnabled) return;
  
  const audio = new Audio(NOTIFICATION_SOUNDS[type] || NOTIFICATION_SOUNDS.like);
  audio.volume = 0.3;
  audio.play().catch(() => {});
};

// ── FEED ALGORITHMIQUE AVEC SUGGESTIONS PERSONNALISÉES ───────
window.loadAlgorithmicFeed = async () => {
  if (!ME) return loadFeed();

  const mySnap = await getDoc(doc(db, 'users', ME.uid));
  const myData = mySnap.data();
  const following = myData.following || [];
  const myTags = myData.interests || [];

  // Récupérer les posts des utilisateurs suivis
  const followingPosts = await getDocs(
    query(collection(db, 'posts'), 
          where('authorId', 'in', following.length ? following.slice(0, 10) : ['none']),
          orderBy('createdAt', 'desc'),
          limit(20))
  );

  // Récupérer les posts avec des tags similaires
  const tagPosts = await getDocs(
    query(collection(db, 'posts'),
          orderBy('createdAt', 'desc'),
          limit(30))
  );

  const allPosts = [...followingPosts.docs, ...tagPosts.docs];
  
  // Algorithme de scoring
  const scoredPosts = allPosts.map(doc => {
    const post = { id: doc.id, ...doc.data() };
    let score = 0;

    // +50 si c'est quelqu'un qu'on suit
    if (following.includes(post.authorId)) score += 50;

    // +30 si le post a des tags similaires
    if (post.gameTag && myTags.includes(post.gameTag)) score += 30;

    // +20 si le post a beaucoup de likes
    score += Math.min((post.likes?.length || 0) * 2, 20);

    // +15 si c'est récent
    const hoursAgo = (Date.now() - (post.createdAt?.toMillis?.() || 0)) / 3600000;
    if (hoursAgo < 24) score += 15;

    return { ...post, score };
  });

  // Trier par score
  scoredPosts.sort((a, b) => b.score - a.score);

  const wrap = document.getElementById('feedPosts');
  wrap.innerHTML = scoredPosts.slice(0, 20).map(p => renderPost(p)).join('');
};

// ── SYSTÈME DE GIFS INTÉGRÉS (GIPHY) ───────────────────────────
const GIPHY_API_KEY = 'dc6zaTOxFJmzC'; // Clé publique de test

window.openGifPicker = async (inputId) => {
  const existing = document.getElementById('gifPicker');
  if (existing) {
    existing.remove();
    return;
  }

  const picker = document.createElement('div');
  picker.id = 'gifPicker';
  picker.className = 'gif-picker';
  picker.innerHTML = `
    <div class="gif-picker-header">
      <input type="text" id="gifSearchInput" placeholder="Rechercher des GIFs..." 
             oninput="searchGifs(this.value)">
      <button onclick="document.getElementById('gifPicker').remove()">✕</button>
    </div>
    <div class="gif-picker-content" id="gifResults">
      <div style="padding:20px;text-align:center;color:var(--text3)">Trending GIFs...</div>
    </div>
  `;

  document.body.appendChild(picker);

  // Charger les trending GIFs
  loadTrendingGifs();
};

window.searchGifs = async (query) => {
  const results = document.getElementById('gifResults');
  results.innerHTML = '<div style="padding:20px;text-align:center">Recherche...</div>';

  try {
    const response = await fetch(
      `https://api.giphy.com/v1/gifs/search?api_key=${GIPHY_API_KEY}&q=${encodeURIComponent(query)}&limit=12`
    );
    const data = await response.json();
    displayGifs(data.data);
  } catch (e) {
    results.innerHTML = '<div style="padding:20px;text-align:center">Erreur de chargement</div>';
  }
};

window.loadTrendingGifs = async () => {
  try {
    const response = await fetch(
      `https://api.giphy.com/v1/gifs/trending?api_key=${GIPHY_API_KEY}&limit=12`
    );
    const data = await response.json();
    displayGifs(data.data);
  } catch (e) {
    console.error('Giphy error:', e);
  }
};

function displayGifs(gifs) {
  const results = document.getElementById('gifResults');
  results.innerHTML = gifs.map(gif => `
    <img src="${gif.images.fixed_height.url}" 
         alt="${gif.title}" 
         class="gif-item"
         onclick="selectGif('${gif.images.fixed_height.url}')">
  `).join('');
}

window.selectGif = (url) => {
  const compTa = document.getElementById('compTa');
  if (compTa) {
    compTa.value += ` ${url} `;
    compTa.focus();
  }
  document.getElementById('gifPicker')?.remove();
};

// ── SYSTÈME DE TYPING INDICATORS DANS LE CHAT ─────────────────
let _typingTimeout = null;

window.sendTypingIndicator = async (chatId) => {
  if (!ME) return;

  const ref = doc(db, 'chats', chatId);
  await updateDoc(ref, {
    [`typing.${ME.uid}`]: true,
    [`typing.${ME.uid}At`]: serverTimestamp()
  });

  clearTimeout(_typingTimeout);
  _typingTimeout = setTimeout(async () => {
    await updateDoc(ref, { [`typing.${ME.uid}`]: false });
  }, 3000);
};

window.listenForTyping = (chatId) => {
  const ref = doc(db, 'chats', chatId);
  onSnapshot(ref, (snap) => {
    const data = snap.data();
    const typing = data?.typing || {};
    
    Object.entries(typing).forEach(([uid, isTyping]) => {
      if (uid !== ME?.uid && isTyping) {
        showTypingIndicator(uid);
      }
    });
  });
};

function showTypingIndicator(uid) {
  const existing = document.getElementById('typingIndicator');
  if (existing) return;

  const indicator = document.createElement('div');
  indicator.id = 'typingIndicator';
  indicator.className = 'typing-indicator';
  indicator.innerHTML = '<span></span><span></span><span></span>';
  
  const msgs = document.getElementById('chatMsgs');
  if (msgs) msgs.appendChild(indicator);

  setTimeout(() => indicator.remove(), 3000);
}

// ── SYSTÈME DE SUGGESTIONS D'AMIS/USERS SIMILAIRES ───────────
window.loadSuggestions = async () => {
  if (!ME) return;

  const mySnap = await getDoc(doc(db, 'users', ME.uid));
  const myData = mySnap.data();
  const following = myData.following || [];
  const myTags = myData.interests || [];

  const allUsers = await getDocs(collection(db, 'users'));
  
  const suggestions = allUsers.docs
    .map(d => ({ id: d.id, ...d.data() }))
    .filter(u => 
      u.id !== ME.uid && 
      !following.includes(u.id) &&
      (u.interests || []).some(tag => myTags.includes(tag))
    )
    .slice(0, 5);

  const container = document.getElementById('suggestionsContainer');
  if (!container) return;

  container.innerHTML = suggestions.map(u => {
    const hue = u.id.charCodeAt(0) * 5 % 360;
    const commonTags = (u.interests || []).filter(t => myTags.includes(t));
    
    return `
      <div class="suggestion-card">
        <div class="suggestion-avatar" 
             style="${!u.photoURL ? `background:hsl(${hue},40%,35%)` : ''}"
             onclick="viewProfile('${u.id}')">
          ${u.photoURL ? `<img src="${u.photoURL}">` : (u.name || '?').charAt(0)}
        </div>
        <div class="suggestion-info">
          <div class="suggestion-name">${u.name || 'Utilisateur'}</div>
          <div class="suggestion-reason">
            ${commonTags.length ? `Intérêts communs: ${commonTags.join(', ')}` : 'Suggestion'}
          </div>
        </div>
        <button class="btn-follow" onclick="toggleFollow('${u.id}')">Suivre</button>
      </div>
    `;
  }).join('');
};

// ── SYSTÈME DE STATISTIQUES DÉTAILLÉES SUR LE PROFIL ───────────
window.loadDetailedStats = async (uid) => {
  const snap = await getDoc(doc(db, 'users', uid));
  const user = snap.data();

  const postsSnap = await getDocs(
    query(collection(db, 'posts'), where('authorId', '==', uid))
  );

  const posts = postsSnap.docs.map(d => d.data());
  
  const totalLikes = posts.reduce((sum, p) => sum + (p.likes?.length || 0), 0);
  const totalComments = posts.reduce((sum, p) => sum + (p.commentsCount || 0), 0);
  const avgLikes = posts.length ? Math.round(totalLikes / posts.length) : 0;

  const stats = {
    totalPosts: posts.length,
    totalLikes,
    totalComments,
    avgLikes,
    followers: (user.followers || []).length,
    following: (user.following || []).length,
    level: xpToLevel(user.xp || 0)
  };

  const container = document.getElementById('detailedStats');
  if (!container) return;

  container.innerHTML = `
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-value">${stats.totalPosts}</div>
        <div class="stat-label">Posts</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">${stats.totalLikes}</div>
        <div class="stat-label">Likes totaux</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">${stats.avgLikes}</div>
        <div class="stat-label">Likes/post</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">${stats.totalComments}</div>
        <div class="stat-label">Commentaires</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">${stats.followers}</div>
        <div class="stat-label">Abonnés</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">${stats.level}</div>
        <div class="stat-label">Niveau</div>
      </div>
    </div>
  `;
};

// ── SYSTÈME DE PARTAGE DE POSTS SUR AUTRES PLATEFORMES ───────
window.sharePostTo = (postId, platform) => {
  const url = location.href.split('?')[0] + '?post=' + postId;
  const text = 'Regarde ce post sur Fluxus !';

  const shareUrls = {
    twitter: `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
    reddit: `https://reddit.com/submit?url=${encodeURIComponent(url)}&title=${encodeURIComponent(text)}`,
    whatsapp: `https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}`,
    telegram: `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`
  };

  if (shareUrls[platform]) {
    window.open(shareUrls[platform], '_blank', 'width=600,height=400');
  }
};

window.openShareModal = (postId) => {
  const modal = document.createElement('div');
  modal.className = 'overlay open';
  modal.id = 'shareModal';
  modal.innerHTML = `
    <div class="modal share-modal">
      <button class="modal-x" onclick="document.getElementById('shareModal').remove()">
        <svg viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
      </button>
      <h3 style="font-family:var(--font-d);font-size:18px;font-weight:700;margin-bottom:20px">Partager</h3>
      <div class="share-buttons">
        <button onclick="sharePostTo('${postId}', 'twitter')" class="share-btn twitter">
          <svg viewBox="0 0 24 24"><path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z"/></svg>
          Twitter
        </button>
        <button onclick="sharePostTo('${postId}', 'facebook')" class="share-btn facebook">
          <svg viewBox="0 0 24 24"><path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z"/></svg>
          Facebook
        </button>
        <button onclick="sharePostTo('${postId}', 'reddit')" class="share-btn reddit">
          <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M12 7a5 5 0 00-5 5 5 5 0 005 5 5 5 0 005-5 5 5 0 00-5-5z"/></svg>
          Reddit
        </button>
        <button onclick="sharePostTo('${postId}', 'whatsapp')" class="share-btn whatsapp">
          <svg viewBox="0 0 24 24"><path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z"/></svg>
          WhatsApp
        </button>
        <button onclick="sharePostTo('${postId}', 'telegram')" class="share-btn telegram">
          <svg viewBox="0 0 24 24"><path d="M22 2L11 13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
          Telegram
        </button>
      </div>
      <button onclick="navigator.clipboard.writeText(location.href.split('?')[0]+'?post=${postId}');toast('Lien copié !','success')" 
              class="btn-main" style="margin-top:15px">
        Copier le lien
      </button>
    </div>
  `;
  document.body.appendChild(modal);
};

// ── INITIALISATION ───────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  initAutoTheme();
  initMentions();
  
  console.log('%c🚀 MEGA AMÉLIORATIONS FLUXUS CHARGÉES !', 'color:#f59e0b;font-weight:800;font-size:14px');
});
