import { Line, Rect, Text } from "react-konva";
import Konva from "konva";
import type { CanvasObject } from "@/types";

interface CanvasObjectProps {
  object: CanvasObject;
  isSelected: boolean;
  onDblClick: (id: string) => void;
  isVisible: boolean;
  onClick: (id: string) => void;
  onTransformEnd: (event: Konva.KonvaEventObject<Event>) => void;
}

export function CanvasObjectRenderer({
  object,
  isSelected,
  isVisible,
  onClick,
  onDblClick,
  onTransformEnd,
}: CanvasObjectProps) {
  const commonProps = {
    id: object.id,
    x: object.x,
    y: object.y,
    opacity: object.opacity,
    draggable: isSelected,
    visible: isVisible,
    onClick: () => onClick(object.id),
    onDblClick: () => onDblClick(object.id),
    onTap: () => onClick(object.id),
    onTransformEnd: onTransformEnd,
  };

  switch (object.type) {
    case "line":
      return (
        <Line
          {...commonProps}
          points={object.points}
          stroke={object.color}
          strokeWidth={object.strokeWidth}
          tension={0.5}
          lineCap="round"
          lineJoin="round"
          globalCompositeOperation={object.globalCompositeOperation}
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
          fontFamily={object.fontFamily}
          fill={object.color}
          fontWeight={object.fontWeight}
          width={object.width}
          height={object.height}
          verticalAlign="middle"
        />
      );
    default:
      return null;
  }
}
