import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { Copy, Share2, Check } from "lucide-react";

export function ShareButton() {
  const [copied, setCopied] = useState(false);
  const shareUrl = "https://whiteboard.app/room/abc123";

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy link:", err);
    }
  };

  return (
    <TooltipProvider>
      <div className="fixed top-4 left-4 z-50">
        <Popover>
          <Tooltip>
            <TooltipTrigger asChild>
              <PopoverTrigger asChild>
                <Button
                  variant="default"
                  className="gap-2 px-4 py-2 cursor-pointer text-sm h-10 rounded-2xl border border-border/50 bg-background/80 backdrop-blur-md shadow-lg hover:bg-accent/50 transition-colors text-foreground"
                >
                  <Share2 className="w-4 h-4" />
                  Share
                </Button>
              </PopoverTrigger>
            </TooltipTrigger>
            <TooltipContent>
              <p>Share whiteboard</p>
            </TooltipContent>
          </Tooltip>

          <PopoverContent
            className="w-80 p-4 border border-border/50 bg-background/95 backdrop-blur-md shadow-xl"
            side="bottom"
            align="start"
            sideOffset={8}
          >
            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-sm mb-2">
                  Share this whiteboard
                </h4>
                <p className="text-xs text-muted-foreground mb-3">
                  Anyone with this link can view and edit this whiteboard.
                </p>
              </div>

              <div className="flex gap-2">
                <Input
                  value={shareUrl}
                  readOnly
                  className="flex-1 text-sm bg-muted/50"
                />
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={handleCopyLink}
                      className="shrink-0 hover:bg-accent/50 transition-colors"
                    >
                      {copied ? (
                        <Check className="w-4 h-4 text-green-600" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{copied ? "Copied!" : "Copy link"}</p>
                  </TooltipContent>
                </Tooltip>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </TooltipProvider>
  );
}
