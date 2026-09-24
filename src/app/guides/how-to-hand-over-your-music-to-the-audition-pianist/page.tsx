import GuideLayout from "@/components/guides/GuideLayout";
import { SITE_NAME } from "@/lib/constants";

const BASE = process.env.NEXT_PUBLIC_APP_URL || "https://theauditionguidebook.vercel.app";
const PATH = "/guides/how-to-hand-over-your-music-to-the-audition-pianist";

export const metadata = {
  title: "How to Hand Over Your Music to the Audition Pianist",
  description:
    "The exact sequence that sets up a smooth handover: approach, folder down, scan first, tempo last. From an accompanist who reads your music cold every day.",
  alternates: { canonical: `${BASE}${PATH}` },
  openGraph: {
    type: "article",
    url: `${BASE}${PATH}`,
    title: "How to Hand Over Your Music to the Audition Pianist",
    description: "Scan first, tempo last. The handover protocol that makes every pianist want to play for you.",
  },
};

export default function GuidePage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: "How to Hand Over Your Music to the Audition Pianist",
    description: metadata.description,
    step: [
      { "@type": "HowToStep", position: 1, name: "Approach the side of the piano", text: "Walk to the side of the piano, not behind it. Behind the piano your music is upside down and you're crowding the accompanist's space." },
      { "@type": "HowToStep", position: 2, name: "Put the folder down", text: "Set the folder on the music stand. Holding it signals nerves and blocks the pianist's view — and it frees your hands to point." },
      { "@type": "HowToStep", position: 3, name: "Scan first", text: "Walk them through the structure with your hand: where it starts, what it jumps, where it ends. Let them look. Don't sing during the scan." },
      { "@type": "HowToStep", position: 4, name: "Save tempo for last", text: "Tempo is what the accompanist remembers best because it's the most recent instruction. Deliver it last — style first, then the pulse." },
      { "@type": "HowToStep", position: 5, name: "Stop talking and sing", text: "Once tempo is delivered, stop. Walk to your spot, breathe, and go. The accompanist needs nothing more." },
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
        eyebrow="The handover"
        title="How to hand over your music to the audition pianist"
        intro="The thirty seconds between 'Hi, how are you?' and your first note can set the entire room's energy. Here's the exact protocol from someone who reads performers' cuts cold, every single day."
        sections={[
          {
            h: "Approach and presence",
            body: [
              "Walk to the side of the piano — not behind it. Behind the piano means your music is upside down, and you're crowding the accompanist's space. Own your space: stand tall, don't shrink. Smile, and a warm 'How are you?' is a lovely opener.",
              "When you reach the piano, put the folder down on the stand. Do not hold it. Holding your music while you talk signals nervousness, and it makes it harder for the accompanist to see the pages. Setting it down frees your hands to gesture and point at sections of the cut. If you have a bag or a bottle, put it on the floor — you don't need to ask permission.",
            ],
          },
          {
            h: "The scan-first, tempo-last protocol",
            body: [
              "This is the sequence that sets up the smoothest handover you'll ever have, and it's not obvious. Most performers lead with tempo. The professionals lead with structure.",
              "First, scan. Put the folder on the stand open at page one, and walk your hand through the cut: 'We're starting here, going through this section, jumping over the page to here, and ending here.' Let the accompanist look at the music while you talk — they're processing visual information. Point out anything tricky: a modulation, a fermata, a time-signature change, a tight cut-off.",
              "Save tempo for last. Tempo is what the accompanist remembers most easily because it's the most recent thing they heard. Everything else — structure, cuts, cues — comes before it.",
            ],
          },
          {
            h: "Deliver tempo with your voice, not your fingers",
            body: [
              "Tempo is style plus pulse. A jazz waltz at 88 BPM feels completely different to a folk ballad at 88 BPM — so lead with the style, not the number.",
              "Sing your tempo rather than just tapping it. The accompanist needs the rhythm and the feel, not just a beat. If you can only do one, sing. Tapping alone gives a beat; your voice gives the tempo.",
              "Tap close to your centre — chest or leg — not frantically. Rapid, anxious tapping signals nerves. And if your song has no tempo changes, say the word 'steady'. It's a clear signal that tells the accompanist: lock this in, don't expect deviations.",
            ],
          },
        ]}
        steps={[
          { title: "Approach the side of the piano", body: "Never behind it. Own your space, smile, open warm." },
          { title: "Put the folder down", body: "On the stand, open to page one. Free your hands to point." },
          { title: "Scan first", body: "Walk your hand through the structure: start, jumps, end. Let them look — don't sing during the scan." },
          { title: "Save tempo for last", body: "It's what they remember best. Deliver style first, then the pulse, sung not tapped." },
          { title: "Stop talking and sing", body: "Once tempo is delivered, stop. Walk to your spot, breathe, and go. All the accompanist needs is your breath." },
        ]}
        nextAction={{
          title: "The handover is a skill you can rehearse",
          body: "In the full course, you'll practice the exact scripts, tempo conversations, and the dozens of small choices that make you look — and feel — in control of the room.",
        }}
      />
    </>
  );
}