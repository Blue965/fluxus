// ══════════════════════════════════════════════════════════════
// ULTRA AMÉLIORATIONS FLUXUS - Voice, Widgets, Thèmes, Shortcuts
// ══════════════════════════════════════════════════════════════

// ── SYSTÈME DE VOICE MESSAGES DANS LE CHAT ───────────────────
let _mediaRecorder = null;
let _audioChunks = [];
let _isRecording = false;

window.startVoiceRecording = async () => {
  if (!ME) return;
  
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    _mediaRecorder = new MediaRecorder(stream);
    _audioChunks = [];
    
    _mediaRecorder.ondataavailable = (e) => {
      _audioChunks.push(e.data);
    };
    
    _mediaRecorder.onstop = async () => {
      const audioBlob = new Blob(_audioChunks, { type: 'audio/webm' });
      const audioUrl = URL.createObjectURL(audioBlob);
      
      // Upload audio to Cloudinary
      const file = new File([audioBlob], 'voice-message.webm', { type: 'audio/webm' });
      const uploadedUrl = await upload(file);
      
      if (uploadedUrl) {
        await sendVoiceMessage(uploadedUrl);
      }
      
      stream.getTracks().forEach(track => track.stop());
    };
    
    _mediaRecorder.start();
    _isRecording = true;
    
    const btn = document.getElementById('voiceRecordBtn');
    if (btn) {
      btn.classList.add('recording');
      btn.innerHTML = '<span class="recording-dot"></span> Enregistrement...';
    }
    
  } catch (e) {
    console.error('Voice recording error:', e);
    toast('Impossible d\'accéder au microphone', 'error');
  }
};

window.stopVoiceRecording = () => {
  if (_mediaRecorder && _isRecording) {
    _mediaRecorder.stop();
    _isRecording = false;
    
    const btn = document.getElementById('voiceRecordBtn');
    if (btn) {
      btn.classList.remove('recording');
      btn.innerHTML = '<svg viewBox="0 0 24 24"><path d="M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3z"/><path d="M19 10v2a7 7 0 01-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg>';
    }
  }
};

window.toggleVoiceRecording = () => {
  if (_isRecording) {
    stopVoiceRecording();
  } else {
    startVoiceRecording();
  }
};

window.sendVoiceMessage = async (audioUrl) => {
  if (!audioUrl || !curChatId || !ME) return;
  
  // Vérifier que Firebase est disponible
  if (typeof addDoc === 'undefined' || typeof collection === 'undefined' || typeof db === 'undefined') {
    toast('Firebase pas encore disponible', 'error');
    return;
  }
  
  await addDoc(collection(db, 'chats', curChatId, 'messages'), {
    type: 'voice',
    audioUrl,
    uid: ME.uid,
    authorName: PROF.name || ME.displayName || 'Utilisateur',
    photoURL: PROF.photoURL || ME.photoURL || null,
    duration: 0, // TODO: Calculate duration
    createdAt: serverTimestamp()
  });
  
  await updateDoc(doc(db, 'chats', curChatId), {
    lastMsg: '🎤 Message vocal',
    lastAt: serverTimestamp()
  });
  
  toast('Message vocal envoyé', 'success');
};

// ── SYSTÈME DE WIDGETS PERSONNALISABLES ─────────────────────
let _widgets = JSON.parse(localStorage.getItem('flx_widgets') || '[]');

const AVAILABLE_WIDGETS = [
  { id: 'stats', name: 'Statistiques', icon: '📊', defaultPos: { x: 0, y: 0, w: 2, h: 2 } },
  { id: 'todo', name: 'To-Do', icon: '✅', defaultPos: { x: 2, y: 0, w: 2, h: 2 } },
  { id: 'activity', name: 'Activité', icon: '📈', defaultPos: { x: 0, y: 2, w: 2, h: 2 } },
  { id: 'suggestions', name: 'Suggestions', icon: '💡', defaultPos: { x: 2, y: 2, w: 2, h: 2 } },
  { id: 'quickPost', name: 'Post rapide', icon: '✏️', defaultPos: { x: 0, y: 4, w: 4, h: 1 } },
  { id: 'notifications', name: 'Notifications', icon: '🔔', defaultPos: { x: 0, y: 5, w: 4, h: 1 } }
];

