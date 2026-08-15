import CopyDocumentButton from "@/components/admin/CopyDocumentButton";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, DollarSign, Clock, Target, Rocket, AlertTriangle, Banknote } from "lucide-react";

export const metadata = {
  title: "Strategy · Admin · The Audition Guidebook",
  description: "Positioning, value proposition, valuation, and tiered growth roadmap (admin only).",
  robots: { index: false, follow: false },
};

function Pill({ icon: Icon, children }: { icon: any; children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-card/60 px-3 py-1 text-[11px] font-medium text-muted-foreground">
      <Icon className="h-3.5 w-3.5 text-primary/70" />
      {children}
    </span>
  );
}

function SectionTitle({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    <h2 id={id} className="mt-14 scroll-mt-8 border-b border-border/40 pb-2 font-serif text-xl font-bold text-primary">
      {children}
    </h2>
  );
}

function SubTitle({ children }: { children: React.ReactNode }) {
  return <h3 className="mt-7 font-serif text-base font-semibold text-primary/90">{children}</h3>;
}

function FactRow({ k, children }: { k: string; children: React.ReactNode }) {
  return (
    <tr className="align-top">
      <td className="py-2.5 pr-4 font-medium text-primary/80">{k}</td>
      <td className="py-2.5 text-foreground/85">{children}</td>
    </tr>
  );
}

function Bullet({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-3">
      <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-primary/40" />
      <span>{children}</span>
    </li>
  );
}

function DollarPill({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-0.5 font-mono text-[11px] font-bold text-primary">{children}</span>
  );
}

