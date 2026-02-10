import React, { useRef, useState, useEffect } from 'react';

interface ProgressBarProps {
    currentTime: number;
    duration: number;
    onSeek: (time: number) => void;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ currentTime, duration, onSeek }) => {
    const [isDragging, setIsDragging] = useState(false);
    const [dragValue, setDragValue] = useState(0);
    const [hoverPercent, setHoverPercent] = useState<number | null>(null);
    const trackRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!isDragging) {
            setDragValue(currentTime);
        }
    }, [currentTime, isDragging]);

    const handleSeekStart = (e: React.MouseEvent | React.TouchEvent) => {
        setIsDragging(true);
        updateSeek(e);
    };

    const handleSeekMove = (e: any) => {
        if (isDragging) updateSeek(e);
    };

    const handleSeekEnd = () => {
        if (isDragging) {
            setIsDragging(false);
            onSeek(dragValue);
        }
    };

    const updateSeek = (e: any) => {
        if (!trackRef.current) return;
        const rect = trackRef.current.getBoundingClientRect();
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const percent = Math.min(Math.max((clientX - rect.left) / rect.width, 0), 1);
        setDragValue(percent * (duration || 0));
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!trackRef.current) return;
        const rect = trackRef.current.getBoundingClientRect();
        const percent = Math.min(Math.max((e.clientX - rect.left) / rect.width, 0), 1);
        setHoverPercent(percent);
    };

    // Attach global listeners for dragging outside component range
    useEffect(() => {
        if (isDragging) {
            window.addEventListener('mousemove', handleSeekMove);
            window.addEventListener('mouseup', handleSeekEnd);
            window.addEventListener('touchmove', handleSeekMove);
            window.addEventListener('touchend', handleSeekEnd);
        }
        return () => {
            window.removeEventListener('mousemove', handleSeekMove);
            window.removeEventListener('mouseup', handleSeekEnd);
            window.removeEventListener('touchmove', handleSeekMove);
            window.removeEventListener('touchend', handleSeekEnd);
        };
    }, [isDragging, dragValue]);

    const formatTime = (time: number) => {
        if (!time || isNaN(time)) return "0:00";
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60);
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    };

    const progressPercent = duration ? (dragValue / duration) * 100 : 0;

    return (
        <div className="w-full mb-6 group select-none">
            {/* Labels */}
            <div className="flex justify-between text-[10px] font-medium tracking-wider text-white/30 mb-2 group-hover:text-white/60 transition-colors font-mono">
                <span className={isDragging ? 'text-primary' : ''}>{formatTime(dragValue)}</span>
                <span>{formatTime(duration)}</span>
            </div>

            {/* Hit Area */}
            <div
                ref={trackRef}
                className="relative h-6 w-full flex items-center cursor-pointer"
                onMouseDown={handleSeekStart}
                onTouchStart={handleSeekStart}
                onMouseMove={handleMouseMove}
                onMouseLeave={() => setHoverPercent(null)}
            >
                {/* Background Track */}
                <div className="absolute w-full h-[2px] bg-white/10 rounded-full overflow-hidden transition-all duration-300 group-hover:h-[4px]">
                    {/* Hover Preview */}
                    {hoverPercent !== null && (
                        <div
                            className="absolute h-full bg-white/10"
                            style={{ width: `${hoverPercent * 100}%` }}
                        />
                    )}
                    {/* Active Progress */}
                    <div
                        className="h-full bg-gradient-to-r from-primary to-accent shadow-[0_0_10px_rgba(242,202,80,0.5)] relative"
                        style={{ width: `${progressPercent}%` }}
                    >
                        <div className="absolute right-0 top-0 bottom-0 w-2 bg-white/50 blur-[2px]" />
                    </div>
                </div>

                {/* Thumb Handle - Smooth Scale on Hover */}
                <div
                    className={`absolute w-3 h-3 bg-white border border-primary rounded-full shadow-[0_0_10px_rgba(255,255,255,0.5)] pointer-events-none transition-all duration-200 ease-out ${isDragging || hoverPercent !== null ? 'scale-125 opacity-100' : 'scale-0 opacity-0 group-hover:opacity-100 group-hover:scale-100'}`}
                    style={{ left: `${progressPercent}%`, transform: `translate(-50%, 0) scale(${isDragging ? 1.5 : 1})` }}
                />
            </div>
        </div>
    );
};

export default ProgressBar;
