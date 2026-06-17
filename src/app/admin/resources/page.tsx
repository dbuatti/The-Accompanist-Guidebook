"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, ExternalLink, Copy, Check, Presentation, FileText, MessageSquare, Sparkles, Calendar, Kanban } from "lucide-react";
import { showSuccess, showError } from "@/utils/toast";
import AdminNav from "@/components/AdminNav";
import { authClient } from "@/lib/auth/client";

const ADMIN_EMAILS = ["admin@accompanist.com", "daniele.buatti@gmail.com"];

interface Resource {
  title: string;
  description: string;
  url: string;
  category: string;
  icon: any;
  color: string;
}

export default function AdminResourcesPage() {
  const router = useRouter();
  const { data: session, isPending: isAuthPending } = authClient.useSession();
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  useEffect(() => {
    if (!isAuthPending && !session) {
      router.push("/auth/sign-in");
      return;
    }
    if (session && (!session.user.email || !ADMIN_EMAILS.includes(session.user.email.toLowerCase()))) {
      router.push("/modules");
      return;
    }
  }, [session, isAuthPending, router]);

  const resources: Resource[] = [
    {
      title: "Claude AI Workspace",
      description: "Direct link to the Claude chat session for guidebook development and planning.",
      url: "https://claude.ai/chat/1370e7d5-81d7-4108-ac7b-5397eb4e8c4d",
      category: "AI Assistant",
      icon: MessageSquare,
      color: "bg-purple-500/10 text-purple-700 border-purple-500/20",
    },
    {
      title: "Notion Course Development",
      description: "Master Notion workspace for planning, structuring, and drafting the Audition Guidebook.",
      url: "https://app.notion.com/p/danielebuatti/Audition-Guidebook-Course-Development-35caad21cd0981a18eb9e5a05fa3f765",
      category: "Notion Workspace",
      icon: Kanban,
      color: "bg-emerald-500/10 text-emerald-700 border-emerald-500/20",
    },
    {
      title: "Filming Schedule",
      description: "Notion database tracking video production, filming dates, and editing status.",
      url: "https://app.notion.com/p/danielebuatti/dec3663aeda14afdb81b296fa94e9f87?v=a73d9a50dce24b29a8ff50ab5a1b9add",
      category: "Production Schedule",
      icon: Calendar,
      color: "bg-rose-500/10 text-rose-700 border-rose-500/20",
    },
    {
      title: "Audition Prep Workshop (Wednesdays)",
      description: "Google Slides presentation for the weekly Wednesday Audition Prep Workshop.",
      url: "https://docs.google.com/presentation/d/1uPpJG-E859qQSj6J-8HYHLQifaruqsMiafLj_lM-dbA/edit?slide=id.g3531c216a29_0_95#slide=id.g3531c216a29_0_95",
      category: "Presentation",
      icon: Presentation,
      color: "bg-amber-500/10 text-amber-700 border-amber-500/20",
    },
    {
      title: "Audition Guidebook",
      description: "Google Doc containing the master guidebook content, notes, and curriculum outline.",
      url: "https://docs.google.com/document/d/1RLfXUVcRcGTsZhBoU7ZZC4AnQdzPCy89/edit",
      category: "Documentation",
      icon: FileText,
      color: "bg-blue-500/10 text-blue-700 border-blue-500/20",
    },
  ];

  const handleCopy = async (url: string, index: number) => {
    try {
      await navigator.clipboard.writeText(url);
      setCopiedIndex(index);
      showSuccess("Link copied to clipboard!");
      setTimeout(() => setCopiedIndex(null), 2000);
    } catch (err) {
      showError("Failed to copy link.");
    }
  };

  if (isAuthPending) {
    return (
      <div className="h-screen flex items-center justify-center">
        <Loader2 className="animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-8 max-w-5xl mx-auto">
      <AdminNav />

      <div className="mb-8">
        <h2 className="text-xl font-serif font-semibold text-primary flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-accent" />
          Quick Workspaces & Resources
        </h2>
        <p className="text-sm text-muted-foreground">
          Launch your external tools, slides, and documents instantly to streamline your workflow.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {resources.map((resource, index) => {
          const Icon = resource.icon;
          return (
            <Card key={index} className="bg-card/50 border-border/50 flex flex-col justify-between hover:shadow-md transition-all">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${resource.color}`}>
                    {resource.category}
                  </span>
                  <div className="p-2 rounded-lg bg-primary/5 text-primary">
                    <Icon className="w-5 h-5" />
                  </div>
                </div>
                <CardTitle className="text-lg font-serif font-bold text-primary mt-2">
                  {resource.title}
                </CardTitle>
                <CardDescription className="text-sm text-muted-foreground leading-relaxed mt-1">
                  {resource.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0 flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 border-border/80 hover:bg-primary/5 hover:text-primary transition-all"
                  onClick={() => handleCopy(resource.url, index)}
                >
                  {copiedIndex === index ? (
                    <>
                      <Check className="w-4 h-4 mr-2 text-green-600" />
                      Copied
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 mr-2" />
                      Copy Link
                    </>
                  )}
                </Button>
                <a
                  href={resource.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1"
                >
                  <Button size="sm" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Open Link
                  </Button>
                </a>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}