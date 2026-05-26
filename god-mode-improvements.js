// ══════════════════════════════════════════════════════════════
// GOD MODE AMÉLIORATIONS FLUXUS - Fonctionnalités Ultra-Avancées
// ══════════════════════════════════════════════════════════════

// ── SYSTÈME DE LIVE STREAMING INTÉGRÉ ───────────────────────
let _mediaStream = null;
let _isStreaming = false;
let _streamViewers = 0;
let _streamChat = [];

window.startLiveStream = async () => {
  if (!ME) {
    toast('Connecte-toi d\'abord', 'error');
    return;
  }

  try {
    _mediaStream = await navigator.mediaDevices.getUserMedia({ 
      video: { width: 1280, height: 720 }, 
      audio: true 
    });

    const videoElement = document.getElementById('streamVideo');
    if (videoElement) {
      videoElement.srcObject = _mediaStream;
      videoElement.play();
    }

    _isStreaming = true;
    toast('Live stream démarré !', 'success');

    // Simuler viewer count
    setInterval(() => {
      if (_isStreaming) {
        _streamViewers = Math.floor(Math.random() * 500) + 50;
        updateStreamStats();
      }
    }, 5000);

  } catch (e) {
    console.error('Stream error:', e);
    toast('Impossible d\'accéder à la caméra', 'error');
  }
};

window.stopLiveStream = () => {
  if (_mediaStream) {
    _mediaStream.getTracks().forEach(track => track.stop());
    _mediaStream = null;
  }
  _isStreaming = false;
  _streamViewers = 0;
  toast('Live stream terminé', '');
};

window.openStreamModal = () => {
  const modal = document.createElement('div');
  modal.className = 'overlay open';
  modal.id = 'streamModal';
  modal.innerHTML = `
    <div class="modal stream-modal">
      <button class="modal-x" onclick="closeStreamModal()">
        <svg viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
      </button>
      <h3 style="font-family:var(--font-d);font-size:20px;font-weight:700;margin-bottom:20px">🔴 Live Stream</h3>
      
      <div class="stream-container">
        <video id="streamVideo" autoplay muted playsinline style="width:100%;border-radius:var(--r);background:#000"></video>
        <div class="stream-overlay">
          <div class="stream-badge">LIVE</div>
          <div class="stream-viewers">👁 <span id="streamViewerCount">0</span></div>
        </div>
      </div>
      
      <div class="stream-controls">
        ${!_isStreaming ? `
          <button class="btn-main stream-start-btn" onclick="startLiveStream()">
            <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><polygon points="10 8 16 12 10 16"/></svg>
            Démarrer le live
          </button>
        ` : `
          <button class="btn-main stream-stop-btn" onclick="stopLiveStream()">
            <svg viewBox="0 0 24 24"><rect x="6" y="6" width="12" height="12"/></svg>
            Arrêter le live
          </button>
        `}
      </div>
      
      <div class="stream-chat">
        <div class="stream-chat-messages" id="streamChatMessages"></div>
        <div class="stream-chat-input">
          <input type="text" id="streamChatInput" placeholder="Chat du live..." 
                 onkeydown="if(event.key==='Enter')sendStreamChat()">
          <button onclick="sendStreamChat()">→</button>
        </div>
      </div>
    </div>
  `;
  document.body.appendChild(modal);
};

window.closeStreamModal = () => {
  if (_isStreaming) stopLiveStream();
  document.getElementById('streamModal')?.remove();
};

function updateStreamStats() {
  const countEl = document.getElementById('streamViewerCount');
  if (countEl) countEl.textContent = _streamViewers;
}

window.sendStreamChat = () => {
  const input = document.getElementById('streamChatInput');
  const text = input?.value?.trim();
  if (!text) return;

  const messages = document.getElementById('streamChatMessages');
  if (messages) {
    const msg = document.createElement('div');
    msg.className = 'stream-chat-message';
    msg.innerHTML = `<strong>${PROF.name || ME.displayName || 'Moi'}:</strong> ${text}`;
    messages.appendChild(msg);
    messages.scrollTop = messages.scrollHeight;
  }

  input.value = '';
};

// ── SYSTÈME DE VIDÉO CALLS (WebRTC) ─────────────────────────
let _peerConnection = null;
let _localStream = null;
let _remoteStream = null;
let _isInCall = false;

