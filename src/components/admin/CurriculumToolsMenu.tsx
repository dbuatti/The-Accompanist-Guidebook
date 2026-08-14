"use client";

import { useState } from "react";
import {
  restructureCourse,
  fixCourseStructure,
  syncLessonContent,
  scaffoldAuditionGuidebook,
  publishAllLessons,
  stripModuleNumberPrefixes,
} from "@/app/actions";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Wrench, Loader2, ChevronDown } from "lucide-react";
import { showSuccess, showError } from "@/utils/toast";

interface CurriculumToolsMenuProps {
  onRefetch: () => void | Promise<void>;
}

interface Tool {
  key: string;
  label: string;
  confirmMessage: string;
  run: () => Promise<string>;
}

export default function CurriculumToolsMenu({ onRefetch }: CurriculumToolsMenuProps) {
  const [pending, setPending] = useState<string | null>(null);

  const tools: Tool[] = [
    {
      key: "restructure",
      label: "Restructure Course",
      confirmMessage: "This will create a new Module 1, renumber all existing modules, and sync expanded lesson notes. Continue?",
      run: async () => { await restructureCourse(); return "Course restructured successfully"; },
    },
    {
      key: "fix",
      label: "Fix Structure",
      confirmMessage: "This will rebuild all module titles and display orders to be sequential. Use after Restructure Course. Continue?",
      run: async () => { await fixCourseStructure(); return "Structure fixed"; },
    },
    {
      key: "strip",
      label: "Strip Module Number Prefixes",
      confirmMessage: "This will remove any \"Module N: \" prefix from module titles. Continue?",
      run: async () => { const r = await stripModuleNumberPrefixes(); return `Stripped prefixes from ${r.updated} module(s)`; },
    },
    {
      key: "sync",
      label: "Sync Content",
      confirmMessage: "This will sync expanded lesson notes for all modules in the sync array. Continue?",
      run: async () => {
        const result = await syncLessonContent();
        const parts = [`Updated ${result.updatedLessons} lessons`];
        if (result.createdLessons) parts.push(`Created ${result.createdLessons} new`);
        return parts.join(", ");
      },
    },
    {
      key: "publish-all",
      label: "Publish All Lessons",
      confirmMessage: "This will mark every lesson in the course as published, including current drafts. Continue?",
      run: async () => { await publishAllLessons(); return "All lessons published"; },
    },
    {
      key: "scaffold",
      label: "Scaffold Curriculum",
      confirmMessage: "This will automatically create all 13 modules and populate them with structured lesson drafts. Are you sure you want to proceed?",
      run: async () => { await scaffoldAuditionGuidebook(); return "13-Module curriculum scaffolded successfully"; },
    },
  ];

  const runTool = async (tool: Tool) => {
    if (!confirm(tool.confirmMessage)) return;
    setPending(tool.key);
    try {
      const message = await tool.run();
      showSuccess(message);
      await onRefetch();
    } catch {
      showError(`Failed to run "${tool.label}"`);
    } finally {
      setPending(null);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="h-9 text-xs" disabled={!!pending}>
          {pending ? <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" /> : <Wrench className="w-3.5 h-3.5 mr-1.5" />}
          Tools
          <ChevronDown className="w-3 h-3 ml-1.5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        {tools.slice(0, -1).map((tool) => (
          <DropdownMenuItem key={tool.key} onClick={() => runTool(tool)} disabled={!!pending}>
            {tool.label}
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        {tools.slice(-1).map((tool) => (
          <DropdownMenuItem key={tool.key} onClick={() => runTool(tool)} disabled={!!pending}>
            {tool.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
