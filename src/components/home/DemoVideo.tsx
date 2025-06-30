import { useState, useRef, useEffect } from 'react';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { Card } from '@/components/ui/card';
import { Play, Pause, Volume2, VolumeX, Loader2, ExternalLink } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function DemoVideo() {
  const { toast } = useToast();
  const [isHovered, setIsHovered] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const playerRef = useRef<HTMLDivElement>(null);
  const youtubePlayerRef = useRef<YT.Player | null>(null);
  
  // YouTube video ID from the provided URL
  const videoId = 'pzKv1baC9m0';

  useEffect(() => {
    // Load YouTube API
    const tag = document.createElement('script');
    tag.src = 'https://www.youtube.com/iframe_api';
    const firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);

    // Initialize player when API is ready
    window.onYouTubeIframeAPIReady = () => {
      if (playerRef.current) {
        youtubePlayerRef.current = new YT.Player(playerRef.current, {
          videoId: videoId,
          playerVars: {
            autoplay: 0,
            controls: 0,
            disablekb: 1,
            enablejsapi: 1,
            fs: 0,
            iv_load_policy: 3,
            modestbranding: 1,
            rel: 0,
            showinfo: 0
          },
          events: {
            onReady: onPlayerReady,
            onStateChange: onPlayerStateChange,
            onError: onPlayerError
          }
        });
      }
    };

    return () => {
      // Clean up
      if (youtubePlayerRef.current) {
        youtubePlayerRef.current.destroy();
      }
      window.onYouTubeIframeAPIReady = null;
    };
  }, []);

  const onPlayerReady = (event: YT.PlayerEvent) => {
    setIsLoading(false);
    event.target.mute();
    setIsMuted(true);
  };

  const onPlayerStateChange = (event: YT.OnStateChangeEvent) => {
    if (event.data === YT.PlayerState.PLAYING) {
      setIsPlaying(true);
    } else if (event.data === YT.PlayerState.PAUSED || event.data === YT.PlayerState.ENDED) {
      setIsPlaying(false);
    }
  };
  
  const onPlayerError = (event: YT.OnErrorEvent) => {
    console.error('YouTube player error:', event.data);
    setIsLoading(false);
    toast({
      title: "Video Error",
      description: "There was an issue loading the demo video. Please try again later.",
      variant: "destructive"
    });
  };

  const handlePlayPause = () => {
    if (!youtubePlayerRef.current) return;
    
    try {
      if (isPlaying) {
        youtubePlayerRef.current.pauseVideo();
      } else {
        youtubePlayerRef.current.playVideo();
      }
    } catch (error) {
      console.error('Error controlling YouTube player:', error);
      toast({
        title: "Playback Error",
        description: "There was an issue controlling the video. Please try again.",
        variant: "destructive"
      });
    }
  };
  
  const handleMuteToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!youtubePlayerRef.current) return;
    
    try {
      if (isMuted) {
        youtubePlayerRef.current.unMute();
        setIsMuted(false);
      } else {
        youtubePlayerRef.current.mute();
        setIsMuted(true);
      }
    } catch (error) {
      console.error('Error toggling mute:', error);
    }
  };
  
  const openYouTube = (e: React.MouseEvent) => {
    e.stopPropagation();
    window.open(`https://youtu.be/${videoId}`, '_blank');
  };

  return (
    <Card 
      className="overflow-hidden border-2 border-primary/50 shadow-[0_0_15px_rgba(120,_0,_255,_0.3)]"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <AspectRatio ratio={16/9}>
        <div className="relative w-full h-full bg-black">
          {/* YouTube Player Container */}
          <div 
            ref={playerRef}
            className="w-full h-full"
          />
          
          {/* Loading state */}
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/80 z-10">
              <Loader2 className="w-10 h-10 text-primary animate-spin" />
            </div>
          )}
          
          {/* Overlay - only show when paused or hovered */}
          <div className={`absolute inset-0 bg-gradient-to-t from-black/60 to-transparent pointer-events-none transition-opacity duration-300 ${
            isPlaying && !isHovered ? 'opacity-0' : 'opacity-100'
          }`}>
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
          
          {/* Play button - hide when playing and not hovered */}
          <button 
            className={`absolute inset-0 flex items-center justify-center transition-all duration-300 ${
              isPlaying && !isHovered ? 'opacity-0 pointer-events-none' : 'opacity-100'
            } ${isHovered ? 'bg-black/40' : 'bg-black/20'}`}
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
          
          {/* Control buttons - always visible */}
          <div className={`absolute bottom-4 right-4 flex items-center space-x-2 transition-opacity duration-300 ${
            isPlaying && !isHovered ? 'opacity-0' : 'opacity-100'
          }`}>
            <button
              className="w-8 h-8 bg-black/50 rounded-full flex items-center justify-center text-white hover:bg-black/70 transition-colors"
              onClick={handleMuteToggle}
            >
              {isMuted ? (
                <VolumeX size={16} />
              ) : (
                <Volume2 size={16} />
              )}
            </button>
            <button
              className="w-8 h-8 bg-black/50 rounded-full flex items-center justify-center text-white hover:bg-black/70 transition-colors"
              onClick={openYouTube}
            >
              <ExternalLink size={16} />
            </button>
          </div>
          
          {/* Video title - fade out when playing */}
          <div className={`absolute top-4 left-0 px-3 py-1 bg-black/80 text-white font-mono text-sm transition-opacity duration-300 ${
            isPlaying && !isHovered ? 'opacity-0' : 'opacity-100'
          }`}>
            Legalish Demo: Analyzing Terms of Service in Seconds
          </div>
        </div>
      </AspectRatio>
    </Card>
  );
}

// Add TypeScript declaration for YouTube IFrame API
declare global {
  interface Window {
    onYouTubeIframeAPIReady: () => void;
    YT: typeof YT;
  }
}