function _saveWidgets() {
  localStorage.setItem('flx_widgets', JSON.stringify(_widgets));
  renderWidgetGrid();
}

window.addWidget = (widgetId) => {
  const widget = AVAILABLE_WIDGETS.find(w => w.id === widgetId);
  if (!widget) return;
  
  if (_widgets.find(w => w.id === widgetId)) {
    toast('Widget déjà ajouté', 'error');
    return;
  }
  
  _widgets.push({
    ...widget,
    pos: { ...widget.defaultPos },
    enabled: true
  });
  
  _saveWidgets();
  toast('Widget ajouté', 'success');
};

window.removeWidget = (widgetId) => {
  _widgets = _widgets.filter(w => w.id !== widgetId);
  _saveWidgets();
  toast('Widget retiré', '');
};

window.toggleWidget = (widgetId) => {
  const widget = _widgets.find(w => w.id === widgetId);
  if (widget) {
    widget.enabled = !widget.enabled;
    _saveWidgets();
  }
};

window.renderWidgetGrid = () => {
  const container = document.getElementById('widgetGrid');
  if (!container) return;
  
  const enabledWidgets = _widgets.filter(w => w.enabled);
  
  container.innerHTML = `
    <div class="widget-grid">
      ${enabledWidgets.map(w => renderWidget(w)).join('')}
    </div>
    <div class="widget-add-menu">
      ${AVAILABLE_WIDGETS.filter(aw => !_widgets.find(w => w.id === aw.id)).map(w => `
        <button class="widget-add-btn" onclick="addWidget('${w.id}')">
          <span class="widget-icon">${w.icon}</span>
          <span class="widget-name">${w.name}</span>
        </button>
      `).join('')}
    </div>
  `;
};

function renderWidget(widget) {
  const content = getWidgetContent(widget.id);
  
  return `
    <div class="widget-card" data-widget-id="${widget.id}" style="grid-column: span ${widget.pos.w}; grid-row: span ${widget.pos.h}">
      <div class="widget-header">
        <span class="widget-title">${widget.icon} ${widget.name}</span>
        <button class="widget-remove" onclick="removeWidget('${widget.id}')">✕</button>
      </div>
      <div class="widget-content">
        ${content}
      </div>
    </div>
  `;
}

function getWidgetContent(widgetId) {
  switch (widgetId) {
    case 'stats':
      return `
        <div class="mini-stats">
          <div class="mini-stat">
            <span class="mini-stat-value">${(PROF?.followers || []).length}</span>
            <span class="mini-stat-label">Abonnés</span>
          </div>
          <div class="mini-stat">
            <span class="mini-stat-value">${PROF?.xp || 0}</span>
            <span class="mini-stat-label">XP</span>
          </div>
        </div>
      `;
    case 'todo':
      const pendingTodos = _todos.filter(t => !t.done).slice(0, 3);
      return `
        <div class="widget-todo-list">
          ${pendingTodos.length ? pendingTodos.map(t => `
            <div class="widget-todo-item">
              <input type="checkbox" onchange="toggleTodo('${t.id}')" ${t.done ? 'checked' : ''}>
              <span>${t.text.substring(0, 30)}${t.text.length > 30 ? '...' : ''}</span>
            </div>
          `).join('') : '<div class="widget-empty">Aucune tâche</div>'}
        </div>
        <button class="widget-action-btn" onclick="goPage('Todo', null)">Voir tout →</button>
      `;
    case 'activity':
      return `
        <div class="widget-activity">
          <div class="activity-item">
            <span class="activity-icon">❤️</span>
            <span class="activity-text">+12 likes aujourd'hui</span>
          </div>
          <div class="activity-item">
            <span class="activity-icon">💬</span>
            <span class="activity-text">+5 commentaires</span>
          </div>
          <div class="activity-item">
            <span class="activity-icon">🎯</span>
            <span class="activity-text">+50 XP gagnés</span>
          </div>
        </div>
      `;
    case 'suggestions':
      return `
        <div class="widget-suggestions">
          <div class="suggestion-mini" onclick="goPage('Search', null)">
            <span>🔍</span>
            <span>Explorer du contenu</span>
          </div>
          <div class="suggestion-mini" onclick="goPage('Groups', null)">
            <span>👥</span>
            <span>Rejoindre un groupe</span>
          </div>
          <div class="suggestion-mini" onclick="openPollCreator()">
            <span>📊</span>
            <span>Créer un sondage</span>
          </div>
        </div>
      `;
    case 'quickPost':
      return `
        <input type="text" class="widget-quick-post" placeholder="Écrire un post rapide..." 
               onkeydown="if(event.key==='Enter'){submitQuickPost(this.value)}">
      `;
    case 'notifications':
      return `
        <div class="widget-notifs">
          <div class="notif-mini" onclick="goPage('Notifs', null)">
            <span>🔔</span>
            <span>3 nouvelles notifications</span>
          </div>
        </div>
      `;
    default:
      return '<div class="widget-empty">Contenu non disponible</div>';
  }
}