export default function StrategyPage() {
  return (
    <div className="max-w-4xl mx-auto">

      {/* Hero */}
      <div className="relative overflow-hidden rounded-2xl border border-border/40 bg-gradient-to-br from-primary/[0.06] via-card/40 to-transparent p-8">
        <div className="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-primary/[0.04] blur-3xl" />
        <div className="relative">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline" className="gap-1.5 border-primary/20 bg-primary/5 text-primary">
              <Target className="h-3.5 w-3.5" /> Admin only
            </Badge>
            <Badge variant="outline" className="border-amber-500/20 bg-amber-500/5 text-amber-700">
              Business consultant view
            </Badge>
            <Badge variant="outline" className="border-border/60 text-muted-foreground">
              14 August 2026
            </Badge>
          </div>
          <h1 className="mt-4 font-serif text-3xl font-bold text-primary sm:text-4xl">Strategy &amp; Valuation</h1>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground">
            The commercial companion to the Blueprint. Covers the single customer-facing proposition, naming, a grounded
            valuation at the current maturity, a 3-tier value-creation roadmap with dollar targets and itemized actions,
            the dollar cost of each launch-delay week, and the priority sequence &mdash; written so a fresh Claude
            session can act on it.
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            <Pill icon={Target}>Positioning &amp; naming</Pill>
            <Pill icon={Banknote}>Customer value proposition</Pill>
            <Pill icon={DollarSign}>Grounded valuation (realistic)</Pill>
            <Pill icon={TrendingUp}>3-tier value roadmap</Pill>
            <Pill icon={Clock}>Cost-of-delay math</Pill>
          </div>
          <div className="mt-6">
            <CopyDocumentButton targetId="strategy-document" />
          </div>
        </div>
      </div>

      <article id="strategy-document" className="mt-10">
        {/* ============================================================= */}
        {/* PART A — POSITIONING & NAMING                                 */}
        {/* ============================================================= */}
        <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-primary/50">Part A</p>
        <h2 className="border-b border-border/40 pb-2 font-serif text-2xl font-bold text-primary">
          Positioning &amp; Naming
        </h2>

        <SectionTitle id="a-the-earth-truth">A1 · The earth truth (what a buyer actually gets)</SectionTitle>
        <p className="mt-3 text-[15px] leading-relaxed text-foreground/85">
          This is not a dev project with a course attached; it&apos;s a <strong>course product run by a professional
          coach</strong>. The 57-lesson Musical Theatre Audition Playbook is built on the instructor&apos;s
          professional &amp; exam experience &mdash; the long-life <em>evergreen</em> asset. The app is the lightest
          possible delivery vehicle for that content, delivering it on a virtual UNIX database platform.
          <strong> The customer is &ldquo;working musical theatre performers about to audition&rdquo;</strong>, and the
          promise is a <strong>practical, unromantic, practical set of audition-room workflows</strong> taught from the
          vantage of the accompanist.
        </p>

        <SectionTitle id="a-why-it-differs">A2 · Why it differs (the one-line positioning)</SectionTitle>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <tbody className="divide-y divide-border/40">
              <FactRow k="Competitor archetype">
                Broadway coaching studios selling 50/60-min private lessons at <DollarPill>$100&ndash;$200</DollarPill> a session.
              </FactRow>
              <FactRow k="This product">
                <strong>Self-paced, on-demand</strong> &mdash; lower-risk and cheaper per session; can be retaken at the
                cost of a digital note.
              </FactRow>
              <FactRow k="Why it wins (if it does)">
                It&apos;s taught <strong>by a working accompanist heard on the other side of every audition
                table</strong>. The &ldquo;music side&rdquo; of auditioning is the hardest part and the least-taught
                part. Most coaching focuses on vocal coaching; this is the &ldquo;everything else&rdquo; of the panel
                &mdash; repertoire, cuts, sheet music, tempo, presentation.
              </FactRow>
              <FactRow k="Why it loses (if it does)">
                Self-paced <strong>lacks the looped-by-visual-feedback</strong> loop of a live coach. Hard to charge a
                premium price without some form of human-touch/value-add (see Tier 2 roadmap).
              </FactRow>
              <FactRow k="Proof needed">
                For the singing register, the work is done by the instructor + rhe owner &mdash; <strong>YouTube
                credentials are weak</strong> until the course is full of video. <DollarPill>14/37 published lessons have
                video</DollarPill>. Messaging + brand sound change should reflect this <em>now</em>.
              </FactRow>
            </tbody>
          </table>
        </div>

        <SectionTitle id="a-naming">A3 · Naming &mdash; where it stands and what to do about it</SectionTitle>
        <p className="mt-3 text-[15px] leading-relaxed text-foreground/85">
          You&apos;re correct that naming is <strong>upstream of everything downstream</strong>. The current name
          &mdash; <strong>&ldquo;The Accompanist Guidebook&rdquo;</strong> &mdash; is operationally clean and consistent
          across the repo and brand surfaces, but it has <strong>two positioning tensions</strong> that should be
          resolved before you spend money on a domain or any marketing creative.
        </p>
        <SubTitle>Tension 1 &mdash; audience signal</SubTitle>
        <p className="mt-2 text-[15px] leading-relaxed text-foreground/85">
          The name names the <em>instructor</em>, not the <em>student</em>. To a cold visitor it reads as a course
          <em> for accompanists</em> &mdash; and indeed the landing hero literally says &ldquo;a video course for musical
          theatre accompanists&rdquo; (<code className="rounded bg-muted px-1.5 py-0.5">src/app/page.tsx:43</code>). But
          the curriculum is for <em>singers</em>. Every module &mdash; choosing repertoire, marking cuts, delivering
          tempo, talking to the accompanist &mdash; is something the <em>singer</em> does. So the name as it stands
          is a <strong>&ldquo;said Guest, looks Host&rdquo;</strong> name: aimed at the listener, named for the speaker.
          That&apos;s a real source of prune-on-arrival confusion and converts worse than a name that names the user.
        </p>
        <SubTitle>Tension 2 &mdash; category words</SubTitle>
        <p className="mt-2 text-[15px] leading-relaxed text-foreground/85">
          &ldquo;Guidebook&rdquo; is <strong>the right word</strong> &mdash; it signals a reference you keep and return
          to (the product positioning), not a one-and-done online class. Protect that word. The weaker half of the name
          is &ldquo;Accompanist&rdquo; as the <em>subject</em> &mdash; it signals a person who is not the buyer.
        </p>
        <SubTitle>Options, ranked</SubTitle>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b border-border/50 text-left text-[11px] uppercase tracking-wider text-muted-foreground">
                <th className="py-2 pr-4 font-semibold">Option</th>
                <th className="py-2 pr-4 font-semibold">Signal to the buyer</th>
                <th className="py-2 font-semibold">Trade-offs</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              <FactRow k="A &mdash; Keep &ldquo;The Accompanist Guidebook&rdquo;">
                Instructor-perspective brand. Keep it if you keep the positioning as
                &ldquo;taught-from-the-piano-bench insight&rdquo; and fix the tagline to make the audience explicit.
                Lowest churn cost. Highest lateral-conversion-room risk.
              </FactRow>
              <FactRow k="B &mdash; &ldquo;The Audition Guidebook&rdquo;">
                Uses the internal codebrand. Names the <em>event</em> (audition), which the buyer is preparing for.
                Category-goes-after the core job-to-be-done. Lets the tagline carry the &ldquo;taught by an
                accompanist&rdquo; angle. Cheap to switch now (internal uses already lean this way &mdash;
                <code>lessonContent.ts</code>, Gemini prompts, Notion).
              </FactRow>
              <FactRow k="C &mdash; A buyer-naming variant">
                e.g. <em>The Singer&apos;s Audition Guidebook</em> &mdash; names the user. Most explicit; slightly
                longer; could lose the &ldquo;taught by an accompanist&rdquo; nuance in the title itself.
              </FactRow>
              <FactRow k="D &mdash; Fresh brand new name">
                New organic brandable name. Highest potential ceiling, highest rework cost &mdash; do this only if
                you&apos;ve done customer interviews. <strong>Not recommended before launch.</strong>
              </FactRow>
            </tbody>
          </table>
        </div>
        <Card className="mt-5 border-primary/15 bg-primary/[0.03]">
          <CardContent className="p-5 text-sm leading-relaxed text-foreground/85">
            <p className="font-semibold text-primary">
              <AlertTriangle className="mr-1 inline h-4 w-4 align-[-2px]" /> Consultant recommendation
            </p>
            <p className="mt-1">
              <strong>Pick Option B &mdash; &ldquo;The Audition Guidebook&rdquo;</strong> &mdash; but make the decision
              this week, not after audit. The cost to switch today is &lt;1h of find/replace + a domain purchase + updating
              Vercel/OG text. The cost to switch after you&apos;ve launched a domain, paid ads, and SEO equity is 50&times;.
              Take the tagline fix and fold it into the same change: &ldquo;A complete video course for the musical
              theatre singer &mdash; taught from the accompanist&apos;s bench.&rdquo;
            </p>
          </CardContent>
        </Card>

        {/* ============================================================= */}
        {/* PART B — CUSTOMER VALUE PROPOSITION                           */}
        {/* ============================================================= */}
        <p className="mt-14 text-[11px] font-bold uppercase tracking-[0.2em] text-primary/50">Part B</p>
        <h2 className="border-b border-border/40 pb-2 font-serif text-2xl font-bold text-primary">
          Customer Value Proposition
        </h2>

        <SectionTitle id="b-vop">B1 · The single customer proposition (one sentence)</SectionTitle>
        <Card className="mt-4 border-primary/20 bg-primary/[0.04]">
          <CardContent className="p-6">
            <p className="font-serif text-lg leading-snug text-primary">
              &ldquo;For the working musical theatre performer about to audition, The Accompanist Guidebook is the
              practical, on-demand video course that teaches the music-side of auditioning &mdash; choosing repertoire,
              cutting, annotating and presenting sheet music, and delivering tempo and the handover &mdash; taught by a
              working audition pianist, so you can walk into any room and have the accompanist play <em>with</em> you,
              not against you.&rdquo;
            </p>
          </CardContent>
        </Card>

        <SectionTitle id="b-jtbd-loop">B2 · The job-to-be-done &amp; the value loop</SectionTitle>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b border-border/50 text-left text-[11px] uppercase tracking-wider text-muted-foreground">
                <th className="py-2 pr-4 font-semibold">Element</th>
                <th className="py-2 font-semibold">Statement</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              <FactRow k="Job-to-be-done">
                Walk into an audition with sheet music any accompanist can sight-read cold, deliver a tempo that holds,
                and hand over the music without forgetting anything.
              </FactRow>
              <FactRow k="Functional value">
                Remove the &ldquo;I don&apos;t know what I don&apos;t know&rdquo; risk on the music side &mdash; so the
                singer can stop worrying about the piano and focus on singing.
              </FactRow>
              <FactRow k="Emotional value">
                Convert audition anxiety from dread to confidence &mdash; because the most unpredictable variable in the
                room (the accompanist) is now understood and de-risked.
              </FactRow>
              <FactRow k="Social value">
                Be seen in the room as a prepared, collaborative, professional performer &mdash; the singer the
                accompanist remembers fondly.
              </FactRow>
              <FactRow k="Promise (what it is)">
                Thirteen modules of video lessons from repertoire selection to in-room behaviour, delivered as a
                reference you keep and return to.
              </FactRow>
              <FactRow k="Proof (why believe it)">
                Taught by Daniele Buatti, a working Music Director / Audition Pianist / Voice Coach (i.e. the person on
                the other side of the audition table). <em>See Tier 0 risk: this proof is weak until video coverage
                reaches ~37/37.</em>
              </FactRow>
              <FactRow k="Pricing (placeholder pending decision)">
                To be set by business-model decision. See Part C &mdash; but the value <em>delivered</em> &mdash; a
                series of bad auditions avoided &mdash; is in the <DollarPill>$100&ndash;$500</DollarPill> range buyers
                already pay per private coaching session.
              </FactRow>
            </tbody>
          </table>
        </div>

        <SectionTitle id="b-categories">B3 · Competitive category &amp; pricing anchors</SectionTitle>
        <p className="mt-3 text-[15px] leading-relaxed text-foreground/85">
          The product sits in a small, underserved category: <strong>&ldquo;practical audition infrastructure
          for singers,&rdquo;</strong> not &ldquo;vocal coaching.&rdquo; Most adjacent pricing is set by live
          coaching; the digital alternatives are thin. The most credible pricing anchors for this product:
        </p>
        <ul className="mt-3 space-y-2 text-[15px] leading-relaxed text-foreground/85">
          <Bullet><strong>1 private audition coaching session:</strong> ~<DollarPill>$100&ndash;$200</DollarPill> per hour, in person or Zoom.</Bullet>
          <Bullet><strong>A university extension / community-college audition-prep class:</strong> <DollarPill>$200&ndash;$600</DollarPill> for a multi-week course.</Bullet>
          <Bullet><strong>Bundled online theatre courses (e.g. Broadway-grade streaming workshops):</strong> <DollarPill>$97&ndash;$297</DollarPill> for lifetime access.</Bullet>
          <Bullet><strong>A sheet-music service subscription (Musicnotes, sheet-music-plus):</strong> ~<DollarPill>$20&ndash;$50</DollarPill>/mo &mdash; the floor of &ldquo;willing to pay for audition infrastructure.&rdquo;</Bullet>
        </ul>
        <p className="mt-3 text-[15px] leading-relaxed text-foreground/85">
          The defensible read: <strong>a complete, lifetime course, taught by a working accompanist, is worth a price
          point between one and three private lessons</strong> &mdash; with the note that the product today
          <strong> doesn&apos;t yet have enough video proof</strong> to charge the top of that range (see C1).
        </p>

        {/* ============================================================= */}
        {/* PART C — VALUATION                                            */}
        {/* ============================================================= */}
        <p className="mt-14 text-[11px] font-bold uppercase tracking-[0.2em] text-primary/50">Part C</p>
        <h2 className="border-b border-border/40 pb-2 font-serif text-2xl font-bold text-primary">
          Grounded Valuation
        </h2>

        <SectionTitle id="c-method">C1 · Method &amp; ground rules</SectionTitle>
        <p className="mt-3 text-[15px] leading-relaxed text-foreground/85">
          This valuation is deliberately <strong>conservative, digital-asset-fashion</strong> &mdash; no revenue, no
          user base, no brand equity, no SEO rank. We value the product <em>as a sell-anywhere self-service asset + the
          codebase that ships it</em>, at three different lenses, and we tell you <em>why</em> each number is what it is
          &mdash; not the direction we&apos;d like it to be.
        </p>
        <ul className="mt-3 space-y-2 text-[15px] leading-relaxed text-foreground/85">
          <Bullet><strong>Asset cost approach (floor):</strong> what would it cost to recreate this from scratch &mdash; code + content &mdash; if a client hired out the work today?</Bullet>
          <Bullet><strong>Market approach (comp):</strong> what do comparable pre-revenue course/studio acquisitions or small-asset sales go for on Flippa/Empire Flippers/MicroAcquire?</Bullet>
          <Bullet><strong>DILM / income approach (ceiling):</strong> if this generated $X/yr profit at maturity, what would a buyer pay for that income stream at a 2.5&times; to 4&times; multiple?</Bullet>
        </ul>

        <SectionTitle id="c-today">C2 · Current valuation &mdash; Tier 0 (today, as-is, 14 Aug 2026)</SectionTitle>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b border-border/50 text-left text-[11px] uppercase tracking-wider text-muted-foreground">
                <th className="py-2 pr-4 font-semibold">Lens</th>
                <th className="py-2 pr-4 font-semibold">Approach</th>
                <th className="py-2 font-semibold">Number</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              <FactRow k="Asset cost (floor)">
                Next.js app (~80h @ $80/h) + 57-lesson authored curriculum (~80h @ $60/h content) + brand &amp; design.
              </FactRow>
              <FactRow k="What it would cost to recreate">
                ~<DollarPill>$12,000&ndash;$15,000</DollarPill> of agency/freelancer time, conservatively. This is your <strong>hard floor</strong>.
              </FactRow>
              <FactRow k="Market (comparable sales)">
                Pre-revenue SaaS/content assets on MicroAcquire/EF go for <DollarPill>$3k&ndash;$40k</DollarPill>, typically skewing low <em>unless</em> there&apos;s traffic, a list, or distinctive IP. This product is <em>pre-revenue</em>, has <strong>zero traffic</strong>, <strong>zero email list</strong>, <strong>no owned domain</strong>, and <strong>no customer proof</strong>. The market comps &ldquo;give&rdquo; a likely <DollarPill>$5k&ndash;$10k</DollarPill> for the asset + curriculumно IP.
              </FactRow>
              <FactRow k="Income (DILM, ceiling)">
                No income. Income approach yields <DollarPill>$0</DollarPill> until there&apos;s a MRR/transaction stream &mdash; see Tier 1 &amp; 2.
              </FactRow>
            </tbody>
          </table>
        </div>
        <Card className="mt-5 border-primary/20 bg-primary/[0.04]">
          <CardContent className="p-5">
            <p className="text-sm font-semibold text-primary">Tier 0 honest range</p>
            <p className="mt-2 font-serif text-2xl font-bold text-primary">
              <DollarPill>$5,000 &mdash; $15,000</DollarPill>
            </p>
            <p className="mt-2 text-sm leading-relaxed text-foreground/85">
              That <em>looks</em> low because you&apos;ve put real work in &mdash; but a pre-revenue, no-traffic,
              no-domain course product is essentially a <strong>course manuscript + delivery code</strong>. Buyers
              don&apos;t pay for the manuscript; they pay for proven repeatable sales. The whole roadmap below is the
              process of converting the manuscript into a revenue line, dollar by dollar.
            </p>
          </CardContent>
        </Card>
        <p className="mt-3 text-xs italic text-muted-foreground">
          Excluded: working computers, software tools, domain registration costs. Assumes the operator keeps working at
          zero opportunity cost. If you value your time, the &ldquo;true&rdquo; sunk cost is higher than the floor &mdash;
          but that&apos;s not what a buyer pays.
        </p>

        {/* ============================================================= */}
        {/* PART D — THE 3-TIER VALUE ROADMAP                             */}
        {/* ============================================================= */}
        <p className="mt-14 text-[11px] font-bold uppercase tracking-[0.2em] text-primary/50">Part D</p>
        <h2 className="border-b border-border/40 pb-2 font-serif text-2xl font-bold text-primary">
          The 3-Tier Value Roadmap
        </h2>
        <p className="mt-3 text-[15px] leading-relaxed text-foreground/85">
          The unit of value is a <strong>completed launch</strong> &mdash; not a released feature. Each tier below is a
          full launch that, completed, produces a step-change in the product&apos;s sale value. Each tier
          <strong> lists itemized actions</strong> (sort by &ldquo;biggest dollar/value per hour of your time&rdquo;),
          the <strong>new valuation range</strong> after completing it, and the <strong>time investment</strong>.
          Tiers are executed <em>in sequence</em> &mdash; skipping a tier breaks the math.
        </p>

        {/* TIER 1 ----------------------------------------- */}
        <SectionTitle id="d-tier1">D1 · Tier 1 &mdash; &ldquo;Sellable single product&rdquo;</SectionTitle>
        <Card className="mt-4 border-green-600/20 bg-green-600/[0.03]">
          <CardContent className="space-y-2 p-5">
            <div className="flex flex-wrap items-center gap-2">
              <Badge className="border-green-600/30 bg-green-600/10 text-green-700">MVP to Market</Badge>
              <span className="text-sm text-muted-foreground">~2&ndash;4 weeks of part-time work</span>
            </div>
            <p className="text-sm leading-relaxed text-foreground/85">
              <strong>Goal:</strong> a single product that a stranger can buy, complete, and get value from end-to-end.
              No subscriptions, no tiers, no group coaching &mdash; just &ldquo;here is the course, here is the
              price, here is how you pay.&rdquo;
            </p>
            <p className="text-sm"><strong>Valuation moving to:</strong> <DollarPill>$12,000&ndash;$25,000</DollarPill> (with first 10&ndash;50 sales of record)</p>
          </CardContent>
        </Card>
        <SubTitle>Itemized actions (highest value/hour first)</SubTitle>
        <ol className="mt-3 list-decimal space-y-2 pl-6 text-[15px] leading-relaxed text-foreground/85 marker:text-primary/40">
          <li><strong>Finalize the name</strong> (Option B &mdash; &ldquo;The Audition Guidebook&rdquo;) and buy the domain <em>this week.</em> <span className="text-muted-foreground">[~1h, ~$15]</span> &mdash; the single highest-ROI action. Every creative asset downstream cites the domain; if you change it after launch you pay &gt;50&times; the cost to redo.</li>
          <li><strong>Lock the leading price.</strong> Pick a number and stand behind it for 90 days. Recommended anchor: <DollarPill>$147 or $197</DollarPill> (lifetime, single price) &mdash; below two private coaching sessions, well above a sheet-music subscription. Math: 100 buyers @ $147 = $14,700 gross. Can always tier up later; can&apos;t tier down without alienating early buyers.</li>
          <li><strong>Publish Module 1</strong> (currently 7/0 unpublished) and resolve the ~20 draft lessons / <code>[New]</code> duplicates. <span className="text-muted-foreground">[~1&ndash;2 days content work]</span> &mdash; a buyer&apos;s first impression is Module 1; if it&apos;s missing the course looks unfinished and refund risk spikes.</li>
          <li><strong>Wire Stripe Checkout</strong> (simplest viable paywall) + gate <code>lessons.is_published</code> behind purchase. Use Stripe Payment Links initially &mdash; no backend subscription code needed. Gate at the <em>module</em> level (free: Level 1 Module 1; paid: everything else) <span className="text-muted-foreground">[~1&ndash;2 days]</span>.</li>
          <li><strong>Produce video for the 14 of 37 published lessons that lack it.</strong> Doesn&apos;t have to be 14 polished videos &mdash; even narrated screencasts of the sheet-music examples <em>massively</em> de-risks the refund risk and lifts conversion. Or: temporarily set <code>has_video=false</code> on those rows and present them as &ldquo;written lessons&rdquo; so the course doesn&apos;t look half-finished. <span className="text-muted-foreground">[~1&ndash;3 weeks part-time]</span></li>
          <li><strong>Update tagline + OG metadata + favicon</strong> on the new domain. <span className="text-muted-foreground">[~2h]</span></li>
          <li><strong>Add Vercel Web Analytics</strong> (toggle, free) and a Plausible/GA event on checkout-complete. <span className="text-muted-foreground">[~30min]</span> &mdash; no traffic data means you can&apos;t optimise anything.</li>
          <li><strong>Soft launch:</strong> email 5&ndash;10 friendly users, ask for a testimonial + a review in exchange for free access. Capture quotes. <span className="text-muted-foreground">[~1 week of async]</span> &mdash; testimonials are the cheapest conversion lift in theatre.</li>
        </ol>

        {/* TIER 2 ----------------------------------------- */}
        <SectionTitle id="d-tier2">D2 · Tier 2 &mdash; &ldquo;Repeatable sales engine&rdquo;</SectionTitle>
        <Card className="mt-4 border-primary/20 bg-primary/[0.04]">
          <CardContent className="space-y-2 p-5">
            <div className="flex flex-wrap items-center gap-2">
              <Badge className="border-primary/30 bg-primary/10 text-primary">Repeatable Sales</Badge>
              <span className="text-sm text-muted-foreground">~1&ndash;3 months of work</span>
            </div>
            <p className="text-sm leading-relaxed text-foreground/85">
              <strong>Goal:</strong> the product no longer relies on the founder being online to sell. You have a
              working paid funnel, an email list, and at least one traffic source that isn&apos;t your personal network.
            </p>
            <p className="text-sm"><strong>Valuation moving to:</strong> <DollarPill>$30,000&ndash;$80,000</DollarPill> at <DollarPill>$1k&ndash;$3k MRR</DollarPill> with 30+ paying customers and a keyword-ranked content asset</p>
          </CardContent>
        </Card>
        <SubTitle>Itemized actions (highest value/hour first)</SubTitle>
        <ol className="mt-3 list-decimal space-y-2 pl-6 text-[15px] leading-relaxed text-foreground/85 marker:text-primary/40">
          <li><strong>Email list + lifecycle.</strong> A free lead magnet (e.g. &ldquo;The 10-sheet-music mistakes singers make&rdquo; PDF) &rarr; ConvertKit / Resend capture &rarr; 5-part nurture &rarr; soft pitch. <span className="text-muted-foreground">[~2 days to build, ongoing to write]</span> &mdash; <em>the</em> single highest-leverage Tier 2 asset. The email list is itself part of the valuation.</li>
          <li><strong>Stripe-gated version 2.</strong> Move from Payment Links to Stripe Checkout with customer portal, receipts, and (optionally) a 3-pay installment plan. Add <code>customer_id</code> to the <code>users</code> table and an <code>is_paid</code> flag. <span className="text-muted-foreground">[~3&ndash;5 days]</span></li>
          <li><strong>A human-touch tier to lift AOV</strong> &mdash; the &ldquo;Coached Guidebook&rdquo;: course + one 30-min audition tape review ($297 or $397). The software already supports this (just offer it); no new code. <span className="text-muted-foreground">[~0 code, 1 landing page]</span> &mdash; directly lifts average-order-value by ~2&times; and produces a testimonial engine.</li>
          <li><strong>SEO basics:</strong> a sitemap, 5&ndash;10 blog/lesson-teaser pages targeting keywords like &ldquo;how to cut sheet music for auditions,&rdquo; &ldquo;16 bar cut vs 32 bar cut,&rdquo; &ldquo;audition tempo.&rdquo; Each is a free top-of-funnel entry. <span className="text-muted-foreground">[~1 day each]</span></li>
          <li><strong>Pricing page + social proof:</strong> testimonials (from Tier 1 ease * get permission), a money-back guarantee (30-day, audition-outcome-agnostic), and a single-tier $197 card. <span className="text-muted-foreground">[~1 day]</span></li>
          <li><strong>One paid traffic test</strong> with a hard cap (~<DollarPill>$200</DollarPill> on Instagram/TikTok ads targeted at BFA students &amp; regional theatre performers). Even if it loses money, the data tells you who your buyer actually is. <span className="text-muted-foreground">[~1 week]</span></li>
          <li><strong>Rewrite landing hero</strong> using the Tier 1 testimonials + the corrected positioning. <span className="text-muted-foreground">[~half day]</span> &mdash; conversion copy is worth its weight in gold once you have quotes.</li>
        </ol>

        {/* TIER 3 ----------------------------------------- */}
        <SectionTitle id="d-tier3">D3 · Tier 3 &mdash; &ldquo;Multi-product business with defensible IP&rdquo;</SectionTitle>
        <Card className="mt-4 border-amber-500/20 bg-amber-500/[0.03]">
          <CardContent className="space-y-2 p-5">
            <div className="flex flex-wrap items-center gap-2">
              <Badge className="border-amber-500/30 bg-amber-500/10 text-amber-700">Multi-Product &amp; IP</Badge>
              <span className="text-sm text-muted-foreground">3&ndash;9 months of work</span>
            </div>
            <p className="text-sm leading-relaxed text-foreground/85">
              <strong>Goal:</strong> the product is no longer a single course; it&apos;s a <em>catalogue</em> with
              recurring revenue and at least one asset that&apos;s hard to copy. This is the tier where valuation
              multiples start applying instead of asset-cost floors.
            </p>
            <p className="text-sm"><strong>Valuation moving to:</strong> <DollarPill>$100,000&ndash;$300,000+</DollarPill> at <DollarPill>$5k&ndash;$15k MRR</DollarPill>, with email list &gt;2k, multiple SKUs, and the instructor brand carrying the business</p>
          </CardContent>
        </Card>
        <SubTitle>Itemized actions (highest value/hour first)</SubTitle>
        <ol className="mt-3 list-decimal space-y-2 pl-6 text-[15px] leading-relaxed text-foreground/85 marker:text-primary/40">
          <li><strong>Product #2: backing tracks marketplace</strong> &mdash; the curriculum already primes this (Module 12 &ldquo;Backing Tracks and Home Rehearsal&rdquo;). Sell per-song backing tracks (the instructor already brands these &mdash; &ldquo;Piano Backings by Daniele&rdquo;) at <DollarPill>$9&ndash;$19</DollarPill> each or a <DollarPill>$15/mo</DollarPill> subscription. <span className="text-muted-foreground">[~1&ndash;2 weeks code + recording setup]</span> &mdash; this converts the existing curriculum into a <em>repeat-purchase</em> engine and lifts LTV dramatically.</li>
          <li><strong>Membership / library tier.</strong> Replace lifetime-purchase-only with: <DollarPill>$197</DollarPill> lifetime OR <DollarPill>$29/mo</DollarPill> all-access + new modules + monthly group Q&amp;A. Use Stripe billing. <span className="text-muted-foreground">[~1 week]</span> &mdash; gives the income approach a real MRR line; that&apos;s what acquirers apply a multiple to.</li>
          <li><strong>B2B licensing.</strong> Sell a studio license (bulk seats) to university musical-theatre programs and community theatres. B2B deals are lumpy but high-ACV and <em>highly</em> attractive to acquirers because one relationships = <DollarPill>$2k&ndash;$5k</DollarPill> per sale. <span className="text-muted-foreground">[~1 month bizdev, ~1 week code for seat management]</span></li>
          <li><strong>The instructor&apos;s brand as IP</strong> &mdash; a small YouTube channel (the 14+ videos already need to exist anyway) and a weekly newsletter. This is the moat: it converts the founder&apos;s name into discoverable, searchable, owned media. By Tier 3 the <em>brand</em> is worth more than the codebase.</li>
          <li><strong>Productize the Wednesday Audition Prep Workshop</strong> (already running off-app, referenced in <code>/admin/resources</code>) as a paid monthly cohort, upsold from the course. <span className="text-muted-foreground">[~0 code, 1 landing page + ticketing]</span></li>
          <li><strong>Polish &amp; accessibility hardening</strong> &mdash; RLS-on, full WCAG AA pass, video resume (currently dead code), bots/spam protection. By Tier 3 you have enough traffic that the lack of these is a <em>business</em> risk, not just a code risk. <span className="text-muted-foreground">[~1&ndash;2 weeks]</span></li>
        </ol>

        {/* ============================================================= */}
        {/* PART E — COST OF DELAY                                        */}
        {/* ============================================================= */}
        <p className="mt-14 text-[11px] font-bold uppercase tracking-[0.2em] text-primary/50">Part E</p>
        <h2 className="border-b border-border/40 pb-2 font-serif text-2xl font-bold text-primary">
          Cost of Delay
        </h2>
        <p className="mt-3 text-[15px] leading-relaxed text-foreground/85">
          The cost of delay is <em>not</em> the value of getting to perfection later &mdash; it&apos;s the
          <strong> revenue you fail to earn between now and launch</strong>, plus the <strong>brand equity you fail to
          build while the domain sits unowned</strong>. Run the math two ways: conservative and realistic.
        </p>

        <SectionTitle id="e-conservative">E1 · Conservative run &mdash; the math</SectionTitle>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b border-border/50 text-left text-[11px] uppercase tracking-wider text-muted-foreground">
                <th className="py-2 pr-4 font-semibold">Assumption</th>
                <th className="py-2 pr-4 font-semibold">Conservative</th>
                <th className="py-2 font-semibold">Realistic (if you launch properly)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              <FactRow k="ARR per 100 visitors/mo">0.5% conversion @ $147 = 0.5 sales = ~$73/mo</FactRow>
              <FactRow k="After Tier 1 marketing">1.5% conversion @ $147 = 1.5 sales = $220/mo</FactRow>
              <FactRow k="After Tier 2 (email + paid)">$3k MRR = $36k/yr ARR</FactRow>
              <FactRow k="Domain + SEO equity value">$0 (no domain) &rarr; $1k+ in held equity per month after 90 days of content</FactRow>
            </tbody>
          </table>
        </div>
        <Card className="mt-5 border-red-500/20 bg-red-500/[0.03]">
          <CardContent className="space-y-2 p-5">
            <p className="text-sm font-semibold text-red-700">
              <Clock className="mr-1 inline h-4 w-4 align-[-2px]" /> Cost of each launch-delay week
            </p>
            <p className="text-sm leading-relaxed text-foreground/85">
              <strong>Today (pre-launch):</strong> ~<DollarPill>$0&ndash;$200/week</DollarPill> of foregone revenue at the
              &ldquo;1.5 sales a month&rdquo; floor.
            </p>
            <p className="text-sm leading-relaxed text-foreground/85">
              <strong>After a soft launch (Tier 1 complete):</strong> the same delay starts costing
              ~<DollarPill>$500&ndash;$1,500/week</DollarPill> &mdash; that&apos;s the email list growing slower, the
              SEO domain authority aging from zero instead of aging <em>up</em>, the testimonials not being collected,
              the refund-rate data not being gathered, and the next price tier not being justified by social proof.
            </p>
            <p className="text-sm leading-relaxed text-foreground/85">
              <strong>The compounding asset cost:</strong> the domain ages from purchase. SEO content ages from
              publish. Email subscribers age from signup. Every week <em>before</em> those things exist is a week
              <em>permanently</em> missing from the compounding curves that buyers actually pay for. A 4-week delay
              before launching can cost 8&ndash;12 weeks of eventual ARR, not 4.
            </p>
          </CardContent>
        </Card>

        <SectionTitle id="e-takeaway">E2 · The hard-consultant takeaway</SectionTitle>
        <Card className="mt-4 border-primary/20 bg-primary/[0.04]">
          <CardContent className="p-5 text-sm leading-relaxed text-foreground/85">
            <p>
              <strong>You should ship Tier 1 in 2&ndash;4 weeks, not after the audit is finished.</strong> The audit
              exists to <em>de-risk</em> launch &mdash; not to gate it. Perfection-is-not-possible is especially true
              for a single-operator course business: the refund rate for &ldquo;no Module 1 video&rdquo; is likely lower
              than the refund rate for &ldquo;waited 6 months for investment-grade polish and nobody came.&rdquo; The
              right plan is: ship Tier 1, instrument everything, let the data tell you what to fix for Tier 2.
            </p>
          </CardContent>
        </Card>

        {/* ============================================================= */}
        {/* PART F — PRIORITY SEQUENCE                                    */}
        {/* ============================================================= */}
        <p className="mt-14 text-[11px] font-bold uppercase tracking-[0.2em] text-primary/50">Part F</p>
        <h2 className="border-b border-border/40 pb-2 font-serif text-2xl font-bold text-primary">
          Priority Sequence
        </h2>
        <p className="mt-3 text-[15px] leading-relaxed text-foreground/85">
          If you do nothing else from these two strategy docs, do these in order. Each step unlocks the next, and each
          is itemized so you can hand the list to a contractor (or Claude) without losing context.
        </p>
        <ol className="mt-4 list-decimal space-y-3 pl-6 text-[15px] leading-relaxed text-foreground/85 marker:font-bold marker:text-primary">
          <li><strong>This week &mdash; Decide.</strong> Lock the name (recommendation: &ldquo;The Audition Guidebook&rdquo;) and the price (recommendation: <DollarPill>$147</DollarPill> lifetime). Buy the domain. These two decisions unblock &gt;80% of the remaining work.</li>
          <li><strong>Days 1&ndash;3 &mdash; Wire production.</strong> Set Vercel env vars, connect the domain, enable analytics, update OG metadata + tagline, rotate secrets. <span className="text-xs text-muted-foreground">(covered in <code>LAUNCH.md</code> Phases 1&ndash;2)</span></li>
          <li><strong>Days 3&ndash;5 &mdash; Content triage.</strong> Publish Module 1; resolve <code>[New]</code> duplicates; set <code>has_video=false</code> on lessons without video rather than shipping empty players.</li>
          <li><strong>Days 5&ndash;10 &mdash; Stripe + gating.</strong> Payment Links first (no backend), gate at module level, log <code>is_paid</code> on the user.</li>
          <li><strong>Days 10&ndash;14 &mdash; Soft launch.</strong> Email your network, pitch 5&ndash;10 friendly users for testimonials and the first 10 sales of record.</li>
          <li><strong>Weeks 3&ndash;6 &mdash; Tier 2 build.</strong> Email lead magnet + lifecycle, sitemap + SEO pages, a <DollarPill>$297</DollarPill> &ldquo;+ tape review&rdquo; tier, conversion copy refresh using real testimonials.</li>
          <li><strong>Months 2&ndash;3 &mdash; Tier 3 begins.</strong> Backing tracks marketplace as Product #2; this is the highest-ROI new SKU because the curriculum <em>already sells it</em>.</li>
        </ol>

        <Card className="mt-8 border-primary/20 bg-primary/[0.04]">
          <CardContent className="space-y-2 p-6">
            <p className="text-sm font-semibold text-primary">
              <Rocket className="mr-1 inline h-4 w-4 align-[-2px]" /> One-line summary of the whole plan
            </p>
            <p className="text-sm leading-relaxed text-foreground/85">
              Ship a real, chargeable, $147-and-gated product in 2&ndash;4 weeks (Tier 1, valuing
              <DollarPill>$12k&ndash;$25k</DollarPill>); add an email list + upsell + paid traffic to make it repeatable
              over 1&ndash;3 months (Tier 2, <DollarPill>$30k&ndash;$80k</DollarPill>); then expand to a backing-tracks
              marketplace and membership to convert the single product into a real MRR business (Tier 3,
              <DollarPill>$100k+</DollarPill>). Every week before launch costs you $500&ndash;$1,500 of foregone
              compounding revenue &mdash; <strong>today is the cheapest launch will ever be.</strong>
            </p>
          </CardContent>
        </Card>

        <p className="mt-10 text-center text-[11px] text-muted-foreground/40 uppercase tracking-[0.2em]">
          End of strategy &amp; valuation
        </p>
      </article>
    </div>
  );
}