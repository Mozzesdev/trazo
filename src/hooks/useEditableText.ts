import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useReducer,
  useRef,
  type ChangeEvent,
  type KeyboardEvent,
  type MouseEvent,
  type Reducer,
} from "react";

const MIN_FONT_SIZE = 8;
const MAX_FONT_SIZE = 150;

// Tipos que ya habíamos definido en el componente
type InteractionMode = "IDLE" | "DRAGGING" | "RESIZING" | "EDITING";
type ResizeDirection =
  | "top-left"
  | "top-right"
  | "bottom-left"
  | "bottom-right";

// Interfaz para el estado principal del componente
interface EditableState {
  x: number;
  y: number;
  width: number;
  height: number;
  text: string;
  fontSize: number;
  interactionMode: InteractionMode;
}

// Interfaz para los datos de la interacción actual (al arrastrar/redimensionar)
interface InteractionData {
  startX: number;
  startY: number;
  startFontSize: number;
  startBoxX: number;
  startBoxY: number;
  direction: ResizeDirection | "";
}

// Unión Discriminada para las Acciones del Reducer
// Esto garantiza que cada `type` tenga su `payload` correcto.
type Action =
  | { type: "START_INTERACTION"; payload: { mode: InteractionMode } }
  | { type: "END_INTERACTION" }
  | { type: "UPDATE_POSITION"; payload: { x: number; y: number } }
  | { type: "UPDATE_FONT_SIZE"; payload: { fontSize: number } }
  | {
      type: "UPDATE_CONTAINER_SIZE";
      payload: { width: number; height: number };
    }
  | { type: "START_EDIT" }
  | { type: "UPDATE_TEXT"; payload: { text: string } }
  | { type: "END_EDIT" }
  | { type: "KEYBOARD_MOVE"; payload: { deltaX: number; deltaY: number } };

const reducer: Reducer<EditableState, Action> = (state, action) => {
  console.log(`Reducer action: ${action.type}`);
  switch (action.type) {
    case "START_INTERACTION":
      return { ...state, interactionMode: action.payload.mode };
    case "END_INTERACTION":
      return { ...state, interactionMode: "IDLE" };
    case "UPDATE_POSITION":
      return { ...state, x: action.payload.x, y: action.payload.y };
    case "UPDATE_FONT_SIZE":
      return { ...state, fontSize: action.payload.fontSize };
    case "UPDATE_CONTAINER_SIZE":
      return {
        ...state,
        width: action.payload.width,
        height: action.payload.height,
      };
    case "START_EDIT":
      return { ...state, interactionMode: "EDITING" };
    case "UPDATE_TEXT":
      return { ...state, text: action.payload.text };
    case "END_EDIT":
      return { ...state, interactionMode: "IDLE" };
    case "KEYBOARD_MOVE":
      return {
        ...state,
        x: state.x + action.payload.deltaX,
        y: state.y + action.payload.deltaY,
      };
    default:
      return state;
  }
};

const initialState: EditableState = {
  x: 100,
  y: 100,
  width: 200,
  height: 100,
  fontSize: 24,
  text: "",
  interactionMode: "IDLE",
};

interface Callbacks {
  onUpdate?: (state: EditableState) => void;
  onDone?: (finalState: EditableState) => void;
}

/**
 * Custom Hook que encapsula toda la lógica de estado e interacciones.
 */
