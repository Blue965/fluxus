// ════════════════════════════════════════
// AMÉLIORATIONS FLUXUS - JavaScript
// ════════════════════════════════════════

// ── SYSTÈME DE SIGNETS (BOOKMARKS) ───────────────────────────
let _bookmarks = JSON.parse(localStorage.getItem('flx_bookmarks') || '[]');

function _saveBookmarks() {
  localStorage.setItem('flx_bookmarks', JSON.stringify(_bookmarks));
  _updateBookmarkButtons();
}

function _updateBookmarkButtons() {
  document.querySelectorAll('.bookmark-btn').forEach(btn => {
    const postId = btn.dataset.postId;
    if (_bookmarks.includes(postId)) {
      btn.innerHTML = '<svg viewBox="0 0 24 24"><path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z"/></svg>';
      btn.classList.add('bookmarked');
    } else {
      btn.innerHTML = '<svg viewBox="0 0 24 24"><path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z"/></svg>';
      btn.classList.remove('bookmarked');
    }
  });
}

window.toggleBookmark = (postId) => {
  const idx = _bookmarks.indexOf(postId);
  if (idx > -1) {
    _bookmarks.splice(idx, 1);
    toast('Retiré des signets', '');
  } else {
    _bookmarks.push(postId);
    toast('Ajouté aux signets', 'success');
  }
  _saveBookmarks();
};

// ── AMÉLIORATION DE LA RECHERCHE AVEC FILTRES ───────────────────
window.toggleSearchFilter = (filter, btn) => {
  const currentFilter = document.getElementById('currentSearchFilter')?.value || 'all';
  const newFilter = currentFilter === filter ? 'all' : filter;
  
  document.querySelectorAll('.search-filter-btn').forEach(b => b.classList.remove('active'));
  if (newFilter !== 'all' && btn) btn.classList.add('active');
  
  const filterInput = document.getElementById('currentSearchFilter');
  if (!filterInput) {
    const input = document.createElement('input');
    input.id = 'currentSearchFilter';
    input.type = 'hidden';
    input.value = newFilter;
    document.querySelector('.search-wrap').appendChild(input);
  } else {
    filterInput.value = newFilter;
  }
  
  const searchInp = document.getElementById('searchInp');
  if (searchInp && searchInp.value) doSearch(searchInp.value);
};

// ── RACCOURCIS CLAVIER ───────────────────────────────────────
document.addEventListener('keydown', (e) => {
  // Ne pas activer si l'utilisateur est dans un input
  if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
  
  // Ctrl/Cmd + K : Recherche
  if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
    e.preventDefault();
    goPage('Search', null);
    document.getElementById('searchInp')?.focus();
  }
  
  // Ctrl/Cmd + N : Nouveau post
  if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
    e.preventDefault();
    goPage('Feed', null);
    document.getElementById('compTa')?.focus();
  }
  
  // Ctrl/Cmd + B : Signets
  if ((e.ctrlKey || e.metaKey) && e.key === 'b') {
    e.preventDefault();
    showBookmarks();
  }
  
  // Ctrl/Cmd + T : Todo
  if ((e.ctrlKey || e.metaKey) && e.key === 't') {
    e.preventDefault();
    goPage('Todo', null);
  }
  
  // ? : Aide raccourcis
  if (e.key === '?' && !e.shiftKey) {
    e.preventDefault();
    showShortcutsHelp();
  }
});