window.startVideoCall = async (targetUserId) => {
  if (!ME) {
    toast('Connecte-toi d\'abord', 'error');
    return;
  }

  try {
    _localStream = await navigator.mediaDevices.getUserMedia({ 
      video: true, 
      audio: true 
    });

    _peerConnection = new RTCPeerConnection({
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' }
      ]
    });

    _localStream.getTracks().forEach(track => {
      _peerConnection.addTrack(track, _localStream);
    });

    _peerConnection.ontrack = (event) => {
      _remoteStream = event.streams[0];
      const remoteVideo = document.getElementById('remoteVideo');
      if (remoteVideo) {
        remoteVideo.srcObject = _remoteStream;
      }
    };

    _peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        // Envoyer le ICE candidate via Firebase
        // (implémentation simplifiée)
      }
    };

    const offer = await _peerConnection.createOffer();
    await _peerConnection.setLocalDescription(offer);

    _isInCall = true;
    openVideoCallModal(targetUserId);

  } catch (e) {
    console.error('Video call error:', e);
    toast('Impossible de démarrer l\'appel vidéo', 'error');
  }
};

window.endVideoCall = () => {
  if (_peerConnection) {
    _peerConnection.close();
    _peerConnection = null;
  }

  if (_localStream) {
    _localStream.getTracks().forEach(track => track.stop());
    _localStream = null;
  }

  _isInCall = false;
  document.getElementById('videoCallModal')?.remove();
  toast('Appel terminé', '');
};

window.openVideoCallModal = (targetUserId) => {
  const modal = document.createElement('div');
  modal.className = 'overlay open';
  modal.id = 'videoCallModal';
  modal.innerHTML = `
    <div class="modal video-call-modal">
      <div class="video-call-grid">
        <div class="video-call-local">
          <video id="localVideo" autoplay muted playsinline></video>
          <div class="video-label">Toi</div>
        </div>
        <div class="video-call-remote">
          <video id="remoteVideo" autoplay playsinline></video>
          <div class="video-label">Autre</div>
        </div>
      </div>
      
      <div class="video-call-controls">
        <button class="video-call-btn" onclick="toggleMute()">
          <svg viewBox="0 0 24 24"><path d="M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3z"/><path d="M19 10v2a7 7 0 01-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg>
        </button>
        <button class="video-call-btn" onclick="toggleVideo()">
          <svg viewBox="0 0 24 24"><path d="M23 7l-7 5 7 5V7z"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/></svg>
        </button>
        <button class="video-call-btn end-call" onclick="endVideoCall()">
          <svg viewBox="0 0 24 24"><path d="M10.68 13.31a16 16 0 003.41 2.6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7 2 2 0 012 2v3a2 2 0 01-2 2A18 18 0 013 9a2 2 0 012-2h3a2 2 0 012 2 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11l-1.27 1.27a16 16 0 002.6 3.41"/></svg>
        </button>
      </div>
    </div>
  `;
  document.body.appendChild(modal);

  const localVideo = document.getElementById('localVideo');
  if (localVideo && _localStream) {
    localVideo.srcObject = _localStream;
  }
};

let _isMuted = false;
let _isVideoOff = false;

window.toggleMute = () => {
  if (_localStream) {
    _isMuted = !_isMuted;
    _localStream.getAudioTracks().forEach(track => {
      track.enabled = !_isMuted;
    });
  }
};

window.toggleVideo = () => {
  if (_localStream) {
    _isVideoOff = !_isVideoOff;
    _localStream.getVideoTracks().forEach(track => {
      track.enabled = !_isVideoOff;
    });
  }
};

// ── SYSTÈME DE COLLABORATION EN TEMPS RÉEL ───────────────────
let _collaborators = [];
let _isCollaborating = false;

window.startCollaboration = async (postId) => {
  if (!ME) return;

  _isCollaborating = true;
  
  // Simuler collaboration
  _collaborators = [
    { id: 'user1', name: 'Alice', color: '#ef4444', cursor: { x: 50, y: 50 } },
    { id: 'user2', name: 'Bob', color: '#3b82f6', cursor: { x: 30, y: 70 } }
  ];

  showCollaborationUI();
  toast('Mode collaboration activé', 'success');
};

