import { useState, useEffect } from 'react';

interface SpeedrunTimerProps {
  isRunning: boolean;
  time: number;
}

export default function SpeedrunTimer({ isRunning, time }: SpeedrunTimerProps) {
  const formatTime = (ms: number) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    const milliseconds = Math.floor((ms % 1000) / 10);
    
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${milliseconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className={`px-2 py-1 font-mono text-sm rounded-md ${isRunning ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground'}`}>
      {formatTime(time)}
    </div>
  );
}