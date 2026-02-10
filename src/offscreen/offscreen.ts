/// <reference types="chrome" />

// Audio player logic running in offscreen document
const audio = document.getElementById('audio-player') as HTMLAudioElement;

// Listen for messages from the extension
chrome.runtime.onMessage.addListener(async (message) => {
    if (message.target !== 'offscreen') return;

    switch (message.type) {
        case 'PLAY':
            if (message.payload.url) {
                audio.src = message.payload.url;
                audio.load();
            }
            try {
                await audio.play();
            } catch (err) {
                console.error('Audio play error:', err);
            }
            break;
        case 'PAUSE':
            audio.pause();
            break;
        case 'SET_VOLUME':
            audio.volume = message.payload.volume; // 0.0 to 1.0
            break;
        case 'SEEK':
            audio.currentTime = message.payload.time;
            break;
        case 'GET_STATUS':
            sendStatus();
            break;
    }
});

// Send status updates back to the extension (popup)
function sendStatus() {
    chrome.runtime.sendMessage({
        target: 'popup',
        type: 'AUDIO_STATUS_UPDATE',
        payload: {
            isPlaying: !audio.paused,
            currentTime: audio.currentTime,
            duration: audio.duration,
            volume: audio.volume,
            ended: audio.ended
        }
    });
}

// Attach event listeners to audio element
audio.addEventListener('timeupdate', sendStatus);
audio.addEventListener('play', sendStatus);
audio.addEventListener('pause', sendStatus);
audio.addEventListener('ended', () => {
    sendStatus();
    chrome.runtime.sendMessage({ target: 'popup', type: 'AUDIO_ENDED' });
});
audio.addEventListener('error', (e) => {
    console.error("Audio Error", e);
    chrome.runtime.sendMessage({ target: 'popup', type: 'AUDIO_ERROR', payload: { error: "Playback Error" } });
});

// Keep-alive mechanism (optional, but good practice if needed)
setInterval(() => {
    if (!audio.paused) {
        // If playing, we might need to ping the SW to keep it alive via runtime connection, 
        // but offscreen docs generally persist as long as media plays.
    }
}, 10000);
