import GuideLayout from "@/components/guides/GuideLayout";
import { SITE_NAME } from "@/lib/constants";

const BASE = process.env.NEXT_PUBLIC_APP_URL || "https://theauditionguidebook.vercel.app";
const PATH = "/guides/what-to-bring-to-a-musical-theatre-audition";

export const metadata = {
  title: "What to Bring to a Musical Theatre Audition",
  description:
    "Clean printed music, a book with your cuts marked, water, headshot, and the confidence to hand it all over. The complete list from an accompanist's perspective.",
  alternates: { canonical: `${BASE}${PATH}` },
  openGraph: {
    type: "article",
    url: `${BASE}${PATH}`,
    title: "What to Bring to a Musical Theatre Audition",
    description: "The kit that makes you look prepared before you've sung a note.",
  },
};

export default function GuidePage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: "What to Bring to a Musical Theatre Audition",
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
        eyebrow="Audition kit"
        source="guide:what-to-bring-to-a-musical-theatre-audition"
        title="What to bring to a musical theatre audition"
        intro="Your music is the first thing anyone sees. From an accompanist's perspective, here's the kit that makes you read as professional before you've sung a note — and the mistakes that quietly cost you."
        sections={[
          {
            h: "Your music, properly printed",
            body: [
              "Bring clean, printed sheet music with your cuts marked. Print in black and white with high contrast — not greyscale. Make sure no staves are cut off at the edges and pages are horizontally aligned. If it's a photocopy, check it's not blurry or faded; a grey page is a bad first impression.",
              "Even if your cut starts on page three, always keep page one visible in your folder. It gives the accompanist the key signature, time signature, tempo marking, and full context in a split second. If they open your music and their first question is 'what world am I in?', you've already spent their attention.",
            ],
          },
          {
            h: "The folder",
            body: [
              "A simple folder is the professional standard. Put your songs in order — most likely first. Consider a second copy of your top song: some rooms ask for doubles, and having one ready shows preparation. It costs nothing to have it in the bag.",
            ],
          },
          {
            h: "A pen (and nothing grey)",
            body: [
              "Mark your cuts with a pen, not pencil — pencil smudges and disappears under the room lights. If you've annotated energy or marked tempo changes, make sure the marks are clean, straight, and consistent. A yellow highlighter only. Never white-out a cut: the accompanist still needs to see the music underneath to follow where you are.",
            ],
          },
          {
            h: "The practical extras",
            body: [
              "Water. A headshot and résumé if the brief asks for them. Your ID. And your phone — for nothing in the room except, if you like, a reference photo of your marked pages so your copy and the pianist's copy match. Anything else stays on the floor during your handover.",
            ],
          },
          {
            h: "The confidence to hand it over",
            body: [
              "The best piece of kit you can bring is the ability to put the folder on the stand, walk the pianist through your cut, and deliver your tempo without flinching. Most performers bring the music but not the handover. Practising that one minute changes how the whole room feels.",
            ],
          },
        ]}
        nextAction={{
          title: "Packed bag, calm room",
          body: "The full course covers the preparation and the handover in detail — so walking in feels routine, not nerve-racking.",
        }}
      />
    </>
  );
}