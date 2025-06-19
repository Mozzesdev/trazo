import { useState, useCallback, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Slider } from "@/components/ui/slider";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  MousePointer2,
  Pencil,
  Eraser,
  StickyNote,
  Undo2,
  Redo2,
  Trash2,
  ChevronRight,
  Type,
  Square,
  Circle,
} from "lucide-react";

/**
 * Available tool types for the floating toolbar
 */
export type ToolType =
  | "cursor"
  | "pencil"
  | "eraser"
  | "sticky"
  | "text"
  | "rectangle"
  | "circle";

/**
 * Color options for drawing tools
 */
export interface ColorOption {
  value: string;
  name: string;
  category: "basic" | "accent" | "neutral";
}

/**
 * Configuration for pencil tool
 */
export interface PencilOptions {
  color: string;
  strokeWidth: number;
  opacity: number;
}

/**
 * Configuration for eraser tool
 */
export interface EraserOptions {
  size: number;
  mode: "pixel" | "object";
}

/**
 * Configuration for text tool
 */
export interface TextOptions {
  fontSize: number;
  color: string;
  fontWeight: "normal" | "bold";
}

/**
 * All tool options combined
 */
export interface ToolOptions {
  pencil: PencilOptions;
  eraser: EraserOptions;
  text: TextOptions;
}

/**
 * Props for the FloatingToolbar component
 */
export interface FloatingToolbarProps {
  /** Currently active tool */
  activeTool: ToolType;
  /** Callback when tool changes */
  onToolChange: (tool: ToolType) => void;
  /** Callback for undo action */
  onUndo: () => void;
  /** Callback for redo action */
  onRedo: () => void;
  /** Callback for clear all action */
  onClear: () => void;
  /** Whether undo is available */
  canUndo: boolean;
  /** Whether redo is available */
  canRedo: boolean;
  /** Current tool options */
  toolOptions?: Partial<ToolOptions>;
  /** Callback when tool options change */
  onToolOptionsChange?: (options: ToolOptions) => void;
  /** Custom position for the toolbar */
  position?: "left" | "right";
  /** Whether the toolbar is collapsed */
  isCollapsed?: boolean;
}

/**
 * Professional color palette with semantic naming
 */
const COLOR_PALETTE: ColorOption[] = [
  // Basic colors
  { value: "#000000", name: "Black", category: "basic" },
  { value: "#FFFFFF", name: "White", category: "basic" },
  { value: "#EF4444", name: "Red", category: "basic" },
  { value: "#22C55E", name: "Green", category: "basic" },
  { value: "#3B82F6", name: "Blue", category: "basic" },

  // Accent colors
  { value: "#F97316", name: "Orange", category: "accent" },
  { value: "#EAB308", name: "Yellow", category: "accent" },
  { value: "#8B5CF6", name: "Purple", category: "accent" },
  { value: "#EC4899", name: "Pink", category: "accent" },
  { value: "#06B6D4", name: "Cyan", category: "accent" },

  // Neutral colors
  { value: "#374151", name: "Dark Gray", category: "neutral" },
  { value: "#6B7280", name: "Gray", category: "neutral" },
];

/**
 * Default tool options
 */
const DEFAULT_TOOL_OPTIONS: ToolOptions = {
  pencil: {
    color: "#000000",
    strokeWidth: 2,
    opacity: 100,
  },
  eraser: {
    size: 10,
    mode: "pixel",
  },
  text: {
    fontSize: 16,
    color: "#000000",
    fontWeight: "normal",
  },
};

/**
 * Tool configuration with metadata
 */
const TOOLS = [
  {
    id: "cursor" as const,
    icon: MousePointer2,
    label: "Select",
    description: "Select and move objects",
    hasOptions: false,
    shortcut: "V",
  },
  {
    id: "pencil" as const,
    icon: Pencil,
    label: "Pencil",
    description: "Draw freehand lines",
    hasOptions: true,
    shortcut: "P",
  },
  {
    id: "eraser" as const,
    icon: Eraser,
    label: "Eraser",
    description: "Erase drawings",
    hasOptions: true,
    shortcut: "E",
  },
  {
    id: "text" as const,
    icon: Type,
    label: "Text",
    description: "Add text annotations",
    hasOptions: true,
    shortcut: "T",
  },
  {
    id: "rectangle" as const,
    icon: Square,
    label: "Rectangle",
    description: "Draw rectangles",
    hasOptions: false,
    shortcut: "R",
  },
  {
    id: "circle" as const,
    icon: Circle,
    label: "Circle",
    description: "Draw circles",
    hasOptions: false,
    shortcut: "C",
  },
  {
    id: "sticky" as const,
    icon: StickyNote,
    label: "Sticky Note",
    description: "Add sticky notes",
    hasOptions: false,
    shortcut: "S",
  },
] as const;

