import { useRef, useState, useEffect } from "react";
import { Stage, Layer, Transformer } from "react-konva";
import Konva from "konva";
import { CanvasObjectRenderer } from "./canvas-object";
import type { CanvasObject, LineObject, TextObject } from "../types";
import { type ToolOptions } from "./floating-bar";
import { EditableText } from "./objects/editable-text";

interface CanvasProps {
  activeTool: string;
  objects: CanvasObject[];
  onAddObject: (obj: CanvasObject) => void;
  onUpdateObject: (obj: CanvasObject) => void;
  // Añadimos las opciones de herramientas a las props
  toolOptions: ToolOptions;
}

export function Canvas({
  activeTool,
  objects,
  onAddObject,
  onUpdateObject,
  toolOptions,
}: CanvasProps) {
  const isDrawing = useRef(false);
  const [previewLine, setPreviewLine] = useState<LineObject | null>(null);
  const [selectedObjectId, setSelectedObjectId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState<TextObject | null>(null);

  const stageRef = useRef<Konva.Stage>(null);
  const trRef = useRef<Konva.Transformer>(null);
  const layerRef = useRef<Konva.Layer>(null);

  useEffect(() => {
    if (trRef.current && layerRef.current) {
      const stage = layerRef.current.getStage();
      const selectedNode = stage?.findOne("#" + selectedObjectId);

      trRef.current.nodes(selectedNode ? [selectedNode] : []);
      layerRef.current.batchDraw();
    }
  }, [selectedObjectId]);

  const handleMouseDown = (e: Konva.KonvaEventObject<MouseEvent>) => {
    if (editingText) return;

    if (activeTool === "pencil" || activeTool === "eraser") {
      isDrawing.current = true;
      const pos = e.target.getStage()?.getPointerPosition();
      if (!pos) return;
      const { pencil, eraser } = toolOptions;
      setPreviewLine({
        id: `line-${Date.now()}`,
        type: "line",
        points: [pos.x, pos.y],
        x: 0,
        y: 0,
        color: pencil.color,
        strokeWidth: activeTool === "eraser" ? eraser.size : pencil.strokeWidth,
        opacity: pencil.opacity / 100,
        globalCompositeOperation:
          activeTool === "eraser" ? "destination-out" : "source-over",
      });
      return;
    }

    if (activeTool === "text") {
      const pos = e.target.getStage()?.getPointerPosition();
      if (!pos) return;
      const { text: textOptions } = toolOptions;
      setEditingText({
        id: `text-${Date.now()}`,
        type: "text",
        x: pos.x,
        y: pos.y,
        text: "",
        color: textOptions.color,
        fontSize: textOptions.fontSize,
        fontWeight: textOptions.fontWeight,
        fontFamily: "sans-serif",
        width: 200,
        height: 50,
        rotation: 0,
        opacity: 1,
        interactionMode: "EDITING",
      });
      setSelectedObjectId(null);
      return;
    }

    const clickedOnEmpty = e.target === e.target.getStage();
    if (clickedOnEmpty) {
      setSelectedObjectId(null);
    }
  };

  const handleMouseMove = (e: Konva.KonvaEventObject<MouseEvent>) => {
    if (!isDrawing.current || !previewLine) return;
    const stage = e.target.getStage();
    const point = stage?.getPointerPosition();
    if (!point) return;
    setPreviewLine((prev) =>
      prev ? { ...prev, points: [...prev.points, point.x, point.y] } : null
    );
  };

  const handleMouseUp = () => {
    if (isDrawing.current && previewLine) {
      onAddObject(previewLine);
    }
    isDrawing.current = false;
    setPreviewLine(null);
  };

  const handleObjectClick = (id: string) => {
    if (activeTool === "cursor") {
      setSelectedObjectId(id);
    }
  };

  const handleObjectDblClick = (id: string) => {
    if (activeTool !== "cursor") return;
    const object = objects.find((o) => o.id === id);
    if (object && object.type === "text") {
      setEditingText(object);
      setSelectedObjectId(null); // Deseleccionar para ocultar el Transformer
    }
  };

  const handleTextEditEnd = (finalTextObject: TextObject) => {
    if (finalTextObject.text.trim() === "") {
      setEditingText(null);
      return;
    }

    // Verificamos si era un objeto existente o uno nuevo
    const isExistingObject = objects.some(
      (obj) => obj.id === finalTextObject.id
    );
    if (isExistingObject) {
      onUpdateObject(finalTextObject);
    } else {
      onAddObject(finalTextObject);
    }
    setEditingText(null);
  };

  const handleTextUpdate = (updatedText: TextObject) => {
    setEditingText(updatedText);
    onUpdateObject(updatedText);
  };

  const handleTransformEnd = (e: Konva.KonvaEventObject<Event>) => {
    const node = e.target;
    const id = node.id();
    const originalObject = objects.find((o) => o.id === id);
    if (!originalObject) return;
    const scaleX = node.scaleX();
    const scaleY = node.scaleY();
    node.scaleX(1);
    node.scaleY(1);

    // Only update width/height for objects that support them
    if ("width" in originalObject && "height" in originalObject) {
      onUpdateObject({
        ...originalObject,
        x: node.x(),
        y: node.y(),
        rotation: node.rotation(),
        width: Math.max(5, (originalObject.width ?? 0) * scaleX),
        height: Math.max(5, (originalObject.height ?? 0) * scaleY),
      } as CanvasObject);
    } else {
      onUpdateObject({
        ...originalObject,
        x: node.x(),
        y: node.y(),
        rotation: node.rotation(),
      } as CanvasObject);
    }
  };

  return (
    <>
      <Stage
        ref={stageRef}
        width={window.innerWidth}
        height={window.innerHeight}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        className="absolute inset-0 z-10"
      >
        <Layer ref={layerRef}>
          {objects.map((obj) => (
            <CanvasObjectRenderer
              key={obj.id}
              object={obj}
              isSelected={
                obj.id === selectedObjectId && activeTool === "cursor"
              }
              onClick={handleObjectClick}
              onDblClick={handleObjectDblClick}
              onTransformEnd={handleTransformEnd}
              isVisible={!editingText || editingText.id !== obj.id}
            />
          ))}
          {previewLine && (
            <CanvasObjectRenderer
              object={previewLine}
              isVisible={true}
              isSelected={false}
              onClick={() => {}}
              onDblClick={() => {}}
              onTransformEnd={() => {}}
            />
          )}
          <Transformer
            ref={trRef}
            listening={selectedObjectId !== null}
            boundBoxFunc={(oldBox, newBox) =>
              newBox.width < 5 || newBox.height < 5 ? oldBox : newBox
            }
          />
        </Layer>
      </Stage>

      {/* Renderizamos el componente de texto editable si existe */}
      {editingText && (
        <EditableText
          key={editingText.id}
          initialState={editingText}
          onUpdate={(state) => handleTextUpdate({ ...editingText, ...state })}
          onDone={(state) => handleTextEditEnd({ ...editingText, ...state })}
        />
      )}
    </>
  );
}
