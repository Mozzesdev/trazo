import { useState } from "react";
import { FloatingToolbar, type ToolType } from "./components/floating-bar";
import { PresenceIndicator } from "./components/presence-indicator";
import { ShareButton } from "./components/share-button";
import { Canvas } from "./components/canvas";

export type LineType = {
  points: number[];
  tool: "pencil" | "eraser";
};

export default function WhiteboardApp() {
  const [activeTool, setActiveTool] = useState<ToolType>("cursor");
  const [history, setHistory] = useState<LineType[][]>([[]]); // Inicia con un canvas vacío
  const [currentStep, setCurrentStep] = useState(0);

  // 3. Creamos las funciones para manejar el historial
  const handleUndo = () => {
    // Solo podemos deshacer si no estamos en el primer estado
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const onClear = () => {};

  const handleRedo = () => {
    // Solo podemos rehacer si no estamos en el último estado del historial
    if (currentStep < history.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  // 4. Esta función será llamada por el Canvas cuando se complete un dibujo
  const handleDrawComplete = (newLines: LineType[]) => {
    // Cuando el usuario dibuja algo nuevo, eliminamos el historial "futuro" (lo que se había deshecho)
    const newHistory = history.slice(0, currentStep + 1);
    setHistory([...newHistory, newLines]);
    setCurrentStep(newHistory.length);
  };

  const canUndo = currentStep > 0;
  const canRedo = currentStep < history.length - 1;
  const currentLines = history[currentStep];

  return (
    <div className="relative w-full h-screen overflow-hidden bg-background">
      {/* Canvas with dot grid background */}
      <div
        className="absolute inset-0 opacity-30 dark:opacity-20"
        style={{
          backgroundImage: `radial-gradient(circle, #488aee 1px, transparent 1px)`,
          backgroundSize: "20px 20px",
        }}
      />

      {/* Main canvas area */}
      <Canvas
        lines={currentLines}
        onDrawComplete={handleDrawComplete}
        activeTool={activeTool}
      />

      {/* Floating UI Components */}
      <FloatingToolbar
        onClear={onClear}
        activeTool={activeTool}
        onToolChange={setActiveTool}
        onUndo={handleUndo}
        onRedo={handleRedo}
        canUndo={canUndo}
        canRedo={canRedo}
      />
      <PresenceIndicator />
      <ShareButton />
    </div>
  );
}