window.showCollaborationUI = () => {
  const ui = document.createElement('div');
  ui.id = 'collaborationUI';
  ui.className = 'collaboration-ui';
  ui.innerHTML = `
    <div class="collab-header">
      <span>👥 Collaboration</span>
      <button onclick="endCollaboration()">✕</button>
    </div>
    <div class="collab-users">
      ${_collaborators.map(c => `
        <div class="collab-user" style="--user-color: ${c.color}">
          <div class="collab-avatar">${c.name.charAt(0)}</div>
          <span>${c.name}</span>
        </div>
      `).join('')}
    </div>
    <div class="collab-cursors">
      ${_collaborators.map(c => `
        <div class="collab-cursor" style="left:${c.cursor.x}%;top:${c.cursor.y}%;--cursor-color:${c.color}">
          <svg viewBox="0 0 24 24"><path d="M3 3l7.07 16.97 2.51-7.39 7.39-2.51L3 3z"/></svg>
          <span>${c.name}</span>
        </div>
      `).join('')}
    </div>
  `;
  document.body.appendChild(ui);
};

window.endCollaboration = () => {
  _isCollaborating = false;
  _collaborators = [];
  document.getElementById('collaborationUI')?.remove();
  toast('Collaboration terminée', '');
};

// ── SYSTÈME D'IA GÉNÉRATIVE D'IMAGES ─────────────────────────
window.openAIGenerator = () => {
  const modal = document.createElement('div');
  modal.className = 'overlay open';
  modal.id = 'aiGeneratorModal';
  modal.innerHTML = `
    <div class="modal ai-generator-modal">
      <button class="modal-x" onclick="document.getElementById('aiGeneratorModal').remove()">
        <svg viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
      </button>
      <h3 style="font-family:var(--font-d);font-size:20px;font-weight:700;margin-bottom:20px">🎨 Générateur d'images IA</h3>
      
      <textarea id="aiPromptInput" class="fi" rows="3" 
                placeholder="Décris l'image que tu veux générer... (ex: 'Un paysage cyberpunk avec des néons bleus et roses')"></textarea>
      
      <div class="ai-style-selector">
        <label>Style:</label>
        <select id="aiStyleSelect" class="fi">
          <option value="realistic">Réaliste</option>
          <option value="anime">Anime</option>
          <option value="cyberpunk">Cyberpunk</option>
          <option value="fantasy">Fantasy</option>
          <option value="minimalist">Minimaliste</option>
        </select>
      </div>
      
      <button class="btn-main" onclick="generateAIImage()" style="margin-top:15px">
        <svg viewBox="0 0 24 24"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
        Générer l'image
      </button>
      
      <div id="aiGeneratedImage" class="ai-generated-container"></div>
    </div>
  `;
  document.body.appendChild(modal);
};

window.generateAIImage = async () => {
  const prompt = document.getElementById('aiPromptInput')?.value.trim();
  const style = document.getElementById('aiStyleSelect')?.value;
  
  if (!prompt) {
    toast('Entre une description', 'error');
    return;
  }

  const container = document.getElementById('aiGeneratedImage');
  container.innerHTML = '<div style="padding:20px;text-align:center">Génération en cours...</div>';

  try {
    // Utiliser une API de génération d'images (simulé pour l'exemple)
    // En production, utiliser DALL-E, Stable Diffusion, ou Midjourney API
    await new Promise(r => setTimeout(r, 3000));
    
    // Simuler une image générée
    const placeholderImages = [
      'https://picsum.photos/512/512?random=1',
      'https://picsum.photos/512/512?random=2',
      'https://picsum.photos/512/512?random=3'
    ];
    
    const randomImage = placeholderImages[Math.floor(Math.random() * placeholderImages.length)];
    
    container.innerHTML = `
      <img src="${randomImage}" alt="Generated image" style="width:100%;border-radius:var(--r)">
      <div style="display:flex;gap:10px;margin-top:10px">
        <button class="btn-main" onclick="useGeneratedImage('${randomImage}')">Utiliser cette image</button>
        <button class="btn-google" onclick="generateAIImage()">Régénérer</button>
      </div>
    `;
    
    toast('Image générée !', 'success');
  } catch (e) {
    container.innerHTML = '<div style="padding:20px;text-align:center;color:var(--red)">Erreur de génération</div>';
    toast('Erreur de génération', 'error');
  }
};

window.useGeneratedImage = (imageUrl) => {
  const compTa = document.getElementById('compTa');
  if (compTa) {
    compTa.value += ` ${imageUrl} `;
    compTa.focus();
  }
  document.getElementById('aiGeneratorModal')?.remove();
};

// ── SYSTÈME DE TRADUCTION INSTANTANÉE MULTILINGUE ─────────────
const TRANSLATION_LANGUAGES = [
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
  { code: 'it', name: 'Italiano', flag: '🇮🇹' },
  { code: 'pt', name: 'Português', flag: '🇵🇹' },
  { code: 'ja', name: '日本語', flag: '🇯🇵' },
  { code: 'ko', name: '한국어', flag: '🇰🇷' },
  { code: 'zh', name: '中文', flag: '🇨🇳' },
  { code: 'ru', name: 'Русский', flag: '🇷🇺' }
];

