export type ToolType =
  | "cursor"
  | "pencil"
  | "eraser"
  | "sticky"
  | "text"
  | "rectangle"
  | "circle";

// --- Opciones de Herramientas ---

export interface PencilOptions {
  color: string;
  strokeWidth: number;
  opacity: number;
}

export interface EraserOptions {
  size: number;
}

export interface TextOptions {
  fontSize: number;
  color: string;
  fontWeight: "normal" | "bold";
}

export interface ToolOptions {
  pencil: PencilOptions;
  eraser: EraserOptions;
  text: TextOptions;
}

interface BaseObject {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  opacity: number;
}

export interface LineObject
  extends Omit<BaseObject, "width" | "height" | "rotation"> {
  type: "line";
  points: number[];
  color: string;
  strokeWidth: number;
  globalCompositeOperation?: "source-over" | "destination-out";
}

export interface RectObject extends BaseObject {
  type: "rect";
  fill: string;
  stroke: string;
  strokeWidth: number;
}

export interface TextObject extends BaseObject {
  type: "text";
  text: string;
  color: string;
  fontSize: number;
  fontFamily: string;
  fontWeight: string;
}

// Unión discriminada para todos los objetos posibles en el canvas
export type CanvasObject = LineObject | RectObject | TextObject;
