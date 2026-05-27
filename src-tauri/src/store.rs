// ══════════════════════════════════════════════════════════════
// MODULE STORE - Gestion du stockage local
// ══════════════════════════════════════════════════════════════

use tauri_plugin_store::{StoreBuilder};

pub fn init_store(app: &tauri::App) -> tauri_plugin_store::Store {
    StoreBuilder::new(app).build()
}
