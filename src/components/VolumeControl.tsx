import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Volume2, VolumeX, Volume1 } from 'lucide-react';

interface VolumeControlProps {
    volume: number;
    onVolumeChange: (volume: number) => void;
}

const VolumeControl: React.FC<VolumeControlProps> = ({ volume, onVolumeChange }) => {
    const { t } = useTranslation();
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    // Click outside to close
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen]);

    const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newVolume = parseFloat(e.target.value);
        onVolumeChange(newVolume);
    };

    const toggleVolumePanel = () => {
        setIsOpen(!isOpen);
    };

    // Get appropriate icon based on volume level
    const VolumeIcon = volume === 0 ? VolumeX : volume < 0.5 ? Volume1 : Volume2;

    return (
        <div ref={containerRef} className="relative flex items-center">
            {/* Volume Icon Button */}
            <button
                onClick={toggleVolumePanel}
                className={`p-2 rounded-full transition-all duration-300 ${isOpen
                    ? 'text-primary'
                    : 'text-primary hover:opacity-80'
                    }`}
                style={{
                    backgroundColor: isOpen ? 'rgba(197, 160, 89, 0.2)' : 'transparent'
                }}
                aria-label={t('player.volumeControl')}
            >
                <VolumeIcon size={16} className="transition-transform duration-300" />
            </button>

            {/* Floating Volume Slider Panel */}
            {isOpen && (
                <div
                    className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 animate-volume-appear"
                    style={{ minWidth: '40px' }}
                >
                    {/* Arrow pointing down to icon */}
                    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-full">
                        <div className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[6px]"
                             style={{ borderTopColor: 'var(--glass-border)' }} />
                    </div>

                    {/* Volume Bar Container */}
                    <div className="rounded-2xl p-4 shadow-2xl"
                         style={{ 
                             backgroundColor: 'var(--bg-card)',
                             border: '1px solid var(--border-color)',
                             backdropFilter: 'blur(20px)',
                             WebkitBackdropFilter: 'blur(20px)'
                         }}>
                        <div className="flex flex-col items-center gap-3">
                            {/* Percentage Display */}
                            <div className="text-xs font-bold text-primary tabular-nums">
                                {Math.round(volume * 100)}%
                            </div>

                            {/* Vertical Slider */}
                            <div className="relative w-1 h-24 rounded-full overflow-visible"
                                 style={{ backgroundColor: 'var(--border-color)' }}>
                                {/* Filled portion */}
                                <div
                                    className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-primary to-primary-light rounded-full transition-all duration-150"
                                    style={{ height: `${volume * 100}%` }}
                                />

                                {/* Slider input (invisible but functional) */}
                                <input
                                    type="range"
                                    min="0"
                                    max="1"
                                    step="0.01"
                                    value={volume}
                                    onChange={handleVolumeChange}
                                    className="volume-slider absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                    style={{
                                        writingMode: 'bt-lr' as any,
                                        WebkitAppearance: 'slider-vertical',
                                        width: '100%',
                                        height: '100%'
                                    } as React.CSSProperties}
                                    aria-label={t('player.volumeLevel')}
                                />

                                {/* Interactive thumb */}
                                <div
                                    className="absolute left-1/2 -translate-x-1/2 w-3 h-3 bg-primary rounded-full shadow-lg pointer-events-none transition-all duration-150"
                                    style={{
                                        bottom: `calc(${volume * 100}% - 6px)`,
                                        transform: 'translateX(-50%) scale(1)',
                                        boxShadow: '0 0 10px rgba(197, 160, 89, 0.5)',
                                        border: '2px solid rgba(255, 255, 255, 0.3)'
                                    }}
                                />
                            </div>

                            {/* Mute/Unmute Button */}
                            <button
                                onClick={() => onVolumeChange(volume === 0 ? 0.5 : 0)}
                                className="p-1.5 rounded-lg transition-colors hover:text-primary"
                                style={{ color: 'var(--text-muted)' }}
                                aria-label={volume === 0 ? t('player.unmute') : t('player.mute')}
                            >
                                {volume === 0 ? (
                                    <VolumeX size={14} />
                                ) : (
                                    <Volume2 size={14} />
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default VolumeControl;
