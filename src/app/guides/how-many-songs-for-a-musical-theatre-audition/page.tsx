import GuideLayout from "@/components/guides/GuideLayout";
import { SITE_NAME } from "@/lib/constants";

const BASE = process.env.NEXT_PUBLIC_APP_URL || "https://theauditionguidebook.vercel.app";
const PATH = "/guides/how-many-songs-for-a-musical-theatre-audition";

export const metadata = {
  title: "How Many Songs Should You Prepare for a Musical Theatre Audition?",
  description:
    "The honest answer: six songs you could sing in your sleep beat twenty you're shaky on. Here's how to build a repertoire book that works for any audition room.",
  alternates: { canonical: `${BASE}${PATH}` },
  openGraph: {
    type: "article",
    url: `${BASE}${PATH}`,
    title: "How Many Songs Should You Prepare for a Musical Theatre Audition?",
    description: "Six songs you own beat twenty you're shaky on. Build an audition book that actually works.",
  },
};

export default function GuidePage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: "How Many Songs Should You Prepare for a Musical Theatre Audition?",
    description: metadata.description,
    author: { "@type": "Person", name: "Daniele Buatti" },
    publisher: { "@type": "Organization", name: SITE_NAME },
    inLanguage: "en-AU",
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <GuideLayout
        eyebrow="Audition repertoire"
        title="How many songs should you prepare for a musical theatre audition?"
        intro="The short answer: about six — and they matter more for how well you own them than how many you can list. Here's what a useful audition 'book' actually looks like, from the accompanist's bench."
        sections={[
          {
            h: "Build a six-song book, not a binder",
            body: [
              "Your audition repertoire is the collection of songs you keep ready and polished — songs that represent who you are as a performer. A strong book gives you flexibility and confidence across a range of audition types.",
              "Do you actually need twenty songs? No. Six go-to songs that you know inside out will serve you better than a binder full of material you're shaky on. If an audition comes up next week and you've got six songs you could sing in your sleep, you're ready. The performers who book consistently bring the same handful of songs to nearly every audition — because they own them.",
              "These aren't songs you're learning. They're songs you own.",
            ],
          },
          {
            h: "Match the room and the brief",
            body: [
              "Before you pick what to sing, read the audition brief like a contract. What's the show? What type is the room looking for? You wouldn't bring Seussical to a Ragtime audition — know what the room is asking for before you choose anything.",
            ],
          },
          {
            h: "Intellectual choice vs vibe",
            body: [
              "Choosing a song isn't just about what you like. Two lenses matter: intellectual choice (does it serve the audition — the show, the brief, the room?) and vibe (does it feel like you, and does it show off your voice and energy?).",
              "The best song choices sit where both overlap. A song that suits the role but you underdeliver on won't book. A song you love but that's wrong for the room won't either.",
            ],
          },
          {
            h: "The 'overdone song' myth",
            body: [
              "There is no secret blacklist of forbidden songs. If you nail a song, sing it. If Magic to Do lands in your voice and you connect with it, sing Magic to Do. The reason songs become 'overdone' is that they're well-written and they work — a familiar song done confidently can actually work in your favour.",
            ],
          },
          {
            h: "Three composers that give accompanists pause",
            body: [
              "There's a loose industry saying about three composers to be careful bringing into an audition — Stephen Sondheim, Jason Robert Brown, and Adam Guettel. It's less about you and more about the accompaniment.",
              "Sondheim's accompaniments are dense and specific — strange timings, unusual harmonic moves. Jason Robert Brown's songs are rock-and-roll and Billy Joel-informed, and some are genuinely hard to play cold at 9am. Adam Guettel's work is through-composed and harmonically complex.",
              "This doesn't mean never bring them. It means know that your cut may be harder for the accompanist to sight-read. If you bring a Sondheim song prepared, with your cut known cold, fine. But don't assume it buys you an advantage — it doesn't.",
              "A better approach: choose songs that sit well in your voice and let you do your best work. The accompanist will follow you.",
            ],
          },
        ]}
        nextAction={{
          title: "But knowing WHAT to sing is only half the battle",
          body: "The cut, the tempo, the handover — that's where auditions are actually won or lost. The full course walks you through all of it, step by step.",
        }}
      />
    </>
  );
}