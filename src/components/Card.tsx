import React, { useRef, useEffect, useState } from 'react';
import { Card as CardType } from '../types/Card';

interface CardProps {
  card: CardType;
  position: { x: number; y: number; rotation: number; zIndex: number };
  isHovered: boolean;
  isConsuming: boolean;
  isShuffling: boolean;
  isDrawing: boolean;
  onClick: (position: { x: number; y: number }) => void;
  onFixedPosition?: (position: { x: number; y: number }) => void;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
}

const CARD_WIDTH = 200;
const CARD_HEIGHT = 300;

const Card: React.FC<CardProps> = ({
  card,
  position,
  isHovered,
  isConsuming,
  isShuffling,
  isDrawing,
  onClick,
  onFixedPosition,
  onMouseEnter,
  onMouseLeave,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isClicking, setIsClicking] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const [startPosition, setStartPosition] = useState<{ x: number; y: number } | null>(null);
  
  const isHandOnlyCard = card.id === 'nav-projects' || card.id === 'nav-blog' || card.id === 'back';

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, CARD_WIDTH, CARD_HEIGHT);

    if (isHandOnlyCard) {
      // Hand-only card style: holo gold-brass version of regular cards
      // Base card structure similar to project cards but with gold-brass colors
      const baseGradient = ctx.createLinearGradient(0, 0, CARD_WIDTH, CARD_HEIGHT);
      baseGradient.addColorStop(0, '#2a2318');
      baseGradient.addColorStop(0.5, '#3d3425');
      baseGradient.addColorStop(1, '#2a2318');
      ctx.fillStyle = baseGradient;
      ctx.fillRect(0, 0, CARD_WIDTH, CARD_HEIGHT);

      // Draw card name area - gold-brass header
      const headerGradient = ctx.createLinearGradient(0, 0, CARD_WIDTH, 45);
      headerGradient.addColorStop(0, '#1a1610');
      headerGradient.addColorStop(0.5, '#2a2318');
      headerGradient.addColorStop(1, '#1a1610');
      ctx.fillStyle = headerGradient;
      ctx.fillRect(0, 0, CARD_WIDTH, 45);

      // Draw card name - gold text with glow
      ctx.fillStyle = '#ffd700';
      ctx.font = 'bold 16px Akkurat, "Helvetica Neue", Helvetica, Arial, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.shadowColor = '#ffd700';
      ctx.shadowBlur = 12;
      ctx.fillText(card.name, CARD_WIDTH / 2, 22);
      ctx.shadowBlur = 0;

      // Draw card art area - gold-brass gradient
      const artGradient = ctx.createLinearGradient(8, 50, CARD_WIDTH - 8, 200);
      artGradient.addColorStop(0, '#1a1610');
      artGradient.addColorStop(0.5, '#2a2318');
      artGradient.addColorStop(1, '#1a1610');
      ctx.fillStyle = artGradient;
      ctx.fillRect(8, 50, CARD_WIDTH - 16, 150);

      // Draw decorative gold-brass lines
      ctx.strokeStyle = '#ffd700';
      ctx.lineWidth = 1;
      ctx.globalAlpha = 0.4;
      for (let i = 0; i < 5; i++) {
        ctx.beginPath();
        ctx.moveTo(8, 50 + i * 30);
        ctx.lineTo(CARD_WIDTH - 8, 50 + i * 30);
        ctx.stroke();
      }
      ctx.globalAlpha = 1;

      // Draw description area - gold-brass background
      ctx.fillStyle = '#2a2318';
      ctx.fillRect(8, 210, CARD_WIDTH - 16, 80);

      // Draw description text - light gold
      ctx.fillStyle = '#ffd700';
      ctx.font = '14px Akkurat, "Helvetica Neue", Helvetica, Arial, sans-serif';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'top';
      
      // Word wrap description
      const words = card.description.split(' ');
      let line = '';
      let y = 220;
      const maxWidth = CARD_WIDTH - 30;
      
      for (let i = 0; i < words.length; i++) {
        const testLine = line + words[i] + ' ';
        const metrics = ctx.measureText(testLine);
        
        if (metrics.width > maxWidth && i > 0) {
          ctx.fillText(line, 15, y);
          line = words[i] + ' ';
          y += 18;
        } else {
          line = testLine;
        }
      }
      ctx.fillText(line, 15, y);

      // Draw gold-brass indicator badge (top right) - glowing gold
      const badgeGradient = ctx.createRadialGradient(CARD_WIDTH - 25, 22, 0, CARD_WIDTH - 25, 22, 8);
      badgeGradient.addColorStop(0, '#ffd700');
      badgeGradient.addColorStop(0.5, '#ffed4e');
      badgeGradient.addColorStop(1, '#cc9900');
      ctx.fillStyle = badgeGradient;
      ctx.shadowColor = '#ffd700';
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.arc(CARD_WIDTH - 25, 22, 8, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
    } else {
      // Project card style: standard dark theme
      ctx.fillStyle = '#2a2a2a';
      ctx.fillRect(0, 0, CARD_WIDTH, CARD_HEIGHT);

      // Draw card name area - simple dark header
      ctx.fillStyle = '#1f1f1f';
      ctx.fillRect(0, 0, CARD_WIDTH, 45);

      // Draw card name - white text
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 16px Akkurat, "Helvetica Neue", Helvetica, Arial, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(card.name, CARD_WIDTH / 2, 22);

      // Draw card art area placeholder - dark gray
      ctx.fillStyle = '#252525';
      ctx.fillRect(8, 50, CARD_WIDTH - 16, 150);

      // Draw description area - dark background
      ctx.fillStyle = '#2a2a2a';
      ctx.fillRect(8, 210, CARD_WIDTH - 16, 80);

      // Draw description text - white
      ctx.fillStyle = '#ffffff';
      ctx.font = '14px Akkurat, "Helvetica Neue", Helvetica, Arial, sans-serif';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'top';
      
      // Word wrap description
      const words = card.description.split(' ');
      let line = '';
      let y = 220;
      const maxWidth = CARD_WIDTH - 30;
      
      for (let i = 0; i < words.length; i++) {
        const testLine = line + words[i] + ' ';
        const metrics = ctx.measureText(testLine);
        
        if (metrics.width > maxWidth && i > 0) {
          ctx.fillText(line, 15, y);
          line = words[i] + ' ';
          y += 18;
        } else {
          line = testLine;
        }
      }
      ctx.fillText(line, 15, y);

      // Draw tech indicator badge (top right) - vibrant accent color
      ctx.fillStyle = '#00ff88';
      ctx.beginPath();
      ctx.arc(CARD_WIDTH - 25, 22, 6, 0, Math.PI * 2);
      ctx.fill();
    }
  }, [card, isHandOnlyCard]);

  // Reset start position when not consuming
  useEffect(() => {
    if (!isConsuming) {
      setStartPosition(null);
    }
  }, [isConsuming]);

  // Capture start position when consuming starts
  useEffect(() => {
    if (isConsuming && cardRef.current && !startPosition) {
      // Use requestAnimationFrame to ensure DOM is updated
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          if (cardRef.current) {
            const rect = cardRef.current.getBoundingClientRect();
            const pos = { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
            setStartPosition(pos);
            // Notify parent of fixed position for hand-only cards
            if (isHandOnlyCard && onFixedPosition) {
              onFixedPosition(pos);
            }
          }
        });
      });
    }
  }, [isConsuming, startPosition, isHandOnlyCard, onFixedPosition]);

  const handleClick = () => {
    if (isConsuming || isShuffling) return; // Prevent clicks during consumption/shuffling
    setIsClicking(true);
    setTimeout(() => setIsClicking(false), 150);
    // Get actual screen position from card element
    if (cardRef.current) {
      const rect = cardRef.current.getBoundingClientRect();
      onClick({ x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 });
    } else {
      // Fallback to calculated position
      onClick({ x: position.x, y: position.y });
    }
  };

  // Calculate transforms
  let scale = isHovered && !isConsuming && !isShuffling ? 1.1 : 1;
  // scaleX starts at the same scale as scaleY for hover, but can be modified during hand-only card flip animation
  let scaleX = scale; // Match vertical scale for hover (unless modified during flip animation)
  let rotateY = 0; // 3D rotation for card flip effect - only used for board cards or burst
  let yOffset = isHovered && !isConsuming && !isShuffling ? -30 : 0;
  let forwardOffset = isHovered && !isConsuming && !isShuffling ? 50 : 0;
  let rotation = position.rotation;
  let translateX = 0;
  let translateY = 0;
  let transition = 'transform 0.3s ease-out, opacity 0.3s ease-out';
  let opacity = 1;
  let fixedPosition = false;
  let fixedLeft = 0;
  let fixedTop = 0;

  // Shuffle animation: fly down and fade out
  if (isShuffling) {
    translateY = window.innerHeight + 400; // Fly down off screen
    opacity = 0;
    rotation = position.rotation + (Math.random() - 0.5) * 360; // Random rotation
    transition = 'transform 0.6s ease-in, opacity 0.6s ease-in';
    
    setTimeout(() => {
      if (cardRef.current) {
        cardRef.current.style.display = 'none';
      }
    }, 600);
  }

  // Draw animation: start from below and slide up while fading in
  const [isDrawingAnimation, setIsDrawingAnimation] = useState(false);
  
  useEffect(() => {
    if (isDrawing) {
      // Small delay to ensure initial state is rendered first
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setIsDrawingAnimation(true);
        });
      });
    } else {
      setIsDrawingAnimation(false);
    }
  }, [isDrawing]);
  
  if (isDrawing && !isDrawingAnimation) {
    // Initial state: below screen
    translateY = 200;
    opacity = 0;
    transition = 'transform 0.6s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.6s ease-out';
  } else if (isDrawing && isDrawingAnimation) {
    // Animate to final position
    translateY = 0;
    opacity = 1;
    transition = 'transform 0.6s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.6s ease-out';
  }

  // Vertical movement and burst animation state for hand-only cards
  const [verticalPosition, setVerticalPosition] = useState(0);
  const [isBursting, setIsBursting] = useState(false);
  const [burstOpacity, setBurstOpacity] = useState(1);
  const [flipRotationY, setFlipRotationY] = useState(0);
  const [flipScaleX, setFlipScaleX] = useState(1);
  
  useEffect(() => {
    if (isConsuming && isHandOnlyCard && startPosition) {
      // Start vertical movement animation - move to middle of screen
      const startTime = Date.now();
      const duration = 2000; // Match flip duration
      
      const animateVertical = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Easing function for smooth motion (ease-in-out cubic)
        const easeInOutCubic = (t: number) => {
          return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
        };
        const easedProgress = easeInOutCubic(progress);
        
        // Move vertically to middle of screen
        const targetY = -window.innerHeight * 0.5; // Middle of screen
        const verticalY = targetY * easedProgress;
        setVerticalPosition(verticalY);
        
        if (progress < 1) {
          requestAnimationFrame(animateVertical);
        }
      };
      
      // Start flip animation - 4 flips in 2 seconds
      const flipStartTime = Date.now();
      const flipDuration = 2000; // 2 seconds for 4 flips
      
      const animateFlip = () => {
        const elapsed = Date.now() - flipStartTime;
        const progress = Math.min(elapsed / flipDuration, 1);

        // TEMP: Disable flip animation to verify behaviour
        setFlipRotationY(0);
        setFlipScaleX(1);
        
        if (progress < 1) {
          requestAnimationFrame(animateFlip);
        } else {
          // Ensure we end at full width
          setFlipRotationY(720);
          setFlipScaleX(1);
        }
      };
      
      requestAnimationFrame(animateVertical);
      requestAnimationFrame(animateFlip);
      
      // Start burst after flip completes
      const burstDelay = flipDuration + 120;
      const burstTimer = setTimeout(() => {
        setIsBursting(true);
        setBurstOpacity(1); // Start at full opacity for fade-out animation
        // After a brief moment, start fading out
        setTimeout(() => {
          setBurstOpacity(0);
        }, 50);
      }, burstDelay); // Allow the flip to settle slightly before bursting
      
      return () => {
        clearTimeout(burstTimer);
      };
    } else {
      setVerticalPosition(0);
      setIsBursting(false);
      setBurstOpacity(1);
      setFlipRotationY(0);
      setFlipScaleX(1);
    }
  }, [isConsuming, isHandOnlyCard, startPosition]);

  // Consumption animation: different for hand-only vs board-updating cards
  if (isConsuming && startPosition) {
    fixedPosition = true;
    fixedLeft = startPosition.x;
    fixedTop = startPosition.y;
    
    if (isHandOnlyCard) {
      // Hand-only cards: flip and burst animation
      // Vertical movement: move to middle of screen
      translateY = verticalPosition; // Move to middle vertically
      translateX = 0; // No horizontal movement
      rotation = 0; // No Z rotation
      
      if (isBursting) {
        // Burst phase: expand gracefully and fade out (scale both X and Y)
        scale = 1.75;
        scaleX = 1.75; // Scale horizontally too
        rotateY = 0;
        opacity = burstOpacity; // Use state-controlled opacity for smooth fade
        transition = 'transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.5s ease-out';
      } else {
        // During flip: CSS animation handles rotation and scaleX on inner div
        // Outer transform handles positioning and scaleY only
        scale = 1;
        scaleX = 1; // Maintain uniform scale during travel
        rotateY = 0; // Not used for outer transform during flip
        opacity = 1;
        transition = 'none'; // No transition - RAF handles smooth updates directly
      }
      
      // After fade-out completes, ensure opacity stays at 0 and remove element
      setTimeout(() => {
        if (cardRef.current) {
          // Keep opacity at 0 until shader completes, then remove
          setTimeout(() => {
            if (cardRef.current) {
              cardRef.current.style.display = 'none';
            }
          }, 1300); // Wait for shader (1200ms) + buffer
        }
      }, 2670); // After burst fade completes (2000 flip + 120 delay + 50 initial + 500 fade)
    } else {
      // Board-updating cards: swish to board center, spin, and slam
      const boardCenterX = window.innerWidth / 2;
      const boardCenterY = window.innerHeight / 2 - 150; // Center of board area
      
      // Calculate offset from start position to board center
      translateX = boardCenterX - startPosition.x;
      translateY = boardCenterY - startPosition.y;
      
      // Spin during movement (720 degrees)
      rotation = 720;
      
      // Scale up for dramatic effect - scale uniformly (both X and Y)
      scale = 1.4;
      scaleX = 1.4; // Match scaleY for uniform scaling
      rotateY = 0; // No 3D rotation for board cards
      
      // Smooth but snappy animation with bounce at the end
      transition = 'transform 0.9s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.9s ease-out';
      
      // Fade out smoothly during animation
      opacity = 0;
      
      // Also set display none after animation to ensure complete removal
      setTimeout(() => {
        if (cardRef.current) {
          cardRef.current.style.display = 'none';
        }
      }, 900);
    }
  }

  const clickScale = isClicking ? 0.95 : 1;

  return (
    <div
      ref={cardRef}
      style={{
        position: fixedPosition ? 'fixed' : 'absolute',
        left: fixedPosition ? `${fixedLeft}px` : `${position.x}px`,
        top: fixedPosition ? `${fixedTop}px` : `${position.y}px`,
        transform: `translate(-50%, -50%) translate(${translateX}px, ${translateY}px) rotate(${rotation}deg) ${isHandOnlyCard && isConsuming && !isBursting ? 'scaleX(1)' : `scaleX(${scaleX * clickScale})`} scaleY(${scale * clickScale}) translateY(${yOffset - forwardOffset}px)`,
        transformStyle: 'preserve-3d',
        transition,
        zIndex: position.zIndex,
        cursor: (isConsuming || isShuffling) ? 'default' : 'pointer',
        pointerEvents: (isConsuming || isShuffling) ? 'none' : 'auto',
        opacity,
      }}
      onClick={handleClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <div style={{ 
        position: 'relative', 
        display: 'inline-block',
        perspective: isHandOnlyCard && isConsuming ? '1000px' : 'none',
        transformStyle: 'preserve-3d',
        willChange: isHandOnlyCard && isConsuming && !isBursting ? 'transform' : 'auto',
        transform: isHandOnlyCard && isConsuming && !isBursting
          ? `rotateY(${flipRotationY}deg) scaleX(${flipScaleX})`
          : 'none',
        transition: 'none', // No transition - RAF handles animation
      }}>
        <canvas
          ref={canvasRef}
          width={CARD_WIDTH}
          height={CARD_HEIGHT}
          style={{
            display: 'block',
            borderRadius: '12px',
            boxShadow: isHovered && !isConsuming 
              ? '0 8px 24px rgba(0, 0, 0, 0.5), 0 4px 12px rgba(0, 0, 0, 0.3)' 
              : '0 4px 12px rgba(0, 0, 0, 0.4), 0 2px 6px rgba(0, 0, 0, 0.2)',
            transition: 'box-shadow 0.3s ease-out',
            filter: isHandOnlyCard
              ? `drop-shadow(0 0 12px rgba(255, 215, 0, 0.6)) drop-shadow(0 0 6px rgba(255, 215, 0, 0.4)) brightness(1.1)`
              : 'none',
            transformStyle: 'preserve-3d',
            backfaceVisibility: 'hidden',
          }}
        />
        {isHandOnlyCard && !isConsuming && (
          <>
            {/* Shine overlay - animated sweep */}
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: CARD_WIDTH,
                height: CARD_HEIGHT,
                borderRadius: '12px',
                background: 'linear-gradient(135deg, rgba(255, 215, 0, 0.3) 0%, rgba(255, 215, 0, 0) 50%, rgba(255, 215, 0, 0.3) 100%)',
                backgroundSize: '200% 200%',
                animation: 'shimmer 2s ease-in-out infinite',
                pointerEvents: 'none',
                mixBlendMode: 'screen',
              }}
            />
            {/* Additional holographic effect */}
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: CARD_WIDTH,
                height: CARD_HEIGHT,
                borderRadius: '12px',
                background: 'linear-gradient(90deg, transparent 0%, rgba(255, 215, 0, 0.2) 50%, transparent 100%)',
                backgroundSize: '200% 100%',
                animation: 'holoShine 3s linear infinite',
                pointerEvents: 'none',
                mixBlendMode: 'overlay',
              }}
            />
          </>
        )}
      </div>
    </div>
  );
};

export default Card;