window.submitQuickPost = async (text) => {
  if (!text.trim() || !ME) return;
  
  // Vérifier que Firebase est disponible
  if (typeof addDoc === 'undefined' || typeof collection === 'undefined' || typeof db === 'undefined') {
    toast('Firebase pas encore disponible', 'error');
    return;
  }
  
  await addDoc(collection(db, 'posts'), {
    text,
    authorId: ME.uid,
    authorName: PROF.name || ME.displayName || 'Utilisateur',
    authorPhoto: PROF.photoURL || ME.photoURL || null,
    likes: [],
    commentsCount: 0,
    createdAt: serverTimestamp()
  });
  
  toast('Post publié !', 'success');
  document.querySelector('.widget-quick-post').value = '';
};

// ── SYSTÈME DE THÈMES DE COULEURS PERSONNALISABLES ───────────
const THEME_PRESETS = [
  { name: 'Midnight', colors: { bg: '#000000', bg2: '#0a0a0a', bg3: '#111111', accent: '#6366f1' } },
  { name: 'Ocean', colors: { bg: '#0f172a', bg2: '#1e293b', bg3: '#334155', accent: '#0ea5e9' } },
  { name: 'Forest', colors: { bg: '#052e16', bg2: '#14532d', bg3: '#166534', accent: '#22c55e' } },
  { name: 'Sunset', colors: { bg: '#1c1917', bg2: '#292524', bg3: '#44403c', accent: '#f59e0b' } },
  { name: 'Purple', colors: { bg: '#0f0518', bg2: '#1a0a2e', bg3: '#2d1b4e', accent: '#a855f7' } },
  { name: 'Rose', colors: { bg: '#1a0505', bg2: '#2e0a0a', bg3: '#4e1b1b', accent: '#f43f5e' } }
];

let _currentTheme = JSON.parse(localStorage.getItem('flx_custom_theme') || 'null');

window.openThemePicker = () => {
  const modal = document.createElement('div');
  modal.className = 'overlay open';
  modal.id = 'themePickerModal';
  modal.innerHTML = `
    <div class="modal theme-picker-modal">
      <button class="modal-x" onclick="document.getElementById('themePickerModal').remove()">
        <svg viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
      </button>
      <h3 style="font-family:var(--font-d);font-size:20px;font-weight:700;margin-bottom:20px">Personnaliser le thème</h3>
      
      <div class="theme-presets">
        ${THEME_PRESETS.map(t => `
          <button class="theme-preset-btn" onclick="applyThemePreset('${t.name}')">
            <div class="theme-preview" style="background: linear-gradient(135deg, ${t.colors.bg}, ${t.colors.bg2})">
              <div class="theme-accent" style="background: ${t.colors.accent}"></div>
            </div>
            <span>${t.name}</span>
          </button>
        `).join('')}
      </div>
      
      <div class="custom-theme-section">
        <h4 style="font-size:14px;font-weight:600;margin-bottom:12px">Couleurs personnalisées</h4>
        <div class="color-inputs">
          <div class="color-input-group">
            <label>Arrière-plan</label>
            <input type="color" id="themeBg" value="${_currentTheme?.colors?.bg || '#000000'}" onchange="updateCustomColor('bg', this.value)">
          </div>
          <div class="color-input-group">
            <label>Arrière-plan 2</label>
            <input type="color" id="themeBg2" value="${_currentTheme?.colors?.bg2 || '#0a0a0a'}" onchange="updateCustomColor('bg2', this.value)">
          </div>
          <div class="color-input-group">
            <label>Accent</label>
            <input type="color" id="themeAccent" value="${_currentTheme?.colors?.accent || '#6366f1'}" onchange="updateCustomColor('accent', this.value)">
          </div>
        </div>
      </div>
      
      <div style="display:flex;gap:10px;margin-top:20px">
        <button class="btn-main" onclick="saveCustomTheme()">Appliquer</button>
        <button class="btn-google" onclick="resetTheme()">Réinitialiser</button>
      </div>
    </div>
  `;
  document.body.appendChild(modal);
};

