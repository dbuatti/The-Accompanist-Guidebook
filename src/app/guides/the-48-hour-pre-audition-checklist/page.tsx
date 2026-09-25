import GuideLayout from "@/components/guides/GuideLayout";
import { SITE_NAME } from "@/lib/constants";
import { getCoursePrice } from "@/lib/pricing";

const BASE = process.env.NEXT_PUBLIC_APP_URL || "https://theauditionguidebook.vercel.app";
const PATH = "/guides/the-48-hour-pre-audition-checklist";

export const metadata = {
  title: "The 48-Hour Pre-Audition Checklist",
  description:
    "A printable checklist for the two days before your audition: music, cuts, timing, handover, and the room. Print it, tick it, walk in calm.",
  alternates: { canonical: `${BASE}${PATH}` },
  openGraph: {
    type: "article",
    url: `${BASE}${PATH}`,
    title: "The 48-Hour Pre-Audition Checklist",
    description: "Everything to have ready in the two days before your audition — printable.",
  },
};

export default async function GuidePage() {
  const price = await getCoursePrice();
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: "The 48-Hour Pre-Audition Checklist",
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
        eyebrow="Print & keep"
        source="guide:the-48-hour-pre-audition-checklist"
        priceDisplay={price.display}
        title="The 48-hour pre-audition checklist"
        intro="Preparation is the antidote to nerves. If everything below is handled before you arrive, the only thing left in the room is you, your song, and the pianist. Print this page and tick as you go."
        sections={[
          {
            h: "How to use this",
            body: [
              "Work backwards from your audition time. The 'day before' column should be finished the evening prior — the morning of an audition is for the body, not the paperwork. This page prints cleanly (Cmd/Ctrl + P) and fits right in your folder.",
            ],
          },
        ]}
        checklist={[
          {
            heading: "The day before",
            items: [
              "Songs chosen and matched to the brief",
              "Cuts timed at performance tempo (45 sec max unless brief says otherwise)",
              "Cuts marked with the box method, in pen",
              "Tricky spots flagged: fermatas, key changes, tempo shifts",
              "Two copies of your music printed / in the folder",
              "Page one kept visible in the folder",
              "Intro decided: bell tone, chord, one bar, or none",
              "Tempo in your head, and sung through out loud",
              "Clothes and shoes laid out",
              "Sleep. Earliest bedtime you can manage.",
            ],
          },
          {
            heading: "Morning of",
            items: [
              "Water, warm tea, nothing heavy before you sing",
              "Folder packed: music, ID, headshot if asked",
              "Vocal warm-up done gently, no belting at home",
              "Directions checked — arrive with time to spare",
              "Phone charged but silent",
              "One breath. You know your cut. You own your tempo.",
            ],
          },
          {
            heading: "The room",
            items: [
              "Walk in with presence — enter tall, smile",
              "Approach the side of the piano, never behind",
              "Folder down on the stand, open to page one",
              "Scan first: start, jumps, end — point as you go",
              "Flag the tricky bars",
              "Tempo last: style, then pulse, sung not tapped",
              "Walk to your spot, ground, breathe",
              "Sing. Thank the room. Collect your music.",
            ],
          },
          {
            heading: "After",
            items: [
              "Note what worked and what didn't while it's fresh",
              "Write down the tempo you actually used",
              "Refill your book with anything the room asked for",
              "File the feedback. Prepare for the next one already a little stronger.",
            ],
          },
        ]}
        nextAction={{
          title: "The checklist is the tip of the iceberg",
          body: "The course is built around exactly these mechanics — repertoire, cuts, tempo, handover, and owning the room — so the day feels rehearsed, not improvised.",
        }}
      />
    </>
  );
}