export function useEditableText(
  customInitialState: Partial<EditableState> = {},
  callbacks: Callbacks = {}
) {
  const { onUpdate, onDone } = callbacks;
  const [state, dispatch] = useReducer(reducer, {
    ...initialState,
    ...customInitialState,
  });
  const interactionRef = useRef<InteractionData>({
    startX: 0,
    startY: 0,
    startFontSize: 0,
    startBoxX: 0,
    startBoxY: 0,
    direction: "",
  });
  const prevSizeRef = useRef<{ width: number; height: number }>({
    width: state.width,
    height: state.height,
  });
  const prevModeRef = useRef(state.interactionMode);
  const liveRegionRef = useRef<HTMLDivElement>(null);
  const measurementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (
      state.interactionMode !== "DRAGGING" &&
      state.interactionMode !== "RESIZING"
    ) {
      return;
    }

    const handleMouseMove = (e: globalThis.MouseEvent) => {
      const { startX, startY, startFontSize, startBoxX, startBoxY, direction } =
        interactionRef.current;
      const deltaX = e.clientX - startX;
      const deltaY = e.clientY - startY;

      if (state.interactionMode === "DRAGGING") {
        dispatch({
          type: "UPDATE_POSITION",
          payload: { x: startBoxX + deltaX, y: startBoxY + deltaY },
        });
      } else if (state.interactionMode === "RESIZING") {
        let delta: number;
        switch (direction) {
          case "top-left":
            delta = -deltaX + -deltaY;
            break;
          case "top-right":
            delta = deltaX + -deltaY;
            break;
          case "bottom-left":
            delta = -deltaX + deltaY;
            break;
          case "bottom-right":
            delta = deltaX + deltaY;
            break;
          default:
            delta = 0;
        }

        const newFontSize = Math.max(
          MIN_FONT_SIZE,
          Math.min(MAX_FONT_SIZE, startFontSize + delta * 0.2)
        );
        dispatch({
          type: "UPDATE_FONT_SIZE",
          payload: { fontSize: newFontSize },
        });
      }
    };

    const handleMouseUp = () => {
      dispatch({ type: "END_INTERACTION" });
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [state.interactionMode]);

  useLayoutEffect(() => {
    if (measurementRef.current) {
      const padding = 0;
      const newWidth = measurementRef.current.scrollWidth + padding;
      const newHeight = measurementRef.current.scrollHeight + padding;
      if (newWidth !== state.width || newHeight !== state.height) {
        dispatch({
          type: "UPDATE_CONTAINER_SIZE",
          payload: { width: newWidth, height: newHeight },
        });
      }
    }
  }, [
    state.text,
    state.fontSize,
    state.width,
    state.height,
    state.interactionMode,
  ]);

  useLayoutEffect(() => {
    if (state.interactionMode !== "RESIZING") {
      prevSizeRef.current = { width: state.width, height: state.height };
      return;
    }
    const { direction } = interactionRef.current;
    if (!direction) return;

    const dw = state.width - prevSizeRef.current.width;
    const dh = state.height - prevSizeRef.current.height;

    if (dw === 0 && dh === 0) return;

    let newX = state.x;
    let newY = state.y;

    if (direction.includes("left")) newX -= dw;
    if (direction.includes("top")) newY -= dh;

    if (newX !== state.x || newY !== state.y) {
      dispatch({ type: "UPDATE_POSITION", payload: { x: newX, y: newY } });
    }

    prevSizeRef.current = { width: state.width, height: state.height };
  }, [state.width, state.height, state.interactionMode, state.x, state.y]);

  const handleMouseDown = useCallback(
    (
      e: MouseEvent,
      mode: InteractionMode,
      direction: ResizeDirection | "" = ""
    ) => {
      e.preventDefault();
      e.stopPropagation();
      interactionRef.current = {
        startX: e.clientX,
        startY: e.clientY,
        startFontSize: state.fontSize,
        startBoxX: state.x,
        startBoxY: state.y,
        direction,
      };
      dispatch({ type: "START_INTERACTION", payload: { mode } });
    },
    [state.fontSize, state.x, state.y]
  );

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (state.interactionMode === "EDITING") return;
      const step = e.shiftKey ? 10 : 1;
      const fontStep = e.shiftKey ? 2 : 1;
      let handled = true;

      switch (e.key) {
        case "Enter":
          dispatch({ type: "START_EDIT" });
          break;
        case "ArrowUp":
          if (e.ctrlKey) {
            dispatch({
              type: "UPDATE_FONT_SIZE",
              payload: {
                fontSize: Math.min(MAX_FONT_SIZE, state.fontSize + fontStep),
              },
            });
          } else {
            dispatch({
              type: "KEYBOARD_MOVE",
              payload: { deltaX: 0, deltaY: -step },
            });
          }
          break;
        case "ArrowDown":
          if (e.ctrlKey) {
            dispatch({
              type: "UPDATE_FONT_SIZE",
              payload: {
                fontSize: Math.max(MIN_FONT_SIZE, state.fontSize - fontStep),
              },
            });
          } else {
            dispatch({
              type: "KEYBOARD_MOVE",
              payload: { deltaX: 0, deltaY: step },
            });
          }
          break;
        case "ArrowLeft":
          dispatch({
            type: "KEYBOARD_MOVE",
            payload: { deltaX: -step, deltaY: 0 },
          });
          break;
        case "ArrowRight":
          dispatch({
            type: "KEYBOARD_MOVE",
            payload: { deltaX: step, deltaY: 0 },
          });
          break;
        default:
          handled = false;
      }
      if (handled) e.preventDefault();
    },
    [state.interactionMode, state.fontSize]
  );

  const handleTextChange = useCallback(
    (e: ChangeEvent<HTMLTextAreaElement>) =>
      dispatch({ type: "UPDATE_TEXT", payload: { text: e.target.value } }),
    []
  );

  useEffect(() => {
    const prevMode = prevModeRef.current;
    const currentMode = state.interactionMode;

    console.log(`Modo de interacción: ${currentMode}, Anterior: ${prevMode}`);

    if (prevMode !== "IDLE" && currentMode === "IDLE") {
      if (onUpdate) onUpdate(state);
      if (prevMode === "EDITING" && onDone) onDone(state);
    }

    prevModeRef.current = currentMode;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.interactionMode, onUpdate, onDone]);

  useEffect(() => {
    if (liveRegionRef.current) {
      liveRegionRef.current.textContent = `Posición: x ${Math.round(
        state.x
      )}, y ${Math.round(state.y)}. Tamaño de fuente: ${Math.round(
        state.fontSize
      )}px.`;
    }
  }, [state.x, state.y, state.fontSize]);

  return {
    state,
    dispatch,
    handleKeyDown,
    handleMouseDown,
    handleTextChange,
    liveRegionRef,
    measurementRef,
  };
}
