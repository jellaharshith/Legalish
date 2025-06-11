import { useState } from 'react';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { Card } from '@/components/ui/card';
import { Play } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function DemoVideo() {
  const { toast } = useToast();
  const [isHovered, setIsHovered] = useState(false);
  
  const handlePlayVideo = () => {
    toast({
      title: "Video Demo",
      description: "A real implementation would play a demo video here."
    });
  };

  return (
    <Card 
      className="overflow-hidden border-2 border-primary/50 shadow-[0_0_15px_rgba(120,_0,_255,_0.3)]"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <AspectRatio ratio={16/9}>
        <div className="relative w-full h-full bg-black">
          <img 
            src="https://images.pexels.com/photos/8721342/pexels-photo-8721342.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2" 
            alt="Computer screen with code" 
            className="w-full h-full object-cover opacity-70"
          />
          
          {/* Twitch-style overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent">
            <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center">
                  <span className="text-white font-bold text-xs">V</span>
                </div>
                <div>
                  <p className="text-white font-bold text-sm">VOLT_Official</p>
                  <p className="text-gray-300 text-xs">1.2K viewers</p>
                </div>
              </div>
              <div className="px-2 py-1 bg-red-500 rounded text-white text-xs font-bold">
                LIVE
              </div>
            </div>
          </div>
          
          {/* Play button */}
          <button 
            className={`absolute inset-0 flex items-center justify-center transition-all duration-300 ${
              isHovered ? 'bg-black/40' : 'bg-black/20'
            }`}
            onClick={handlePlayVideo}
          >
            <div className={`bg-primary rounded-full w-16 h-16 flex items-center justify-center transition-all duration-300 ${
              isHovered ? 'scale-110' : 'scale-100'
            }`}>
              <Play size={30} className="text-white ml-1" />
            </div>
          </button>
          
          {/* Stream title */}
          <div className="absolute top-4 left-0 px-3 py-1 bg-black/80 text-white font-mono text-sm">
            Speedrunning Adobe's ToS in under 30 seconds
          </div>
        </div>
      </AspectRatio>
    </Card>
  );
}