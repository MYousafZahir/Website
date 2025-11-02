import { useState, useRef } from 'react';
import Hand from './components/Hand';
import Board from './components/Board';
import GlimmerShader from './components/GlimmerShader';
import HandShader from './components/HandShader';
import { initialCards, projectCards, blogCards, backCard, Card as CardType } from './types/Card';

function App() {
  const [cards, setCards] = useState<CardType[]>(initialCards);
  const [selectedCard, setSelectedCard] = useState<CardType | null>(null);
  const [consumingCardId, setConsumingCardId] = useState<string | null>(null);
  const [shufflingCardIds, setShufflingCardIds] = useState<Set<string>>(new Set());
  const [drawingCardIds, setDrawingCardIds] = useState<Set<string>>(new Set());
  const [shake, setShake] = useState(false);
  const [shakeEnded, setShakeEnded] = useState(false);
  const [glimmerActive, setGlimmerActive] = useState(false);
  const [handShaderActive, setHandShaderActive] = useState(false);
  const [handShaderPosition, setHandShaderPosition] = useState({ x: 0, y: 0 });
  const appRef = useRef<HTMLDivElement>(null);
  const consumedCardsRef = useRef<Set<string>>(new Set());

  const handleCardFixedPosition = (card: CardType, position: { x: number; y: number }) => {
    // Check if this is a hand-only card
    const isHandOnlyCard = (card.id === 'nav-projects' || card.id === 'nav-blog' || card.id === 'back');
    if (isHandOnlyCard) {
      // Store the start position - we'll update shader position when card reaches fade point
      // The card moves vertically to middle of screen, so final fade position is:
      // X: startPosition.x (no horizontal movement)
      // Y: startPosition.y - window.innerHeight * 0.5 (moves up to middle)
      setHandShaderPosition({ 
        x: position.x, 
        y: position.y - window.innerHeight * 0.5 
      });
    }
  };

  const handleCardClick = (card: CardType, cardPosition: { x: number; y: number }) => {
    // Check if this is a hand-only card (Projects, Blog, Back - but NOT Contact/About)
    const isHandOnlyCard = (card.id === 'nav-projects' || card.id === 'nav-blog' || card.id === 'back');
    
    if (isHandOnlyCard) {
      // Hand-only cards: just refresh hand, no board update
      setConsumingCardId(card.id);
      
      // Calculate where the card will fade away (middle of screen vertically)
      // Card starts at cardPosition and moves up to middle
      const fadePositionX = cardPosition.x;
      const fadePositionY = cardPosition.y - window.innerHeight * 0.5;
      setHandShaderPosition({ x: fadePositionX, y: fadePositionY });
      
      // Trigger hand shader effect when fade-out is 50% complete
      // Flip: 2000ms, Burst delay: 120ms, Fade duration: 500ms
      // 50% of fade = 250ms into fade = 2000 + 120 + 250 = 2370ms
      setTimeout(() => {
        setHandShaderActive(true);
        setTimeout(() => setHandShaderActive(false), 1200);
      }, 2370); // When fade-out is 50% complete
      
      // After consumption animation, refresh hand
      setTimeout(() => {
        // Store the consumed card ID before clearing it
        const consumedCardId = card.id;
        setConsumingCardId(null);
        consumedCardsRef.current.add(consumedCardId);
        
        // Read current state and remove consumed card
        setCards(prevCards => {
          // Filter out ALL consumed cards (including this one and any board cards)
          // Always filter based on ref to prevent any consumed cards from appearing
          const cardsToShuffle = prevCards.filter(c => !consumedCardsRef.current.has(c.id));
          
          // Determine which cards to show next
          let newCards: CardType[];
          if (consumedCardId === 'back') {
            // Return to initial navigation cards
            newCards = initialCards;
          } else if (consumedCardId === 'nav-projects') {
            // Show Back + Project cards
            newCards = [backCard, ...projectCards];
          } else if (consumedCardId === 'nav-blog') {
            // Show Back + Blog post cards
            newCards = [backCard, ...blogCards];
          } else {
            // For other navigation cards, refresh hand with same cards
            newCards = initialCards;
          }
          
          // Also filter out consumed cards from newCards to be safe
          const filteredNewCards = newCards.filter(c => !consumedCardsRef.current.has(c.id));
          
          // Immediately shuffle with the filtered cards (consumed cards already excluded)
          shuffleAndDrawCards(filteredNewCards, 0, cardsToShuffle);
          
          // Return filtered cards to ensure consumed cards are never in state
          return cardsToShuffle;
        });
      }, 2800); // Animation duration for 4 flips plus smooth burst
    } else {
      // Board-updating cards (Contact, About, Projects): update board with glimmer (no shake)
      setShakeEnded(false);
      
      // Start consumption animation
      setConsumingCardId(card.id);
      setSelectedCard(card);
      
      // Trigger glimmer effect when card slams
      setTimeout(() => {
        setGlimmerActive(true);
        setTimeout(() => {
          setGlimmerActive(false);
          setShakeEnded(true); // Mark as ended after glimmer
        }, 1500);
      }, 900); // When animation completes
      
      // After animation completes, remove card
      setTimeout(() => {
        setConsumingCardId(null);
        // Add to ref FIRST before removing from state to prevent race conditions
        consumedCardsRef.current.add(card.id);
        // Use functional update that also filters based on ref to prevent reappearance
        setCards(prevCards => prevCards.filter(c => c.id !== card.id && !consumedCardsRef.current.has(c.id)));
      }, 1000); // Animation duration
    }
  };

  const shuffleAndDrawCards = (newCards: CardType[], delay: number, currentCardsOverride?: CardType[]) => {
    // First, shuffle all current cards back to deck
    // Use the override if provided, otherwise read the latest state
    const cardsToShuffle = currentCardsOverride || cards;
    const currentCardIds = cardsToShuffle.map(c => c.id);
    setShufflingCardIds(new Set(currentCardIds));
    
    // After shuffle animation, remove old cards and add new ones
    setTimeout(() => {
      setShufflingCardIds(new Set());
      
      // Set new cards with drawing animation
      // Use functional update that reads from previous state to prevent race conditions
      setCards(prevCards => {
        // First filter out any consumed cards from previous state
        const filteredPrev = prevCards.filter(c => !consumedCardsRef.current.has(c.id));
        // Then filter out consumed cards from new cards
        const filteredNewCards = newCards.filter(c => !consumedCardsRef.current.has(c.id));
        // Return new cards, but ensure we're not including anything from prev that shouldn't be there
        return filteredNewCards;
      });
      setDrawingCardIds(new Set(newCards.map(c => c.id)));
      
      // Clear drawing animation after cards appear
      setTimeout(() => {
        setDrawingCardIds(new Set());
      }, 600); // Drawing animation duration
    }, delay);
  };

  const handleCardHover = (_card: CardType | null) => {
    // Hover handled in Hand component
  };

  return (
    <div 
      ref={appRef}
      className="app"
    >
      <Board selectedCard={selectedCard} shakeEnded={shakeEnded} />
      <HandShader active={handShaderActive} cardX={handShaderPosition.x} cardY={handShaderPosition.y} />
      <GlimmerShader active={glimmerActive} />
      <Hand
        cards={cards}
        consumingCardId={consumingCardId}
        shufflingCardIds={shufflingCardIds}
        drawingCardIds={drawingCardIds}
        onCardClick={handleCardClick}
        onCardFixedPosition={handleCardFixedPosition}
        onCardHover={handleCardHover}
      />
    </div>
  );
}

export default App;
