"use server";

import { db } from "@/lib/db";
import { users, progress, levels, modules, lessons, resources } from "@/lib/schema";
import { eq, and, asc, desc } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { GoogleGenAI } from "@google/genai";

const ADMIN_EMAILS = ["daniele.buatti@gmail.com"];

// Initialize Gemini client with the provided API key
const ai = new GoogleGenAI({ apiKey: "AIzaSyB34MlHrrNdpuvJO-6T4NeMwD72msKRRr0" });

// --- User Management Actions ---
export async function ensureUserExists(userId: string, email: string, name?: string) {
  try {
    const existing = await db.select().from(users).where(eq(users.id, userId));
    if (existing.length === 0) {
      const role = ADMIN_EMAILS.includes(email.toLowerCase()) ? "admin" : "user";
      await db.insert(users).values({
        id: userId,
        email,
        name: name || null,
        role,
      });
    }
  } catch (error: any) {
    console.error("Error ensuring user exists (FULL ERROR):", {
      message: error.message,
      stack: error.stack,
      detail: error.detail,
      code: error.code,
      hint: error.hint
    });
  }
}

export async function getAllUsers() {
  try {
    return await db.select().from(users).orderBy(desc(users.createdAt));
  } catch (error: any) {
    console.error("Error fetching users (FULL ERROR):", error.message);
    return [];
  }
}

export async function updateUser(userId: string, data: { name?: string, role?: string }) {
  try {
    await db.update(users).set(data).where(eq(users.id, userId));
    revalidatePath("/admin/users");
  } catch (error: any) {
    console.error("Error updating user (FULL ERROR):", error.message);
    throw new Error("Failed to update user: " + error.message);
  }
}

export async function deleteUser(userId: string) {
  try {
    await db.delete(users).where(eq(users.id, userId));
    revalidatePath("/admin/users");
  } catch (error: any) {
    console.error("Error deleting user (FULL ERROR):", error.message);
    throw new Error("Failed to delete user: " + error.message);
  }
}

// --- Progress Actions ---
export async function getProgress(userId: string) {
  try {
    const results = await db.select().from(progress).where(eq(progress.userId, userId));
    return results;
  } catch (error: any) {
    console.error("Error fetching progress (FULL ERROR):", error.message);
    return [];
  }
}

export async function saveVideoProgress(userId: string, lessonId: string, seconds: number) {
  try {
    await db.insert(progress)
      .values({ userId, lessonId, lastPosition: seconds })
      .onConflictDoUpdate({
        target: [progress.userId, progress.lessonId],
        set: { lastPosition: seconds }
      });
  } catch (error: any) {
    console.error("Error saving video progress (FULL ERROR):", error.message);
  }
}

export async function toggleLessonProgress(userId: string, lessonId: string) {
  try {
    const existing = await db
      .select()
      .from(progress)
      .where(and(eq(progress.userId, userId), eq(progress.lessonId, lessonId)));

    if (existing.length > 0 && existing[0].completedAt) {
      await db
        .update(progress)
        .set({ completedAt: null })
        .where(and(eq(progress.userId, userId), eq(progress.lessonId, lessonId)));
      return { completed: false };
    } else {
      await db.insert(progress)
        .values({ userId, lessonId, completedAt: new Date() })
        .onConflictDoUpdate({
          target: [progress.userId, progress.lessonId],
          set: { completedAt: new Date() }
        });
      return { completed: true };
    }
  } catch (error: any) {
    console.error("Error toggling progress (FULL ERROR):", error.message);
    throw new Error("Failed to update progress: " + error.message);
  }
}

// --- Content Management Actions ---
export async function getCourseContent(isAdmin: boolean = false) {
  try {
    const allLevels = await db.select().from(levels).orderBy(asc(levels.displayOrder));
    const allModules = await db.select().from(modules).orderBy(asc(modules.displayOrder));
    
    let allLessons;
    if (isAdmin) {
      allLessons = await db.select().from(lessons).orderBy(asc(lessons.displayOrder));
    } else {
      allLessons = await db.select().from(lessons).where(eq(lessons.isPublished, true)).orderBy(asc(lessons.displayOrder));
    }

    const allResources = await db.select().from(resources).orderBy(asc(resources.displayOrder));

    const resourceMap = new Map<string, any[]>();
    for (const r of allResources) {
      if (!resourceMap.has(r.lessonId)) resourceMap.set(r.lessonId, []);
      resourceMap.get(r.lessonId)!.push(r);
    }

    return allLevels.map(lvl => {
      const lvlModules = allModules.filter(mod => mod.levelId === lvl.id).map(mod => ({
        ...mod,
        lessons: allLessons.filter(lesson => lesson.moduleId === mod.id).map(lesson => ({
          ...lesson,
          resources: resourceMap.get(lesson.id) || [],
        }))
      })).filter(mod => isAdmin || mod.lessons.length > 0);

      return {
        ...lvl,
        modules: lvlModules
      };
    }).filter(lvl => isAdmin || lvl.modules.length > 0);
  } catch (error: any) {
    console.error("Error fetching course content (FULL ERROR):", error.message);
    return [];
  }
}

export async function getLevelsOnly() {
  try {
    return await db.select().from(levels).orderBy(asc(levels.displayOrder));
  } catch (error: any) {
    console.error("Error fetching levels (FULL ERROR):", error.message);
    return [];
  }
}

export async function createLevel(title: string) {
  try {
    const result = await db.insert(levels).values({ title }).returning();
    revalidatePath("/admin");
    revalidatePath("/admin/tree");
    return result[0];
  } catch (error: any) {
    console.error("Error creating level (FULL ERROR):", error.message);
    throw new Error("Failed to create level: " + error.message);
  }
}

export async function updateLevel(levelId: string, title: string) {
  try {
    await db.update(levels).set({ title }).where(eq(levels.id, levelId));
    revalidatePath("/admin");
    revalidatePath("/admin/tree");
  } catch (error: any) {
    console.error("Error updating level (FULL ERROR):", error.message);
    throw new Error("Failed to update level: " + error.message);
  }
}

export async function deleteLevel(levelId: string) {
  try {
    // Set levelId to null for any modules in this level
    await db.update(modules).set({ levelId: null }).where(eq(modules.levelId, levelId));
    await db.delete(levels).where(eq(levels.id, levelId));
    revalidatePath("/admin");
    revalidatePath("/admin/tree");
  } catch (error: any) {
    console.error("Error deleting level (FULL ERROR):", error.message);
    throw new Error("Failed to delete level: " + error.message);
  }
}

export async function createModule(title: string, levelId?: string) {
  try {
    const result = await db.insert(modules).values({ title, levelId: levelId || null }).returning();
    revalidatePath("/admin");
    revalidatePath("/admin/tree");
    return result[0];
  } catch (error: any) {
    console.error("Error creating module (FULL ERROR):", error.message);
    throw new Error("Failed to create module: " + error.message);
  }
}

export async function updateModule(moduleId: string, title: string) {
  try {
    await db.update(modules).set({ title }).where(eq(modules.id, moduleId));
    revalidatePath("/admin");
    revalidatePath("/admin/tree");
  } catch (error: any) {
    console.error("Error updating module (FULL ERROR):", error.message);
    throw new Error("Failed to update module: " + error.message);
  }
}

export async function deleteModule(moduleId: string) {
  try {
    await db.delete(modules).where(eq(modules.id, moduleId));
    revalidatePath("/admin");
    revalidatePath("/admin/tree");
  } catch (error: any) {
    console.error("Error deleting module (FULL ERROR):", error.message);
    throw new Error("Failed to delete module: " + error.message);
  }
}

export async function updateModuleLevel(moduleId: string, levelId: string | null) {
  try {
    await db.update(modules).set({ levelId }).where(eq(modules.id, moduleId));
    revalidatePath("/admin");
    revalidatePath("/admin/tree");
  } catch (error: any) {
    console.error("Error updating module level (FULL ERROR):", error.message);
    throw new Error("Failed to update module level: " + error.message);
  }
}

