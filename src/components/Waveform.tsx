import React from 'react';

const Waveform: React.FC<{ isPlaying: boolean }> = ({ isPlaying }) => {
    const bars = Array.from({ length: 60 });

    return (
        <div className="w-full px-0 my-4">
            <div
                className="flex items-center justify-center gap-[2px] h-16 w-full opacity-80"
                style={{
                    filter: 'drop-shadow(0 0 8px rgba(197, 160, 89, 0.6)) drop-shadow(0 0 12px rgba(197, 160, 89, 0.4))',
                }}
            >
                {bars.map((_, i) => (
                    <div
                        key={i}
                        className="flex-1 bg-gradient-to-t from-primary via-primary-light to-primary rounded-full"
                        style={{
                            height: isPlaying ? 'auto' : '6px',
                            animation: isPlaying ? `waveform 1.2s ease-in-out infinite` : 'none',
                            animationDelay: `${i * 0.02}s`,
                            minHeight: '4px',
                            maxWidth: '4px',
                            boxShadow: isPlaying
                                ? '0 0 4px rgba(197, 160, 89, 0.8), 0 0 8px rgba(197, 160, 89, 0.5)'
                                : '0 0 2px rgba(197, 160, 89, 0.4)',
                        }}
                    />
                ))}
                <style>{`
          @keyframes waveform {
            0%, 100% { height: 15%; }
            50% { height: 100%; }
          }
        `}</style>
            </div>
        </div>
    );
};

export default Waveform;
