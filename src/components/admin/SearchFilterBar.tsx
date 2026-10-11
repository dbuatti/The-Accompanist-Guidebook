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

export type StatusFilter = "all" | "published" | "draft";
export type VideoFilter = "all" | "requires_video" | "no_video";

interface SearchFilterBarProps {
  searchQuery: string;
  onSearchQueryChange: (val: string) => void;
  statusFilter: StatusFilter;
  onStatusFilterChange: (val: StatusFilter) => void;
  videoFilter: VideoFilter;
  onVideoFilterChange: (val: VideoFilter) => void;
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
        <Select value={statusFilter} onValueChange={(val) => onStatusFilterChange(val as StatusFilter)}>
          <SelectTrigger className="w-36 h-9 text-xs bg-background/50" aria-label="Filter by status">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="published">Published</SelectItem>
            <SelectItem value="draft">Drafts</SelectItem>
          </SelectContent>
        </Select>

        <Select value={videoFilter} onValueChange={(val) => onVideoFilterChange(val as VideoFilter)}>
          <SelectTrigger className="w-40 h-9 text-xs bg-background/50" aria-label="Filter by video requirement">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Lessons</SelectItem>
            <SelectItem value="requires_video">Video planned</SelectItem>
            <SelectItem value="no_video">No video</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
