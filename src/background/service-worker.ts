/// <reference types="chrome" />

// Constants
const OFFSCREEN_DOCUMENT_PATH = 'src/offscreen/index.html';

// Storage keys
const STORAGE_KEYS = {
    ACTIVE_RECITER: 'activeReciter',
    ACTIVE_SURAHS: 'activeSurah',
    REPEAT_MODE: 'repeatMode',
};

// Ensure offscreen document exists
async function ensureOffscreenDocument() {
    const existingContexts = await chrome.runtime.getContexts({
        contextTypes: [chrome.runtime.ContextType.OFFSCREEN_DOCUMENT],
    });

    if (existingContexts.length > 0) {
        return true;
    }

    try {
        await chrome.offscreen.createDocument({
            url: OFFSCREEN_DOCUMENT_PATH,
            reasons: [chrome.offscreen.Reason.AUDIO_PLAYBACK],
            justification: 'Playing Quran audio in the background',
        });
        return true;
    } catch (error) {
        console.error('Failed to create offscreen document:', error);
        return false;
    }
}

// Handle next track playback when audio ends
async function handleNextTrack() {
    try {
        const data = await chrome.storage.local.get([
            STORAGE_KEYS.ACTIVE_RECITER,
            STORAGE_KEYS.ACTIVE_SURAHS,
            STORAGE_KEYS.REPEAT_MODE
        ]);
        const { activeReciter, activeSurah, repeatMode } = data;

        if (!activeReciter || !activeSurah) return;

        let nextSurahId = activeSurah.id;

        if (repeatMode === 'one') {
            // Replay same surah
            nextSurahId = activeSurah.id;
        } else {
            // Next surah (1-114)
            if (activeSurah.id < 114) {
                nextSurahId = activeSurah.id + 1;
            } else {
                // End of Quran, loop to 1
                nextSurahId = 1;
            }
        }

        // Get surah list to find next surah data
        const surahsData = await chrome.storage.local.get(['zikr_surahs_list']);
        const surahs = surahsData.zikr_surahs_list || [];
        const nextSurah = surahs.find((s: any) => s.id === nextSurahId);

        if (!nextSurah) return;

        // Build audio URL using reciter's moshaf
        const moshaf = activeReciter.moshaf?.[0];
        if (!moshaf?.server) return;

        const padSurahId = nextSurahId.toString().padStart(3, '0');
        const nextUrl = `${moshaf.server}${padSurahId}.mp3`;

        // Update storage
        await chrome.storage.local.set({ [STORAGE_KEYS.ACTIVE_SURAHS]: nextSurah });
        await chrome.storage.local.set({ 'zikr_last_surah': nextSurahId });

        // Play in offscreen
        await ensureOffscreenDocument();
        chrome.runtime.sendMessage({
            target: 'offscreen',
            type: 'PLAY',
            payload: { url: nextUrl }
        });

        // Notify popup (if open)
        try {
            chrome.runtime.sendMessage({
                target: 'popup',
                type: 'NEXT_TRACK_STARTED',
                payload: { surah: nextSurah }
            }).catch(() => {
                // Popup might not be open
            });
        } catch (e) {
            // Ignore errors
        }
    } catch (error) {
        console.error('Failed to handle next track:', error);
    }
}

// Message listener - minimal routing
chrome.runtime.onMessage.addListener((message) => {
    // Handle audio-ended event from offscreen for auto-advance
    if (message.type === 'AUDIO_ENDED') {
        handleNextTrack();
        return false;
    }

    // Forward messages to offscreen if needed (for now, popup talks directly to offscreen)
    if (message.target === 'offscreen') {
        ensureOffscreenDocument();
        return false; // Let the message pass through
    }

    return false;
});

// Install handler
chrome.runtime.onInstalled.addListener(() => {
    console.log('Zikr Extension Installed');
    ensureOffscreenDocument();
});

// Startup handler
chrome.runtime.onStartup.addListener(() => {
    ensureOffscreenDocument();
});