/**
 * Professional floating toolbar component for drawing applications
 */
export function FloatingToolbar({
  activeTool,
  onToolChange,
  onUndo,
  onRedo,
  onClear,
  canUndo,
  canRedo,
  toolOptions: externalToolOptions,
  onToolOptionsChange,
  position = "left",
  isCollapsed = false,
}: FloatingToolbarProps) {
  const [internalToolOptions, setInternalToolOptions] =
    useState<ToolOptions>(DEFAULT_TOOL_OPTIONS);

  // Use external options if provided, otherwise use internal state
  const toolOptions = externalToolOptions || internalToolOptions;

  /**
   * Update tool options with proper callback handling
   */
  const updateToolOptions = useCallback(
    (updates: Partial<ToolOptions>) => {
      const pencil = toolOptions.pencil ?? DEFAULT_TOOL_OPTIONS.pencil;
      const eraser = toolOptions.eraser ?? DEFAULT_TOOL_OPTIONS.eraser;
      const text = toolOptions.text ?? DEFAULT_TOOL_OPTIONS.text;

      const newOptions: ToolOptions = {
        pencil: {
          color: updates.pencil?.color ?? pencil.color,
          strokeWidth: updates.pencil?.strokeWidth ?? pencil.strokeWidth,
          opacity: updates.pencil?.opacity ?? pencil.opacity,
        },
        eraser: {
          size: updates.eraser?.size ?? eraser.size,
          mode: updates.eraser?.mode ?? eraser.mode,
        },
        text: {
          fontSize: updates.text?.fontSize ?? text.fontSize,
          color: updates.text?.color ?? text.color,
          fontWeight: updates.text?.fontWeight ?? text.fontWeight,
        },
      };

      if (onToolOptionsChange) {
        onToolOptionsChange(newOptions);
      } else {
        setInternalToolOptions(newOptions);
      }
    },
    [toolOptions, onToolOptionsChange]
  );

  /**
   * Update specific pencil options
   */
  const updatePencilOptions = useCallback(
    (updates: Partial<PencilOptions>) => {
      updateToolOptions({
        pencil: {
          color:
            updates.color ??
            toolOptions.pencil?.color ??
            DEFAULT_TOOL_OPTIONS.pencil.color,
          strokeWidth:
            updates.strokeWidth ??
            toolOptions.pencil?.strokeWidth ??
            DEFAULT_TOOL_OPTIONS.pencil.strokeWidth,
          opacity:
            updates.opacity ??
            toolOptions.pencil?.opacity ??
            DEFAULT_TOOL_OPTIONS.pencil.opacity,
        },
      });
    },
    [toolOptions.pencil, updateToolOptions]
  );

  /**
   * Update specific eraser options
   */
  const updateEraserOptions = useCallback(
    (updates: Partial<EraserOptions>) => {
      const eraser = toolOptions.eraser ?? DEFAULT_TOOL_OPTIONS.eraser;
      updateToolOptions({
        eraser: {
          size: updates.size ?? eraser.size,
          mode: updates.mode ?? eraser.mode,
        },
      });
    },
    [toolOptions.eraser, updateToolOptions]
  );

  /**
   * Update specific text options
   */
  const updateTextOptions = useCallback(
    (updates: Partial<TextOptions>) => {
      updateToolOptions({
        text: {
          fontSize:
            updates.fontSize ??
            toolOptions.text?.fontSize ??
            DEFAULT_TOOL_OPTIONS.text.fontSize,
          color:
            updates.color ??
            toolOptions.text?.color ??
            DEFAULT_TOOL_OPTIONS.text.color,
          fontWeight:
            updates.fontWeight ??
            toolOptions.text?.fontWeight ??
            DEFAULT_TOOL_OPTIONS.text.fontWeight,
        },
      });
    },
    [toolOptions.text, updateToolOptions]
  );

  /**
   * Handle tool change with validation
   */
  const handleToolChange = useCallback(
    (tool: string | undefined) => {
      if (tool && TOOLS.some((t) => t.id === tool)) {
        onToolChange(tool as ToolType);
      }
    },
    [onToolChange]
  );

  /**
   * Memoized position classes
   */
  const positionClasses = useMemo(() => {
    return position === "left"
      ? "fixed left-4 top-1/2 -translate-y-1/2"
      : "fixed right-4 top-1/2 -translate-y-1/2";
  }, [position]);

  /**
   * Render color palette
   */
  const renderColorPalette = useCallback(
    (currentColor: string, onColorChange: (color: string) => void) => (
      <div className="space-y-3">
        <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
          Color
        </label>
        <div className="grid grid-cols-5 gap-2">
          {COLOR_PALETTE.map((colorOption) => (
            <Tooltip key={colorOption.value}>
              <TooltipTrigger asChild>
                <button
                  onClick={() => onColorChange(colorOption.value)}
                  className={`w-8 h-8 rounded-lg border-2 transition-all hover:scale-110 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${
                    currentColor === colorOption.value
                      ? "border-primary shadow-lg ring-2 ring-primary ring-offset-2"
                      : "border-border/50 hover:border-border"
                  }`}
                  style={{ backgroundColor: colorOption.value }}
                  aria-label={`Select ${colorOption.name} color`}
                />
              </TooltipTrigger>
              <TooltipContent>
                <p>{colorOption.name}</p>
              </TooltipContent>
            </Tooltip>
          ))}
        </div>
      </div>
    ),
    []
  );

  /**
   * Render tool options popover content
   */
  const renderToolOptions = useCallback(
    (tool: (typeof TOOLS)[number]) => {
      switch (tool.id) {
        case "pencil":
          return (
            <div className="space-y-4 w-64">
              <div className="border-b border-border/50 pb-3">
                <h4 className="font-semibold text-sm text-foreground">
                  Pencil Settings
                </h4>
                <p className="text-xs text-muted-foreground mt-1">
                  Customize your drawing tool
                </p>
              </div>

              {renderColorPalette(
                toolOptions.pencil?.color ?? DEFAULT_TOOL_OPTIONS.pencil.color,
                (color) => updatePencilOptions({ color })
              )}

              <div className="space-y-3">
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Stroke Width:{" "}
                  {toolOptions.pencil?.strokeWidth ??
                    DEFAULT_TOOL_OPTIONS.pencil.strokeWidth}
                  px
                </label>
                <Slider
                  value={[
                    toolOptions.pencil?.strokeWidth ??
                      DEFAULT_TOOL_OPTIONS.pencil.strokeWidth,
                  ]}
                  onValueChange={([value]) =>
                    updatePencilOptions({ strokeWidth: value })
                  }
                  min={1}
                  max={20}
                  step={1}
                  className="w-full"
                />
              </div>

              <div className="space-y-3">
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Opacity:{" "}
                  {toolOptions.pencil?.opacity ??
                    DEFAULT_TOOL_OPTIONS.pencil.opacity}
                  %
                </label>
                <Slider
                  value={[
                    toolOptions.pencil?.opacity ??
                      DEFAULT_TOOL_OPTIONS.pencil.opacity,
                  ]}
                  onValueChange={([value]) =>
                    updatePencilOptions({ opacity: value })
                  }
                  min={10}
                  max={100}
                  step={10}
                  className="w-full"
                />
              </div>
            </div>
          );

        case "eraser":
          return (
            <div className="space-y-4 w-64">
              <div className="border-b border-border/50 pb-3">
                <h4 className="font-semibold text-sm text-foreground">
                  Eraser Settings
                </h4>
                <p className="text-xs text-muted-foreground mt-1">
                  Configure eraser behavior
                </p>
              </div>

              <div className="space-y-3">
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Eraser Size:{" "}
                  {toolOptions.eraser?.size ?? DEFAULT_TOOL_OPTIONS.eraser.size}
                  px
                </label>
                <Slider
                  value={[
                    toolOptions.eraser?.size ??
                      DEFAULT_TOOL_OPTIONS.eraser.size,
                  ]}
                  onValueChange={([value]) =>
                    updateEraserOptions({ size: value })
                  }
                  min={5}
                  max={50}
                  step={5}
                  className="w-full"
                />

                {/* <div className="flex justify-center pt-2">
                  <div
                    className="rounded-full bg-muted border-2 border-dashed border-muted-foreground/50"
                    style={{
                      width: `${Math.min(
                        toolOptions.eraser?.size ??
                          DEFAULT_TOOL_OPTIONS.eraser.size,
                        40
                      )}px`,
                      height: `${Math.min(
                        toolOptions.eraser?.size ??
                          DEFAULT_TOOL_OPTIONS.eraser.size,
                        40
                      )}px`,
                    }}
                  />
                </div> */}
              </div>
            </div>
          );

        case "text":
          return (
            <div className="space-y-4 w-64">
              <div className="border-b border-border/50 pb-3">
                <h4 className="font-semibold text-sm text-foreground">
                  Text Settings
                </h4>
                <p className="text-xs text-muted-foreground mt-1">
                  Customize text appearance
                </p>
              </div>

              {renderColorPalette(
                toolOptions.text?.color ?? DEFAULT_TOOL_OPTIONS.text.color,
                (color) => updateTextOptions({ color })
              )}

              <div className="space-y-3">
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Font Size:{" "}
                  {toolOptions.text?.fontSize ??
                    DEFAULT_TOOL_OPTIONS.text.fontSize}
                  px
                </label>
                <Slider
                  value={[
                    toolOptions.text?.fontSize ??
                      DEFAULT_TOOL_OPTIONS.text.fontSize,
                  ]}
                  onValueChange={([value]) =>
                    updateTextOptions({ fontSize: value })
                  }
                  min={8}
                  max={72}
                  step={2}
                  className="w-full"
                />
              </div>
            </div>
          );

        default:
          return null;
      }
    },
    [
      toolOptions,
      updatePencilOptions,
      updateEraserOptions,
      updateTextOptions,
      renderColorPalette,
    ]
  );

  if (isCollapsed) {
    return (
      <TooltipProvider>
        <div className={`${positionClasses} z-50`}>
          <Button
            variant="outline"
            size="icon"
            className="rounded-full bg-background/95 backdrop-blur-md shadow-lg border-border/50"
            onClick={() => {
              /* Handle expand */
            }}
          >
            <MousePointer2 className="w-4 h-4" />
          </Button>
        </div>
      </TooltipProvider>
    );
  }

  return (
    <TooltipProvider>
      <div className={`${positionClasses} z-50`}>
        <div className="flex flex-col items-center gap-3 p-3 rounded-2xl border border-border/50 bg-background/95 backdrop-blur-md shadow-xl">
          {/* Tool Selection */}
          <ToggleGroup
            type="single"
            value={activeTool}
            onValueChange={handleToolChange}
            orientation="vertical"
            className="flex flex-col gap-1"
          >
            {TOOLS.map((tool) => {
              const Icon = tool.icon;
              const isActive = activeTool === tool.id;

              if (tool.hasOptions) {
                return (
                  <div key={tool.id} className="relative">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <ToggleGroupItem
                          value={tool.id}
                          data-state={isActive ? "on" : "off"}
                          aria-label={`${tool.label} (${tool.shortcut})`}
                          className="p-0 w-8 h-8 cursor-pointer data-[state=on]:bg-accent rounded-sm hover:bg-accent/50 transition-all duration-200 relative group"
                        >
                          <Icon
                            className="w-5 h-5 transition-transform group-hover:scale-110"
                            style={
                              tool.id === "pencil" && isActive
                                ? {
                                    color:
                                      toolOptions.pencil?.color ??
                                      DEFAULT_TOOL_OPTIONS.pencil.color,
                                  }
                                : tool.id === "text" && isActive
                                ? {
                                    color:
                                      toolOptions.text?.color ??
                                      DEFAULT_TOOL_OPTIONS.text.color,
                                  }
                                : {}
                            }
                          />
                        </ToggleGroupItem>
                      </TooltipTrigger>
                      <TooltipContent
                        side={position === "left" ? "right" : "left"}
                        sideOffset={12}
                      >
                        <div className="text-center">
                          <p className="font-medium">{tool.label}</p>
                          <p className="text-xs text-muted-foreground">
                            {tool.description}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            Press {tool.shortcut}
                          </p>
                        </div>
                      </TooltipContent>
                    </Tooltip>

                    {/* Tool Options Popover */}
                    {isActive && (
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className={`absolute ${
                              position === "left" ? "-right-8" : "-left-8"
                            } top-0.5 w-5 h-7 ${
                              position === "left"
                                ? "rounded-l-none rounded-r-xl"
                                : "rounded-r-none rounded-l-xl"
                            } bg-background/95 backdrop-blur-md border border-border/50 ${
                              position === "left" ? "border-l-0" : "border-r-0"
                            } hover:bg-accent/50 transition-all duration-200`}
                          >
                            <ChevronRight
                              className={`w-3 h-3 ${
                                position === "right" ? "rotate-180" : ""
                              }`}
                            />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent
                          side={position === "left" ? "right" : "left"}
                          sideOffset={8}
                          className="border border-border/50 bg-background/98 backdrop-blur-md shadow-2xl p-4"
                        >
                          {renderToolOptions(tool)}
                        </PopoverContent>
                      </Popover>
                    )}
                  </div>
                );
              }

              return (
                <div key={tool.id} className="relative">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <ToggleGroupItem
                        value={tool.id}
                        data-state={isActive ? "on" : "off"}
                        aria-label={`${tool.label} (${tool.shortcut})`}
                        className="p-0 w-8 h-8 cursor-pointer rounded-xl data-[state=on]:bg-accent hover:bg-accent/50 transition-all duration-200 group"
                      >
                        <Icon className="w-5 h-5 transition-transform group-hover:scale-110" />
                      </ToggleGroupItem>
                    </TooltipTrigger>
                    <TooltipContent
                      side={position === "left" ? "right" : "left"}
                      sideOffset={12}
                    >
                      <div className="text-center">
                        <p className="font-medium">{tool.label}</p>
                        <p className="text-xs text-muted-foreground">
                          {tool.description}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Press {tool.shortcut}
                        </p>
                      </div>
                    </TooltipContent>
                  </Tooltip>
                </div>
              );
            })}
          </ToggleGroup>

          <Separator className="w-8 my-1" />

          {/* Action Buttons */}
          <div className="flex flex-col gap-1">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="w-8 h-8 rounded-xl cursor-pointer hover:bg-accent/50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed group"
                  aria-label="Undo (Ctrl+Z)"
                  onClick={onUndo}
                  disabled={!canUndo}
                >
                  <Undo2 className="w-5 h-5 transition-transform group-hover:scale-110" />
                </Button>
              </TooltipTrigger>
              <TooltipContent
                side={position === "left" ? "right" : "left"}
                sideOffset={12}
              >
                <p>Undo (Ctrl+Z)</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="w-8 h-8 rounded-xl cursor-pointer hover:bg-accent/50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed group"
                  aria-label="Redo (Ctrl+Y)"
                  onClick={onRedo}
                  disabled={!canRedo}
                >
                  <Redo2 className="w-5 h-5 transition-transform group-hover:scale-110" />
                </Button>
              </TooltipTrigger>
              <TooltipContent
                side={position === "left" ? "right" : "left"}
                sideOffset={12}
              >
                <p>Redo (Ctrl+Y)</p>
              </TooltipContent>
            </Tooltip>

            <Separator className="w-6 my-1" />

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onClear}
                  className="w-8 h-8 rounded-xl cursor-pointer hover:bg-destructive/20 hover:text-destructive transition-all duration-200 group"
                  aria-label="Clear All (Ctrl+Shift+X)"
                >
                  <Trash2 className="w-5 h-5 transition-transform group-hover:scale-110" />
                </Button>
              </TooltipTrigger>
              <TooltipContent
                side={position === "left" ? "right" : "left"}
                sideOffset={12}
              >
                <p>Clear All (Ctrl+Shift+X)</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}
