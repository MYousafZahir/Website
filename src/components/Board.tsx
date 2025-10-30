import React, { useState, useEffect, useRef } from 'react';
import { Card as CardType } from '../types/Card';

interface BoardProps {
  selectedCard: CardType | null;
  shakeEnded?: boolean;
}

const Board: React.FC<BoardProps> = ({ selectedCard, shakeEnded = false }) => {
  const [displayCard, setDisplayCard] = useState<CardType | null>(null);
  const [isFading, setIsFading] = useState(false);
  const prevShakeEndedRef = useRef(false);

  useEffect(() => {
    // Update content when shake ends
    if (shakeEnded && !prevShakeEndedRef.current && selectedCard) {
      // If there's already content, fade it out first
      if (displayCard) {
        setIsFading(true);
        // After fade out completes, update content and fade in
        setTimeout(() => {
          setDisplayCard(selectedCard);
          setIsFading(false);
        }, 300); // Match fade duration
      } else {
        // First load, no fade out needed
        setDisplayCard(selectedCard);
      }
    }
    
    // Update the ref for next comparison
    prevShakeEndedRef.current = shakeEnded;
  }, [selectedCard, shakeEnded, displayCard]);

  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: '300px',
        background: 'transparent',
        display: 'flex',
        flexDirection: 'column',
        padding: '60px 80px',
        boxSizing: 'border-box',
        overflowY: 'auto',
      }}
    >
      <div
        style={{
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          gap: '40px',
          opacity: (isFading && displayCard) ? 0 : 1,
          transition: 'opacity 0.3s ease-in-out',
        }}
      >
        {/* Project Name Header */}
        {displayCard ? (
          <>
            <div>
              <h1
                style={{
                  color: '#ffffff',
                  fontSize: '48px',
                  fontFamily: 'Akkurat, "Helvetica Neue", Helvetica, Arial, sans-serif',
                  fontWeight: 'bold',
                  marginBottom: '8px',
                }}
              >
                {displayCard.name}
              </h1>
              <hr
                style={{
                  border: 'none',
                  borderTop: '1px solid rgba(255, 255, 255, 0.12)',
                  margin: 0,
                  position: 'relative',
                }}
              />
              <div
                style={{
                  width: '60px',
                  height: '2px',
                  background: '#00ff88',
                  marginTop: '-1px',
                }}
              />
            </div>

            {/* Grid Layout */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr 1fr',
                gridTemplateRows: 'auto auto',
                gap: '30px',
              }}
            >
              {/* Top-Left: Video */}
              <div
                style={{
                  gridColumn: '1',
                  gridRow: '1',
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
                <h3
                  style={{
                    color: '#ffffff',
                    fontSize: '28px',
                    marginBottom: '12px',
                    fontFamily: 'Akkurat, "Helvetica Neue", Helvetica, Arial, sans-serif',
                    fontWeight: 'bold',
                    letterSpacing: '2px',
                  }}
                >
                  GALLERY
                </h3>
                <hr
                  style={{
                    border: 'none',
                    borderTop: '1px solid rgba(255, 255, 255, 0.12)',
                    marginBottom: '20px',
                  }}
                />
                {displayCard.videoUrl ? (
                  <div
                    style={{
                      position: 'relative',
                      width: '100%',
                      paddingBottom: '56.25%', // 16:9 aspect ratio
                      overflow: 'hidden',
                      background: '#252525',
                      border: '1px solid rgba(255, 255, 255, 0.08)',
                      borderRadius: '8px',
                      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3), 0 2px 6px rgba(0, 0, 0, 0.2)',
                    }}
                  >
                    <iframe
                      width="100%"
                      height="100%"
                      src={displayCard.videoUrl}
                      title={displayCard.name}
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        borderRadius: '8px',
                      }}
                    />
                  </div>
                ) : (
                  <div
                    style={{
                      padding: '40px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#999',
                      fontStyle: 'italic',
                      background: '#252525',
                      border: '1px solid rgba(255, 255, 255, 0.08)',
                      borderRadius: '8px',
                      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3), 0 2px 6px rgba(0, 0, 0, 0.2)',
                    }}
                  >
                    No video available
                  </div>
                )}
              </div>

              {/* Bottom-Left: Tech List */}
              <div
                style={{
                  gridColumn: '1',
                  gridRow: '2',
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
                <h3
                  style={{
                    color: '#ffffff',
                    fontSize: '28px',
                    marginBottom: '12px',
                    fontFamily: 'Akkurat, "Helvetica Neue", Helvetica, Arial, sans-serif',
                    fontWeight: 'bold',
                  }}
                >
                  Technologies
                </h3>
                <hr
                  style={{
                    border: 'none',
                    borderTop: '1px solid rgba(255, 255, 255, 0.12)',
                    marginBottom: '20px',
                  }}
                />
                <ul
                  style={{
                    listStyle: 'none',
                    padding: 0,
                    margin: 0,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px',
                  }}
                >
                  {displayCard.tech.map((tech, index) => (
                    <li
                      key={index}
                      style={{
                        color: '#ffffff',
                        fontSize: '16px',
                        fontFamily: 'Akkurat, "Helvetica Neue", Helvetica, Arial, sans-serif',
                        padding: '10px 16px',
                        background: '#252525',
                        borderRadius: '6px',
                        border: '1px solid rgba(255, 255, 255, 0.08)',
                        boxShadow: '0 2px 6px rgba(0, 0, 0, 0.2)',
                      }}
                    >
                      {tech}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Middle-Right: Description */}
              <div
                style={{
                  gridColumn: '2',
                  gridRow: '1 / 3',
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
                <h3
                  style={{
                    color: '#ffffff',
                    fontSize: '28px',
                    marginBottom: '12px',
                    fontFamily: 'Akkurat, "Helvetica Neue", Helvetica, Arial, sans-serif',
                    fontWeight: 'bold',
                  }}
                >
                  Description
                </h3>
                <hr
                  style={{
                    border: 'none',
                    borderTop: '1px solid rgba(255, 255, 255, 0.12)',
                    marginBottom: '20px',
                  }}
                />
                <p
                  style={{
                    color: 'rgba(255, 255, 255, 0.85)',
                    fontSize: '16px',
                    lineHeight: '1.8',
                    fontFamily: 'Akkurat, "Helvetica Neue", Helvetica, Arial, sans-serif',
                    flex: 1,
                    padding: '24px',
                    background: '#252525',
                    borderRadius: '8px',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3), 0 2px 6px rgba(0, 0, 0, 0.2)',
                  }}
                >
                  {displayCard.expandedDescription}
                </p>
              </div>

              {/* Far-Right: Sample Code */}
              <div
                style={{
                  gridColumn: '3',
                  gridRow: '1 / 3',
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
                <h3
                  style={{
                    color: '#ffffff',
                    fontSize: '28px',
                    marginBottom: '12px',
                    fontFamily: 'Akkurat, "Helvetica Neue", Helvetica, Arial, sans-serif',
                    fontWeight: 'bold',
                  }}
                >
                  Sample Code
                </h3>
                <hr
                  style={{
                    border: 'none',
                    borderTop: '1px solid rgba(255, 255, 255, 0.12)',
                    marginBottom: '20px',
                  }}
                />
                {displayCard.codeSample ? (
                  <pre
                    style={{
                      background: '#252525',
                      padding: '20px',
                      overflow: 'auto',
                      flex: 1,
                      color: '#ffffff',
                      fontFamily: 'JetBrains Mono, "Courier New", monospace',
                      fontSize: '14px',
                      lineHeight: '1.6',
                      margin: 0,
                      border: '1px solid rgba(255, 255, 255, 0.08)',
                      borderRadius: '8px',
                      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3), 0 2px 6px rgba(0, 0, 0, 0.2)',
                    }}
                  >
                    <code>{displayCard.codeSample}</code>
                  </pre>
                ) : (
                  <div
                    style={{
                      flex: 1,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#888',
                      fontStyle: 'italic',
                      padding: '40px',
                    }}
                  >
                    No code sample available
                  </div>
                )}
              </div>
            </div>
          </>
        ) : (
          <div
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '60px 40px',
            }}
          >
            <p
              style={{
                fontSize: '18px',
                color: '#999',
                fontStyle: 'italic',
                textAlign: 'center',
                fontFamily: 'Akkurat, "Helvetica Neue", Helvetica, Arial, sans-serif',
              }}
            >
              Click a project card to see its details
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Board;

