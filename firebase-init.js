// Firebase Initialization
// This file loads the Firebase config and initializes Firebase

import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import { getDatabase } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js';

// Export database functions for use in script.js
window.firebaseDatabaseFunctions = {
    ref: null,
    set: null
};

// Wait for firebaseConfig to be available and initialize
function initFirebase() {
    if (typeof firebaseConfig !== 'undefined') {
        try {
            window.firebaseApp = initializeApp(firebaseConfig);
            window.firebaseDatabase = getDatabase(window.firebaseApp);
            
            // Import and store database functions
            import('https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js').then((dbModule) => {
                window.firebaseDatabaseFunctions.ref = dbModule.ref;
                window.firebaseDatabaseFunctions.set = dbModule.set;
                console.log('✅ Firebase initialized successfully');
            });
        } catch (error) {
            console.error('❌ Firebase initialization error:', error);
        }
    } else {
        console.warn('⚠️ firebaseConfig not found. Make sure firebase-config.js is loaded.');
    }
}

// Try to initialize immediately, or wait a bit if config isn't loaded yet
if (typeof firebaseConfig !== 'undefined') {
    initFirebase();
} else {
    // Wait a bit for the config script to load
    setTimeout(initFirebase, 100);
    // Also try again after a longer delay
    setTimeout(initFirebase, 500);
}

