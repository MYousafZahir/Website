import React, { useRef, useEffect } from 'react';

interface GlimmerShaderProps {
  active: boolean;
}

const GlimmerShader: React.FC<GlimmerShaderProps> = ({ active }) => {
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
    const duration = 1500; // 1.5 seconds

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

      // Calculate center point (where card slammed)
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2 - 150; // Board center

      // Create glimmer effect - circular wave expanding from center and fading out
      const maxRadius = Math.max(canvas.width, canvas.height) * 1.5;
      const radius = maxRadius * progress;

      // Fade out curve - starts strong, fades to zero as progress increases
      // Use ease-out curve for smooth fade
      const fadeOut = Math.pow(1 - progress, 2); // Quadratic fade out
      const alpha = fadeOut * 0.8; // Max intensity

      // Only draw if there's still visible intensity
      if (alpha < 0.01) {
        animationFrameRef.current = requestAnimationFrame(animate);
        return;
      }

      // Start drawing from a small radius to avoid center artifacts
      const minDrawRadius = 40;
      if (radius < minDrawRadius) {
        animationFrameRef.current = requestAnimationFrame(animate);
        return;
      }

      // Create gradient for glimmer - expands outward and fades
      const gradientStartRadius = Math.max(minDrawRadius, radius * 0.1);
      const gradient = ctx.createRadialGradient(centerX, centerY, gradientStartRadius, centerX, centerY, radius);
      
      // Smooth fade out - no pulsing, just burst and fade
      const finalAlpha = alpha;
      
      // Gold glimmer colors - bright cartoony colors that match the theme
      gradient.addColorStop(0, `rgba(255, 255, 255, ${finalAlpha * 0.8})`);
      gradient.addColorStop(0.15, `rgba(255, 215, 0, ${finalAlpha * 0.9})`);
      gradient.addColorStop(0.35, `rgba(255, 192, 203, ${finalAlpha * 0.7})`);
      gradient.addColorStop(0.55, `rgba(147, 197, 253, ${finalAlpha * 0.6})`);
      gradient.addColorStop(0.75, `rgba(196, 181, 253, ${finalAlpha * 0.4})`);
      gradient.addColorStop(0.9, `rgba(255, 255, 255, ${finalAlpha * 0.2})`);
      gradient.addColorStop(1, `rgba(255, 255, 255, 0)`);

      // Draw the expanding glimmer circle
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
      ctx.fill();

      // Add animated sparkles that spread outward and fade smoothly
      const sparkleCount = 30;
      for (let i = 0; i < sparkleCount; i++) {
        const angle = (i / sparkleCount) * Math.PI * 2 + progress * 4;
        const sparkleRadius = radius * (0.25 + (i % 3) * 0.15);
        
        // Only draw sparkles that are far enough from center and haven't faded
        if (sparkleRadius > minDrawRadius) {
          const sparkleX = centerX + Math.cos(angle) * sparkleRadius;
          const sparkleY = centerY + Math.sin(angle) * sparkleRadius;
          // Fixed sparkle size - no pulsing
          const sparkleSize = 3;
          
          // Sparkles fade out as they spread and as progress increases
          const sparkleFade = fadeOut * (1 - (sparkleRadius / radius) * 0.5);
          const sparkleAlpha = sparkleFade * 0.8;
          
          if (sparkleAlpha > 0.01) {
            ctx.fillStyle = `rgba(255, 255, 255, ${sparkleAlpha})`;
            ctx.beginPath();
            ctx.arc(sparkleX, sparkleY, sparkleSize, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      }

      // Add radial lines that spread outward and fade smoothly
      const lineCount = 12;
      const lineStartOffset = 40; // Start lines away from exact center
      for (let i = 0; i < lineCount; i++) {
        const angle = (i / lineCount) * Math.PI * 2 + progress * 2;
        const lineLength = radius * 0.65;
        
        // Start lines from offset position, not exact center
        const lineX1 = centerX + Math.cos(angle) * lineStartOffset;
        const lineY1 = centerY + Math.sin(angle) * lineStartOffset;
        const lineX2 = centerX + Math.cos(angle) * lineLength;
        const lineY2 = centerY + Math.sin(angle) * lineLength;
        
        // Lines fade out as they spread - smooth fade, no pulsing
        const lineFade = fadeOut * 0.5;
        const lineAlpha = lineFade * 0.4;
        
        if (lineAlpha > 0.01) {
          const lineGradient = ctx.createLinearGradient(lineX1, lineY1, lineX2, lineY2);
          lineGradient.addColorStop(0, `rgba(255, 255, 255, ${lineAlpha})`);
          lineGradient.addColorStop(0.5, `rgba(255, 215, 0, ${lineAlpha * 0.7})`);
          lineGradient.addColorStop(1, `rgba(255, 255, 255, 0)`);
          
          ctx.strokeStyle = lineGradient;
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(lineX1, lineY1);
          ctx.lineTo(lineX2, lineY2);
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
  }, [active]);

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
        zIndex: 9999,
        mixBlendMode: 'screen',
        opacity: active ? 1 : 0,
        transition: 'opacity 0.1s ease-out',
      }}
    />
  );
};

export default GlimmerShader;

