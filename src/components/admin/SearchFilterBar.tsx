"use client";

import React from "react";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
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
}

export default function SearchFilterBar({
  searchQuery,
  onSearchQueryChange,
  statusFilter,
  onStatusFilterChange,
  videoFilter,
  onVideoFilterChange,
}: SearchFilterBarProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-3 items-center">
      <div className="relative w-full sm:max-w-xs">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Find a lesson..."
          value={searchQuery}
          onChange={(e) => onSearchQueryChange(e.target.value)}
          className="pl-9 bg-background/50 border-border/80 h-9 text-sm"
        />
      </div>
      <div className="flex flex-wrap gap-2 w-full sm:w-auto">
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
      </div>
    </div>
  );
}
