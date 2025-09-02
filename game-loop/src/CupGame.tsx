import { useApplication, useTick } from "@pixi/react";
import { Assets, Sprite, Texture } from "pixi.js";
import { useEffect, useRef, useState } from "react";

interface CupGameProps {
  selectedCup: number;
  gameState: "betting" | "shuffling" | "selecting" | "revealing";
  onCupSelect: (cupIndex: number) => void;
}

export const CupGame: React.FC<CupGameProps> = ({
  selectedCup,
  gameState,
  onCupSelect,
}) => {
  const { app } = useApplication();
  const cupRefs = [
    useRef<Sprite>(null),
    useRef<Sprite>(null),
    useRef<Sprite>(null),
  ];
  const prizeRef = useRef<Sprite>(null);

  const [cupTexture, setCupTexture] = useState(Texture.EMPTY);
  const [prizeTexture, setPrizeTexture] = useState(Texture.EMPTY);
  const [winningCup, setWinningCup] = useState(Math.floor(Math.random() * 3));
  const [shuffleAnimation, setShuffleAnimation] = useState(0);
  const [showPrize, setShowPrize] = useState(false);

  // Load textures
  useEffect(() => {
    if (cupTexture === Texture.EMPTY) {
      Assets.load("/assets/redcup.png").then(setCupTexture);
    }
    if (prizeTexture === Texture.EMPTY) {
      Assets.load("/assets/prize.png").then(setPrizeTexture);
    }
  }, [cupTexture, prizeTexture]);

  // Handle game state changes
  useEffect(() => {
    if (gameState === "shuffling") {
      setShowPrize(false);
      setWinningCup(Math.floor(Math.random() * 3));
    } else if (gameState === "revealing") {
      setShowPrize(true);
    }
  }, [gameState]);

  // Shuffling animation
  useTick((ticker) => {
    if (gameState === "shuffling") {
      setShuffleAnimation((prev) => prev + 0.1 * ticker.deltaTime);

      cupRefs.forEach((ref, index) => {
        if (ref.current) {
          // Add subtle shuffling motion
          ref.current.y = getCupY() + Math.sin(shuffleAnimation + index) * 5;
          ref.current.x =
            getCupX(index) + Math.cos(shuffleAnimation * 1.5 + index) * 3;
        }
      });
    } else {
      // Reset to normal positions
      cupRefs.forEach((ref, index) => {
        if (ref.current) {
          ref.current.y = getCupY();
          ref.current.x = getCupX(index);
        }
      });
    }
  });

  // Responsive positioning functions
  const getCupX = (index: number) => {
    const screenWidth = app.screen.width;
    const spacing = Math.min(screenWidth * 0.25, 150);
    const startX = screenWidth / 2 - spacing;
    return startX + index * spacing;
  };

  const getCupY = () => {
    const screenHeight = app.screen.height;
    return screenHeight * 0.7; // Position cups at 70% of screen height
  };

  const getPrizeY = () => {
    const screenHeight = app.screen.height;
    return screenHeight * 0.55; // Position prize above cups
  };

  const getCupScale = () => {
    const screenWidth = app.screen.width;
    return Math.min(screenWidth / 800, 1.5); // Responsive scaling
  };

  const handleCupClick = (cupIndex: number) => {
    if (gameState === "selecting") {
      onCupSelect(cupIndex);
    }
  };

  return (
    <>
      {/* Render three cups */}
      {cupRefs.map((ref, index) => (
        <pixiSprite
          key={`cup-${index}`}
          ref={ref}
          texture={cupTexture}
          anchor={0.5}
          x={getCupX(index)}
          y={getCupY()}
          scale={getCupScale()}
          interactive={gameState === "selecting"}
          cursor={gameState === "selecting" ? "pointer" : "default"}
          alpha={selectedCup === index && gameState === "selecting" ? 0.8 : 1}
          onClick={() => handleCupClick(index)}
          onPointerOver={() => {
            if (gameState === "selecting" && ref.current) {
              ref.current.scale.set(getCupScale() * 1.1);
            }
          }}
          onPointerOut={() => {
            if (ref.current) {
              ref.current.scale.set(getCupScale());
            }
          }}
        />
      ))}

      {/* Render prize under winning cup when revealing */}
      {showPrize && gameState === "revealing" && (
        <pixiSprite
          ref={prizeRef}
          texture={prizeTexture}
          anchor={0.5}
          x={getCupX(winningCup)}
          y={getPrizeY()}
          scale={getCupScale() * 0.8}
        />
      )}
    </>
  );
};