export async function updateLesson(
  lessonId: string, 
  data: { 
    title: string; 
    videoUrl: string; 
    notes: string; 
    adminNotes: string; 
    cliffnotes?: string;
    isPublished: boolean; 
    duration: string; 
    hasVideo?: boolean;
    videoStatus?: string;
    filmingDate?: Date | null;
  }
) {
  try {
    await db.update(lessons).set({
      title: data.title,
      videoUrl: data.videoUrl,
      notes: data.notes,
      adminNotes: data.adminNotes,
      cliffnotes: data.cliffnotes,
      isPublished: data.isPublished,
      duration: data.duration,
      hasVideo: data.hasVideo ?? true,
      videoStatus: data.videoStatus ?? 'not_started',
      filmingDate: data.filmingDate ?? null,
    }).where(eq(lessons.id, lessonId));
    revalidatePath("/portal");
    revalidatePath("/admin");
    revalidatePath("/admin/tree");
    revalidatePath("/admin/modules");
  } catch (error: any) {
    console.error("Error updating lesson (FULL ERROR):", error.message);
    throw new Error("Failed to update lesson: " + error.message);
  }
}

export async function createLesson(moduleId: string, data: { title: string, videoUrl: string, duration: string, notes: string, adminNotes: string, isPublished: boolean, hasVideo?: boolean, videoStatus?: string, filmingDate?: Date | null }) {
  try {
    const result = await db.insert(lessons).values({ 
      ...data, 
      moduleId,
      hasVideo: data.hasVideo ?? true,
      videoStatus: data.videoStatus ?? 'not_started',
      filmingDate: data.filmingDate ?? null,
    }).returning();
    revalidatePath("/admin");
    revalidatePath("/portal");
    revalidatePath("/admin/tree");
    return result[0];
  } catch (error: any) {
    console.error("Error creating lesson (FULL ERROR):", error.message);
    throw new Error("Failed to create lesson: " + error.message);
  }
}

export async function deleteLesson(lessonId: string) {
  try {
    await db.delete(lessons).where(eq(lessons.id, lessonId));
    revalidatePath("/admin");
    revalidatePath("/portal");
    revalidatePath("/admin/tree");
  } catch (error: any) {
    console.error("Error deleting lesson (FULL ERROR):", error.message);
    throw new Error("Failed to delete lesson: " + error.message);
  }
}

// --- Gemini AI Generation Action ---
export async function generateLessonNotes(lessonId: string, templateType: string = "standard") {
  try {
    // 1. Fetch the lesson details
    const [lesson] = await db.select().from(lessons).where(eq(lessons.id, lessonId));
    if (!lesson) throw new Error("Lesson not found");

    // 2. Construct the prompt
    const prompt = `You are Daniele Buatti, a professional Music Director, Audition Pianist, and Voice Coach. 
I want you to write a comprehensive, engaging, and highly practical lesson for my "Audition Guidebook" course.

LESSON TITLE: "${lesson.title}"
CURRENT OUTLINE / NOTES:
${lesson.notes || "No notes written yet."}

BACK-END DRAFT NOTES / BRAIN DUMP:
${lesson.adminNotes || "No private draft notes written yet."}

Please write the complete, client-facing lesson notes in Markdown format. Use a warm, professional, and encouraging tone. Include:
1. A clear, practical explanation of the concept.
2. Real-world audition room examples or stories.
3. A "Daniele's Pro-Tip" callout box.
4. Actionable steps the student can take right now to prepare.

Format the output beautifully with clear headings, bullet points, and bold text. Do not include any conversational intro or outro, just output the markdown content directly.`;

    // 3. Call Gemini API
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    const generatedNotes = response.text;
    if (!generatedNotes) throw new Error("No content generated from Gemini");

    // 4. Save the generated notes back to the database
    await db.update(lessons)
      .set({ notes: generatedNotes })
      .where(eq(lessons.id, lessonId));

    revalidatePath("/portal");
    revalidatePath("/admin");
    revalidatePath("/admin/tree");

    return { success: true, notes: generatedNotes };
  } catch (error: any) {
    console.error("Error generating lesson notes with Gemini:", error);
    throw new Error(error.message || "Failed to generate lesson notes");
  }
}

