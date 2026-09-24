import { desc } from "drizzle-orm";
import { Mail, CheckCircle2, AlertTriangle } from "lucide-react";
import { db } from "@/lib/db";
import { waitlist } from "@/lib/schema";
import CopyEmailsButton from "@/components/admin/CopyEmailsButton";

export default async function AdminLeadsPage() {
  const kitConfigured = !!process.env.KIT_API_KEY;
  let leads: { email: string; source: string; createdAt: Date }[] = [];
  try {
    leads = await db
      .select({ email: waitlist.email, source: waitlist.source, createdAt: waitlist.createdAt })
      .from(waitlist)
      .orderBy(desc(waitlist.createdAt));
  } catch (error) {
    console.error("Error fetching waitlist:", error);
  }

  const emails = leads.map((l) => l.email);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-serif font-bold text-primary">Email Leads</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Everyone who joined the free email list — your owned audience.
          </p>
        </div>
        <div className="flex items-center gap-3">
          {kitConfigured ? (
            <span className="inline-flex items-center gap-1.5 rounded-xl border border-accent/30 bg-accent/[0.08] px-3 py-2 text-xs font-medium text-accent-foreground">
              <CheckCircle2 className="w-3.5 h-3.5 text-accent-bright" />
              Auto-synced to Kit
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 rounded-xl border border-amber-400/30 bg-amber-400/10 px-3 py-2 text-xs font-medium text-amber-700">
              <AlertTriangle className="w-3.5 h-3.5" />
              Kit not connected
            </span>
          )}
          {leads.length > 0 && <CopyEmailsButton emails={emails} />}
          <div className="flex items-center gap-2 rounded-xl border border-border/60 bg-card/60 px-4 py-2.5">
            <Mail className="w-4 h-4 text-primary" />
            <span className="text-sm font-semibold text-primary tabular-nums">{leads.length}</span>
          </div>
        </div>
      </div>

      {leads.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border/70 bg-card/30 p-12 text-center">
          <Mail className="w-8 h-8 text-muted-foreground/40 mx-auto mb-3" />
          <p className="text-sm font-medium text-primary">No leads yet</p>
          <p className="text-xs text-muted-foreground mt-1">Emails will appear here as people join the list on the sales page.</p>
        </div>
      ) : (
        <div className="rounded-2xl border border-border/60 bg-card/40 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border/60 text-left text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground/70">
                <th className="px-5 py-3">Email</th>
                <th className="px-5 py-3 hidden sm:table-cell">Source</th>
                <th className="px-5 py-3">Joined</th>
              </tr>
            </thead>
            <tbody>
              {leads.map((lead) => (
                <tr key={lead.email} className="border-b border-border/40 last:border-0">
                  <td className="px-5 py-3 text-foreground/80 font-medium">{lead.email}</td>
                  <td className="px-5 py-3 hidden sm:table-cell text-muted-foreground">{lead.source}</td>
                  <td className="px-5 py-3 text-muted-foreground">
                    {new Date(lead.createdAt).toLocaleDateString("en-AU", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}