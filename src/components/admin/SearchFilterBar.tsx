"use client";

import React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Plus } from "lucide-react";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";

interface SearchFilterBarProps {
  searchQuery: string;
  onSearchQueryChange: (val: string) => void;
  statusFilter: string;
  onStatusFilterChange: (val: string) => void;
  videoFilter: string;
  onVideoFilterChange: (val: string) => void;
  energyFilter: string;
  onEnergyFilterChange: (val: string) => void;
  onAddLevel: () => void;
}

export default function SearchFilterBar({
  searchQuery,
  onSearchQueryChange,
  statusFilter,
  onStatusFilterChange,
  videoFilter,
  onVideoFilterChange,
  energyFilter,
  onEnergyFilterChange,
  onAddLevel,
}: SearchFilterBarProps) {
  return (
    <div className="bg-card/30 border border-border/50 rounded-2xl p-4 mb-8 flex flex-col sm:flex-row gap-4 items-center justify-between">
      <div className="relative w-full sm:max-w-xs">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Quick search lessons..."
          value={searchQuery}
          onChange={(e) => onSearchQueryChange(e.target.value)}
          className="pl-9 bg-background/50 border-border/80 h-9 text-sm"
        />
      </div>
      <div className="flex flex-wrap gap-3 w-full sm:w-auto justify-end">
        <Select value={statusFilter} onValueChange={onStatusFilterChange}>
          <SelectTrigger className="w-32 h-9 text-xs bg-background/50">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="published">Published</SelectItem>
            <SelectItem value="draft">Drafts</SelectItem>
          </SelectContent>
        </Select>

        <Select value={videoFilter} onValueChange={onVideoFilterChange}>
          <SelectTrigger className="w-36 h-9 text-xs bg-background/50">
            <SelectValue placeholder="Video Requirement" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Lessons</SelectItem>
            <SelectItem value="requires_video">Requires Video</SelectItem>
            <SelectItem value="no_video">No Video</SelectItem>
          </SelectContent>
        </Select>

        <Select value={energyFilter} onValueChange={onEnergyFilterChange}>
          <SelectTrigger className="w-36 h-9 text-xs bg-background/50">
            <SelectValue placeholder="Energy Level" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Energy Levels</SelectItem>
            <SelectItem value="low">Low Energy (Quick Tasks)</SelectItem>
            <SelectItem value="medium">Medium Energy</SelectItem>
            <SelectItem value="high">High Energy (Deep Focus)</SelectItem>
          </SelectContent>
        </Select>

        <Button onClick={onAddLevel} className="bg-primary h-9 text-xs">
          <Plus className="w-4 h-4 mr-1.5" /> Add Level
        </Button>
      </div>
    </div>
  );
}