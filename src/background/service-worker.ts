/// <reference types="chrome" />

// Constants
const OFFSCREEN_DOCUMENT_PATH = 'src/offscreen/index.html';

// Ideally, we check if an offscreen document exists before creating one.
async function ensureOffscreenDocument() {
    const existingContexts = await chrome.runtime.getContexts({
        contextTypes: [chrome.runtime.ContextType.OFFSCREEN_DOCUMENT],
    });

    if (existingContexts.length > 0) {
        return;
    }

    // Create the offscreen document
    await chrome.offscreen.createDocument({
        url: OFFSCREEN_DOCUMENT_PATH,
        reasons: [chrome.offscreen.Reason.AUDIO_PLAYBACK],
        justification: 'Playing Quran audio in the background',
    });
}

// Function to handle next track via SW (background playback)
async function handleNextTrack() {
    const data = await chrome.storage.local.get(['activeReciter', 'activeSurah', 'repeatMode']);
    const { activeReciter, activeSurah, repeatMode } = data;

    if (!activeReciter || !activeSurah) return;

    let nextSurahId = activeSurah.id;

    if (repeatMode === 'one') {
        // Replay same
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

    // Construct URL
    const moshaf = activeReciter.moshaf[0]; // Assuming first moshaf
    if (!moshaf) return;

    const padSurahId = nextSurahId.toString().padStart(3, '0');
    const nextUrl = `${moshaf.server}${padSurahId}.mp3`;

    // Update Storage
    const nextSurah = {
        id: nextSurahId,
        name: `Surah ${nextSurahId}`, // Placeholder, UI will update name on load
        audioUrl: nextUrl
    };

    await chrome.storage.local.set({ activeSurah: nextSurah });

    // Play
    await ensureOffscreenDocument();

    // We send PLAY_REQUEST effectively
    chrome.runtime.sendMessage({
        target: 'offscreen',
        type: 'PLAY',
        payload: { url: nextUrl }
    });
}

// Listen for messages from popup or other parts
chrome.runtime.onMessage.addListener(async (message) => {
    // If we receive AUDIO_ENDED from offscreen (relayed or direct), we handle next track
    if (message.type === 'AUDIO_ENDED') {
        handleNextTrack();
        return;
    }

    if (message.target === 'offscreen') {
        await ensureOffscreenDocument();

        if (message.type === 'PLAY_REQUEST') {
            chrome.runtime.sendMessage({ target: 'offscreen', type: 'PLAY', payload: message.payload });
        } else if (message.type === 'PAUSE_REQUEST') {
            chrome.runtime.sendMessage({ target: 'offscreen', type: 'PAUSE' });
        } else if (message.type === 'RESUME_REQUEST') {
            chrome.runtime.sendMessage({ target: 'offscreen', type: 'RESUME' });
        } else if (message.type === 'VOLUME_REQUEST') {
            chrome.runtime.sendMessage({ target: 'offscreen', type: 'SET_VOLUME', payload: message.payload });
        } else if (message.type === 'SEEK') {
            chrome.runtime.sendMessage({ target: 'offscreen', type: 'SEEK', payload: message.payload });
        }
    }
});

// Activate SW
chrome.runtime.onInstalled.addListener(() => {
    console.log('Zikr Extension Installed');
    ensureOffscreenDocument();
});
