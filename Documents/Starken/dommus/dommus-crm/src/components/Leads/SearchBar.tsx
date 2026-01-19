import React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Filter, Plus, Search } from "lucide-react";

interface SearchBarProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  onAddClick?: () => void;
}

export function SearchBar({ searchQuery, onSearchChange, onAddClick }: SearchBarProps) {
  return (
    <div className="flex items-center gap-3 w-full sm:w-auto">
      <div className="relative w-full sm:w-auto">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search leads..."
          className="pl-8 w-full sm:w-[250px] border-green-200 focus:border-green-400 focus:ring-green-400"
          value={searchQuery}
          onChange={e => onSearchChange(e.target.value)}
        />
      </div>
      <Button variant="outline" size="icon" className="border-green-200 hover:border-green-300 hover:bg-green-50">
        <Filter size={18} className="text-green-500" />
      </Button>
      <Button 
        className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 transition-all duration-300"
        onClick={onAddClick}
      >
        <Plus size={18} className="mr-2" />
        New Lead
      </Button>
    </div>
  );
}
