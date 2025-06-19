import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Users } from "lucide-react";

const mockUsers = [
  {
    id: "1",
    name: "Alice Johnson",
    avatar: "/placeholder.svg?height=32&width=32",
    color: "bg-blue-500",
  },
  {
    id: "2",
    name: "Bob Smith",
    avatar: "/placeholder.svg?height=32&width=32",
    color: "bg-green-500",
  },
  {
    id: "3",
    name: "Carol Davis",
    avatar: "/placeholder.svg?height=32&width=32",
    color: "bg-purple-500",
  },
  {
    id: "4",
    name: "David Wilson",
    avatar: "/placeholder.svg?height=32&width=32",
    color: "bg-orange-500",
  },
];

export function PresenceIndicator() {
  const visibleUsers = mockUsers.slice(0, 3);
  const remainingCount = Math.max(0, mockUsers.length - 3);

  return (
    <TooltipProvider>
      <div className="fixed top-4 right-4 z-50">
        <div className="flex items-center gap-3 p-1 px-1.5 rounded-2xl border border-border/50 bg-background/80 backdrop-blur-md shadow-lg">
          {/* Avatar Group */}
          <div className="flex items-center -space-x-2">
            {visibleUsers.map((user) => (
              <Tooltip key={user.id}>
                <TooltipTrigger asChild>
                  <Avatar className="w-8 h-8 border-2 border-background ring-2 ring-border/20 hover:scale-110 transition-transform cursor-pointer">
                    <AvatarImage
                      src={user.avatar || "/placeholder.svg"}
                      alt={user.name}
                    />
                    <AvatarFallback
                      className={`text-xs font-medium text-white ${user.color}`}
                    >
                      {user.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{user.name}</p>
                </TooltipContent>
              </Tooltip>
            ))}

            {remainingCount > 0 && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Avatar className="w-8 h-8 border-2 border-background ring-2 ring-border/20 hover:scale-110 transition-transform cursor-pointer">
                    <AvatarFallback className="text-xs font-medium bg-muted text-muted-foreground">
                      +{remainingCount}
                    </AvatarFallback>
                  </Avatar>
                </TooltipTrigger>
                <TooltipContent>
                  <p>
                    {remainingCount} more user{remainingCount !== 1 ? "s" : ""}
                  </p>
                </TooltipContent>
              </Tooltip>
            )}
          </div>

          {/* Users Button */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="w-10 h-10 rounded-xl hover:bg-accent/50 transition-colors"
                aria-label="View all participants"
              >
                <Users className="w-4 h-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>View all participants</p>
            </TooltipContent>
          </Tooltip>
        </div>
      </div>
    </TooltipProvider>
  );
}