let _currentLanguage = localStorage.getItem('flx_language') || 'fr';

window.openTranslationSettings = () => {
  const modal = document.createElement('div');
  modal.className = 'overlay open';
  modal.id = 'translationModal';
  modal.innerHTML = `
    <div class="modal translation-modal">
      <button class="modal-x" onclick="document.getElementById('translationModal').remove()">
        <svg viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
      </button>
      <h3 style="font-family:var(--font-d);font-size:20px;font-weight:700;margin-bottom:20px">🌍 Traduction</h3>
      
      <div class="language-selector">
        <label>Langue de l'interface:</label>
        <select id="languageSelect" class="fi" onchange="changeLanguage(this.value)">
          ${TRANSLATION_LANGUAGES.map(l => `
            <option value="${l.code}" ${l.code === _currentLanguage ? 'selected' : ''}>
              ${l.flag} ${l.name}
            </option>
          `).join('')}
        </select>
      </div>
      
      <div class="translation-options">
        <label class="checkbox-label">
          <input type="checkbox" id="autoTranslate" checked>
          Traduire automatiquement les posts
        </label>
        <label class="checkbox-label">
          <input type="checkbox" id="showOriginal">
          Afficher le texte original
        </label>
      </div>
      
      <button class="btn-main" onclick="saveTranslationSettings()" style="margin-top:15px">
        Enregistrer
      </button>
    </div>
  `;
  document.body.appendChild(modal);
};

window.changeLanguage = (langCode) => {
  _currentLanguage = langCode;
  // Ici, on pourrait charger les traductions correspondantes
};

window.saveTranslationSettings = () => {
  localStorage.setItem('flx_language', _currentLanguage);
  document.getElementById('translationModal')?.remove();
  toast('Paramètres de traduction enregistrés', 'success');
};

window.translateText = async (text, targetLang) => {
  // Simulation de traduction (utiliser une API comme Google Translate en production)
  const translations = {
    'en': { 'Bonjour': 'Hello', 'Merci': 'Thank you', 'Au revoir': 'Goodbye' },
    'es': { 'Bonjour': 'Hola', 'Merci': 'Gracias', 'Au revoir': 'Adiós' },
    'de': { 'Bonjour': 'Hallo', 'Merci': 'Danke', 'Au revoir': 'Auf Wiedersehen' },
    'it': { 'Bonjour': 'Ciao', 'Merci': 'Grazie', 'Au revoir': 'Arrivederci' }
  };
  
  return translations[targetLang]?.[text] || text;
};

// ── SYSTÈME DE RECONNAISSANCE VOCALE (Speech-to-Text) ───────
let _recognition = null;
let _isListening = false;

window.initSpeechRecognition = () => {
  if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    _recognition = new SpeechRecognition();
    _recognition.lang = 'fr-FR';
    _recognition.continuous = false;
    _recognition.interimResults = false;

    _recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      const targetInput = document.getElementById('compTa') || document.getElementById('cmtInp');
      if (targetInput) {
        targetInput.value += transcript;
        targetInput.focus();
      }
      _isListening = false;
      updateSpeechButton();
    };

    _recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      _isListening = false;
      updateSpeechButton();
    };

    _recognition.onend = () => {
      _isListening = false;
      updateSpeechButton();
    };
  }
};

window.toggleSpeechRecognition = () => {
  if (!_recognition) {
    initSpeechRecognition();
    if (!_recognition) {
      toast('Reconnaissance vocale non supportée', 'error');
      return;
    }
  }

  if (_isListening) {
    _recognition.stop();
  } else {
    _recognition.start();
    _isListening = true;
  }
  
  updateSpeechButton();
};

function updateSpeechButton() {
  const btn = document.getElementById('speechBtn');
  if (btn) {
    btn.classList.toggle('listening', _isListening);
    btn.innerHTML = _isListening 
      ? '<span class="listening-dot"></span> Écoute...' 
      : '<svg viewBox="0 0 24 24"><path d="M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3z"/><path d="M19 10v2a7 7 0 01-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg>';
  }
}

// ── SYSTÈME DE SYNTHÈSE VOCALE (Text-to-Speech) ───────────────
let _speechSynthesis = window.speechSynthesis;
let _currentUtterance = null;

