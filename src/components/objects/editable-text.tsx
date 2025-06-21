import { useEditableText } from "@/hooks/useEditableText";
import {
  useEffect,
  useRef,
  type CSSProperties,
  type FC,
  type MouseEvent,
} from "react";

/** Modos de interacción posibles para el componente. */
type InteractionMode = "IDLE" | "DRAGGING" | "RESIZING" | "EDITING";

/** Direcciones posibles para los manejadores de redimensión. */
type ResizeDirection =
  | "top-left"
  | "top-right"
  | "bottom-left"
  | "bottom-right";

/** Describe la forma del objeto de estado que maneja el componente. */
interface EditableState {
  x: number;
  y: number;
  width: number;
  height: number;
  text: string;
  fontSize: number;
  interactionMode: InteractionMode;
}

/** Props para el componente ResizeHandle. */
interface ResizeHandleProps {
  direction: ResizeDirection;
  onMouseDown: (
    e: MouseEvent<HTMLDivElement>,
    mode: "RESIZING",
    direction: ResizeDirection
  ) => void;
}

/** Props para el componente principal EditableText. */
interface EditableTextProps {
  initialState: Partial<EditableState>;
  onUpdate?: (state: EditableState) => void;
  onDone?: (finalState: EditableState) => void;
}

/**
 * Un manejador de redimensión para una esquina específica.
 */
const ResizeHandle: FC<ResizeHandleProps> = ({ direction, onMouseDown }) => {
  const positionClasses: Record<ResizeDirection, string> = {
    "top-left": "top-0 left-0 cursor-nwse-resize",
    "top-right": "top-0 right-0 cursor-nesw-resize",
    "bottom-left": "bottom-0 left-0 cursor-nesw-resize",
    "bottom-right": "bottom-0 right-0 cursor-nwse-resize",
  };
  return (
    <div
      className={`absolute w-3 h-3 bg-white border-2 border-blue-500 rounded-full -m-1.5 z-10 ${positionClasses[direction]}`}
      onMouseDown={(e) => onMouseDown(e, "RESIZING", direction)}
    />
  );
};

/**
 * Un componente de texto editable que se puede arrastrar, redimensionar
 * y cuyo texto se escala automáticamente para ajustarse al cuadro,
 * similar a la funcionalidad de Miro.
 */
export const EditableText: FC<EditableTextProps> = ({
  initialState: customInitialState,
  onUpdate,
  onDone,
}) => {
  // Asumimos los tipos de retorno del hook personalizado.
  const {
    state,
    dispatch,
    handleKeyDown,
    handleMouseDown,
    handleTextChange,
    liveRegionRef,
    measurementRef,
  } = useEditableText(customInitialState, { onUpdate, onDone });

  const textAreaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (state.interactionMode === "EDITING" && textAreaRef.current) {
      textAreaRef.current.focus();
      textAreaRef.current.select();
    }
  }, [state.interactionMode]);

  const dynamicTextStyle: CSSProperties = {
    fontSize: `${state.fontSize}px`,
  };

  const containerStyle: CSSProperties = {
    transform: `translate(${state.x}px, ${state.y}px)`,
    width: `${state.width}px`,
    height: `${state.height}px`,
  };

  // Definimos las direcciones con su tipo para el map.
  const resizeDirections: ResizeDirection[] = [
    "top-left",
    "top-right",
    "bottom-left",
    "bottom-right",
  ];

  const elementoEnFoco = document.activeElement;

  console.log("El elemento activo ahora mismo es:", elementoEnFoco?.tagName);

  return (
    <>
      {/* Elemento oculto para medir el texto. white-space: pre previene el salto de línea automático */}
      <div
        ref={measurementRef}
        style={{
          ...dynamicTextStyle,
          position: "absolute",
          visibility: "hidden",
          left: -9999,
          top: -9999,
          whiteSpace: "pre",
        }}
      >
        {state.text || "Type something..."}
      </div>

      <div
        style={containerStyle}
        className="absolute z-10 shadow-lg ring-2 ring-blue-500/50 rounded-lg focus:outline-none focus:ring-4 focus:ring-blue-500"
        onKeyDown={handleKeyDown}
        tabIndex={0}
        aria-label="Caja de texto editable. Usa las flechas para mover, Ctrl+Flechas arriba/abajo para cambiar tamaño de fuente, Enter para editar."
      >
        {state.interactionMode === "EDITING" ? (
          <textarea
            ref={textAreaRef}
            className="w-full h-full bg-transparent border-none rounded-lg resize-none focus:outline-none text-nowrap"
            style={{ ...dynamicTextStyle, overflow: "hidden" }}
            value={state.text}
            id="editable-text-area"
            placeholder="Type something..."
            onChange={handleTextChange}
            onFocus={() => {
              console.log(
                "EditableText: Modo EDITING activado, textarea enfocado."
              );
            }}
            onBlur={() => {
              dispatch({ type: "END_EDIT" });
              console.log(
                "EditableText: Modo EDITING desactivado, textarea desenfocado."
              );
            }}
            onKeyDown={(e) =>
              e.key === "Escape" && dispatch({ type: "END_EDIT" })
            }
            wrap="off"
          />
        ) : (
          <div
            className="w-full h-full cursor-move select-none"
            style={dynamicTextStyle}
            onClick={() => dispatch({ type: "START_EDIT" })}
            onMouseDown={(e) => handleMouseDown(e, "DRAGGING")}
          >
            {state.text ? (
              <span className="text-gray-800" style={{ whiteSpace: "pre" }}>
                {state.text}
              </span>
            ) : (
              <span
                className="text-gray-400 pointer-events-none"
                style={{ whiteSpace: "pre" }}
              >
                Type something...
              </span>
            )}
          </div>
        )}
        {resizeDirections.map((dir) => (
          <ResizeHandle
            key={dir}
            direction={dir}
            onMouseDown={handleMouseDown}
          />
        ))}
      </div>
      <div
        ref={liveRegionRef}
        className="sr-only"
        aria-live="polite"
        aria-atomic="true"
      />
    </>
  );
};