// --- One-Click Course Scaffolder Action ---
export async function scaffoldAuditionGuidebook() {
  try {
    // 1. Ensure the 3 default levels exist
    let lvl1 = await db.select().from(levels).where(eq(levels.displayOrder, 1));
    let lvl2 = await db.select().from(levels).where(eq(levels.displayOrder, 2));
    let lvl3 = await db.select().from(levels).where(eq(levels.displayOrder, 3));

    let lvl1Id = lvl1[0]?.id;
    let lvl2Id = lvl2[0]?.id;
    let lvl3Id = lvl3[0]?.id;

    if (!lvl1Id) {
      const res = await db.insert(levels).values({ title: "Level 1: Foundations & Mindset", displayOrder: 1 }).returning();
      lvl1Id = res[0].id;
    }
    if (!lvl2Id) {
      const res = await db.insert(levels).values({ title: "Level 2: Practical Preparation", displayOrder: 2 }).returning();
      lvl2Id = res[0].id;
    }
    if (!lvl3Id) {
      const res = await db.insert(levels).values({ title: "Level 3: Advanced Collaboration", displayOrder: 3 }).returning();
      lvl3Id = res[0].id;
    }

    // Helper to create module and lessons
    const addModuleWithLessons = async (levelId: string, title: string, displayOrder: number, lessonsData: any[]) => {
      const modRes = await db.insert(modules).values({ title, levelId, displayOrder }).returning();
      const modId = modRes[0].id;

      for (let i = 0; i < lessonsData.length; i++) {
        const les = lessonsData[i];
        await db.insert(lessons).values({
          moduleId: modId,
          title: les.title,
          videoUrl: les.videoUrl || "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
          duration: les.duration || "05:00",
          notes: les.notes || "",
          adminNotes: les.adminNotes || "",
          isPublished: false,
          hasVideo: les.hasVideo ?? true,
          videoStatus: "not_started",
          displayOrder: i + 1,
          isNew: les.isNew ?? false,
        });
      }
    };

    // --- LEVEL 1 MODULES ---
    await addModuleWithLessons(lvl1Id, "Module 1: Choosing Your Audition Repertoire", 1, [
      {
        title: "What Is Audition Repertoire?",
        notes: "Your audition repertoire is the collection of songs you keep ready and polished — songs that represent who you are as a performer. A strong book gives you flexibility and confidence across a range of audition types.\n\nThe goal is to build a repertoire of six pieces that are aligned to your brand, your strengths, and your voice. These aren't songs you're learning — they're songs you own.",
        adminNotes: "Define audition repertoire in your own words. What does it mean to have a 'book'? Why do you need more than one song?"
      },
      {
        title: "Intellectual Choice vs Vibe",
        notes: "Choosing a song isn't just about what you like. There are two lenses worth considering:\n\n1. Intellectual choice — does the song serve the audition? Does it suit the show, the brief, the room?\n2. Vibe / presentation / brand — does it feel like you? Does it showcase your voice and energy?\n\nBoth matter. The best song choices sit at the intersection of both.\n\nTIP: You wouldn't bring Seussical to a Ragtime audition. Know what the room is asking for.\n\nChoose from brand first, sound second. Pick material because you connect with the text and what it represents — before you've worked out how it sounds on you or whether the cut will work. Jumping ahead to 'will the cut work?' is a way of ruling out songs prematurely.\n\nBallad vs up-tempo is a false binary. What panels usually mean is a mix of vocal production, energy, and character. You can deliver high energy in a ballad and a legit line in an up-tempo. When reading a brief, separate genre, tempo, vocal production, and acting content — they're different axes. Recent briefs increasingly say 'in the style of the show' rather than '16-bar up-tempo.' Ditch the binary.",
        adminNotes: "Give examples of bad song choices vs great song choices for specific audition rooms. Expand on brand — what adjectives describe your performer identity?"
      },
      {
        title: "Learning New Songs vs Recycling Your Rep",
        notes: "Stick with what is tried and tested unless you have ample time to fully integrate new material. Fresh material is a risk in high-pressure rooms.",
        adminNotes: "Talk through when it makes sense to learn something new versus sticking with something tried and tested. What are the risks of each? When is fresh material worth the risk?"
      },
      {
        title: "Composers Worth Knowing",
        notes: "Musical theatre has a rich range of composers, each with their own distinct voice and demands. Some worth having in your repertoire:\n\n- Jason Robert Brown — emotionally complex, rhythmically intricate, vocally demanding\n- Stephen Sondheim — sophisticated harmonic language, text-driven, requires strong musicianship\n- Adam Guettel — contemporary, through-composed, less commonly performed\n\n**'Do Not Sing' lists are a fallacy.** If a song matches your brand and you nail it, sing it — including overdone songs. Popular songs become under-sung precisely because everyone avoids them; a well-written classic can be a relief for a panel that's heard obscure material all day.\n\nThe one genuine caution is the hard-to-play composers: Sondheim, Jason Robert Brown, Adam Guettel. The reason isn't the songs — it's the accompaniment. Sondheim's piano reductions are collapsed orchestrations and can be strange to sight-read; JRB writes pianistically demanding rock/pop/gospel-informed parts. Even here it's a generalisation — both have simpler songs. Understand why the rule exists and apply judgement.\n\nAuditioning for a Sondheim show does not mean bringing a Sondheim song. Composer-matching isn't one-for-one, and any accompanist hired for a Sondheim audition will be on top of the rep anyway.\n\n**Mature rep** (songs about parenthood, loss, etc. sung by young performers) — less of a rule than schools suggest. If you genuinely connect with the content and it fits your brand, it can work; if you can't connect, that's the real reason not to sing it.",
        adminNotes: "Add more composers and your personal notes on each. What does each composer ask of a performer? Which voices do they suit?"
      },
      {
        title: "Building Six Pieces",
        notes: "Aim for six well-prepared, well-chosen pieces. They should collectively demonstrate range — not just vocal range, but emotional range, style range, and character range.\n\n**Book discipline:** you only need a small set of go-to songs you know inside out — six is plenty. Bring only what you're prepared to sing in that room. Consider separate, cleanly stored folders: full originals, 16-bar cuts, 32-bar cuts (useful for cruise-ship style auditions running tight on time).",
        adminNotes: "Give your framework here. What adjectives or categories help a student think about their six pieces? E.g. one uptempo, one ballad, one contemporary, one classic. Make this yours."
      }
    ]);

    await addModuleWithLessons(lvl1Id, "Module 2: Where to Source Sheet Music", 2, [
      {
        title: "Why Legitimate Sources Matter",
        notes: "Your music is the first thing an accompanist sees. A blurry, incomplete, or illegible score creates problems before you've sung a note.",
        adminNotes: "Talk about why sourcing properly matters — both legally and practically. What do badly sourced PDFs look like and why are they a problem in the room?"
      },
      {
        title: "Recommended Sources",
        notes: "1. Musicnotes.com: Good for popular songs and musical theatre. Offers transpositions in multiple keys.\n2. Sheet Music Plus: Broader selection, including classical and more obscure musical theatre.\n3. Scribd: Subscription-based, user-uploaded content. Quality and legality varies — use with caution.",
        adminNotes: "Add your personal notes on Musicnotes and Sheet Music Plus — what you recommend them for, any caveats."
      },
      {
        title: "What Format to Download & Transpositions",
        notes: "Always download as PDF. Avoid screenshots, photos of books, or image files. A clean PDF will scan and annotate correctly.\n\nMost reputable sheet music sites offer transpositions. If your song doesn't sit well in the printed key, check whether a transposition is available before attempting to manually transpose.",
        adminNotes: "Add any extra notes on transpositions — when to use them, what to be aware of, common mistakes."
      }
    ]);

    await addModuleWithLessons(lvl1Id, "Module 3: What Your Sheet Music Should Look Like", 3, [
      {
        title: "The Three Staves",
        notes: "Your sheet music must have three staves — a vocal line, and a grand staff for piano (treble and bass clef). This gives the accompanist everything they need to support you fully.\n\n- Vocal stave — your melody line, with lyrics\n- Treble clef — the right hand of the piano part\n- Bass clef — the left hand of the piano part",
        adminNotes: "Add a diagram or image here showing what three-stave music looks like vs a lead sheet."
      },
      {
        title: "What Is a Lead Sheet — and Why It's Not Enough",
        notes: "A lead sheet typically contains only a melody line and chord symbols, with no piano part written out. While useful for many contexts, it doesn't give an accompanist enough information to support you well in an audition.",
        adminNotes: "Explain why accompanists cannot improvise a full theatrical accompaniment on the spot from chord symbols."
      },
      {
        title: "What to Avoid (Common Problems)",
        notes: "Avoid:\n- Faded or grey printing — black should be truly black, not blurry or pixelated\n- Missing pages — always count your pages before an audition and make sure they're in the right order\n- Photos of books — hard to read on a stand\n- Printers running low on ink — that weird blue tint is no good\n- Lead sheets with chord symbols only\n- Music without a piano part\n\nDo a simple vibe check on your sheet music: can you actually read it? Are you squinting? It's not complicated — you just need to be able to see the music clearly. Print early, store it digitally somewhere you can always find it, and make sure it's high contrast black and white.",
        adminNotes: "This is your list of common problems from the slides. Include the faded black, missing pages, images only, numbered sheets without context etc."
      }
    ]);

    await addModuleWithLessons(lvl1Id, "Module 4: Basic Music Terminology", 4, [
      {
        title: "Key Signature & Time Signature",
        notes: "Key Signature: Tells the pianist what key the song is in. Ensure it is visible and not obscured.\n\nTime Signature: Tells the pianist the meter (e.g., 4/4, 3/4, 6/8). This affects the feel of the song.",
        adminNotes: "Explain what key and time signatures are in plain, accessible language. Keep it practical and audition-relevant."
      },
      {
        title: "BPM & What Is a Bar?",
        notes: "BPM (Beats Per Minute): A numerical measure of tempo. While useful, don't lead with numbers when communicating tempo to an accompanist.\n\nWhat is a Bar?: A segment of time defined by a given number of beats. Connects directly to 16-bar and 32-bar cuts.",
        adminNotes: "Explain what a bar is simply. Connect it to the concept of 16-bar and 32-bar cuts."
      },
      {
        title: "Fermata & Tempo Terms",
        notes: "**Fermata:** Tells the performer to hold a note longer than its written value. If music is a ribbon flowing along, the fermata holds the ribbon still, then lets it flow again.\n\n**Caesura ('tram tracks'):** A complete cut in the sound. The ribbon is cut; silence; then you get back on. Something in the score (usually the vocal line) cues the re-entry.\n\nBoth the fermata and caesura must appear in **every stave**, not just the vocal line — everyone has to stop, not just the singer. Notation software does this automatically; if you're adding one by hand, add it to the accompaniment too. Note the printed fermata in the accompaniment may sit at a different point than the vocal one — that's deliberate.\n\nRubato: 'Robbed time' — expressive freedom with rhythm.\n\nColla Voce: 'With the voice' — accompanist follows the singer.\n\nRallentando (Rall.) / Ritardando (Rit.): Gradual slowing of tempo.\n\nA Tempo: Return to the original tempo.\n\nAnything that changes the rhythm or tempo of your song is good currency: fermata, caesura, tacet, colla voce. These symbols buy you freedom in the room.",
        adminNotes: "Explain these terms simply. Give examples of songs where these are commonly used. Add an image showing fermata and caesura notation."
      },
      {
        title: "Back Phrasing, Colla Voce & Tacet",
        notes: "**Tacet:** Means 'do not play'. If there are bars where you want the accompanist to be silent — perhaps for dramatic effect — write 'tacet' clearly over those bars.\n\n**Colla voce:** The accompanist follows the voice. The singer leads, the pianist waits and supports. Useful when you know the timing will be fluid.\n\n**Back-phrasing:** Singing deliberately off the written rhythm (behind or ahead of the beat). Most contemporary MT is effectively written back-phrased. If you know you back-phrase, telling your accompanist is gold: it means they hold the pulse steady rather than chasing you.\n\nColla voce and back-phrasing are different things — know which one you're asking for. Colla voce means 'follow me'; back-phrasing means 'I'm going to play with the rhythm, hold the pulse steady.'",
        adminNotes: "Explain back phrasing in your own words. What does it sound like? How do you communicate it to an accompanist?"
      }
    ]);

    // --- LEVEL 2 MODULES ---
    await addModuleWithLessons(lvl2Id, "Module 5: How to Cut Your Music", 5, [
      {
        title: "What Is a Cut? (Time Over Bar Counts)",
        notes: "A cut is a shortened excerpt of your song — the section that best showcases your voice and storytelling within the time you're given.\n\n**'16 bars' is lazy nomenclature** — bars are an arbitrary measurement. Think in time and story, not bar counts.\n\n- Target **30–45 seconds**. Pushing past 45 needs to be worth it; at a full minute you're adding padding (walking in, holding the final note) on top. Some briefs ask for 60–90 seconds — read the brief, but in the room, quicker and snappier usually lands better.\n- **Singing shorter gives the panel time back** and can open the door to being asked for a second song. Not gospel — a guideline, not a rule.\n\n**The 'story arc' of a cut is largely an illusion.** Sing a chunk. Get as much story as you can, but don't contort the song into a Frankenstein of half-sentences and jumps. The test isn't 'does it have an arc' — it's 'would someone watching feel lost?'\n\n**Songs aren't designed to be cut.** Don't hack them apart in weird places. Often the cleanest cut is a chunk the composer already stitched together (e.g. from the key change to the end).\n\n**Contemporary MT resists heavy trimming:** intro fragment → jump to end belt reads as chaotic, and a short cut can leave the panel wondering what they missed. If you can hold space and deliver storytelling in a short cut, fine — but know the trade-off.\n\nSome songs simply work better as longer cuts, some as shorter. A held final note alone can be 15 seconds — budget for it.",
        adminNotes: "Give your own guidance on how to identify the right section. What are you looking for?"
      },
      {
        title: "Making Clean, Performable Cuts",
        notes: "A good cut feels like a complete musical thought — not a fragment. It should make sense harmonically and emotionally, even without the context of the full song.\n\n- Cut at the end of a phrase, not mid-thought\n- Avoid starting on a pickup bar where possible\n- The ending of your cut should feel conclusive\n- **Never cut mid-bar.** Don't start or end a cut partway through a bar; it forces extra barlines and reads as messy. Cut clean at barlines.\n\n**Elaborate patchwork cuts are a mental game more than a practical asset.** When it comes time to communicate a complicated cut to an accompanist under pressure, complexity costs you. Keep it simple.\n\n**There is no consequence to trying.** Draft cuts in pencil, test them, commit in pen when it's final.",
        adminNotes: "Step-by-step: how do you find a good cutting point? What do you listen for? What makes a cut feel awkward or abrupt?"
      },
      {
        title: "The Correct Bracket Notation",
        notes: "When marking a cut in your music, use a clear bracket system:\n- Use a thick black or red line to mark the start and end of your cut\n- Clearly label START and END at the appropriate points\n- Do not add brackets at the natural end of the song",
        adminNotes: "Add an image or diagram here showing correct bracket notation vs common mistakes."
      },
      {
        title: "Intros and Endings",
        notes: "**Most people give themselves too much intro.** Two bars is usually plenty; eight is almost never needed.\n\nYou can drop straight in on the vocal with no intro at all — the accompanist only needs your breath. This requires confidence, and it connects to presentation and brand: are you someone who can take a note and go?\n\nDon't count yourself in out loud.\n\n**Alternative to a full intro bar: a single chord.** Mark the bar with the chord, write 'tacet' for what the piano shouldn't play, and 'play' where the accompaniment re-enters. This removes a whole bar where tempo and communication can go wrong — you take the pitch, you set the tempo yourself.\n\n**Endings:** If your cut ends on something unresolved, the panel may not know you've finished. Consider ending somewhere that resolves, or adding a simple ending. Watch your final gesture — it's part of signalling you're done.",
        adminNotes: "Brad suggests a demo video showing the single-chord intro technique in action.",
        isNew: true
      }
    ]);

    await addModuleWithLessons(lvl2Id, "Module 6: How to Annotate and Mark Up Your Music", 6, [
      {
        title: "The Golden Rule of Annotation",
        notes: "Your annotations are a communication tool. The goal is to give the accompanist everything they need to play your cut correctly — without you having to say a word.\n\nTHE GOLDEN RULE: Your music needs to communicate for you when you can't speak.",
        adminNotes: "Emphasize the psychological shift of treating sheet music as a direct communication channel."
      },
      {
        title: "General Annotation Tips & Marking Cuts",
        notes: "- Use a pen, not pencil — pencil is too light and smudges\n- Use yellow highlighter only\n- Do not highlight lyrics\n- Highlight key and time signature changes, clef changes, and (optionally) brackets at page turns\n- Highlight tempo markings and fermatas — highlight the symbol itself, not a giant stroke across the system\n- Keep lines clean and straight — use a ruler\n- Pencil while drafting, pen when committed\n\n**Never cut mid-bar.** Don't start or end a cut partway through a bar; it forces extra barlines and reads as messy. Cut clean at barlines.\n\n**Cross-outs:** Box the excluded bars, then draw a diagonal line from bottom-left to top-right. The box matters — without it, the accompanist can be unsure whether an edge bar is in or out.\n\n**Brackets face the music that is to be played.** Reversed brackets scramble the read. Think of brackets as a portal: in here, out there. Don't bracket the final bars if you're simply playing through to the printed end — a closing bracket implies more music follows.\n\n**Always keep the first page**, even if it's entirely crossed out. It carries the title, key signature, time signature, and context — the accompanist downloads the whole world of the song in one glance. It also means you don't need to re-insert time signatures into later pages (and if the piece is in common time, you never needed to add 'C' anyway). Put the title at the top of the first page.\n\n**Cross out any lyrics you are not singing.** A simple ruled strike-through is enough — no white-out needed. This saves the pre-song conversation from 'wait, are you singing this bit?'\n\n**Start/End labels and smiley faces:** optional. They don't hurt, and if writing 'start' gives you certainty, do it.\n\n**White-out / cut-and-paste reconstruction:** generally discouraged. Done meticulously it can work, but most attempts produce scores that are hard to trust at sight. If you go this route, get the result transcribed or checked — and always re-scan so seams and shadows disappear.\n\n**Duets:** Leave the other vocal line in. It doesn't throw the accompanist, and it can actually help them help you.",
        adminNotes: "Explain why highlighting lyrics is a major distraction for sight-reading pianists. Include images showing correct cross-out technique and bracket orientation."
      },
      {
        title: "Annotating Digitally",
        notes: "Recommended Apps:\n- iPad: ForScore (robust annotation, page turning with pedal)\n- Mac: Preview (easy highlighting, boxes, lines)\n- GoodNotes, PDF Expert, PDFGear (free), Samsung Notes, Google Slides",
        adminNotes: "Add your notes on how you use ForScore. What are the key tools? Any tips for getting clean lines?"
      },
      {
        title: "Annotating by Hand & White Boxes",
        notes: "Handwritten notes are fine — avoid lead pencil. Use yellow highlighter only.\n\nUsing White Boxes: When annotating digitally, white boxes can be used to block out sections of music you don't need in your cut. Do NOT block out the key signature or time signatures.",
        adminNotes: "Explain how to cleanly remove bars by hand: cover them with white paper before scanning."
      }
    ]);

    await addModuleWithLessons(lvl2Id, "Module 7: Physical Preparation of Your Music", 7, [
      {
        title: "Folder vs Taping",
        notes: "Display Folders:\n- Use a display folder with clear plastic pockets — not a ring binder\n- Ring binders cause pages to drag or fall off the piano music stand\n- Ensure the plastic pockets are clear, fresh, and free of crinkles\n\nTaping Pages:\n- Tape pages front and back so no adhesive is exposed — exposed tape sticks pages together mid-song and causes skipped pages\n- Tape the front of page 1–2, then the back of page 2–3, then the front of page 3–4\n- This alternating pattern keeps exposed tape off the playing surface\n- Sits flat on the stand and turns easily\n\niPads in the room: fine, but ask the accompanist first. Some accompanists prefer paper (two pages visible at once, no app surprises). Glare is a real issue with glossy binder sleeves — choose non-glare sleeves.",
        adminNotes: "Recommend a specific type of display folder that works well — brand, sleeve count, any specific features."
      },
      {
        title: "Watching for Page Turns",
        notes: "Before your audition, check every page turn in your cut. Look for:\n- Important information in the corners of pages — key changes, time changes, tempo markings\n- Whether the accompanist will have time to turn the page between playing\n- Whether you need to re-order pages for a smoother transition",
        adminNotes: "Explain how to plan page turns so they occur during vocal rests or simple accompaniment passages."
      },
      {
        title: "Always Keep the First Page & Printing Quality",
        notes: "Even if your cut starts on page three, always keep page one visible in your folder. It provides the accompanist with the key signature, time signature, and the full context of the piece.\n\nPrinting Quality:\n- Ensure no staves are cut off at the edges\n- Music staves should be horizontally aligned — no crooked printing\n- Print in black and white, high contrast — not greyscale",
        adminNotes: "Explain why keeping page one is a non-negotiable rule for professional auditions."
      }
    ]);

    await addModuleWithLessons(lvl2Id, "Module 8: How to Scan and Digitise Your Music", 8, [
      {
        title: "Why Scanning Matters & Scanning Tips",
        notes: "A blurry, crooked, or low-contrast scan makes it very hard for an accompanist to sight-read your music under high-pressure audition room lighting.\n\nScanning Tips:\n- Align pages neatly — no wonky angles\n- Black should appear truly black — not grey or faded\n- High resolution — no pixelation or blurriness\n- Monochrome (black and white) — not greyscale or colour\n- Scan one page at a time for the cleanest result\n\n**Piano-vocal scores vs piano-conductor scores:** Piano-vocal parts sometimes just double the melody — check before trusting a source. Some sources (e.g. Musicnotes) get an unfair blanket ban for this; the real skill is knowing how to read the accompaniment and confirm it isn't just melody. Some genres want the melody in the accompaniment (a lot of '30s–'40s writing) — that's the style, and it matters that the accompanist has it.\n\n**Prefer typeset over handwritten scores.** Handwritten piano-conductor scores from shows read badly under audition pressure.\n\n**Scan quality standard:** no blur. Black and white, high saturation/contrast. Use a proper scanning app (Adobe Scan, Dropbox scan, or similar). If a free download is blurry, fix it or find a better source — 'a smidge blurry' is still a problem for someone sight-reading.\n\nEveryone should reach the point where their whole book exists as clean one-for-one PDFs — no generational photocopies. Store originals; re-scan after any physical cut-and-paste so seams disappear.",
        adminNotes: "Add recommended apps here — your preferred scanning app, any tips for phone scanning. Include note about checking piano-conductor scores vs piano-vocal."
      },
      {
        title: "Saving and Naming Your Files",
        notes: "File naming matters, especially when submitting music digitally. Use a consistent, clear convention:\n\nFirst Name Last Name – Song Title – Show Title\nExample: Daniele Buatti – Part of Your World – The Little Mermaid\n\n- PDF format only — no photos, screenshots, or image files\n- Check your file is complete before sending — open it and scroll through every page\n\n**Organise by cut length.** Consider keeping separate folders for:\n- Full originals (unmarked scores)\n- 16-bar cuts\n- 32-bar cuts (useful for cruise-ship style auditions running tight on time)\n\nThis way you grab the right folder depending on the brief, rather than hunting through a single book.",
        adminNotes: "Explain why sending JPGs or screenshots of sheet music causes problems in the audition room."
      }
    ]);

    // --- LEVEL 3 MODULES ---
    await addModuleWithLessons(lvl3Id, "Module 9: How to Deliver Tempo", 9, [
      {
        title: "Why Tempo Delivery Matters",
        notes: "Delivering tempo clearly and confidently is one of the most important things you can do in an audition. It sets the room. It establishes your musical authority. It ensures the accompanist can give you exactly what you need.\n\nTempo = Style + BPM\nTempo is not just a number. It's the feel, the groove, the pulse, the genre. Style often matters more than the exact BPM.\n\nTIP: A jazz waltz at 88 BPM will feel completely different to a folk ballad at 88 BPM. Lead with the style, not the number.",
        adminNotes: "Explain the psychology of tempo delivery. Why does a rushed tempo delivery signal anxiety?"
      },
      {
        title: "How to Deliver Tempo Confidently",
        notes: "- Sing your tempo — not just tap it. The accompanist needs to hear the rhythm and feel, not just a beat\n- Tap while you sing — chest, leg, or foot are all fine\n- Don't tap frantically — rapid, anxious tapping signals nerves\n- Don't just quote the BPM number — explain it through singing and feel\n- Two priorities: sing, and tap the chest. In that order.",
        adminNotes: "Add your own explanation of the chest tap technique here — why the chest? How does it feel different to tapping elsewhere?"
      },
      {
        title: "Communicating Tempo Changes",
        notes: "If your song has tempo changes — a rall., a rubato section, a modulation — beat through each change with the accompanist, then return to the beginning and deliver the opening tempo again. This refreshes their memory of where the song starts.",
        adminNotes: "Explain how to physically conduct or gesture tempo changes at the piano."
      },
      {
        title: "Tempo Exercise — Songs to Practice With",
        notes: "Practice delivering tempo across different styles:\n\nFast and Rhythmic:\n- You Can't Stop the Beat — Hairspray\n- Good Morning — Singin' in the Rain\n\nModerate / Mid-Tempo:\n- She Used to Be Mine — Waitress\n- Suddenly Seymour — Little Shop of Horrors\n\nSlow and Grounded:\n- Someone Like You — Adele\n- Gravity — Sara Bareilles",
        adminNotes: "Add more songs and specific tempo delivery challenges for each."
      }
    ]);

    await addModuleWithLessons(lvl3Id, "Module 10: Approaching and Talking to Your Accompanist", 10, [
      {
        title: "It's a Collaboration, Not a Test",
        notes: "The accompanist is not judging you. They are there to support you. The most important shift you can make is to think of this moment not as a hand-off, but as the beginning of a partnership.\n\nThe best auditionees don't hand over their music and walk away. They have a brief, warm, purposeful conversation — and then go and sing.",
        adminNotes: "Talk about the power dynamic in the room. How can performers treat the accompanist as an equal collaborator?"
      },
      {
        title: "How to Approach & Walk Them Through the Music",
        notes: "How to Approach:\n- Walk to the side of the piano — not behind it\n- Standing behind the piano means your music is upside down and you're crowding the accompanist's space\n- Own your space — stand tall, don't shrink\n- Smile. A warm 'How are you?' is a lovely opener\n\nWalking Them Through the Music:\n- Show them the structure of your cut — where it starts, where it ends\n- Highlight any tricky moments — unexpected modulations, fermatas, tight cues, cut-offs\n- Save tempo for last — let them absorb the context of the piece first",
        adminNotes: "Explain why standing behind the piano is a common but highly disruptive mistake."
      },
      {
        title: "Delivering Tempo & Introductions",
        notes: "Once you've walked them through the music, get to the end of the cut, then turn back to the beginning and deliver your tempo.\n\nIntroduction or No Introduction?:\n- Be decisive about whether your piece has an introduction\n- If you don't want an introduction, mark this clearly in the music and tell the accompanist\n- If you do want an introduction, keep it purposeful — its job is to give you the key and the tempo",
        adminNotes: "Explain how to mark 'No Intro' or 'Start on Vocal' clearly in the sheet music."
      },
      {
        title: "Putting Things Down & Second Songs",
        notes: "Putting Things Down:\n- If you have a bag, drink bottle, or folder of extra music — just put it down. Find the confidence to place it on the floor or to the side. You don't need to ask permission.\n\nIf They Ask for a Second Song:\n- Being asked for a second song is a good sign. Enjoy it.\n- Walk back to the piano calmly — don't rush\n- Repeat the full process: walk them through the music, highlight cues, deliver tempo",
        adminNotes: "Explain why asking permission to put down your bag signals a lack of professional confidence."
      }
    ]);

    await addModuleWithLessons(lvl3Id, "Module 11: Walking Into the Audition Room", 11, [
      {
        title: "Before You Go In & Entering the Room",
        notes: "Entering the Room:\n- Head up — arrive with presence\n- Take in the space — let your body adjust before you do anything\n- Make eye contact where appropriate — with the panel, with the accompanist\n- Stand tall — posture and poise communicate confidence\n- Walk with intention — grounded, not rushed",
        adminNotes: "What's your pre-room routine? What do you recommend someone does in the five minutes before they're called? Any mindset tips, breathing, physical grounding?"
      },
      {
        title: "The Order of Events & Closing the Audition",
        notes: "The Order of Events:\n1. Enter the room with presence\n2. Acknowledge the panel and accompanist\n3. Approach the piano and walk through your music\n4. Deliver tempo\n5. Walk to your spot, ground yourself, and sing\n6. Thank the room, collect your music, and exit with grace",
        adminNotes: "Walk through the sequence clearly. This is the choreography of the audition. Make it feel straightforward and achievable."
      }
    ]);

    await addModuleWithLessons(lvl3Id, "Module 12: Backing Tracks and Home Rehearsal", 12, [
      {
        title: "What Is a Backing Track & Where to Find Them",
        notes: "A backing track is a pre-recorded piano (or full band) accompaniment that you can rehearse with at home. It allows you to practise your tempo, your entries, and your performance without needing a live accompanist.\n\nRecommended Sources:\n- Piano Backings by Daniele (custom, high-quality backings tailored to your cuts)",
        adminNotes: "List your recommended sources for backing tracks. Include your own Piano Backings by Daniele service here — describe what it offers and how to access it."
      },
      {
        title: "Rehearsing With a Backing Track vs Metronome",
        notes: "A backing track is a rehearsal tool, not a crutch. Use it to build familiarity, confidence, and precision — but be aware that a live accompanist will follow you in ways a track cannot.\n\n- Practise delivering your tempo as if you were talking to a live accompanist — even at home\n- Notice where you tend to rush or drag — a track will expose this clearly\n- Practise your entries, especially after introductions or held notes",
        adminNotes: "Add your own tips for effective home rehearsal practice. What do you tell your voice coaching clients? What separates productive rehearsal from just running through it?"
      }
    ]);

    await addModuleWithLessons(lvl3Id, "Module 13: Common Mistakes — What Not to Do", 13, [
      {
        title: "The Love Me Tender Story",
        notes: "A cautionary tale of what happens when preparation is neglected. The singer who asked to play it twice, told the pianist to go slower after the full instrumental, took ages to remove accessories, wouldn't come in before a two-bar introduction, kept stopping and starting, and gave a long explanation.\n\nTIP: Being asked to replay an introduction is not a problem. How you handle it is.",
        adminNotes: "Tell this story in full, in your voice. What did it feel like from the piano? What was the effect on the room? What would have made it better?"
      },
      {
        title: "Music, In-Room, and Mindset Mistakes",
        notes: "Music Mistakes:\n- Faded or grey printing\n- Missing pages\n- Lead sheets with no piano part\n- Blurry PDFs\n- Pencil annotations\n- Blocking out key signatures\n\nIn-Room Mistakes:\n- Shouting your tempo across the room\n- Giving tempo as just a number\n- Standing behind the piano\n- Rushing through the music handover\n- Apologising for your music\n- Not collecting your music",
        adminNotes: "Your thoughts here — what are the internal mistakes? The ones that don't show up in the music but show up in the room? Over-explaining, apologizing, shrinking.\n\n[DRAFT – candidates for future lessons]\n- The 8-bar intro nobody needed\n- Uncrossed lyrics leading to 'wait, are you singing this bit?' conversations\n- Brackets at the very end of a play-through cut, implying missing pages\n- Exposed tape sticking pages together mid-audition\n- Frankenstein white-out cuts that fall apart at sight-reading\n- Bringing a JRB 'death song' cold to a 9am accompanist"
      }
    ]);

    revalidatePath("/admin");
    revalidatePath("/portal");
    revalidatePath("/admin/tree");
    revalidatePath("/admin/modules");
    return { success: true };
  } catch (error) {
    console.error("Error scaffolding guidebook:", error);
    throw new Error("Failed to scaffold guidebook");
  }
}

