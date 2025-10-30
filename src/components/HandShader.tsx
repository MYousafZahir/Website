import React, { useRef, useEffect } from 'react';

interface HandShaderProps {
  active: boolean;
  cardX: number;
  cardY: number;
}

const HandShader: React.FC<HandShaderProps> = ({ active, cardX, cardY }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number>();
  const startTimeRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    if (!active) {
      // Clear canvas when inactive - ensure complete cleanup
      if (canvasRef.current) {
        const clearCtx = canvasRef.current.getContext('2d');
        if (clearCtx) {
          clearCtx.clearRect(0, 0, canvas.width, canvas.height);
        }
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      return () => {
        window.removeEventListener('resize', resizeCanvas);
        // Final cleanup - clear canvas one more time
        if (canvasRef.current) {
          const clearCtx = canvasRef.current.getContext('2d');
          if (clearCtx) {
            clearCtx.clearRect(0, 0, canvas.width, canvas.height);
          }
        }
      };
    }

    // Start animation
    startTimeRef.current = Date.now();
    const duration = 1200; // 1.2 seconds

    const animate = () => {
      const elapsed = Date.now() - startTimeRef.current;
      const progress = Math.min(elapsed / duration, 1);

      // Always clear canvas first
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // When animation completes, ensure everything is cleared and stop
      if (progress >= 1) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        return;
      }

      // Calculate center point (where card is flipping)
      const centerX = cardX;
      const centerY = cardY;

      // Create unique hand shader effect - rotating gold-brass spiral
      const maxRadius = Math.max(canvas.width, canvas.height) * 0.8;
      const radius = maxRadius * progress;

      // Fade out curve - starts strong, fades to zero as progress increases
      const fadeOut = Math.pow(1 - progress, 1.5); // Slightly different fade curve
      const alpha = fadeOut * 0.9; // Higher intensity for gold effect

      // Only draw if there's still visible intensity
      if (alpha < 0.01) {
        animationFrameRef.current = requestAnimationFrame(animate);
        return;
      }

      // Start drawing from a small radius to avoid center artifacts
      const minDrawRadius = 50;
      if (radius < minDrawRadius) {
        animationFrameRef.current = requestAnimationFrame(animate);
        return;
      }

      // Create rotating spiral pattern - gold-brass themed
      const spiralCount = 8;
      for (let i = 0; i < spiralCount; i++) {
        const spiralAngle = (i / spiralCount) * Math.PI * 2 + progress * 6; // Rotating spiral
        const spiralRadius = radius * (0.2 + (i % 3) * 0.2);
        
        if (spiralRadius > minDrawRadius) {
          const spiralX = centerX + Math.cos(spiralAngle) * spiralRadius;
          const spiralY = centerY + Math.sin(spiralAngle) * spiralRadius;
          
          // Gold-brass gradient for each spiral point
          const spiralGradient = ctx.createRadialGradient(spiralX, spiralY, 0, spiralX, spiralY, 40);
          spiralGradient.addColorStop(0, `rgba(255, 215, 0, ${alpha * 0.9})`); // Gold center
          spiralGradient.addColorStop(0.3, `rgba(255, 223, 0, ${alpha * 0.7})`); // Bright gold
          spiralGradient.addColorStop(0.6, `rgba(204, 153, 0, ${alpha * 0.5})`); // Brass
          spiralGradient.addColorStop(1, `rgba(255, 215, 0, 0)`); // Fade out
          
          ctx.fillStyle = spiralGradient;
          ctx.beginPath();
          ctx.arc(spiralX, spiralY, 30, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // Add expanding gold-brass rings
      const ringCount = 3;
      for (let i = 0; i < ringCount; i++) {
        const ringRadius = radius * (0.3 + i * 0.25);
        const ringAlpha = alpha * (1 - i * 0.3);
        
        if (ringRadius > minDrawRadius && ringAlpha > 0.01) {
          const ringGradient = ctx.createRadialGradient(centerX, centerY, ringRadius - 10, centerX, centerY, ringRadius + 10);
          ringGradient.addColorStop(0, `rgba(255, 215, 0, 0)`);
          ringGradient.addColorStop(0.5, `rgba(255, 215, 0, ${ringAlpha * 0.6})`);
          ringGradient.addColorStop(1, `rgba(255, 215, 0, 0)`);
          
          ctx.strokeStyle = ringGradient;
          ctx.lineWidth = 4;
          ctx.beginPath();
          ctx.arc(centerX, centerY, ringRadius, 0, Math.PI * 2);
          ctx.stroke();
        }
      }

      // Add golden rays radiating outward
      const rayCount = 16;
      for (let i = 0; i < rayCount; i++) {
        const rayAngle = (i / rayCount) * Math.PI * 2 + progress * 3;
        const rayLength = radius * 0.7;
        const rayStart = minDrawRadius + 20;
        
        const rayX1 = centerX + Math.cos(rayAngle) * rayStart;
        const rayY1 = centerY + Math.sin(rayAngle) * rayStart;
        const rayX2 = centerX + Math.cos(rayAngle) * rayLength;
        const rayY2 = centerY + Math.sin(rayAngle) * rayLength;
        
        const rayAlpha = alpha * 0.5;
        if (rayAlpha > 0.01) {
          const rayGradient = ctx.createLinearGradient(rayX1, rayY1, rayX2, rayY2);
          rayGradient.addColorStop(0, `rgba(255, 215, 0, ${rayAlpha})`);
          rayGradient.addColorStop(0.5, `rgba(255, 223, 0, ${rayAlpha * 0.7})`);
          rayGradient.addColorStop(1, `rgba(255, 215, 0, 0)`);
          
          ctx.strokeStyle = rayGradient;
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.moveTo(rayX1, rayY1);
          ctx.lineTo(rayX2, rayY2);
          ctx.stroke();
        }
      }

      // Continue animation
      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animationFrameRef.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [active, cardX, cardY]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 1,
        mixBlendMode: 'screen',
        opacity: active ? 1 : 0,
        transition: 'opacity 0.1s ease-out',
      }}
    />
  );
};

export default HandShader;


