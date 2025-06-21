import { useState, useCallback } from "react";
import {
  FloatingToolbar,
  type ToolType,
  type ToolOptions,
} from "./components/floating-bar";
import { PresenceIndicator } from "./components/presence-indicator";
import { ShareButton } from "./components/share-button";
import { Canvas } from "./components/canvas";
import type { CanvasObject } from "./types";

// Opciones por defecto para nuestras herramientas
const DEFAULT_TOOL_OPTIONS: ToolOptions = {
  pencil: {
    color: "#000000",
    strokeWidth: 5,
    opacity: 100, // Usamos una escala de 0-100 para la UI
  },
  eraser: {
    size: 20,
    mode: "pixel",
  },
  text: {
    fontSize: 16,
    color: "#000000",
    fontWeight: "normal",
  },
};

export default function WhiteboardApp() {
  const [activeTool, setActiveTool] = useState<ToolType>("cursor");
  const [history, setHistory] = useState<CanvasObject[][]>([[]]);
  const [currentStep, setCurrentStep] = useState(0);
  // 1. Añadimos un estado para gestionar las opciones de las herramientas
  const [toolOptions, setToolOptions] =
    useState<ToolOptions>(DEFAULT_TOOL_OPTIONS);

  const handleUndo = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const onClear = () => {
    setHistory([[]]);
    setCurrentStep(0);
  };

  const handleRedo = () => {
    if (currentStep < history.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const addObject = useCallback(
    (newObject: CanvasObject) => {
      const currentObjects = history[currentStep] || [];
      const newObjects = [...currentObjects, newObject];
      const newHistory = history.slice(0, currentStep + 1);
      setHistory([...newHistory, newObjects]);
      setCurrentStep(newHistory.length);
    },
    [currentStep, history]
  );

  const updateObject = (updatedObject: CanvasObject) => {
    const currentObjects = history[currentStep] || [];
    const objectIndex = currentObjects.findIndex(
      (obj) => obj.id === updatedObject.id
    );
    if (objectIndex === -1) return;

    const newObjects = [...currentObjects];
    newObjects[objectIndex] = updatedObject;

    const newHistory = history.slice(0, currentStep + 1);
    setHistory([...newHistory, newObjects]);
    setCurrentStep(newHistory.length);
  };

  const canUndo = currentStep > 0;
  const canRedo = currentStep < history.length - 1;
  const objects = history[currentStep] || [];

  return (
    <div className="relative w-full h-screen overflow-hidden bg-background">
      <div
        className="absolute inset-0 opacity-30 dark:opacity-20"
        style={{
          backgroundImage: `radial-gradient(circle, #488aee 1px, transparent 1px)`,
          backgroundSize: "20px 20px",
        }}
      />

      <Canvas
        objects={objects}
        activeTool={activeTool}
        onAddObject={addObject}
        onUpdateObject={updateObject}
        toolOptions={toolOptions}
      />

      <FloatingToolbar
        onClear={onClear}
        activeTool={activeTool}
        onToolChange={setActiveTool}
        onUndo={handleUndo}
        onRedo={handleRedo}
        canUndo={canUndo}
        canRedo={canRedo}
        toolOptions={toolOptions}
        onToolOptionsChange={setToolOptions}
      />
      <PresenceIndicator />
      <ShareButton />
    </div>
  );
}