window.speakText = (text) => {
  if (!_speechSynthesis) {
    toast('Synthèse vocale non supportée', 'error');
    return;
  }

  if (_currentUtterance) {
    _speechSynthesis.cancel();
  }

  _currentUtterance = new SpeechSynthesisUtterance(text);
  _currentUtterance.lang = 'fr-FR';
  _currentUtterance.rate = 1;
  _currentUtterance.pitch = 1;

  _speechSynthesis.speak(_currentUtterance);
};

window.stopSpeaking = () => {
  if (_speechSynthesis) {
    _speechSynthesis.cancel();
  }
};

// ── SYSTÈME D'ANALYSE DE SENTIMENT DES COMMENTAIRES ───────────
window.analyzeSentiment = (text) => {
  // Analyse de sentiment simplifiée basée sur des mots-clés
  const positiveWords = ['super', 'génial', 'awesome', 'excellent', 'parfait', 'love', '❤️', '🔥', '👍', 'bravo', 'félicitations', 'merci', 'thanks'];
  const negativeWords = ['nul', 'mauvais', 'horrible', 'terrible', 'déçu', 'hate', '😢', '👎', 'désolé', 'sorry', 'échec', 'fail'];
  
  const words = text.toLowerCase().split(/\s+/);
  let positiveCount = 0;
  let negativeCount = 0;
  
  words.forEach(word => {
    if (positiveWords.some(pw => word.includes(pw))) positiveCount++;
    if (negativeWords.some(nw => word.includes(nw))) negativeCount++;
  });
  
  if (positiveCount > negativeCount) return 'positive';
  if (negativeCount > positiveCount) return 'negative';
  return 'neutral';
};

window.getSentimentEmoji = (sentiment) => {
  const emojis = {
    positive: '😊',
    negative: '😢',
    neutral: '😐'
  };
  return emojis[sentiment] || '😐';
};

// ── SYSTÈME DE GAMIFICATION AVANCÉE (Quêtes, Achievements) ──
const QUESTS = [
  { id: 'first_post', name: 'Premier post', description: 'Publie ton premier post', xp: 50, icon: '✍️' },
  { id: 'first_like', name: 'Premier like', description: 'Like un post pour la première fois', xp: 20, icon: '❤️' },
  { id: 'first_comment', name: 'Premier commentaire', description: 'Commente un post', xp: 30, icon: '💬' },
  { id: 'social_butterfly', name: 'Papillon social', description: 'Suis 10 personnes', xp: 100, icon: '🦋' },
  { id: 'content_creator', name: 'Créateur de contenu', description: 'Publie 10 posts', xp: 200, icon: '📸' },
  { id: 'community_leader', name: 'Leader communautaire', description: 'Obtiens 100 abonnés', xp: 500, icon: '👑' },
  { id: 'night_owl', name: 'Hibou nocturne', description: 'Connecte-toi après minuit', xp: 75, icon: '🦉' },
  { id: 'early_bird', name: 'Lève-tôt', description: 'Connecte-toi avant 7h', xp: 75, icon: '🐦' },
  { id: 'explorer', name: 'Explorateur', description: 'Visite toutes les pages', xp: 150, icon: '🗺️' },
  { id: 'master', name: 'Maître Fluxus', description: 'Atteins le niveau 50', xp: 1000, icon: '🏆' }
];

let _completedQuests = JSON.parse(localStorage.getItem('flx_quests') || '[]');
let _activeQuests = QUESTS.filter(q => !_completedQuests.includes(q.id)).slice(0, 3);

window.loadQuests = () => {
  const container = document.getElementById('questsContainer');
  if (!container) return;

  container.innerHTML = `
    <div class="quests-header">
      <h3 style="font-family:var(--font-d);font-size:18px;font-weight:700">🎯 Quêtes actives</h3>
    </div>
    <div class="quests-list">
      ${_activeQuests.map(q => `
        <div class="quest-card">
          <div class="quest-icon">${q.icon}</div>
          <div class="quest-info">
            <div class="quest-name">${q.name}</div>
            <div class="quest-desc">${q.description}</div>
            <div class="quest-reward">+${q.xp} XP</div>
          </div>
          <div class="quest-progress">
            <div class="quest-progress-bar"></div>
          </div>
        </div>
      `).join('')}
    </div>
    <div class="completed-quests">
      <h4 style="font-size:14px;font-weight:600;margin-bottom:10px">Quêtes complétées (${_completedQuests.length}/${QUESTS.length})</h4>
      <div class="completed-quests-list">
        ${_completedQuests.map(qid => {
          const q = QUESTS.find(quest => quest.id === qid);
          return q ? `<span class="completed-quest-badge" title="${q.name}">${q.icon}</span>` : '';
        }).join('')}
      </div>
    </div>
  `;
};