// --- Resource Actions ---
export async function addResource(lessonId: string, title: string, url: string, description?: string) {
  try {
    const maxOrder = await db.select({ maxOrder: resources.displayOrder }).from(resources).where(eq(resources.lessonId, lessonId));
    const nextOrder = (maxOrder.length > 0 && maxOrder[0].maxOrder !== null) ? maxOrder[0].maxOrder + 1 : 0;
    const result = await db.insert(resources).values({
      lessonId,
      title,
      url,
      description: description || null,
      displayOrder: nextOrder,
    }).returning();
    revalidatePath("/admin/modules");
    return result[0];
  } catch (error: any) {
    console.error("Error adding resource:", error.message);
    throw new Error("Failed to add resource: " + error.message);
  }
}

export async function updateResource(id: string, data: { title?: string; url?: string; description?: string }) {
  try {
    await db.update(resources).set(data).where(eq(resources.id, id));
    revalidatePath("/admin/modules");
  } catch (error: any) {
    console.error("Error updating resource:", error.message);
    throw new Error("Failed to update resource: " + error.message);
  }
}

export async function deleteResource(id: string) {
  try {
    await db.delete(resources).where(eq(resources.id, id));
    revalidatePath("/admin/modules");
  } catch (error: any) {
    console.error("Error deleting resource:", error.message);
    throw new Error("Failed to delete resource: " + error.message);
  }
}

