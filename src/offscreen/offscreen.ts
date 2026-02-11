/// <reference types="chrome" />

// Audio player logic running in offscreen document
const audio = document.getElementById('audio-player') as HTMLAudioElement;

// Current state
let audioState = {
    isPlaying: false,
    currentTime: 0,
    duration: 0,
    volume: 0.7,
    isLooping: false,
    currentUrl: null as string | null,
};

// Send status updates back to the extension (popup)
function sendStatus() {
    audioState = {
        isPlaying: !audio.paused,
        currentTime: audio.currentTime,
        duration: audio.duration || 0,
        volume: audio.volume,
        isLooping: audio.loop,
        currentUrl: audio.src,
    };

    try {
        chrome.runtime.sendMessage({
            target: 'popup',
            type: 'AUDIO_STATUS_UPDATE',
            payload: audioState
        }).catch(() => {
            // Popup might be closed, that's fine
        });
    } catch (e) {
        // Ignore errors
    }
}

// Listen for messages from the extension
chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
    if (message.target !== 'offscreen') return false;

    const handleMessage = async () => {
        switch (message.type) {
            case 'PLAY':
                if (message.payload?.url) {
                    if (audio.src !== message.payload.url) {
                        audio.src = message.payload.url;
                        audio.load();
                    }
                    
                    try {
                        await audio.play();
                        sendResponse({ success: true });
                    } catch (err) {
                        console.error('Audio play error:', err);
                        sendResponse({ success: false, error: (err as Error).message });
                    }
                } else {
                    if (audio.src && audio.paused) {
                        try {
                            await audio.play();
                            sendResponse({ success: true });
                        } catch (err) {
                            console.error('Audio resume error:', err);
                            sendResponse({ success: false, error: (err as Error).message });
                        }
                    } else {
                        sendResponse({ success: false, error: 'No audio URL set' });
                    }
                }
                sendStatus();
                break;

            case 'PAUSE':
                audio.pause();
                sendStatus();
                sendResponse({ success: true });
                break;

            case 'TOGGLE_PLAY':
                if (audio.paused) {
                    if (audio.src) {
                        try {
                            await audio.play();
                            sendResponse({ success: true, isPlaying: true });
                        } catch (err) {
                            console.error('Audio play error:', err);
                            sendResponse({ success: false, error: (err as Error).message });
                        }
                    } else {
                        sendResponse({ success: false, error: 'No audio URL set' });
                    }
                } else {
                    audio.pause();
                    sendResponse({ success: true, isPlaying: false });
                }
                sendStatus();
                break;

            case 'STOP':
                audio.pause();
                audio.currentTime = 0;
                sendStatus();
                sendResponse({ success: true });
                break;

            case 'SET_VOLUME':
                if (typeof message.payload?.volume === 'number') {
                    const volume = Math.max(0, Math.min(1, message.payload.volume));
                    audio.volume = volume;
                    sendStatus();
                    sendResponse({ success: true });
                } else {
                    sendResponse({ success: false, error: 'Invalid volume value' });
                }
                break;

            case 'SEEK':
                if (typeof message.payload?.time === 'number') {
                    audio.currentTime = message.payload.time;
                    sendStatus();
                    sendResponse({ success: true });
                } else {
                    sendResponse({ success: false, error: 'Invalid time value' });
                }
                break;

            case 'SET_LOOP':
                audio.loop = message.payload?.loop || false;
                sendStatus();
                sendResponse({ success: true });
                break;

            case 'SET_URL':
                if (message.payload?.url) {
                    const wasPlaying = !audio.paused;
                    audio.src = message.payload.url;
                    audio.load();
                    
                    if (wasPlaying || message.payload?.autoPlay) {
                        try {
                            await audio.play();
                            sendResponse({ success: true });
                        } catch (err) {
                            console.error('Audio play error after setting URL:', err);
                            sendResponse({ success: false, error: (err as Error).message });
                        }
                    } else {
                        sendResponse({ success: true });
                    }
                    sendStatus();
                } else {
                    sendResponse({ success: false, error: 'No URL provided' });
                }
                break;

            case 'GET_STATUS':
                sendStatus();
                sendResponse({ success: true, state: audioState });
                break;

            default:
                sendResponse({ success: false, error: 'Unknown message type' });
                break;
        }
    };

    handleMessage().catch((err) => {
        console.error('Error handling message:', err);
        sendResponse({ success: false, error: err.message });
    });

    return true;
});

// Attach event listeners to audio element
audio.addEventListener('timeupdate', sendStatus);
audio.addEventListener('play', sendStatus);
audio.addEventListener('pause', sendStatus);
audio.addEventListener('loadedmetadata', sendStatus);

audio.addEventListener('ended', () => {
    sendStatus();
    try {
        chrome.runtime.sendMessage({ target: 'popup', type: 'AUDIO_ENDED' }).catch(() => {
            // Popup might be closed
        });
        // Also notify service worker
        chrome.runtime.sendMessage({ type: 'AUDIO_ENDED' }).catch(() => {
            // SW might not respond
        });
    } catch (e) {
        // Ignore errors
    }
});

audio.addEventListener('error', (e) => {
    console.error('Audio error:', e);
    try {
        chrome.runtime.sendMessage({ 
            target: 'popup', 
            type: 'AUDIO_ERROR', 
            payload: { 
                error: 'Playback failed',
                url: audio.src,
                code: (e.target as any).error?.code
            }
        }).catch(() => {
            // Popup might be closed
        });
    } catch (err) {
        // Ignore errors
    }
});

// Initialize volume from storage
chrome.storage.local.get(['zikr_last_volume'], (result) => {
    if (result.zikr_last_volume !== undefined) {
        audio.volume = result.zikr_last_volume;
        sendStatus();
    }
});

console.log('Offscreen audio player initialized');
