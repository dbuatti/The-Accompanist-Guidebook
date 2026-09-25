import GuideLayout from "@/components/guides/GuideLayout";
import { SITE_NAME } from "@/lib/constants";
import { getCoursePrice } from "@/lib/pricing";

const BASE = process.env.NEXT_PUBLIC_APP_URL || "https://theauditionguidebook.vercel.app";
const PATH = "/guides/how-to-cut-sheet-music-for-an-audition";

export const metadata = {
  title: "How to Cut Sheet Music for an Audition (Step by Step)",
  description:
    "A cut is about time, not bars. Learn what a 16-bar cut actually means, how to make logical, performable cuts, and how to time and mark them so any pianist can sight-read them on the spot.",
  alternates: { canonical: `${BASE}${PATH}` },
  openGraph: {
    type: "article",
    url: `${BASE}${PATH}`,
    title: "How to Cut Sheet Music for an Audition (Step by Step)",
    description: "Cuts are measured in seconds, not bars. Here's how to make one any pianist can sight-read cold.",
  },
};

export default async function GuidePage() {
  const price = await getCoursePrice();
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: "How to Cut Sheet Music for an Audition",
    description: metadata.description,
    step: [
      { "@type": "HowToStep", position: 1, name: "Decide the section", text: "Choose one strong section of the song — usually the last chorus, or a verse leading into a chorus. Sing a chunk; don't stitch together a highlight reel." },
      { "@type": "HowToStep", position: 2, name: "Time it at performance tempo", text: "Stand up, deliver tempo as you would in the room, and sing through the cut with a stopwatch. Time it twice, at the tempo you'll actually use." },
      { "@type": "HowToStep", position: 3, name: "Check it makes sense as text", text: "Read only the lyrics of your cut like a monologue. Does the sentence make sense alone? If it starts on 'and' or 'but', you're missing context." },
      { "@type": "HowToStep", position: 4, name: "Mark it with the box method", text: "Draw a box around the bars you're removing and cross once from bottom-left to top-right, with a pen. Leave the music visible — never white it out." },
      { "@type": "HowToStep", position: 5, name: "Make the end conclusive", text: "Your cut should feel complete. Land on a held note or a clean cut-off — never a trailing-off. If it ends at the natural end of the song, you don't need a closing bracket." },
    ],
    author: { "@type": "Person", name: "Daniele Buatti" },
    publisher: { "@type": "Organization", name: SITE_NAME },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <GuideLayout
        eyebrow="Cutting your music"
        source="guide:how-to-cut-sheet-music-for-an-audition"
        priceDisplay={price.display}
        title="How to cut sheet music for an audition"
        intro="A cut is a shortened excerpt of your song — the most effective section that best shows your voice and storytelling. Here's how to make one that any pianist can sight-read confidently, and how to mark it so there's zero ambiguity in the room."
        sections={[
          {
            h: "A cut is measured in time, not bars",
            body: [
              "'16-bar cut' has become the default language, but bars are an arbitrary measurement. The real measure is time. A verse in 4/4 at a slow tempo might take 30 seconds; 16 bars of a fast pop-rock song might fly by in 12.",
              "So when they say '16 bars', what they really mean is something that runs 30–45 seconds. That's the sweet spot: it shows what you can do without outstaying its welcome. 45–60 seconds is pushing it — every extra second has to earn its place. 60–90 seconds allows a more developed arc, but be aware of the room's energy.",
              "There's a practical trade-off: a tight 30-second cut that leaves them wanting more is better than a 90-second cut that goes on too long. Even better — if the panel likes what they hear, they may ask for a second song.",
            ],
          },
          {
            h: "Make logical, performable cuts",
            body: [
              "A good cut feels like a complete musical thought — not a fragment. And here's the misconception that frees most people: your cut doesn't need an arc. The full song has the arc. The cut's job is just to communicate what the song is about.",
              "Practical principles: cut at the end of a phrase, never mid-thought or through a bar. Avoid starting on a pickup bar where possible, and never start on 'and' or 'but' — it implies something happened before, and the panel feels it. Don't jump erratically between sections. And make sure the ending feels conclusive — land on a held note or a clean cut-off.",
              "Watch for the Frankenstein cut: multiple unrelated sections stitched together, often jumping key or time signature mid-stream, cramming a full song into 30 seconds. It reads as chopped-up rather than intentional. A single chorus well sung will always beat a tour of every section. A cut is not a highlight reel — it's a sample.",
            ],
          },
          {
            h: "Time it properly",
            body: [
              "The most common cause of indecision about a cut is simple: you don't know how long it actually is. Three reliable methods:",
              "1. Stopwatch + sing-through: stand up, deliver tempo as you would in the room, and sing the cut through with the stopwatch running. Do it twice. If you can't sing it at performance tempo yet, you're not ready to time it — you're ready to learn it.",
              "2. DAW slicing: import the song into GarageBand or Audacity and slice out your cut. Exact duration — just make sure the recording's tempo matches yours.",
              "3. BPM math: if you know your tempo, measure the bars. In 4/4 at 120 BPM, one bar is 2 seconds, so 16 bars is 32 seconds. Formula: (bars × beats per bar) ÷ (BPM ÷ 60) = seconds.",
            ],
          },
        ]}
        steps={[
          { title: "Choose one strong section", body: "Usually the last chorus, or a verse leading into a chorus. Sing a chunk — don't stitch together a highlight reel." },
          { title: "Time it at performance tempo", body: "Stand up, deliver tempo as you would in the room, sing it through with a stopwatch. Do it twice, at the tempo you'll actually use." },
          { title: "Check it makes sense as text", body: "Read only the lyrics of your cut like a monologue. If they don't make sense alone, the cut is too fragmented." },
          { title: "Mark it with the box method", body: "Draw a box around the bars you're removing and cross once, bottom-left to top-right, using a pen. Never white the music out — the accompanist still needs context." },
          { title: "Make the ending conclusive", body: "Land on a held note or a clean cut-off. If it ends at the natural end of the song, no closing bracket is needed." },
        ]}
        nextAction={{
          title: "Cutting is where most auditions are lost or won",
          body: "The full course takes you through cuts, marking, timing, and the sight-reading techniques that make a pianist's job effortless — before you've sung a note.",
        }}
      />
    </>
  );
}