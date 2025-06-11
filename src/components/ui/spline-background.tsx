import { useEffect, useRef } from 'react';
import { Application } from '@splinetool/runtime';

export function SplineBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const splineAppRef = useRef<Application | null>(null);

  useEffect(() => {
    let mounted = true;

    const loadSpline = async () => {
      try {
        if (!mounted || !canvasRef.current) return;

        // Create Spline application
        const splineApp = new Application(canvasRef.current);
        splineAppRef.current = splineApp;

        // Load the scene
        await splineApp.load('https://prod.spline.design/SjjnJbdeX2Ves2Ba/scene.splinecode');

        console.log('Spline scene loaded successfully');
      } catch (error) {
        console.error('Error loading Spline scene:', error);
        
        // Fallback: Create a simple animated background
        if (canvasRef.current && mounted) {
          const canvas = canvasRef.current;
          const ctx = canvas.getContext('2d');
          
          if (ctx) {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            
            // Create animated gradient fallback
            let time = 0;
            const animate = () => {
              if (!mounted) return;
              
              time += 0.01;
              
              const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
              gradient.addColorStop(0, `hsl(${240 + Math.sin(time) * 20}, 70%, ${10 + Math.sin(time * 0.5) * 5}%)`);
              gradient.addColorStop(0.5, `hsl(${267 + Math.cos(time * 0.7) * 15}, 84%, ${15 + Math.cos(time * 0.3) * 5}%)`);
              gradient.addColorStop(1, `hsl(${290 + Math.sin(time * 1.2) * 25}, 60%, ${8 + Math.sin(time * 0.8) * 3}%)`);
              
              ctx.fillStyle = gradient;
              ctx.fillRect(0, 0, canvas.width, canvas.height);
              
              // Add floating particles
              ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
              for (let i = 0; i < 50; i++) {
                const x = (Math.sin(time + i) * 200 + canvas.width / 2) % canvas.width;
                const y = (Math.cos(time * 0.8 + i * 0.5) * 150 + canvas.height / 2) % canvas.height;
                const size = Math.sin(time + i * 0.3) * 2 + 3;
                
                ctx.beginPath();
                ctx.arc(x, y, size, 0, Math.PI * 2);
                ctx.fill();
              }
              
              requestAnimationFrame(animate);
            };
            
            animate();
          }
        }
      }
    };

    loadSpline();

    // Handle resize
    const handleResize = () => {
      if (canvasRef.current) {
        canvasRef.current.width = window.innerWidth;
        canvasRef.current.height = window.innerHeight;
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      mounted = false;
      window.removeEventListener('resize', handleResize);
      
      if (splineAppRef.current) {
        try {
          splineAppRef.current.dispose();
        } catch (error) {
          console.error('Error disposing Spline app:', error);
        }
      }
    };
  }, []);

  return (
    <div className="absolute inset-0 w-full h-full">
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full object-cover"
        style={{
          width: '100%',
          height: '100%',
          display: 'block'
        }}
      />
    </div>
  );
}