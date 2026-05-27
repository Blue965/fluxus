# 🚀 Quick Start - Fluxus Desktop App (Tauri)

**C'est la solution moderne que tu cherchais !** Tauri utilise Rust, c'est ce que Discord utilise maintenant.

## 📋 Installation Rapide

### 1. Installer Rust (Requis)
```bash
# Windows
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh

# Vérifier
rustc --version
cargo --version
```

### 2. Installer les dépendances
```bash
npm install
```

### 3. Lancer en mode développement
```bash
npm run tauri:dev
```

### 4. Build pour production
```bash
npm run tauri:build
```

## 🎮 Fonctionnalités Incluses

✅ **Boutique intégrée** - Achats in-app, abonnements, micro-transactions  
✅ **Social complet** - Profils, amis, followers, notifications  
✅ **Gaming avancé** - Stats, leaderboards, sessions de jeu  
✅ **Streaming** - Live streaming avec chat intégré  
✅ **Architecture scalable** - Rust backend pour performance  
✅ **Cross-platform** - Windows, macOS, Linux, iOS, Android (future)  

## 📦 Avantages vs Electron

| Caractéristique | Electron | Tauri |
|----------------|----------|-------|
| Taille d'installation | ~150MB | ~10MB |
| Mémoire utilisée | ~200MB | ~50MB |
| Performance | Moyenne | Excellente |
| Sécurité | Moyenne | Excellente |
| Langage backend | Node.js | Rust |
| Mobile | Non | Oui (future) |
| Boutique native | Limité | Complet |

## 🔧 Commandes Disponibles

```bash
npm run tauri:dev          # Mode développement
npm run tauri:build        # Build release
npm run tauri:build:debug  # Build debug
npm run tauri:build:release # Build production
```

## 📁 Structure Créée

```
fluxus/
├── tauri.conf.json           # Configuration Tauri
├── package.json              # Scripts Tauri
├── icons/                    # Icônes de l'app
├── src-tauri/                # Code Rust backend
│   ├── src/
│   │   ├── main.rs          # Point d'entrée
│   │   ├── boutique.rs      # Module boutique
│   │   ├── social.rs         # Module social
│   │   ├── gaming.rs         # Module gaming
│   │   ├── streaming.rs      # Module streaming
│   │   ├── store.rs          # Module stockage
│   │   └── lib.rs            # Library
│   ├── Cargo.toml            # Dépendances Rust
│   ├── build.rs              # Build script
│   └── tauri.conf.json       # Configuration Tauri
├── TAURI_SETUP.md             # Guide complet
└── QUICKSTART.md              # Ce fichier
```

## 💰 Intégration Boutique

Le système de boutique est déjà implémenté dans `src-tauri/src/boutique.rs`:

```javascript
// Exemple d'utilisation depuis le frontend
import { invoke } from '@tauri-apps/api/core';

// Acheter un item
await invoke('purchase_item', { itemId: 'premium' });

// Récupérer les achats
const purchases = await invoke('get_user_purchases', { userId: 'user_123' });

// Récupérer les items de la boutique
const items = await invoke('get_store_items', { category: 'subscription' });
```

## 🎯 Prochaines Étapes

1. Installer Rust si pas déjà installé
2. Lancer `npm install` pour installer les dépendances
3. Lancer `npm run tauri:dev` pour tester
4. Personnaliser les modules Rust selon tes besoins
5. Intégrer avec ton backend existant (Firebase, etc.)

## 📚 Documentation Complète

Voir `TAURI_SETUP.md` pour la documentation complète.

---

**C'est la solution moderne et professionnelle que tu cherchais !** 🚀
