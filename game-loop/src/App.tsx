import { Application, extend } from "@pixi/react";
import { Container, Sprite } from "pixi.js";
import { useState, useEffect } from "react";
import { CupGame } from "./CupGame";

// extend tells @pixi/react what Pixi.js components are available
extend({
  Container,
  Sprite,
});

type GameState = "betting" | "shuffling" | "selecting" | "revealing";

const GameCanvas = () => {
  const [gameState, setGameState] = useState<GameState>("betting");
  const [selectedCup, setSelectedCup] = useState(-1);

  // Listen for game state changes from Svelte overlay
  useEffect(() => {
    const handleGameState = (event: Event) => {
      const customEvent = event as CustomEvent<GameState>;
      setGameState(customEvent.detail);
    };

    const handleCupSelection = (event: Event) => {
      const customEvent = event as CustomEvent<number>;
      setSelectedCup(customEvent.detail);
    };

    // Listen for custom events from Svelte
    window.addEventListener("gameStateChange", handleGameState);
    window.addEventListener("cupSelection", handleCupSelection);

    return () => {
      window.removeEventListener("gameStateChange", handleGameState);
      window.removeEventListener("cupSelection", handleCupSelection);
    };
  }, []);

  const handleCupSelect = (cupIndex: number) => {
    setSelectedCup(cupIndex);
    // Notify Svelte overlay about cup selection
    window.dispatchEvent(
      new CustomEvent("pixiCupSelected", { detail: cupIndex }),
    );
  };

  return (
    <CupGame
      selectedCup={selectedCup}
      gameState={gameState}
      onCupSelect={handleCupSelect}
    />
  );
};

export default function App() {
  return (
    // We'll wrap our components with an <Application> component to provide
    // the Pixi.js Application context
    <Application background={"#1099bb"} resizeTo={window}>
      <GameCanvas />
    </Application>
  );
}
