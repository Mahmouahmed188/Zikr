import React, { useEffect, useRef, useCallback, useState } from 'react';
import { usePlayer } from '../context/PlayerContext';
import QuranAPIService from '../services/quranAPIService';

const Waveform: React.FC = () => {
    const { isPlaying, currentSurah, currentReciter } = usePlayer();
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const animationRef = useRef<number>();
    const audioContextRef = useRef<AudioContext | null>(null);
    const analyserRef = useRef<AnalyserNode | null>(null);
    const sourceRef = useRef<MediaElementAudioSourceNode | null>(null);
    const audioElementRef = useRef<HTMLAudioElement | null>(null);
    const [isAudioReady, setIsAudioReady] = useState(false);

    const BAR_COUNT = 60;
    const FFT_SIZE = 128;
    const MIN_BAR_HEIGHT = 4;
    const MAX_BAR_HEIGHT = 60;

    const initializeAudioContext = useCallback(() => {
        if (!audioContextRef.current) {
            const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
            audioContextRef.current = new AudioContextClass();
            
            // Create analyser
            analyserRef.current = audioContextRef.current.createAnalyser();
            analyserRef.current.fftSize = FFT_SIZE;
            analyserRef.current.smoothingTimeConstant = 0.8;
        }
    }, []);

    const resumeAudioContext = useCallback(async () => {
        const ctx = audioContextRef.current;
        if (ctx && ctx.state === 'suspended') {
            await ctx.resume();
        }
    }, []);

    const connectAudio = useCallback(async (url: string) => {
        try {
            setIsAudioReady(false);
            
            // Cleanup existing connections first
            if (sourceRef.current) {
                sourceRef.current.disconnect();
                sourceRef.current = null;
            }
            if (audioElementRef.current) {
                audioElementRef.current.pause();
                audioElementRef.current.remove();
                audioElementRef.current = null;
            }

            initializeAudioContext();
            await resumeAudioContext();

            const ctx = audioContextRef.current;
            const analyser = analyserRef.current;
            if (!ctx || !analyser) return;

            // Create hidden audio element
            const audio = new Audio(url);
            audio.crossOrigin = 'anonymous';
            audio.preload = 'auto';
            audioElementRef.current = audio;

            // Create source and connect to analyser
            const source = ctx.createMediaElementSource(audio);
            sourceRef.current = source;

            // Connect: source -> analyser -> gainNode -> destination (but mute it)
            const gainNode = ctx.createGain();
            gainNode.gain.value = 0; // Mute audio in popup (audio plays in offscreen)
            
            source.connect(analyser);
            analyser.connect(gainNode);
            gainNode.connect(ctx.destination);

            // Set up event listeners for proper initialization
            const onCanPlay = () => {
                setIsAudioReady(true);
                audio.removeEventListener('canplay', onCanPlay);
                // Start audio silently to get frequency data
                audio.play().catch((err) => {
                    console.log('Audio play caught (expected for muted audio):', err);
                });
            };

            const onPlay = () => {
                setIsAudioReady(true);
            };

            audio.addEventListener('canplay', onCanPlay);
            audio.addEventListener('play', onPlay);

            // Load and prepare
            audio.load();
        } catch (error) {
            console.error('Failed to connect audio:', error);
        }
    }, [initializeAudioContext, resumeAudioContext]);

    const drawWaveform = useCallback(() => {
        const canvas = canvasRef.current;
        const analyser = analyserRef.current;
        if (!canvas || !analyser) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Set canvas size
        const rect = canvas.getBoundingClientRect();
        canvas.width = rect.width * window.devicePixelRatio;
        canvas.height = rect.height * window.devicePixelRatio;
        ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

        const width = rect.width;
        const height = rect.height;

        // Clear canvas
        ctx.clearRect(0, 0, width, height);

        // Get frequency data
        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        (analyser.getByteFrequencyData as (array: Uint8Array) => void)(dataArray);

        // Draw bars
        const barWidth = (width - (BAR_COUNT - 1) * 2) / BAR_COUNT;
        const startX = 0;

        // Create gradient
        const gradient = ctx.createLinearGradient(0, height, 0, 0);
        gradient.addColorStop(0, '#C5A059'); // primary
        gradient.addColorStop(0.5, '#D4B67A'); // primary-light
        gradient.addColorStop(1, '#C5A059'); // primary

        for (let i = 0; i < BAR_COUNT; i++) {
            // Map bar index to frequency bin
            const binIndex = Math.floor((i / BAR_COUNT) * (bufferLength * 0.7));
            const value = dataArray[binIndex] || 0;

            // Calculate bar height
            let barHeight: number;
            
            if (isPlaying && isAudioReady) {
                // Normalize frequency to bar height (0-255 -> 0-1 -> MIN-MAX)
                const normalizedValue = value / 255;
                barHeight = MIN_BAR_HEIGHT + (normalizedValue * (MAX_BAR_HEIGHT - MIN_BAR_HEIGHT));
            } else {
                // Flat line when paused or not ready
                barHeight = MIN_BAR_HEIGHT;
            }

            const x = startX + i * (barWidth + 2);
            const y = (height - barHeight) / 2;

            // Draw bar with rounded corners
            ctx.fillStyle = gradient;
            ctx.beginPath();
            const radius = barWidth / 2;
            
            // Draw rounded bar (with fallback for browsers without roundRect)
            if ((ctx as any).roundRect) {
                if (barHeight >= radius * 2) {
                    ctx.roundRect(x, y, barWidth, barHeight, radius);
                } else {
                    ctx.roundRect(x, y, barWidth, barHeight, barHeight / 2);
                }
            } else {
                // Fallback: draw rectangle
                ctx.rect(x, y, barWidth, barHeight);
            }
            ctx.fill();

            // Add glow effect when playing and has frequency data
            if (isPlaying && isAudioReady && value > 50) {
                const glowIntensity = value / 255;
                ctx.shadowColor = 'rgba(197, 160, 89, 0.8)';
                ctx.shadowBlur = 8 * glowIntensity;
                ctx.fill();
                ctx.shadowBlur = 0;
            }
        }

        animationRef.current = requestAnimationFrame(drawWaveform);
    }, [isPlaying, isAudioReady]);

    // Setup audio connection when surah/reciter changes
    useEffect(() => {
        const setupAudio = async () => {
            if (!currentSurah || !currentReciter) {
                setIsAudioReady(false);
                return;
            }

            const api = new QuranAPIService();
            await api.initialize();
            
            const audioUrl = api.getSurahAudioUrl(currentReciter.id, currentSurah.id);
            if (audioUrl) {
                await connectAudio(audioUrl);
            }
        };

        setupAudio();

        return () => {
            // Cleanup connections (not the AudioContext itself)
            if (sourceRef.current) {
                sourceRef.current.disconnect();
                sourceRef.current = null;
            }
            if (audioElementRef.current) {
                audioElementRef.current.pause();
                audioElementRef.current.remove();
                audioElementRef.current = null;
            }
        };
    }, [currentSurah?.id, currentReciter?.id, connectAudio]);

    // Start/stop animation based on playing state and audio readiness
    useEffect(() => {
        if (isPlaying || isAudioReady) {
            drawWaveform();
        } else {
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
                animationRef.current = undefined;
            }
            // Draw one frame to show flat bars
            requestAnimationFrame(drawWaveform);
        }

        return () => {
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
                animationRef.current = undefined;
            }
        };
    }, [isPlaying, isAudioReady, drawWaveform]);

    // Resume AudioContext on user interaction (play button click)
    useEffect(() => {
        if (isPlaying) {
            resumeAudioContext();
        }
    }, [isPlaying, resumeAudioContext]);

    // Cleanup AudioContext on unmount only
    useEffect(() => {
        return () => {
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
            }
            if (sourceRef.current) {
                sourceRef.current.disconnect();
            }
            if (audioElementRef.current) {
                audioElementRef.current.pause();
                audioElementRef.current.remove();
            }
            if (audioContextRef.current) {
                audioContextRef.current.close();
            }
        };
    }, []);

    return (
        <div className="w-full px-0 my-4">
            <div
                className="flex items-center justify-center h-16 w-full opacity-80"
                style={{
                    filter: 'drop-shadow(0 0 8px rgba(197, 160, 89, 0.6)) drop-shadow(0 0 12px rgba(197, 160, 89, 0.4))',
                }}
            >
                <canvas
                    ref={canvasRef}
                    className="w-full h-full"
                    style={{ display: 'block' }}
                />
            </div>
        </div>
    );
};

export default Waveform;
