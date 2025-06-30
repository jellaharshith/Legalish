import { useState } from 'react';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { Card } from '@/components/ui/card';
import { Play, Pause, Volume2, VolumeX } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function DemoVideo() {
  const { toast } = useToast();
  const [isHovered, setIsHovered] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [videoLoaded, setVideoLoaded] = useState(false);
  
  const handlePlayPause = () => {
    const video = document.getElementById('demo-video') as HTMLVideoElement;
    if (video) {
      if (isPlaying) {
        video.pause();
      } else {
        video.play().catch(error => {
          console.error('Error playing video:', error);
          toast({
            title: "Playback Error",
            description: "The video couldn't be played automatically. Please try again.",
            variant: "destructive"
          });
        });
      }
      setIsPlaying(!isPlaying);
    }
  };
  
  const handleMuteToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    const video = document.getElementById('demo-video') as HTMLVideoElement;
    if (video) {
      video.muted = !video.muted;
      setIsMuted(!isMuted);
    }
  };
  
  const handleVideoLoad = () => {
    setVideoLoaded(true);
  };

  return (
    <Card 
      className="overflow-hidden border-2 border-primary/50 shadow-[0_0_15px_rgba(120,_0,_255,_0.3)]"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <AspectRatio ratio={16/9}>
        <div className="relative w-full h-full bg-black">
          {/* Video Element */}
          <video 
            id="demo-video"
            className={`w-full h-full object-cover ${videoLoaded ? 'opacity-100' : 'opacity-0'} transition-opacity duration-500`}
            src="/demo-video.mp4"
            poster="/demo-poster.jpg"
            muted={isMuted}
            playsInline
            onLoadedData={handleVideoLoad}
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
            onEnded={() => setIsPlaying(false)}
          />
          
          {/* Loading state */}
          {!videoLoaded && (
            <div className="absolute inset-0 flex items-center justify-center bg-black">
              <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
          )}
          
          {/* Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent">
            <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center">
                  <span className="text-white font-bold text-xs">L</span>
                </div>
                <div>
                  <p className="text-white font-bold text-sm">Legalish_Demo</p>
                  <p className="text-gray-300 text-xs">Legal terms analysis</p>
                </div>
              </div>
              <div className="px-2 py-1 bg-red-500 rounded text-white text-xs font-bold">
                DEMO
              </div>
            </div>
          </div>
          
          {/* Play button */}
          <button 
            className={`absolute inset-0 flex items-center justify-center transition-all duration-300 ${
              isHovered ? 'bg-black/40' : 'bg-black/20'
            }`}
            onClick={handlePlayPause}
          >
            <div className={`bg-primary rounded-full w-16 h-16 flex items-center justify-center transition-all duration-300 ${
              isHovered ? 'scale-110' : 'scale-100'
            }`}>
              {isPlaying ? (
                <Pause size={30} className="text-white" />
              ) : (
                <Play size={30} className="text-white ml-1" />
              )}
            </div>
          </button>
          
          {/* Mute button */}
          <button
            className="absolute bottom-4 right-4 w-8 h-8 bg-black/50 rounded-full flex items-center justify-center text-white hover:bg-black/70 transition-colors"
            onClick={handleMuteToggle}
          >
            {isMuted ? (
              <VolumeX size={16} />
            ) : (
              <Volume2 size={16} />
            )}
          </button>
          
          {/* Video title */}
          <div className="absolute top-4 left-0 px-3 py-1 bg-black/80 text-white font-mono text-sm">
            Legalish Demo: Analyzing Terms of Service in Seconds
          </div>
        </div>
      </AspectRatio>
    </Card>
  );
}