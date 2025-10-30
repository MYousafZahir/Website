export interface CardPosition {
  x: number;
  y: number;
  rotation: number;
  zIndex: number;
}

/**
 * Calculate positions for cards in a fanned hand layout
 * @param cardCount - Number of cards in hand
 * @param cardIndex - Index of the current card (0-based)
 * @param handWidth - Width of the hand container
 * @param handHeight - Height of the hand container
 * @param hoveredCardIndex - Index of hovered card (-1 if none)
 * @returns Position object with x, y, rotation, and zIndex
 */
export function calculateCardPosition(
  cardCount: number,
  cardIndex: number,
  handWidth: number,
  handHeight: number,
  hoveredCardIndex: number = -1
): CardPosition {
  const cardWidth = 200;
  const baseOverlapAmount = 140; // Cards overlap by ~140px (70% of card width)
  const baseSpacingBetweenCenters = cardWidth - baseOverlapAmount; // ~60px between card centers
  
  // Base layout uses base spacing
  const totalSpread = baseSpacingBetweenCenters * (cardCount - 1);
  const centerX = handWidth / 2;
  const startX = centerX - totalSpread / 2;
  const baseX = startX + (baseSpacingBetweenCenters * cardIndex);
  
  // Calculate rotation and offset based on hover state
  let rotation = 0;
  let xOffset = 0;
  
  if (hoveredCardIndex >= 0) {
    // A card is hovered - create fan effect
    const distanceFromHovered = cardIndex - hoveredCardIndex;
    
    if (distanceFromHovered === 0) {
      // Hovered card: no rotation, faces forward
      rotation = 0;
      xOffset = 0;
    } else {
      // Cards to the left rotate clockwise (negative), cards to the right rotate counter-clockwise (positive)
      const maxRotation = 25;
      // Normalize distance (closer cards rotate more)
      const normalizedDistance = Math.min(Math.abs(distanceFromHovered) / 3, 1);
      rotation = (distanceFromHovered / Math.abs(distanceFromHovered)) * maxRotation * normalizedDistance;
      
      // Spread out cards horizontally when hovered
      // Cards closer to hovered card spread more
      const spreadMultiplier = Math.max(0, 1 - Math.abs(distanceFromHovered) * 0.3);
      const spreadAmount = 40 * spreadMultiplier;
      xOffset = distanceFromHovered * spreadAmount;
    }
  }
  
  const x = baseX + xOffset;
  
  // Same Y position for all cards (rectangular, not arc)
  const y = handHeight - 100;
  
  // Base z-index: rightmost cards should be on top for proper layering
  const zIndex = cardIndex;
  
  return {
    x,
    y,
    rotation,
    zIndex: Math.round(zIndex * 10),
  };
}

