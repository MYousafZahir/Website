import React, { useState } from 'react';
import { Card as CardType } from '../types/Card';
import Card from './Card';
import { calculateCardPosition } from '../utils/cardUtils';

interface HandProps {
  cards: CardType[];
  consumingCardId: string | null;
  shufflingCardIds: Set<string>;
  drawingCardIds: Set<string>;
  onCardClick: (card: CardType, cardPosition: { x: number; y: number }) => void;
  onCardFixedPosition?: (card: CardType, position: { x: number; y: number }) => void;
  onCardHover: (card: CardType | null) => void;
}

const Hand: React.FC<HandProps> = ({ 
  cards, 
  consumingCardId, 
  shufflingCardIds,
  drawingCardIds,
  onCardClick,
  onCardFixedPosition,
  onCardHover 
}) => {
  const [hoveredCardId, setHoveredCardId] = useState<string | null>(null);
  const containerRef = React.useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  React.useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.offsetWidth,
          height: containerRef.current.offsetHeight,
        });
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  const handleCardClick = (card: CardType, position: { x: number; y: number }) => {
    onCardClick(card, position);
  };

  const handleCardHover = (card: CardType) => {
    setHoveredCardId(card.id);
    onCardHover(card);
  };

  const handleCardLeave = () => {
    setHoveredCardId(null);
    onCardHover(null);
  };

  return (
    <div
      ref={containerRef}
      style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: '300px',
        overflow: 'visible',
        pointerEvents: 'none',
      }}
    >
      {cards.map((card, index) => {
        // Find hovered card index (exclude consuming card from hover effect)
        const hoveredCardIndex = hoveredCardId && hoveredCardId !== consumingCardId
          ? cards.findIndex(c => c.id === hoveredCardId)
          : -1;

        const basePosition = calculateCardPosition(
          cards.length,
          index,
          dimensions.width || window.innerWidth,
          dimensions.height || 300,
          hoveredCardIndex
        );

        // Calculate z-index: consuming card gets highest, then hovered card, others maintain base layering
        let zIndex = basePosition.zIndex;
        if (consumingCardId === card.id) {
          // Consuming card is always on top during animation
          zIndex = 10000;
        } else if (hoveredCardId === card.id) {
          // Hovered card is next highest
          zIndex = cards.length + 100;
        }

        const position = {
          ...basePosition,
          zIndex,
        };

        return (
          <Card
            key={card.id}
            card={card}
            position={position}
            isHovered={hoveredCardId === card.id && !consumingCardId && !shufflingCardIds.has(card.id)}
            isConsuming={consumingCardId === card.id}
            isShuffling={shufflingCardIds.has(card.id)}
            isDrawing={drawingCardIds.has(card.id)}
            onClick={(clickPosition) => handleCardClick(card, clickPosition)}
            onFixedPosition={onCardFixedPosition ? (pos) => onCardFixedPosition(card, pos) : undefined}
            onMouseEnter={() => handleCardHover(card)}
            onMouseLeave={handleCardLeave}
          />
        );
      })}
    </div>
  );
};

export default Hand;