window.applyThemePreset = (presetName) => {
  const preset = THEME_PRESETS.find(t => t.name === presetName);
  if (!preset) return;
  
  _currentTheme = { name: presetName, colors: { ...preset.colors } };
  
  document.getElementById('themeBg').value = preset.colors.bg;
  document.getElementById('themeBg2').value = preset.colors.bg2;
  document.getElementById('themeAccent').value = preset.colors.accent;
  
  applyThemeColors(preset.colors);
};

window.updateCustomColor = (key, value) => {
  if (!_currentTheme) _currentTheme = { name: 'Custom', colors: {} };
  _currentTheme.colors[key] = value;
};

window.saveCustomTheme = () => {
  if (!_currentTheme) return;
  
  localStorage.setItem('flx_custom_theme', JSON.stringify(_currentTheme));
  applyThemeColors(_currentTheme.colors);
  document.getElementById('themePickerModal').remove();
  toast('Thème appliqué !', 'success');
};

window.resetTheme = () => {
  localStorage.removeItem('flx_custom_theme');
  _currentTheme = null;
  
  document.documentElement.style.removeProperty('--bg');
  document.documentElement.style.removeProperty('--bg2');
  document.documentElement.style.removeProperty('--bg3');
  document.documentElement.style.removeProperty('--accentbg');
  
  document.getElementById('themePickerModal').remove();
  toast('Thème réinitialisé', '');
};

function applyThemeColors(colors) {
  document.documentElement.style.setProperty('--bg', colors.bg);
  document.documentElement.style.setProperty('--bg2', colors.bg2);
  document.documentElement.style.setProperty('--bg3', colors.bg3);
  document.documentElement.style.setProperty('--accentbg', colors.accent + '20');
  document.documentElement.style.setProperty('--accentbg2', colors.accent + '30');
}

// ── SYSTÈME DE SHORTCUTS PERSONNALISABLES ─────────────────────
let _customShortcuts = JSON.parse(localStorage.getItem('flx_shortcuts') || 'null');

const DEFAULT_SHORTCUTS = {
  'search': { key: 'k', ctrl: true, action: 'goPage("Search", null); document.getElementById("searchInp")?.focus()' },
  'newPost': { key: 'n', ctrl: true, action: 'goPage("Feed", null); document.getElementById("compTa")?.focus()' },
  'bookmarks': { key: 'b', ctrl: true, action: 'showBookmarks()' },
  'todo': { key: 't', ctrl: true, action: 'goPage("Todo", null)' },
  'theme': { key: 'd', ctrl: true, action: 'toggleTheme()' },
  'gif': { key: 'g', ctrl: true, action: 'openGifPicker("compTa")' },
  'poll': { key: 'p', ctrl: true, action: 'openPollCreator()' },
  'ai': { key: 'a', ctrl: true, action: 'toggleAI()' },
  'notifications': { key: 'i', ctrl: true, action: 'goPage("Notifs", null)' },
  'profile': { key: 'p', ctrl: true, shift: true, action: 'goPage("Profile", null)' }
};