export async function renameModule(moduleId: string, newTitle: string) {
  try {
    await db.update(modules).set({ title: newTitle }).where(eq(modules.id, moduleId));
    revalidatePath("/admin");
    revalidatePath("/admin/tree");
    revalidatePath("/admin/modules");
    revalidatePath("/modules");
  } catch (error: any) {
    console.error("Error renaming module:", error.message);
    throw new Error("Failed to rename module: " + error.message);
  }
}

export async function updateModuleWrapUpVideo(moduleId: string, wrapUpVideoUrl: string) {
  try {
    await db.update(modules).set({ wrapUpVideoUrl }).where(eq(modules.id, moduleId));
    revalidatePath("/admin");
    revalidatePath("/admin/tree");
    revalidatePath("/admin/modules");
    revalidatePath("/modules");
  } catch (error: any) {
    console.error("Error updating module wrap-up video:", error.message);
    throw new Error("Failed to update module wrap-up video: " + error.message);
  }
}

export async function toggleModuleVisibility(moduleId: string) {
  try {
    const mod = await db.select({ isPublished: modules.isPublished }).from(modules).where(eq(modules.id, moduleId)).limit(1);
    if (mod.length === 0) throw new Error("Module not found");
    const newValue = !mod[0].isPublished;
    await db.update(modules).set({ isPublished: newValue }).where(eq(modules.id, moduleId));
    revalidatePath("/admin");
    revalidatePath("/admin/tree");
    revalidatePath("/admin/modules");
    revalidatePath("/modules");
    return { success: true, isPublished: newValue };
  } catch (error: any) {
    console.error("Error toggling module visibility:", error.message);
    throw new Error("Failed to toggle module visibility: " + error.message);
  }
}

