import { Line, Rect, Text } from "react-konva";
import Konva from "konva";
import type { CanvasObject } from "@/types";

interface CanvasObjectProps {
  object: CanvasObject;
  isSelected: boolean;
  onClick: (id: string) => void;
  onTransformEnd: (event: Konva.KonvaEventObject<Event>) => void;
}

export function CanvasObjectRenderer({
  object,
  isSelected,
  onClick,
  onTransformEnd,
}: CanvasObjectProps) {
  const commonProps = {
    id: object.id,
    x: object.x,
    y: object.y,
    opacity: object.opacity,
    draggable: isSelected,
    onClick: () => onClick(object.id),
    onTap: () => onClick(object.id),
    onTransformEnd: onTransformEnd,
  };

  switch (object.type) {
    case "line":
      return (
        <Line
          id={object.id}
          points={object.points}
          stroke={object.color}
          strokeWidth={object.strokeWidth}
          opacity={object.opacity}
          tension={0.5}
          lineCap="round"
          lineJoin="round"
          onClick={() => onClick(object.id)}
          onTap={() => onClick(object.id)}
        />
      );
    case "rect":
      return (
        <Rect
          {...commonProps}
          width={object.width}
          height={object.height}
          fill={object.fill}
          stroke={object.stroke}
          strokeWidth={object.strokeWidth}
        />
      );
    case "text":
      return (
        <Text
          {...commonProps}
          text={object.text}
          fontSize={object.fontSize}
          fontFamily="sans-serif"
          fill={object.color}
          fontWeight={object.fontWeight}
        />
      );
    default:
      return null;
  }
}
