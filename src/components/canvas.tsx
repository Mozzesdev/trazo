import { useRef } from "react";
import { Stage, Layer, Line } from "react-konva";
import Konva from "konva";

// Definimos el tipo para una línea, que es un array de puntos (x, y)
type LineType = {
  points: number[];
  tool: "pencil" | "eraser";
};

interface CanvasProps {
  activeTool: string;
  lines: LineType[];
  onDrawComplete: (lines: LineType[]) => void;
}

export function Canvas({ activeTool, lines, onDrawComplete }: CanvasProps) {
  const isDrawing = useRef(false);
  const currentLine = useRef<LineType | null>(null);

  const handleMouseDown = (e: Konva.KonvaEventObject<MouseEvent>) => {
    // Solo empezamos a dibujar si la herramienta es 'pencil' o 'eraser'
    if (activeTool !== "pencil" && activeTool !== "eraser") return;

    isDrawing.current = true;
    const pos = e.target.getStage()?.getPointerPosition();
    if (!pos) return;

    // Empezamos una nueva línea con el punto inicial
    currentLine.current = {
      tool: activeTool as "pencil" | "eraser",
      points: [pos.x, pos.y],
    };
  };

  const handleMouseMove = (e: Konva.KonvaEventObject<MouseEvent>) => {
    if (!isDrawing.current || !currentLine.current) return;

    const stage = e.target.getStage();
    const point = stage?.getPointerPosition();
    if (!point) return;

    currentLine.current.points.push(point.x, point.y);
  };

  const handleMouseUp = () => {
    isDrawing.current = false;
    if (currentLine.current) {
      onDrawComplete([...lines, currentLine.current]);
      currentLine.current = null;
    }
  };

  return (
    <Stage
      width={window.innerWidth}
      height={window.innerHeight}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      className="absolute inset-0 z-10" // Aseguramos que ocupe todo el espacio
    >
      <Layer>
        {/* Aquí renderizamos todas las líneas que hemos dibujado */}
        {lines.map((line, i) => (
          <Line
            key={i}
            points={line.points}
            stroke="#000000" // En un futuro, esto podría ser un estado para el color
            strokeWidth={line.tool === "eraser" ? 20 : 5}
            tension={0.5}
            lineCap="round"
            lineJoin="round"
            // La magia del borrador está aquí
            globalCompositeOperation={
              line.tool === "eraser" ? "destination-out" : "source-over"
            }
          />
        ))}
      </Layer>
    </Stage>
  );
}