window.openShortcutEditor = () => {
  const shortcuts = _customShortcuts || { ...DEFAULT_SHORTCUTS };
  
  const modal = document.createElement('div');
  modal.className = 'overlay open';
  modal.id = 'shortcutEditorModal';
  modal.innerHTML = `
    <div class="modal shortcut-editor-modal">
      <button class="modal-x" onclick="document.getElementById('shortcutEditorModal').remove()">
        <svg viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
      </button>
      <h3 style="font-family:var(--font-d);font-size:20px;font-weight:700;margin-bottom:20px">Raccourcis clavier</h3>
      
      <div class="shortcut-list">
        ${Object.entries(shortcuts).map(([id, shortcut]) => `
          <div class="shortcut-item">
            <div class="shortcut-label">${getShortcutLabel(id)}</div>
            <div class="shortcut-key" onclick="editShortcut('${id}')">
              ${formatShortcutKey(shortcut)}
            </div>
          </div>
        `).join('')}
      </div>
      
      <div style="display:flex;gap:10px;margin-top:20px">
        <button class="btn-main" onclick="saveShortcuts()">Enregistrer</button>
        <button class="btn-google" onclick="resetShortcuts()">Réinitialiser</button>
      </div>
    </div>
  `;
  document.body.appendChild(modal);
};

function getShortcutLabel(id) {
  const labels = {
    search: 'Recherche',
    newPost: 'Nouveau post',
    bookmarks: 'Signets',
    todo: 'To-Do',
    theme: 'Changer thème',
    gif: 'GIF picker',
    poll: 'Créer sondage',
    ai: 'Assistant IA',
    notifications: 'Notifications',
    profile: 'Profil'
  };
  return labels[id] || id;
}

function formatShortcutKey(shortcut) {
  const parts = [];
  if (shortcut.ctrl) parts.push('Ctrl');
  if (shortcut.shift) parts.push('Shift');
  if (shortcut.alt) parts.push('Alt');
  parts.push(shortcut.key.toUpperCase());
  return parts.join(' + ');
}

window.editShortcut = (shortcutId) => {
  const input = prompt('Entrez la nouvelle combinaison (ex: Ctrl+K):');
  if (!input) return;
  
  const parts = input.split('+').map(p => p.trim().toLowerCase());
  const key = parts.pop();
  const ctrl = parts.includes('ctrl');
  const shift = parts.includes('shift');
  const alt = parts.includes('alt');
  
  if (!_customShortcuts) _customShortcuts = { ...DEFAULT_SHORTCUTS };
  _customShortcuts[shortcutId] = { key, ctrl, shift, alt };
  
  openShortcutEditor(); // Refresh
};

window.saveShortcuts = () => {
  if (_customShortcuts) {
    localStorage.setItem('flx_shortcuts', JSON.stringify(_customShortcuts));
  }
  document.getElementById('shortcutEditorModal').remove();
  toast('Raccourcis enregistrés', 'success');
};

window.resetShortcuts = () => {
  localStorage.removeItem('flx_shortcuts');
  _customShortcuts = null;
  openShortcutEditor();
  toast('Raccourcis réinitialisés', '');
};

// Override default shortcut handler with custom shortcuts
const originalKeyHandler = document.onkeydown;
document.addEventListener('keydown', (e) => {
  const shortcuts = _customShortcuts || DEFAULT_SHORTCUTS;
  
  Object.entries(shortcuts).forEach(([id, shortcut]) => {
    const keyMatch = e.key.toLowerCase() === shortcut.key.toLowerCase();
    const ctrlMatch = (!shortcut.ctrl && !e.ctrlKey) || (shortcut.ctrl && e.ctrlKey);
    const shiftMatch = (!shortcut.shift && !e.shiftKey) || (shortcut.shift && e.shiftKey);
    const altMatch = (!shortcut.alt && !e.altKey) || (shortcut.alt && e.altKey);
    
    if (keyMatch && ctrlMatch && shiftMatch && altMatch) {
      e.preventDefault();
      eval(shortcut.action);
    }
  });
});

// ── INITIALISATION ───────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  // Load saved theme
  if (_currentTheme) {
    applyThemeColors(_currentTheme.colors);
  }
  
  // Initialize widgets if on dashboard
  if (document.getElementById('widgetGrid')) {
    renderWidgetGrid();
  }
  
  console.log('%c🚀 ULTRA AMÉLIORATIONS FLUXUS CHARGÉES !', 'color:#a855f7;font-weight:800;font-size:14px');
});