// --- Sync Scaffolder Content to Existing DB ---
export async function syncUpdatedContent() {
  try {
    // Map of module title → lessons to update (matched by lesson title)
    const updates: Record<string, { title: string; notes: string; adminNotes: string; isNew?: boolean }[]> = {
      "Module 1: Choosing Your Audition Repertoire": [
        {
          title: "Intellectual Choice vs Vibe",
          notes: "Choosing a song isn't just about what you like. There are two lenses worth considering:\n\n1. Intellectual choice — does the song serve the audition? Does it suit the show, the brief, the room?\n2. Vibe / presentation / brand — does it feel like you? Does it showcase your voice and energy?\n\nBoth matter. The best song choices sit at the intersection of both.\n\nTIP: You wouldn't bring Seussical to a Ragtime audition. Know what the room is asking for.\n\nChoose from brand first, sound second. Pick material because you connect with the text and what it represents — before you've worked out how it sounds on you or whether the cut will work. Jumping ahead to 'will the cut work?' is a way of ruling out songs prematurely.\n\nBallad vs up-tempo is a false binary. What panels usually mean is a mix of vocal production, energy, and character. You can deliver high energy in a ballad and a legit line in an up-tempo. When reading a brief, separate genre, tempo, vocal production, and acting content — they're different axes. Recent briefs increasingly say 'in the style of the show' rather than '16-bar up-tempo.' Ditch the binary.",
          adminNotes: "Give examples of bad song choices vs great song choices for specific audition rooms. Expand on brand — what adjectives describe your performer identity?"
        },
        {
          title: "Composers Worth Knowing",
          notes: "Musical theatre has a rich range of composers, each with their own distinct voice and demands. Some worth having in your repertoire:\n\n- Jason Robert Brown — emotionally complex, rhythmically intricate, vocally demanding\n- Stephen Sondheim — sophisticated harmonic language, text-driven, requires strong musicianship\n- Adam Guettel — contemporary, through-composed, less commonly performed\n\n**'Do Not Sing' lists are a fallacy.** If a song matches your brand and you nail it, sing it — including overdone songs. Popular songs become under-sung precisely because everyone avoids them; a well-written classic can be a relief for a panel that's heard obscure material all day.\n\nThe one genuine caution is the hard-to-play composers: Sondheim, Jason Robert Brown, Adam Guettel. The reason isn't the songs — it's the accompaniment. Sondheim's piano reductions are collapsed orchestrations and can be strange to sight-read; JRB writes pianistically demanding rock/pop/gospel-informed parts. Even here it's a generalisation — both have simpler songs. Understand why the rule exists and apply judgement.\n\nAuditioning for a Sondheim show does not mean bringing a Sondheim song. Composer-matching isn't one-for-one, and any accompanist hired for a Sondheim audition will be on top of the rep anyway.\n\n**Mature rep** (songs about parenthood, loss, etc. sung by young performers) — less of a rule than schools suggest. If you genuinely connect with the content and it fits your brand, it can work; if you can't connect, that's the real reason not to sing it.",
          adminNotes: "Add more composers and your personal notes on each. What does each composer ask of a performer? Which voices do they suit?"
        },
        {
          title: "Building Six Pieces",
          notes: "Aim for six well-prepared, well-chosen pieces. They should collectively demonstrate range — not just vocal range, but emotional range, style range, and character range.\n\n**Book discipline:** you only need a small set of go-to songs you know inside out — six is plenty. Bring only what you're prepared to sing in that room. Consider separate, cleanly stored folders: full originals, 16-bar cuts, 32-bar cuts (useful for cruise-ship style auditions running tight on time).",
          adminNotes: "Give your framework here. What adjectives or categories help a student think about their six pieces? E.g. one uptempo, one ballad, one contemporary, one classic. Make this yours."
        }
      ],
      "Module 4: Basic Music Terminology": [
        {
          title: "Fermata & Tempo Terms",
          notes: "**Fermata:** Tells the performer to hold a note longer than its written value. If music is a ribbon flowing along, the fermata holds the ribbon still, then lets it flow again.\n\n**Caesura ('tram tracks'):** A complete cut in the sound. The ribbon is cut; silence; then you get back on. Something in the score (usually the vocal line) cues the re-entry.\n\nBoth the fermata and caesura must appear in **every stave**, not just the vocal line — everyone has to stop, not just the singer. Notation software does this automatically; if you're adding one by hand, add it to the accompaniment too. Note the printed fermata in the accompaniment may sit at a different point than the vocal one — that's deliberate.\n\nRubato: 'Robbed time' — expressive freedom with rhythm.\n\nColla Voce: 'With the voice' — accompanist follows the singer.\n\nRallentando (Rall.) / Ritardando (Rit.): Gradual slowing of tempo.\n\nA Tempo: Return to the original tempo.\n\nAnything that changes the rhythm or tempo of your song is good currency: fermata, caesura, tacet, colla voce. These symbols buy you freedom in the room.",
          adminNotes: "Explain these terms simply. Give examples of songs where these are commonly used. Add an image showing fermata and caesura notation."
        },
        {
          title: "Back Phrasing & Tacet",
          notes: "**Tacet:** Means 'do not play'. If there are bars where you want the accompanist to be silent — perhaps for dramatic effect — write 'tacet' clearly over those bars.\n\n**Colla voce:** The accompanist follows the voice. The singer leads, the pianist waits and supports. Useful when you know the timing will be fluid.\n\n**Back-phrasing:** Singing deliberately off the written rhythm (behind or ahead of the beat). Most contemporary MT is effectively written back-phrased. If you know you back-phrase, telling your accompanist is gold: it means they hold the pulse steady rather than chasing you.\n\nColla voce and back-phrasing are different things — know which one you're asking for. Colla voce means 'follow me'; back-phrasing means 'I'm going to play with the rhythm, hold the pulse steady.'",
          adminNotes: "Explain back phrasing in your own words. What does it sound like? How do you communicate it to an accompanist?"
        }
      ],
      "Module 5: How to Cut Your Music": [
        {
          title: "What Is a Cut? (Time Over Bar Counts)",
          notes: "A cut is a shortened excerpt of your song — the section that best showcases your voice and storytelling within the time you're given.\n\n**'16 bars' is lazy nomenclature** — bars are an arbitrary measurement. Think in time and story, not bar counts.\n\n- Target **30–45 seconds**. Pushing past 45 needs to be worth it; at a full minute you're adding padding (walking in, holding the final note) on top. Some briefs ask for 60–90 seconds — read the brief, but in the room, quicker and snappier usually lands better.\n- **Singing shorter gives the panel time back** and can open the door to being asked for a second song. Not gospel — a guideline, not a rule.\n\n**The 'story arc' of a cut is largely an illusion.** Sing a chunk. Get as much story as you can, but don't contort the song into a Frankenstein of half-sentences and jumps. The test isn't 'does it have an arc' — it's 'would someone watching feel lost?'\n\n**Songs aren't designed to be cut.** Don't hack them apart in weird places. Often the cleanest cut is a chunk the composer already stitched together (e.g. from the key change to the end).\n\n**Contemporary MT resists heavy trimming:** intro fragment → jump to end belt reads as chaotic, and a short cut can leave the panel wondering what they missed. If you can hold space and deliver storytelling in a short cut, fine — but know the trade-off.\n\nSome songs simply work better as longer cuts, some as shorter. A held final note alone can be 15 seconds — budget for it.",
          adminNotes: "Give your own guidance on how to identify the right section. What are you looking for?"
        },
        {
          title: "Making Clean, Performable Cuts",
          notes: "A good cut feels like a complete musical thought — not a fragment. It should make sense harmonically and emotionally, even without the context of the full song.\n\n- Cut at the end of a phrase, not mid-thought\n- Avoid starting on a pickup bar where possible\n- The ending of your cut should feel conclusive\n- **Never cut mid-bar.** Don't start or end a cut partway through a bar; it forces extra barlines and reads as messy. Cut clean at barlines.\n\n**Elaborate patchwork cuts are a mental game more than a practical asset.** When it comes time to communicate a complicated cut to an accompanist under pressure, complexity costs you. Keep it simple.\n\n**There is no consequence to trying.** Draft cuts in pencil, test them, commit in pen when it's final.",
          adminNotes: "Step-by-step: how do you find a good cutting point? What do you listen for? What makes a cut feel awkward or abrupt?"
        }
      ],
      "Module 6: How to Annotate and Mark Up Your Music": [
        {
          title: "General Annotation Tips & Marking Cuts",
          notes: "- Use a pen, not pencil — pencil is too light and smudges\n- Use yellow highlighter only\n- Do not highlight lyrics\n- Highlight key and time signature changes, clef changes, and (optionally) brackets at page turns\n- Highlight tempo markings and fermatas — highlight the symbol itself, not a giant stroke across the system\n- Keep lines clean and straight — use a ruler\n- Pencil while drafting, pen when committed\n\n**Never cut mid-bar.** Don't start or end a cut partway through a bar; it forces extra barlines and reads as messy. Cut clean at barlines.\n\n**Cross-outs:** Box the excluded bars, then draw a diagonal line from bottom-left to top-right. The box matters — without it, the accompanist can be unsure whether an edge bar is in or out.\n\n**Brackets face the music that is to be played.** Reversed brackets scramble the read. Think of brackets as a portal: in here, out there. Don't bracket the final bars if you're simply playing through to the printed end — a closing bracket implies more music follows.\n\n**Always keep the first page**, even if it's entirely crossed out. It carries the title, key signature, time signature, and context — the accompanist downloads the whole world of the song in one glance. It also means you don't need to re-insert time signatures into later pages (and if the piece is in common time, you never needed to add 'C' anyway). Put the title at the top of the first page.\n\n**Cross out any lyrics you are not singing.** A simple ruled strike-through is enough — no white-out needed. This saves the pre-song conversation from 'wait, are you singing this bit?'\n\n**Start/End labels and smiley faces:** optional. They don't hurt, and if writing 'start' gives you certainty, do it.\n\n**White-out / cut-and-paste reconstruction:** generally discouraged. Done meticulously it can work, but most attempts produce scores that are hard to trust at sight. If you go this route, get the result transcribed or checked — and always re-scan so seams and shadows disappear.\n\n**Duets:** Leave the other vocal line in. It doesn't throw the accompanist, and it can actually help them help you.",
          adminNotes: "Explain why highlighting lyrics is a major distraction for sight-reading pianists. Include images showing correct cross-out technique and bracket orientation."
        }
      ],
      "Module 7: Physical Preparation of Your Music": [
        {
          title: "Folder vs Taping",
          notes: "Display Folders:\n- Use a display folder with clear plastic pockets — not a ring binder\n- Ring binders cause pages to drag or fall off the piano music stand\n- Ensure the plastic pockets are clear, fresh, and free of crinkles\n\nTaping Pages:\n- Tape pages front and back so no adhesive is exposed — exposed tape sticks pages together mid-song and causes skipped pages\n- Tape the front of page 1–2, then the back of page 2–3, then the front of page 3–4\n- This alternating pattern keeps exposed tape off the playing surface\n- Sits flat on the stand and turns easily\n\niPads in the room: fine, but ask the accompanist first. Some accompanists prefer paper (two pages visible at once, no app surprises). Glare is a real issue with glossy binder sleeves — choose non-glare sleeves.",
          adminNotes: "Recommend a specific type of display folder that works well — brand, sleeve count, any specific features."
        }
      ],
      "Module 8: How to Scan and Digitise Your Music": [
        {
          title: "Why Scanning Matters & Scanning Tips",
          notes: "A blurry, crooked, or low-contrast scan makes it very hard for an accompanist to sight-read your music under high-pressure audition room lighting.\n\nScanning Tips:\n- Align pages neatly — no wonky angles\n- Black should appear truly black — not grey or faded\n- High resolution — no pixelation or blurriness\n- Monochrome (black and white) — not greyscale or colour\n- Scan one page at a time for the cleanest result\n\n**Piano-vocal scores vs piano-conductor scores:** Piano-vocal parts sometimes just double the melody — check before trusting a source. Some sources (e.g. Musicnotes) get an unfair blanket ban for this; the real skill is knowing how to read the accompaniment and confirm it isn't just melody. Some genres want the melody in the accompaniment (a lot of '30s–'40s writing) — that's the style, and it matters that the accompanist has it.\n\n**Prefer typeset over handwritten scores.** Handwritten piano-conductor scores from shows read badly under audition pressure.\n\n**Scan quality standard:** no blur. Black and white, high saturation/contrast. Use a proper scanning app (Adobe Scan, Dropbox scan, or similar). If a free download is blurry, fix it or find a better source — 'a smidge blurry' is still a problem for someone sight-reading.\n\nEveryone should reach the point where their whole book exists as clean one-for-one PDFs — no generational photocopies. Store originals; re-scan after any physical cut-and-paste so seams disappear.",
          adminNotes: "Add recommended apps here — your preferred scanning app, any tips for phone scanning. Include note about checking piano-conductor scores vs piano-vocal."
        },
        {
          title: "Saving and Naming Your Files",
          notes: "File naming matters, especially when submitting music digitally. Use a consistent, clear convention:\n\nFirst Name Last Name – Song Title – Show Title\nExample: Daniele Buatti – Part of Your World – The Little Mermaid\n\n- PDF format only — no photos, screenshots, or image files\n- Check your file is complete before sending — open it and scroll through every page\n\n**Organise by cut length.** Consider keeping separate folders for:\n- Full originals (unmarked scores)\n- 16-bar cuts\n- 32-bar cuts (useful for cruise-ship style auditions running tight on time)\n\nThis way you grab the right folder depending on the brief, rather than hunting through a single book.",
          adminNotes: "Explain why sending JPGs or screenshots of sheet music causes problems in the audition room."
        }
      ],
      "Module 13: Common Mistakes — What Not to Do": [
        {
          title: "Music, In-Room, and Mindset Mistakes",
          notes: "Music Mistakes:\n- Faded or grey printing\n- Missing pages\n- Lead sheets with no piano part\n- Blurry PDFs\n- Pencil annotations\n- Blocking out key signatures\n\nIn-Room Mistakes:\n- Shouting your tempo across the room\n- Giving tempo as just a number\n- Standing behind the piano\n- Rushing through the music handover\n- Apologising for your music\n- Not collecting your music",
          adminNotes: "Your thoughts here — what are the internal mistakes? The ones that don't show up in the music but show up in the room? Over-explaining, apologizing, shrinking.\n\n[DRAFT – candidates for future lessons]\n- The 8-bar intro nobody needed\n- Uncrossed lyrics leading to 'wait, are you singing this bit?' conversations\n- Brackets at the very end of a play-through cut, implying missing pages\n- Exposed tape sticking pages together mid-audition\n- Frankenstein white-out cuts that fall apart at sight-reading\n- Bringing a JRB 'death song' cold to a 9am accompanist"
        }
      ]
    };

    // Also handle the renamed lesson title in M5
    const m5rename = {
      oldTitle: "What Is a Cut? (16-Bar vs 32-Bar)",
      newTitle: "What Is a Cut? (Time Over Bar Counts)"
    };

    for (const [modTitle, lessonUpdates] of Object.entries(updates)) {
      const mods = await db.select().from(modules).where(eq(modules.title, modTitle)).limit(1);
      if (mods.length === 0) {
        console.warn(`Module not found: ${modTitle}`);
        continue;
      }
      const modId = mods[0].id;

      for (const upd of lessonUpdates) {
        const existingLessons = await db.select().from(lessons)
          .where(and(eq(lessons.moduleId, modId), eq(lessons.title, upd.title)));
        
        if (existingLessons.length > 0) {
          await db.update(lessons)
            .set({ notes: upd.notes, adminNotes: upd.adminNotes })
            .where(eq(lessons.id, existingLessons[0].id));
        }
      }

      // Handle the renamed M5 lesson
      if (modTitle === "Module 5: How to Cut Your Music") {
        const oldLessons = await db.select().from(lessons)
          .where(and(eq(lessons.moduleId, modId), eq(lessons.title, m5rename.oldTitle)));
        if (oldLessons.length > 0) {
          await db.update(lessons)
            .set({ title: m5rename.newTitle })
            .where(eq(lessons.id, oldLessons[0].id));
        }

        // Add the new Intros and Endings lesson if it doesn't exist
        const existingNew = await db.select().from(lessons)
          .where(and(eq(lessons.moduleId, modId), eq(lessons.title, "Intros and Endings")));
        if (existingNew.length === 0) {
          const maxOrder = await db.select({ maxOrder: lessons.displayOrder }).from(lessons)
            .where(eq(lessons.moduleId, modId));
          const nextOrder = maxOrder.length > 0 && maxOrder[0].maxOrder !== null ? maxOrder[0].maxOrder + 1 : 1;
          await db.insert(lessons).values({
            moduleId: modId,
            title: "Intros and Endings",
            videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
            duration: "05:00",
            notes: "**Most people give themselves too much intro.** Two bars is usually plenty; eight is almost never needed.\n\nYou can drop straight in on the vocal with no intro at all — the accompanist only needs your breath. This requires confidence, and it connects to presentation and brand: are you someone who can take a note and go?\n\nDon't count yourself in out loud.\n\n**Alternative to a full intro bar: a single chord.** Mark the bar with the chord, write 'tacet' for what the piano shouldn't play, and 'play' where the accompaniment re-enters. This removes a whole bar where tempo and communication can go wrong — you take the pitch, you set the tempo yourself.\n\n**Endings:** If your cut ends on something unresolved, the panel may not know you've finished. Consider ending somewhere that resolves, or adding a simple ending. Watch your final gesture — it's part of signalling you're done.",
            adminNotes: "Brad suggests a demo video showing the single-chord intro technique in action.",
            isPublished: false,
            hasVideo: true,
            videoStatus: "not_started",
            displayOrder: nextOrder,
            isNew: true,
          });
        }
      }

      // Handle renamed M4 lesson
      if (modTitle === "Module 4: Basic Music Terminology") {
        const oldTitle = "Back Phrasing & Tacet";
        const newTitle = "Back Phrasing, Colla Voce & Tacet";
        const oldLessons = await db.select().from(lessons)
          .where(and(eq(lessons.moduleId, modId), eq(lessons.title, oldTitle)));
        if (oldLessons.length > 0) {
          await db.update(lessons)
            .set({ title: newTitle })
            .where(eq(lessons.id, oldLessons[0].id));
        }
      }
    }

    revalidatePath("/admin");
    revalidatePath("/modules");
    return { success: true };
  } catch (error) {
    console.error("Error syncing updated content:", error);
    throw new Error("Failed to sync updated content");
  }
}

export async function publishAllLessons() {
  try {
    await db.update(lessons).set({ isPublished: true });
    revalidatePath("/admin");
    revalidatePath("/admin/tree");
    revalidatePath("/admin/modules");
    revalidatePath("/portal");
    revalidatePath("/modules");
    return { success: true };
  } catch (error: any) {
    console.error("Error publishing all lessons:", error.message);
    throw new Error("Failed to publish all lessons: " + error.message);
  }
}