import React from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { ArrowDownAZ, ArrowUpAZ, ArrowDownUp, ArrowUpDown, CalendarRange } from "lucide-react";

export type SortOption = {
  id: string;
  label: string;
  icon: React.ReactNode;
};

export const SORT_OPTIONS: SortOption[] = [
  {
    id: "position_asc",
    label: "Position (Oldest First)",
    icon: <ArrowUpDown className="h-4 w-4" />,
  },
  {
    id: "position_desc",
    label: "Position (Newest First)",
    icon: <ArrowDownUp className="h-4 w-4" />,
  },
  {
    id: "alpha_asc",
    label: "Alphabetical (A-Z)",
    icon: <ArrowDownAZ className="h-4 w-4" />,
  },
  {
    id: "alpha_desc",
    label: "Alphabetical (Z-A)",
    icon: <ArrowUpAZ className="h-4 w-4" />,
  },
  {
    id: "date_asc",
    label: "Creation Date (Oldest First)",
    icon: <CalendarRange className="h-4 w-4" />,
  },
  {
    id: "date_desc",
    label: "Creation Date (Newest First)",
    icon: <CalendarRange className="h-4 w-4" />,
  },
];

interface ColumnSortProps {
  value: string;
  onValueChange: (value: string) => void;
}

export function ColumnSort({ value, onValueChange }: ColumnSortProps) {
  const selectedOption = SORT_OPTIONS.find((option) => option.id === value);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-6 w-6 hover:bg-background/30">
          {selectedOption?.icon || <ArrowUpDown className="h-4 w-4" />}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[200px]">
        <DropdownMenuLabel>Sort by</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {SORT_OPTIONS.map((option) => (
          <DropdownMenuItem
            key={option.id}
            onClick={() => onValueChange(option.id)}
            className="flex items-center gap-2"
          >
            {option.icon}
            <span>{option.label}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
} 