// ── AFFICHER LES SIGNETS ─────────────────────────────────────
window.showBookmarks = () => {
  if (!_bookmarks.length) {
    toast('Aucun signet pour le moment', '');
    return;
  }
  
  const wrap = document.getElementById('feedPosts');
  if (!wrap) return;
  
  wrap.innerHTML = '<div style="padding:20px;text-align:center;color:var(--text3);font-size:13px">Chargement des signets...</div>';
  
  // Charger les posts bookmarkés depuis Firestore
  const promises = _bookmarks.map(pid => getDoc(doc(db, 'posts', pid)));
  
  Promise.all(promises).then(snapshots => {
    const posts = snapshots.filter(s => s.exists()).map(s => ({ id: s.id, ...s.data() }));
    
    if (!posts.length) {
      wrap.innerHTML = '<div class="empty"><svg viewBox="0 0 24 24"><path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z"/></svg><div class="empty-title">Aucun signet</div></div>';
      return;
    }
    
    wrap.innerHTML = posts.map(p => renderPost(p)).join('');
    document.getElementById('tbTitle').textContent = 'Signets';
  }).catch(() => {
    wrap.innerHTML = '<div class="empty"><div class="empty-title">Erreur de chargement</div></div>';
  });
};

// ── AFFICHER L'AIDE DES RACCOURCIS ────────────────────────────
window.showShortcutsHelp = () => {
  const helpHTML = `
    <div style="text-align:left;padding:20px">
      <h3 style="font-family:var(--font-d);font-size:18px;font-weight:700;margin-bottom:16px">Raccourcis clavier</h3>
      <div style="display:flex;flex-direction:column;gap:10px">
        <div style="display:flex;justify-content:space-between;align-items:center">
          <span>Recherche</span>
          <span class="kbd">Ctrl + K</span>
        </div>
        <div style="display:flex;justify-content:space-between;align-items:center">
          <span>Nouveau post</span>
          <span class="kbd">Ctrl + N</span>
        </div>
        <div style="display:flex;justify-content:space-between;align-items:center">
          <span>Signets</span>
          <span class="kbd">Ctrl + B</span>
        </div>
        <div style="display:flex;justify-content:space-between;align-items:center">
          <span>To-Do</span>
          <span class="kbd">Ctrl + T</span>
        </div>
        <div style="display:flex;justify-content:space-between;align-items:center">
          <span>Thème clair/sombre</span>
          <span class="kbd">Ctrl + D</span>
        </div>
        <div style="display:flex;justify-content:space-between;align-items:center">
          <span>Fermer modal</span>
          <span class="kbd">Echap</span>
        </div>
      </div>
    </div>
  `;
  
  // Créer et afficher un modal temporaire
  const modal = document.createElement('div');
  modal.className = 'overlay open';
  modal.id = 'shortcutsModal';
  modal.innerHTML = `
    <div class="modal">
      <button class="modal-x" onclick="document.getElementById('shortcutsModal').remove()">
        <svg viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
      </button>
      ${helpHTML}
    </div>
  `;
  document.body.appendChild(modal);
};

// ── AMÉLIORATION DU RENDERPOST AVEC BOUTON SIGNET ─────────────
const originalRenderPost = window.renderPost;
if (typeof originalRenderPost === 'function') {
  window.renderPost = function(p) {
    let html = originalRenderPost(p);
    // Ajouter le bouton de signet après le bouton de partage
    const bookmarkBtn = `
      <button class="pa bookmark-btn ${_bookmarks.includes(p.id) ? 'bookmarked' : ''}" 
              data-post-id="${p.id}" 
              onclick="toggleBookmark('${p.id}')"
              title="Ajouter aux signets">
        <svg viewBox="0 0 24 24"><path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z"/></svg>
      </button>
    `;
    html = html.replace(
      /(<button class="pa"[^>]*>Partager<\/button>)/,
      `$1${bookmarkBtn}`
    );
    return html;
  };
}

// ── RACCOURCI POUR LE THÈME ─────────────────────────────────
document.addEventListener('keydown', (e) => {
  if ((e.ctrlKey || e.metaKey) && e.key === 'd') {
    e.preventDefault();
    toggleTheme();
  }
});

// ── INITIALISATION ───────────────────────────────────────────
console.log('%c🚀 Améliorations Fluxus chargées !', 'color:#22c55e;font-weight:800;font-size:13px');
