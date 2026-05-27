// ══════════════════════════════════════════════════════════════
// FLUXUS DESKTOP APP - Tauri Rust Backend
// Architecture scalable pour grosse plateforme sociale
// ══════════════════════════════════════════════════════════════

#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod store;
mod boutique;
mod social;
mod gaming;
mod streaming;

use tauri::Manager;
use tauri_plugin_store::{StoreBuilder};

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_store::Builder::new().build())
        .plugin(tauri_plugin_dialog::init())
        .setup(|app| {
            // Initialiser le store local
            let store = StoreBuilder::new(app).build();
            
            // Charger les données utilisateur
            if let Some(user_id) = store.get("user_id") {
                println!("Utilisateur connecté: {}", user_id);
            }
            
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            // Boutique
            boutique::purchase_item,
            boutique::get_user_purchases,
            boutique::get_store_items,
            boutique::validate_purchase,
            
            // Social
            social::get_user_profile,
            social::update_user_profile,
            social::get_friends_list,
            social::send_friend_request,
            social::accept_friend_request,
            
            // Gaming
            gaming::get_game_stats,
            gaming::update_game_stats,
            gaming::get_leaderboard,
            gaming::join_game_session,
            
            // Streaming
            streaming::start_stream,
            streaming::stop_stream,
            streaming::get_stream_info,
            streaming::join_stream,
            
            // Utilitaires
            get_app_version,
            check_updates,
            sync_data
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

// ── COMMANDES UTILITAIRES ────────────────────────────────────

#[tauri::command]
async fn get_app_version() -> Result<String, String> {
    Ok(env!("CARGO_PKG_VERSION").to_string())
}

#[tauri::command]
async fn check_updates() -> Result<bool, String> {
    // Vérifier les mises à jour depuis le serveur
    Ok(true)
}

#[tauri::command]
async fn sync_data(user_id: String) -> Result<bool, String> {
    // Synchroniser les données avec le cloud
    println!("Sync des données pour utilisateur: {}", user_id);
    Ok(true)
}