window.completeQuest = (questId) => {
  if (_completedQuests.includes(questId)) return;

  const quest = QUESTS.find(q => q.id === questId);
  if (quest) {
    _completedQuests.push(questId);
    localStorage.setItem('flx_quests', JSON.stringify(_completedQuests));
    
    giveXP(quest.xp);
    toast(`Quête complétée : ${quest.icon} ${quest.name} (+${quest.xp} XP)`, 'success');
    
    _activeQuests = QUESTS.filter(q => !_completedQuests.includes(q.id)).slice(0, 3);
    loadQuests();
  }
};

// ── SYSTÈME DE MARKETPLACE INTÉGRÉ ───────────────────────────
const MARKETPLACE_ITEMS = [
  { id: 1, name: 'Badge Premium', price: 500, icon: '⭐', description: 'Badge exclusif' },
  { id: 2, name: 'Thème Doré', price: 300, icon: '🎨', description: 'Thème premium' },
  { id: 3, name: 'XP Boost x2', price: 200, icon: '🚀', description: 'Double XP pendant 24h' },
  { id: 4, name: 'Avatar Animé', price: 400, icon: '🎭', description: 'Avatar avec animation' },
  { id: 5, name: 'Bannière Premium', price: 350, icon: '🖼️', description: 'Bannière exclusive' },
  { id: 6, name: 'Badge Créateur', price: 600, icon: '👨‍💻', description: 'Badge créateur vérifié' }
];

let _userCoins = parseInt(localStorage.getItem('flx_coins') || '0');

window.openMarketplace = () => {
  const modal = document.createElement('div');
  modal.className = 'overlay open';
  modal.id = 'marketplaceModal';
  modal.innerHTML = `
    <div class="modal marketplace-modal">
      <button class="modal-x" onclick="document.getElementById('marketplaceModal').remove()">
        <svg viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
      </button>
      <h3 style="font-family:var(--font-d);font-size:20px;font-weight:700;margin-bottom:20px">🛒 Marketplace</h3>
      
      <div class="marketplace-coins">
        <span>💰</span>
        <span id="userCoins">${_userCoins}</span>
        <span>coins</span>
      </div>
      
      <div class="marketplace-grid">
        ${MARKETPLACE_ITEMS.map(item => `
          <div class="marketplace-item">
            <div class="item-icon">${item.icon}</div>
            <div class="item-name">${item.name}</div>
            <div class="item-desc">${item.description}</div>
            <div class="item-price">${item.price} coins</div>
            <button class="btn-main item-buy-btn" onclick="buyItem(${item.id})" 
                    ${_userCoins < item.price ? 'disabled' : ''}>
              ${_userCoins < item.price ? 'Pas assez' : 'Acheter'}
            </button>
          </div>
        `).join('')}
      </div>
    </div>
  `;
  document.body.appendChild(modal);
};

window.buyItem = (itemId) => {
  const item = MARKETPLACE_ITEMS.find(i => i.id === itemId);
  if (!item) return;

  if (_userCoins < item.price) {
    toast('Pas assez de coins', 'error');
    return;
  }

  _userCoins -= item.price;
  localStorage.setItem('flx_coins', _userCoins);
  
  document.getElementById('userCoins').textContent = _userCoins;
  
  toast(`${item.icon} ${item.name} acheté !`, 'success');
  
  // Ici, on pourrait appliquer l'effet de l'item
  applyItemEffect(item);
};

window.applyItemEffect = (item) => {
  // Appliquer l'effet de l'item acheté
  console.log('Item effect applied:', item);
};

window.earnCoins = (amount) => {
  _userCoins += amount;
  localStorage.setItem('flx_coins', _userCoins);
};

// ── INITIALISATION ───────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  initSpeechRecognition();
  
  // Donner des coins pour différentes actions
  const originalGiveXP = window.giveXP;
  window.giveXP = async (amount, badgeId) => {
    await originalGiveXP(amount, badgeId);
    earnCoins(Math.floor(amount / 10)); // 1 coin pour 10 XP
  };
  
  console.log('%c🚀 GOD MODE AMÉLIORATIONS FLUXUS CHARGÉES !', 'color:#f59e0b;font-weight:800;font-size:14px');
});
