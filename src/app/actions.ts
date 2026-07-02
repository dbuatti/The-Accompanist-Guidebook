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
        });
      }
    };

    // --- LEVEL 1 MODULES ---
    await addModuleWithLessons(lvl1Id, "Module 1: Choosing Your Audition Repertoire", 1, [
      {
        title: "What Is Audition Repertoire?",
        notes: "Your audition repertoire is the collection of songs you keep ready and polished — songs that represent who you are as a performer. A strong book gives you flexibility and confidence across a range of audition types.\n\nThe goal is to build a repertoire of six pieces that are aligned to your brand, your strengths, and your voice. These aren't songs you're learning — they're songs you own.\n\nDo you actually need twenty songs? No. Six go-to songs that you know inside out will serve you better than a binder full of material you're shaky on. If an audition comes up next week and you've got six songs you could sing in your sleep, you're ready. Brad would bring the same handful of songs to nearly every audition and it worked because he owned them.",
        adminNotes: "Define audition repertoire in your own words. What does it mean to have a 'book'? Why do you need more than one song?"
      },
      {
        title: "Intellectual Choice vs Vibe [New]",
        notes: "Choosing a song isn't just about what you like. There are two lenses worth considering:\n\n1. Intellectual choice — does the song serve the audition? Does it suit the show, the brief, the room?\n2. Vibe / presentation / brand — does it feel like you? Does it showcase your voice and energy?\n\nBoth matter. The best song choices sit at the intersection of both.\n\nTIP: You wouldn't bring Seussical to a Ragtime audition. Know what the room is asking for.\n\nNow let's clear up a few myths.\n\nThe \"don't sing\" list doesn't exist. There is no secret blacklist of forbidden songs. If you nail a song, sing it. If Maybe This Time lands in your voice and you connect with it, sing Maybe This Time. If you want to sing a Disney song and it fits your brand, sing it. Panel members hear unfamiliar songs all day — sometimes hearing a classic done well is a genuine relief.\n\nWhat about songs that are \"too mature\" for your age? If you can connect with the content, it's fine. The blanket rule \"you're too young to sing that\" ignores nuance. If a song is about children and death and you have nothing to draw on, sure, skip it. But if it connects, and it aligns with your brand, you can make it work.\n\nAnd what about overdone songs? If Anything Goes is in your voice and you sing it well, keep it. The reason songs become \"overdone\" is because they're well-written and they work. A familiar song done confidently can actually work in your favour.",
        adminNotes: "Give examples of bad song choices vs great song choices for specific audition rooms."
      },
      {
        title: "Learning New Songs vs Recycling Your Rep",
        notes: "Stick with what is tried and tested unless you have ample time to fully integrate new material. Fresh material is a risk in high-pressure rooms.",
        adminNotes: "Talk through when it makes sense to learn something new versus sticking with something tried and tested. What are the risks of each? When is fresh material worth the risk?"
      },
      {
        title: "Composers Worth Knowing [New]",
        notes: "Musical theatre has a rich range of composers, each with their own distinct voice and demands. Some worth having in your repertoire:\n\n- Jason Robert Brown — emotionally complex, rhythmically intricate, vocally demanding\n- Stephen Sondheim — sophisticated harmonic language, text-driven, requires strong musicianship\n- Adam Guettel — contemporary, through-composed, less commonly performed\n\nThere's a general rule in the industry about three composers you should be careful bringing into an audition — and it has less to do with you and more to do with the accompaniment. Sondheim, Jason Robert Brown, and Adam Guettel are the ones that give accompanists pause.\n\nWhy? Sondheim writes for the world of each show. His orchestrations are dense and specific, and when reduced to a piano accompaniment they can be wacky to play — strange timings, unusual harmonic moves, parts that don't sit naturally under the hands. Not every Sondheim song is hard — anyone can whistle is lighter — but enough of them are that the reputation exists.\n\nJason Robert Brown is rock-and-roll and Billy Joel-informed, gospel and folk. The man himself has said: if you can't play his songs, they've been out for 25 years. He's got a point. But that doesn't change the fact that some of his songs are death for an accompanist, especially cold at 9am.\n\nAdam Guettel's work (Myths and Hymns, The Light in the Piazza) is through-composed and harmonically complex. Less commonly performed, but when it comes up, it demands real musicianship.\n\nDoes this mean you should never bring these composers? No. It means you should be aware that your cut may be harder for the accompanist to sight-read. If you bring a Sondheim song you've prepared and you know your cut cold, fine. But don't assume that singing a Sondheim song for a Sondheim show is a one-to-one advantage. It isn't.\n\nA better approach: choose songs that sit well in your voice and let you do your best work. The accompanist will follow you. But if your cut is rhythmically chaotic and harmonically thorny, you're adding risk.",
        adminNotes: "Add more composers and your personal notes on each. What does each composer ask of a performer? Which voices do they suit?"
      },
      {
        title: "Building Six Pieces",
        notes: "Aim for six well-prepared, well-chosen pieces. They should collectively demonstrate range — not just vocal range, but emotional range, style range, and character range.",
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
        title: "Recommended Sources [New]",
        notes: "1. Musicnotes.com: Good for popular songs and musical theatre. Offers transpositions in multiple keys. Be aware that Musicnotes PDFs sometimes have the melody line embedded in the piano accompaniment — the right hand plays the vocal melody. Most professional accompanists are smart enough not to play the melody when you're singing, but it's something to check when you print your cut.\n2. Sheet Music Plus: Broader selection, including classical and more obscure musical theatre.\n3. Scribd: Subscription-based, user-uploaded content. Quality and legality varies — use with caution.\n\nWherever possible, look for a piano/vocal score rather than a lead sheet. The piano/vocal score gives the accompanist a full arrangement to work with. Lead sheets (just melody and chord symbols) don't give enough information.\n\nAlso: a typeset (computer-engraved) score is always preferable to a handwritten one. Handwritten scores are harder to sight-read — especially in the pressure of an audition. If all you have is a handwritten copy, consider getting it engraved professionally.",
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
        title: "Fermata, Caesura & Tempo Terms [New]",
        notes: "Fermata: Tells the performer to hold a note or rest longer than its written value. If your song has a fermata, point it out to the accompanist during the handover. Not every fermata is obvious — sometimes the vocal holds while the accompaniment doesn't, so check the score.\n\nCaesura (Tram Tracks / Grand Pause): Indicates a complete break in the music. Everything stops. This is different from a fermata.\n\nThink of music as a ribbon flowing forward:\n- A fermata stretches the ribbon — it holds, stays tense, then resumes.\n- A caesura cuts the ribbon. Silence. Then you pick up again.\n\nWhen marking caesuras in your music, write two small slanted lines (//). The accompanist will know to stop and wait for your cue.\n\nRubato: 'Robbed time' — expressive freedom with rhythm. The singer leads, the accompaniment follows.\n\nColla Voce: 'With the voice' — the accompanist follows the singer's timing exactly.\n\nRallentando (Rall.) / Ritardando (Rit.): Gradual slowing of tempo.\n\nA Tempo: Return to the original tempo.",
        adminNotes: "Explain these terms simply. Give examples of songs where these are commonly used."
      },
      {
        title: "Colle Voce, Back Phrasing & Tacet [New]",
        notes: "Colle Voce: 'With the voice.' The accompanist follows you. This is the default mode for most auditions — the pianist watches your breath and your phrasing and stays with you. It requires no special marking; it's simply good ensemble.\n\nBack Phrasing: Deliberately singing behind or ahead of the written rhythm. This is a stylistic choice, common in contemporary musical theatre and pop-influenced repertoire. If you are back phrasing, tell the accompanist. The phrase 'I'll be back phrasing this' is gold — it signals that you want the pianist to keep a steady tempo while you play with the timing.\n\nHow do you know if you're back phrasing? If you're singing a different rhythm to what's written — pushing ahead on some phrases, laying back on others — that's back phrasing.\n\nColla Voce and back phrasing are not the same thing:\n- Colla Voce: accompanist waits for you, follows your lead\n- Back Phrasing: accompanist stays steady, you move around the beat\n\nTacet: Means 'do not play.' If there are bars where you want the accompanist to be silent — perhaps for a dramatic moment or a held note — write 'tacet' clearly over those bars.",
        adminNotes: "Explain back phrasing in your own words. What does it sound like? How do you communicate it to an accompanist?"
      }
    ]);

    // --- LEVEL 2 MODULES ---
    await addModuleWithLessons(lvl2Id, "Module 5: How to Cut Your Music", 5, [
      {
        title: "What Is a Cut? (16-Bar vs 32-Bar) [New]",
        notes: "A cut is a shortened excerpt of your song — usually the most effective section that best showcases your voice and storytelling.\n\nFirst, let's talk about the term '16-bar cut.' It's become the default language, but bars are an arbitrary measurement. The real measure is time. A verse in 4/4 at a slow tempo might take 30 seconds. The same 16 bars in a fast pop-rock song might fly by in 12 seconds. So when you say '16-bar cut,' what you really mean is something that runs between 30 and 45 seconds.\n\nHere's what the numbers actually mean in the room:\n- 30-45 seconds: A tight, effective cut. Shows what you can do, doesn't outstay its welcome.\n- 45-60 seconds: Pushing it. If you're going past 45 seconds, it had better be worth it — every extra second needs to earn its place.\n- 60-90 seconds: A 32-bar equivalent. Allows for a more developed arc, but be aware of the room's energy.\n\nThere's a practical tradeoff to keep in mind: the pains and gains. If you sing a shorter cut, you give the panel more time. If they like what they hear, they may ask for a second song. A tight 30-second cut that leaves them wanting more is better than a 90-second cut that goes on too long. But this isn't gospel — some songs need a bit more room, and that's fine. Just know that every bar you add is a bar they have to sit through.",
        adminNotes: "Give your own guidance on how to identify the right 16 or 32 bars. What are you looking for?"
      },
      {
        title: "Making Logical, Performable Cuts [New]",
        notes: "A good cut feels like a complete musical thought — not a fragment. It should make sense harmonically and emotionally, even without the context of the full song.\n\nLet's clear up a big misconception: your cut doesn't need an arc. The full song has an arc — that's the composer's job. Your cut just needs to communicate what the song is about. How much of the song's story can you keep in a short excerpt? The opposite is also a useful question: how much can you take out before the song makes no sense at all?\n\nHere are the practical principles:\n\n- Cut at the end of a phrase, not mid-thought. A bracket in the middle of a barline is messy and hard to read. Don't cut through a bar. If you need to start mid-bar, it's usually better to find a cleaner entry point.\n- Avoid starting on a pickup bar where possible. Starting on a weak beat can feel unsettled.\n- Don't start a cut on the word 'and' — it implies something happened before. If your cut starts on 'and' or 'but', the panel feels like they've missed something.\n- Don't jump around erratically. A cut that goes from half a verse to a second verse to a final belt is chaotic both for the accompanist and the listener. Sing a chunk. Get as much story as you can.\n- The ending of your cut should feel conclusive. If the song doesn't have a natural ending, that's fine — you can land on a held note or a cut-off. But make sure it doesn't just trail off.\n\nA good way to start cutting: look at the lyrics first. Put them in a Google Doc and read them as text. The natural shape of the lyrics will tell you where the cut might live. If you're jumping around between half-sentences, the cut is going to be hard to follow.\n\nOne more thing: contemporary musical theatre songs often get over-cut. People try to cram in too many sections — a bit of verse, a pre-chorus, a chorus, a bridge, a belt ending — and the result is a choppy, confusing excerpt. Sometimes a simpler cut from a single section does the job better.",
        adminNotes: "Step-by-step: how do you find a good cutting point? What do you listen for? What makes a cut feel awkward or abrupt?"
      },
      {
        title: "The Correct Bracket Notation [New]",
        notes: "When marking a cut in your music, use a clear bracket system:\n- Use a thick black or red line to mark the start and end of your cut\n- Draw the cross from the bottom left corner to the top right corner of the bar\n- The bracket should point inward toward the music that is to be played\n- Don't face the brackets outward — it scrambles the brain's reading flow\n\nBox method: draw a box around the bars you're cutting, then cross from bottom left to top right. This is the cleanest visual signal. The box tells the accompanist 'do not play any of this' with no ambiguity.\n\nIf a bracket ends at the natural end of the song, you don't need to bracket it — the end of the page is clear enough. But if your instinct says to add one, it doesn't hurt.\n\nLabeling START and END: Optional. Some people find it gives them a psychological boost — like a little pump of confidence — to write 'START' at their entry point. It's fine if you want to do that. Just know it's not strictly necessary if your brackets are clear.\n\nUsing a single chord as an intro: If you want just one chord to set the tempo and then silence before you begin, write the chord and mark 'tacet' over the rest of the bar. This tells the accompanist: play that chord, then stop and wait for my breath.\n\nBonus tip: Use a ruler. Clean lines matter. A wobbly freehand cross can be ambiguous. A ruler sends a professional signal.",
        adminNotes: "Add an image or diagram here showing correct bracket notation vs common mistakes."
      }
    ]);

    await addModuleWithLessons(lvl2Id, "Module 6: How to Annotate and Mark Up Your Music", 6, [
      {
        title: "The Golden Rule of Annotation",
        notes: "Your annotations are a communication tool. The goal is to give the accompanist everything they need to play your cut correctly — without you having to say a word.\n\nTHE GOLDEN RULE: Your music needs to communicate for you when you can't speak.",
        adminNotes: "Emphasize the psychological shift of treating sheet music as a direct communication channel."
      },
      {
        title: "General Annotation Tips & Marking Cuts [New]",
        notes: "- Use a pen, not pencil — pencil is too light and smudges\n- Use yellow highlighter only\n- Do not highlight lyrics\n- Highlight key and time signature changes, not entire sections\n- Highlight tempo markings and fermatas\n- Keep lines clean and straight\n\nCrossing out lyrics: If you've cut a section that has lyrics, strike through the words. Don't just bracket the bars and leave the lyrics visible. The accompanist's eye will naturally follow the text, and they may hesitate, wondering if you're going to sing those words. A simple line through the lyrics removes all doubt.\n\nComping vs playing the melody: In most professional settings, the accompanist will not play the melody from your sheet music — they'll comp (play the accompaniment as written, supporting your voice without doubling it). If you're lost during a cut, a good accompanist may subtly highlight the melody to help you find your place. But this is a rescue, not the default. Don't rely on the piano to carry the tune.",
        adminNotes: "Explain why highlighting lyrics is a major distraction for sight-reading pianists."
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
        notes: "Display Folders:\n- Use a display folder with clear plastic pockets — not a ring binder\n- Ring binders cause pages to drag or fall off the piano music stand\n- Ensure the plastic pockets are clear, fresh, and free of crinkles\n\nTaping Pages:\n- Tape the front of page 1–2, then the back of page 2–3, then the front of page 3–4\n- This alternating pattern ensures no tape is exposed on the playing surface\n- Sits flat on the stand and turns easily",
        adminNotes: "Recommend a specific type of display folder that works well — brand, sleeve count, any specific features."
      },
      {
        title: "Watching for Page Turns",
        notes: "Before your audition, check every page turn in your cut. Look for:\n- Important information in the corners of pages — key changes, time changes, tempo markings\n- Whether the accompanist will have time to turn the page between playing\n- Whether you need to re-order pages for a smoother transition",
        adminNotes: "Explain how to plan page turns so they occur during vocal rests or simple accompaniment passages."
      },
      {
        title: "Always Keep the First Page & Printing Quality",
        notes: "Even if your cut starts on page three, always keep page one visible in your folder. It provides the accompanist with the key signature, time signature, tempo marking, and the full context of the piece.\n\nThink about it from the accompanist's perspective: they open your music and see page three. Immediately their brain has to work out what key they're in, what time signature, what the song is, what the world is. If they can see page one — even if it's entirely crossed out — they download all that information in a split second and feel oriented.\n\nAs a rule of thumb: if removing the first page raises more questions than it answers, keep it.\n\nPrinting Quality:\n- Ensure no staves are cut off at the edges\n- Music staves should be horizontally aligned — no crooked printing\n- Print in black and white, high contrast — not greyscale\n- If you're using a photocopy, check for blurriness or fading. If the page looks even slightly grey, find the original and re-copy.",
        adminNotes: "Explain why keeping page one is a non-negotiable rule for professional auditions."
      }
    ]);

    await addModuleWithLessons(lvl2Id, "Module 8: How to Scan and Digitise Your Music", 8, [
      {
        title: "Why Scanning Matters & Scanning Tips",
        notes: "A blurry, crooked, or low-contrast scan makes it very hard for an accompanist to sight-read your music under high-pressure audition room lighting.\n\nScanning Tips:\n- Align pages neatly — no wonky angles\n- Black should appear truly black — not grey or faded\n- High resolution — no pixelation or blurriness\n- Monochrome (black and white) — not greyscale or colour\n- Scan one page at a time for the cleanest result",
        adminNotes: "Add recommended apps here — your preferred scanning app, any tips for phone scanning."
      },
      {
        title: "Saving and Naming Your Files",
        notes: "File naming matters, especially when submitting music digitally. Use a consistent, clear convention:\n\nFirst Name Last Name – Song Title – Show Title\nExample: Daniele Buatti – Part of Your World – The Little Mermaid\n\n- PDF format only — no photos, screenshots, or image files\n- Check your file is complete before sending — open it and scroll through every page",
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
        notes: "How to Approach:\n- Walk to the side of the piano — not behind it\n- Standing behind the piano means your music is upside down and you're crowding the accompanist's space\n- Own your space — stand tall, don't shrink\n- Smile. A warm 'How are you?' is a lovely opener\n\nWalking Them Through the Music:\n- Show them the structure of your cut — where it starts, where it ends\n- Highlight any tricky moments — unexpected modulations, fermatas, tight cues, cut-offs\n- A useful question to ask yourself: does this raise more questions? If the accompanist will look at your music and wonder what's happening, you haven't communicated enough.\n- Save tempo for last — let them absorb the context of the piece first",
        adminNotes: "Explain why standing behind the piano is a common but highly disruptive mistake."
      },
      {
        title: "Delivering Tempo & Introductions [New]",
        notes: "Once you've walked them through the music, get to the end of the cut, then turn back to the beginning and deliver your tempo.\n\nIntroduction or No Introduction?:\n- Be decisive about whether your piece has an introduction\n- If you don't want an introduction, mark this clearly in the music and tell the accompanist\n- If you do want an introduction, keep it purposeful — its job is to give you the key and the tempo\n\nA note on intro length: some people give themselves too much intro. Eight bars of piano before the vocal enters can feel like an eternity in an audition — for you, for the panel, and for the accompanist who has to play it. If you can start right on the vocal, and you have the confidence to do it, that can be a powerful choice.\n\nBut starting on the vocal requires conviction. You can't count yourself in from the piano and then hesitantly find the note. As an accompanist, all I need is your breath. One breath, and I know where we are. There's no need to tap, count, or explain. Just breathe and go.\n\nIf your intro is very short — a single chord, for example — you can write 'tacet' over the rest of the bar after that chord. The accompanist will play the chord and wait for you.\n\nIf the panel offers to cut the intro down, that's fine. They're trying to move things along. If you detect this happening, just nod and say yes. Don't fight to keep your eight-bar intro.",
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
        notes: "The Order of Events:\n1. Enter the room with presence\n2. Acknowledge the panel and accompanist\n3. Approach the piano and walk through your music\n4. Deliver tempo\n5. Walk to your spot, ground yourself, and sing\n6. Thank the room, collect your music, and exit with grace\n\nIt's worth understanding what kind of room you're walking into. Some classes billed as 'mock auditions' are really acting-through-song classes in disguise. They give you feedback on your performance and your arc — which is valuable, but it's not the same thing as practising the act of auditioning. A true mock audition should rehearse the mechanics: walking in, handing over music, delivering tempo, singing cold, exiting. If you're in a room that leans toward acting feedback, recognise that and adjust your expectations.",
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
        adminNotes: "Your thoughts here — what are the internal mistakes? The ones that don't show up in the music but show up in the room? Over-explaining, apologizing, shrinking."
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

// --- Sync Updated Lesson Content ---
// Updates existing lessons' notes in the DB by matching on module title + lesson title.
// Safe to run if scaffold has already been executed. Will not create duplicates.
export async function syncLessonContent() {
  try {
    const allModules = await db.select().from(modules);
    const allLessons = await db.select().from(lessons);

    // Define the updated lesson data (mirrors the scaffold data above)
    const moduleUpdates: { moduleTitle: string; lessons: { title: string; notes: string; adminNotes: string }[] }[] = [
      {
        moduleTitle: "Module 1: Choosing Your Audition Repertoire",
        lessons: [
          {
            title: "What Is Audition Repertoire?",
            notes: "Your audition repertoire is the collection of songs you keep ready and polished — songs that represent who you are as a performer. A strong book gives you flexibility and confidence across a range of audition types.\n\nThe goal is to build a repertoire of six pieces that are aligned to your brand, your strengths, and your voice. These aren't songs you're learning — they're songs you own.\n\nDo you actually need twenty songs? No. Six go-to songs that you know inside out will serve you better than a binder full of material you're shaky on. If an audition comes up next week and you've got six songs you could sing in your sleep, you're ready. Brad would bring the same handful of songs to nearly every audition and it worked because he owned them.",
            adminNotes: "Define audition repertoire in your own words. What does it mean to have a 'book'? Why do you need more than one song?"
          },
          {
            title: "Intellectual Choice vs Vibe [New]",
            notes: "Choosing a song isn't just about what you like. There are two lenses worth considering:\n\n1. Intellectual choice — does the song serve the audition? Does it suit the show, the brief, the room?\n2. Vibe / presentation / brand — does it feel like you? Does it showcase your voice and energy?\n\nBoth matter. The best song choices sit at the intersection of both.\n\nTIP: You wouldn't bring Seussical to a Ragtime audition. Know what the room is asking for.\n\nNow let's clear up a few myths.\n\nThe \"don't sing\" list doesn't exist. There is no secret blacklist of forbidden songs. If you nail a song, sing it. If Maybe This Time lands in your voice and you connect with it, sing Maybe This Time. If you want to sing a Disney song and it fits your brand, sing it. Panel members hear unfamiliar songs all day — sometimes hearing a classic done well is a genuine relief.\n\nWhat about songs that are \"too mature\" for your age? If you can connect with the content, it's fine. The blanket rule \"you're too young to sing that\" ignores nuance. If a song is about children and death and you have nothing to draw on, sure, skip it. But if it connects, and it aligns with your brand, you can make it work.\n\nAnd what about overdone songs? If Anything Goes is in your voice and you sing it well, keep it. The reason songs become \"overdone\" is because they're well-written and they work. A familiar song done confidently can actually work in your favour.",
            adminNotes: "Give examples of bad song choices vs great song choices for specific audition rooms."
          },
          {
            title: "Composers Worth Knowing [New]",
            notes: "Musical theatre has a rich range of composers, each with their own distinct voice and demands. Some worth having in your repertoire:\n\n- Jason Robert Brown — emotionally complex, rhythmically intricate, vocally demanding\n- Stephen Sondheim — sophisticated harmonic language, text-driven, requires strong musicianship\n- Adam Guettel — contemporary, through-composed, less commonly performed\n\nThere's a general rule in the industry about three composers you should be careful bringing into an audition — and it has less to do with you and more to do with the accompaniment. Sondheim, Jason Robert Brown, and Adam Guettel are the ones that give accompanists pause.\n\nWhy? Sondheim writes for the world of each show. His orchestrations are dense and specific, and when reduced to a piano accompaniment they can be wacky to play — strange timings, unusual harmonic moves, parts that don't sit naturally under the hands. Not every Sondheim song is hard — anyone can whistle is lighter — but enough of them are that the reputation exists.\n\nJason Robert Brown is rock-and-roll and Billy Joel-informed, gospel and folk. The man himself has said: if you can't play his songs, they've been out for 25 years. He's got a point. But that doesn't change the fact that some of his songs are death for an accompanist, especially cold at 9am.\n\nAdam Guettel's work (Myths and Hymns, The Light in the Piazza) is through-composed and harmonically complex. Less commonly performed, but when it comes up, it demands real musicianship.\n\nDoes this mean you should never bring these composers? No. It means you should be aware that your cut may be harder for the accompanist to sight-read. If you bring a Sondheim song you've prepared and you know your cut cold, fine. But don't assume that singing a Sondheim song for a Sondheim show is a one-to-one advantage. It isn't.\n\nA better approach: choose songs that sit well in your voice and let you do your best work. The accompanist will follow you. But if your cut is rhythmically chaotic and harmonically thorny, you're adding risk.",
            adminNotes: "Add more composers and your personal notes on each. What does each composer ask of a performer? Which voices do they suit?"
          },
        ]
      },
      {
        moduleTitle: "Module 2: Where to Source Sheet Music",
        lessons: [
          {
            title: "Recommended Sources [New]",
            notes: "1. Musicnotes.com: Good for popular songs and musical theatre. Offers transpositions in multiple keys. Be aware that Musicnotes PDFs sometimes have the melody line embedded in the piano accompaniment — the right hand plays the vocal melody. Most professional accompanists are smart enough not to play the melody when you're singing, but it's something to check when you print your cut.\n2. Sheet Music Plus: Broader selection, including classical and more obscure musical theatre.\n3. Scribd: Subscription-based, user-uploaded content. Quality and legality varies — use with caution.\n\nWherever possible, look for a piano/vocal score rather than a lead sheet. The piano/vocal score gives the accompanist a full arrangement to work with. Lead sheets (just melody and chord symbols) don't give enough information.\n\nAlso: a typeset (computer-engraved) score is always preferable to a handwritten one. Handwritten scores are harder to sight-read — especially in the pressure of an audition. If all you have is a handwritten copy, consider getting it engraved professionally.",
            adminNotes: "Add your personal notes on Musicnotes and Sheet Music Plus — what you recommend them for, any caveats."
          },
        ]
      },
      {
        moduleTitle: "Module 4: Basic Music Terminology",
        lessons: [
          {
            title: "Fermata, Caesura & Tempo Terms [New]",
            notes: "Fermata: Tells the performer to hold a note or rest longer than its written value. If your song has a fermata, point it out to the accompanist during the handover. Not every fermata is obvious — sometimes the vocal holds while the accompaniment doesn't, so check the score.\n\nCaesura (Tram Tracks / Grand Pause): Indicates a complete break in the music. Everything stops. This is different from a fermata.\n\nThink of music as a ribbon flowing forward:\n- A fermata stretches the ribbon — it holds, stays tense, then resumes.\n- A caesura cuts the ribbon. Silence. Then you pick up again.\n\nWhen marking caesuras in your music, write two small slanted lines (//). The accompanist will know to stop and wait for your cue.\n\nRubato: 'Robbed time' — expressive freedom with rhythm. The singer leads, the accompaniment follows.\n\nColla Voce: 'With the voice' — the accompanist follows the singer's timing exactly.\n\nRallentando (Rall.) / Ritardando (Rit.): Gradual slowing of tempo.\n\nA Tempo: Return to the original tempo.",
            adminNotes: "Explain these terms simply. Give examples of songs where these are commonly used."
          },
          {
            title: "Colle Voce, Back Phrasing & Tacet [New]",
            notes: "Colle Voce: 'With the voice.' The accompanist follows you. This is the default mode for most auditions — the pianist watches your breath and your phrasing and stays with you. It requires no special marking; it's simply good ensemble.\n\nBack Phrasing: Deliberately singing behind or ahead of the written rhythm. This is a stylistic choice, common in contemporary musical theatre and pop-influenced repertoire. If you are back phrasing, tell the accompanist. The phrase 'I'll be back phrasing this' is gold — it signals that you want the pianist to keep a steady tempo while you play with the timing.\n\nHow do you know if you're back phrasing? If you're singing a different rhythm to what's written — pushing ahead on some phrases, laying back on others — that's back phrasing.\n\nColla Voce and back phrasing are not the same thing:\n- Colla Voce: accompanist waits for you, follows your lead\n- Back Phrasing: accompanist stays steady, you move around the beat\n\nTacet: Means 'do not play.' If there are bars where you want the accompanist to be silent — perhaps for a dramatic moment or a held note — write 'tacet' clearly over those bars.",
            adminNotes: "Explain back phrasing in your own words. What does it sound like? How do you communicate it to an accompanist?"
          },
        ]
      },
      {
        moduleTitle: "Module 5: How to Cut Your Music",
        lessons: [
          {
            title: "What Is a Cut? (16-Bar vs 32-Bar) [New]",
            notes: "A cut is a shortened excerpt of your song — usually the most effective section that best showcases your voice and storytelling.\n\nFirst, let's talk about the term '16-bar cut.' It's become the default language, but bars are an arbitrary measurement. The real measure is time. A verse in 4/4 at a slow tempo might take 30 seconds. The same 16 bars in a fast pop-rock song might fly by in 12 seconds. So when you say '16-bar cut,' what you really mean is something that runs between 30 and 45 seconds.\n\nHere's what the numbers actually mean in the room:\n- 30-45 seconds: A tight, effective cut. Shows what you can do, doesn't outstay its welcome.\n- 45-60 seconds: Pushing it. If you're going past 45 seconds, it had better be worth it — every extra second needs to earn its place.\n- 60-90 seconds: A 32-bar equivalent. Allows for a more developed arc, but be aware of the room's energy.\n\nThere's a practical tradeoff to keep in mind: the pains and gains. If you sing a shorter cut, you give the panel more time. If they like what they hear, they may ask for a second song. A tight 30-second cut that leaves them wanting more is better than a 90-second cut that goes on too long. But this isn't gospel — some songs need a bit more room, and that's fine. Just know that every bar you add is a bar they have to sit through.",
            adminNotes: "Give your own guidance on how to identify the right 16 or 32 bars. What are you looking for?"
          },
          {
            title: "Making Logical, Performable Cuts [New]",
            notes: "A good cut feels like a complete musical thought — not a fragment. It should make sense harmonically and emotionally, even without the context of the full song.\n\nLet's clear up a big misconception: your cut doesn't need an arc. The full song has an arc — that's the composer's job. Your cut just needs to communicate what the song is about. How much of the song's story can you keep in a short excerpt? The opposite is also a useful question: how much can you take out before the song makes no sense at all?\n\nHere are the practical principles:\n\n- Cut at the end of a phrase, not mid-thought. A bracket in the middle of a barline is messy and hard to read. Don't cut through a bar. If you need to start mid-bar, it's usually better to find a cleaner entry point.\n- Avoid starting on a pickup bar where possible. Starting on a weak beat can feel unsettled.\n- Don't start a cut on the word 'and' — it implies something happened before. If your cut starts on 'and' or 'but', the panel feels like they've missed something.\n- Don't jump around erratically. A cut that goes from half a verse to a second verse to a final belt is chaotic both for the accompanist and the listener. Sing a chunk. Get as much story as you can.\n- The ending of your cut should feel conclusive. If the song doesn't have a natural ending, that's fine — you can land on a held note or a cut-off. But make sure it doesn't just trail off.\n\nA good way to start cutting: look at the lyrics first. Put them in a Google Doc and read them as text. The natural shape of the lyrics will tell you where the cut might live. If you're jumping around between half-sentences, the cut is going to be hard to follow.\n\nOne more thing: contemporary musical theatre songs often get over-cut. People try to cram in too many sections — a bit of verse, a pre-chorus, a chorus, a bridge, a belt ending — and the result is a choppy, confusing excerpt. Sometimes a simpler cut from a single section does the job better.",
            adminNotes: "Step-by-step: how do you find a good cutting point? What do you listen for? What makes a cut feel awkward or abrupt?"
          },
          {
            title: "The Correct Bracket Notation [New]",
            notes: "When marking a cut in your music, use a clear bracket system:\n- Use a thick black or red line to mark the start and end of your cut\n- Draw the cross from the bottom left corner to the top right corner of the bar\n- The bracket should point inward toward the music that is to be played\n- Don't face the brackets outward — it scrambles the brain's reading flow\n\nBox method: draw a box around the bars you're cutting, then cross from bottom left to top right. This is the cleanest visual signal. The box tells the accompanist 'do not play any of this' with no ambiguity.\n\nIf a bracket ends at the natural end of the song, you don't need to bracket it — the end of the page is clear enough. But if your instinct says to add one, it doesn't hurt.\n\nLabeling START and END: Optional. Some people find it gives them a psychological boost — like a little pump of confidence — to write 'START' at their entry point. It's fine if you want to do that. Just know it's not strictly necessary if your brackets are clear.\n\nUsing a single chord as an intro: If you want just one chord to set the tempo and then silence before you begin, write the chord and mark 'tacet' over the rest of the bar. This tells the accompanist: play that chord, then stop and wait for my breath.\n\nBonus tip: Use a ruler. Clean lines matter. A wobbly freehand cross can be ambiguous. A ruler sends a professional signal.",
            adminNotes: "Add an image or diagram here showing correct bracket notation vs common mistakes."
          },
        ]
      },
      {
        moduleTitle: "Module 6: How to Annotate and Mark Up Your Music",
        lessons: [
          {
            title: "General Annotation Tips & Marking Cuts [New]",
            notes: "- Use a pen, not pencil — pencil is too light and smudges\n- Use yellow highlighter only\n- Do not highlight lyrics\n- Highlight key and time signature changes, not entire sections\n- Highlight tempo markings and fermatas\n- Keep lines clean and straight\n\nCrossing out lyrics: If you've cut a section that has lyrics, strike through the words. Don't just bracket the bars and leave the lyrics visible. The accompanist's eye will naturally follow the text, and they may hesitate, wondering if you're going to sing those words. A simple line through the lyrics removes all doubt.\n\nComping vs playing the melody: In most professional settings, the accompanist will not play the melody from your sheet music — they'll comp (play the accompaniment as written, supporting your voice without doubling it). If you're lost during a cut, a good accompanist may subtly highlight the melody to help you find your place. But this is a rescue, not the default. Don't rely on the piano to carry the tune.",
            adminNotes: "Explain why highlighting lyrics is a major distraction for sight-reading pianists."
          },
        ]
      },
      {
        moduleTitle: "Module 7: Physical Preparation of Your Music",
        lessons: [
          {
            title: "Always Keep the First Page & Printing Quality",
            notes: "Even if your cut starts on page three, always keep page one visible in your folder. It provides the accompanist with the key signature, time signature, tempo marking, and the full context of the piece.\n\nThink about it from the accompanist's perspective: they open your music and see page three. Immediately their brain has to work out what key they're in, what time signature, what the song is, what the world is. If they can see page one — even if it's entirely crossed out — they download all that information in a split second and feel oriented.\n\nAs a rule of thumb: if removing the first page raises more questions than it answers, keep it.\n\nPrinting Quality:\n- Ensure no staves are cut off at the edges\n- Music staves should be horizontally aligned — no crooked printing\n- Print in black and white, high contrast — not greyscale\n- If you're using a photocopy, check for blurriness or fading. If the page looks even slightly grey, find the original and re-copy.",
            adminNotes: "Explain why keeping page one is a non-negotiable rule for professional auditions."
          },
        ]
      },
      {
        moduleTitle: "Module 10: Approaching and Talking to Your Accompanist",
        lessons: [
          {
            title: "How to Approach & Walk Them Through the Music",
            notes: "How to Approach:\n- Walk to the side of the piano — not behind it\n- Standing behind the piano means your music is upside down and you're crowding the accompanist's space\n- Own your space — stand tall, don't shrink\n- Smile. A warm 'How are you?' is a lovely opener\n\nWalking Them Through the Music:\n- Show them the structure of your cut — where it starts, where it ends\n- Highlight any tricky moments — unexpected modulations, fermatas, tight cues, cut-offs\n- A useful question to ask yourself: does this raise more questions? If the accompanist will look at your music and wonder what's happening, you haven't communicated enough.\n- Save tempo for last — let them absorb the context of the piece first",
            adminNotes: "Explain why standing behind the piano is a common but highly disruptive mistake."
          },
          {
            title: "Delivering Tempo & Introductions [New]",
            notes: "Once you've walked them through the music, get to the end of the cut, then turn back to the beginning and deliver your tempo.\n\nIntroduction or No Introduction?:\n- Be decisive about whether your piece has an introduction\n- If you don't want an introduction, mark this clearly in the music and tell the accompanist\n- If you do want an introduction, keep it purposeful — its job is to give you the key and the tempo\n\nA note on intro length: some people give themselves too much intro. Eight bars of piano before the vocal enters can feel like an eternity in an audition — for you, for the panel, and for the accompanist who has to play it. If you can start right on the vocal, and you have the confidence to do it, that can be a powerful choice.\n\nBut starting on the vocal requires conviction. You can't count yourself in from the piano and then hesitantly find the note. As an accompanist, all I need is your breath. One breath, and I know where we are. There's no need to tap, count, or explain. Just breathe and go.\n\nIf your intro is very short — a single chord, for example — you can write 'tacet' over the rest of the bar after that chord. The accompanist will play the chord and wait for you.\n\nIf the panel offers to cut the intro down, that's fine. They're trying to move things along. If you detect this happening, just nod and say yes. Don't fight to keep your eight-bar intro.",
            adminNotes: "Explain how to mark 'No Intro' or 'Start on Vocal' clearly in the sheet music."
          },
        ]
      },
      {
        moduleTitle: "Module 11: Walking Into the Audition Room",
        lessons: [
          {
            title: "The Order of Events & Closing the Audition",
            notes: "The Order of Events:\n1. Enter the room with presence\n2. Acknowledge the panel and accompanist\n3. Approach the piano and walk through your music\n4. Deliver tempo\n5. Walk to your spot, ground yourself, and sing\n6. Thank the room, collect your music, and exit with grace\n\nIt's worth understanding what kind of room you're walking into. Some classes billed as 'mock auditions' are really acting-through-song classes in disguise. They give you feedback on your performance and your arc — which is valuable, but it's not the same thing as practising the act of auditioning. A true mock audition should rehearse the mechanics: walking in, handing over music, delivering tempo, singing cold, exiting. If you're in a room that leans toward acting feedback, recognise that and adjust your expectations.",
            adminNotes: "Walk through the sequence clearly. This is the choreography of the audition. Make it feel straightforward and achievable."
          },
        ]
      },
    ];

    let updated = 0;
    for (const modUpdate of moduleUpdates) {
      const dbModule = allModules.find(m => m.title === modUpdate.moduleTitle);
      if (!dbModule) {
        console.log(`Module not found: "${modUpdate.moduleTitle}" — skipping`);
        continue;
      }
      for (const lessonUpdate of modUpdate.lessons) {
        const dbLesson = allLessons.find(l => l.moduleId === dbModule.id && l.title === lessonUpdate.title);
        if (!dbLesson) {
          console.log(`Lesson not found: "${lessonUpdate.title}" in module "${modUpdate.moduleTitle}" — skipping`);
          continue;
        }
        await db.update(lessons)
          .set({
            notes: lessonUpdate.notes,
            adminNotes: lessonUpdate.adminNotes,
          })
          .where(eq(lessons.id, dbLesson.id));
        updated++;
      }
    }

    revalidatePath("/admin");
    revalidatePath("/portal");
    revalidatePath("/modules");
    return { success: true, updatedLessons: updated };
  } catch (error) {
    console.error("Error syncing lesson content:", error);
    throw new Error("Failed to sync lesson content: " + (error as Error).message);
  }
}

// --- Course Restructure: Insert Module 1 (Choosing Your Audition Repertoire) ---
// Creates the new module with 4 lessons and bumps all existing modules' displayOrder by 1.
// Also syncs the expanded lesson content from the transcript integration pass.
export async function restructureCourse() {
  try {
    // Find Level 1
    const [lvl1] = await db.select().from(levels).where(eq(levels.displayOrder, 1)).limit(1);
    if (!lvl1) throw new Error("Level 1 not found — run scaffold first");

    const existingModules = await db.select().from(modules).where(eq(modules.levelId, lvl1.id));

    // 1. Create new Module 1: Choosing Your Audition Repertoire
    const [newMod] = await db.insert(modules).values({
      title: "Module 1: Choosing Your Audition Repertoire",
      levelId: lvl1.id,
      displayOrder: 1,
      isPublished: false,
    }).returning();

    const newLessons = [
      {
        title: "What Is Audition Repertoire?",
        notes: "Your audition repertoire is the collection of songs you keep ready and polished — songs that represent who you are as a performer. A strong book gives you flexibility and confidence across a range of audition types.\n\nThe goal is to build a repertoire of six pieces that are aligned to your brand, your strengths, and your voice. These aren't songs you're learning — they're songs you own.\n\nDo you actually need twenty songs? No. Six go-to songs that you know inside out will serve you better than a binder full of material you're shaky on. If an audition comes up next week and you've got six songs you could sing in your sleep, you're ready. Brad would bring the same handful of songs to nearly every audition and it worked because he owned them.",
        adminNotes: "Define audition repertoire in your own words. What does it mean to have a 'book'? Why do you need more than one song?"
      },
      {
        title: "Intellectual Choice vs Vibe",
        notes: "Choosing a song isn't just about what you like. There are two lenses worth considering:\n\n1. Intellectual choice — does the song serve the audition? Does it suit the show, the brief, the room?\n2. Vibe / presentation / brand — does it feel like you? Does it showcase your voice and energy?\n\nBoth matter. The best song choices sit at the intersection of both.\n\nTIP: You wouldn't bring Seussical to a Ragtime audition. Know what the room is asking for.\n\nNow let's clear up a few myths.\n\nThe \"don't sing\" list doesn't exist. There is no secret blacklist of forbidden songs. If you nail a song, sing it. If Maybe This Time lands in your voice and you connect with it, sing Maybe This Time. If you want to sing a Disney song and it fits your brand, sing it. Panel members hear unfamiliar songs all day — sometimes hearing a classic done well is a genuine relief.\n\nWhat about songs that are \"too mature\" for your age? If you can connect with the content, it's fine. The blanket rule \"you're too young to sing that\" ignores nuance. If a song is about children and death and you have nothing to draw on, sure, skip it. But if it connects, and it aligns with your brand, you can make it work.\n\nAnd what about overdone songs? If Anything Goes is in your voice and you sing it well, keep it. The reason songs become \"overdone\" is because they're well-written and they work. A familiar song done confidently can actually work in your favour.",
        adminNotes: "Give examples of bad song choices vs great song choices for specific audition rooms."
      },
      {
        title: "Learning New Songs vs Recycling Your Rep",
        notes: "Stick with what is tried and tested unless you have ample time to fully integrate new material. Fresh material is a risk in high-pressure rooms.",
        adminNotes: "Talk through when it makes sense to learn something new versus sticking with something tried and tested. What are the risks of each? When is fresh material worth the risk?"
      },
      {
        title: "Composers Worth Knowing",
        notes: "Musical theatre has a rich range of composers, each with their own distinct voice and demands. Some worth having in your repertoire:\n\n- Jason Robert Brown — emotionally complex, rhythmically intricate, vocally demanding\n- Stephen Sondheim — sophisticated harmonic language, text-driven, requires strong musicianship\n- Adam Guettel — contemporary, through-composed, less commonly performed\n\nThere's a general rule in the industry about three composers you should be careful bringing into an audition — and it has less to do with you and more to do with the accompaniment. Sondheim, Jason Robert Brown, and Adam Guettel are the ones that give accompanists pause.\n\nWhy? Sondheim writes for the world of each show. His orchestrations are dense and specific, and when reduced to a piano accompaniment they can be wacky to play — strange timings, unusual harmonic moves, parts that don't sit naturally under the hands. Not every Sondheim song is hard — anyone can whistle is lighter — but enough of them are that the reputation exists.\n\nJason Robert Brown is rock-and-roll and Billy Joel-informed, gospel and folk. The man himself has said: if you can't play his songs, they've been out for 25 years. He's got a point. But that doesn't change the fact that some of his songs are death for an accompanist, especially cold at 9am.\n\nAdam Guettel's work (Myths and Hymns, The Light in the Piazza) is through-composed and harmonically complex. Less commonly performed, but when it comes up, it demands real musicianship.\n\nDoes this mean you should never bring these composers? No. It means you should be aware that your cut may be harder for the accompanist to sight-read. If you bring a Sondheim song you've prepared and you know your cut cold, fine. But don't assume that singing a Sondheim song for a Sondheim show is a one-to-one advantage. It isn't.\n\nA better approach: choose songs that sit well in your voice and let you do your best work. The accompanist will follow you. But if your cut is rhythmically chaotic and harmonically thorny, you're adding risk.",
        adminNotes: "Add more composers and your personal notes on each. What does each composer ask of a performer? Which voices do they suit?"
      },
      {
        title: "Building Six Pieces",
        notes: "Aim for six well-prepared, well-chosen pieces. They should collectively demonstrate range — not just vocal range, but emotional range, style range, and character range.\n\nSix songs you own completely are worth more than a binder of twenty you're still learning. If an audition comes up next week and you've got six songs you could sing in your sleep, you're ready. Focus on quality and ownership over quantity.",
        adminNotes: "Give your framework here. What adjectives or categories help a student think about their six pieces? E.g. one uptempo, one ballad, one contemporary, one classic. Make this yours."
      },
    ];

    for (let i = 0; i < newLessons.length; i++) {
      await db.insert(lessons).values({
        moduleId: newMod.id,
        title: newLessons[i].title,
        videoUrl: "",
        duration: "00:00",
        notes: newLessons[i].notes,
        adminNotes: newLessons[i].adminNotes,
        isPublished: false,
        displayOrder: i + 1,
      });
    }

    // 2. Bump only Level 1 existing modules' displayOrder by 1
    const lvl1Mods = await db.select().from(modules).where(eq(modules.levelId, lvl1.id));
    for (const mod of lvl1Mods) {
      if (mod.id === newMod.id) continue;
      await db.update(modules)
        .set({ displayOrder: (mod.displayOrder ?? 0) + 1 })
        .where(eq(modules.id, mod.id));
    }

    // 3. Sync expanded lesson content (matches actual DB titles)
    const allLessons = await db.select().from(lessons);
    const allUpdatedMods = await db.select().from(modules);

    const updates: { moduleTitle: string; lessonTitle: string; notes: string; adminNotes: string }[] = [
      // Module 2: Where to Source Sheet Music
      {
        moduleTitle: "Module 1: Where to Source Sheet Music",
        lessonTitle: "Recommended Sources",
        notes: "1. Musicnotes.com: Good for popular songs and musical theatre. Offers transpositions in multiple keys. Be aware that Musicnotes PDFs sometimes have the melody line embedded in the piano accompaniment — the right hand plays the vocal melody. Most professional accompanists are smart enough not to play the melody when you're singing, but it's something to check when you print your cut.\n2. Sheet Music Plus: Broader selection, including classical and more obscure musical theatre.\n3. Scribd: Subscription-based, user-uploaded content. Quality and legality varies — use with caution.\n\nWherever possible, look for a piano/vocal score rather than a lead sheet. The piano/vocal score gives the accompanist a full arrangement to work with. Lead sheets (just melody and chord symbols) don't give enough information.\n\nAlso: a typeset (computer-engraved) score is always preferable to a handwritten one. Handwritten scores are harder to sight-read — especially in the pressure of an audition. If all you have is a handwritten copy, consider getting it engraved professionally.",
        adminNotes: "Add your personal notes on Musicnotes and Sheet Music Plus — what you recommend them for, any caveats."
      },
      // Module 3 (now): Basic Music Terminology
      {
        moduleTitle: "Module 3: Basic Music Terminology",
        lessonTitle: "Fermata, Dal Segno & Musical Road Signs",
        notes: "Fermata: Tells the performer to hold a note or rest longer than its written value. If your song has a fermata, point it out to the accompanist during the handover. Not every fermata is obvious — sometimes the vocal holds while the accompaniment doesn't, so check the score.\n\nCaesura (Tram Tracks / Grand Pause): Indicates a complete break in the music. Everything stops. This is different from a fermata.\n\nThink of music as a ribbon flowing forward:\n- A fermata stretches the ribbon — it holds, stays tense, then resumes.\n- A caesura cuts the ribbon. Silence. Then you pick up again.\n\nWhen marking caesuras in your music, write two small slanted lines (//). The accompanist will know to stop and wait for your cue.\n\nRubato: 'Robbed time' — expressive freedom with rhythm. The singer leads, the accompaniment follows.\n\nColla Voce: 'With the voice' — the accompanist follows the singer's timing exactly.\n\nRallentando (Rall.) / Ritardando (Rit.): Gradual slowing of tempo.\n\nA Tempo: Return to the original tempo.\n\nDal Segno (D.S.): Go back to the sign. Common in musical theatre cuts.",
        adminNotes: "Explain these terms simply. Give examples of songs where these are commonly used."
      },
      {
        moduleTitle: "Module 3: Basic Music Terminology",
        lessonTitle: "Back Phrasing & Tacet — Critical Terms for Auditions",
        notes: "Colle Voce: 'With the voice.' The accompanist follows you. This is the default mode for most auditions — the pianist watches your breath and your phrasing and stays with you. It requires no special marking; it's simply good ensemble.\n\nBack Phrasing: Deliberately singing behind or ahead of the written rhythm. This is a stylistic choice, common in contemporary musical theatre and pop-influenced repertoire. If you are back phrasing, tell the accompanist. The phrase 'I'll be back phrasing this' is gold — it signals that you want the pianist to keep a steady tempo while you play with the timing.\n\nHow do you know if you're back phrasing? If you're singing a different rhythm to what's written — pushing ahead on some phrases, laying back on others — that's back phrasing.\n\nColla Voce and back phrasing are not the same thing:\n- Colla Voce: accompanist waits for you, follows your lead\n- Back Phrasing: accompanist stays steady, you move around the beat\n\nTacet: Means 'do not play.' If there are bars where you want the accompanist to be silent — perhaps for a dramatic moment or a held note — write 'tacet' clearly over those bars.",
        adminNotes: "Explain back phrasing in your own words. What does it sound like? How do you communicate it to an accompanist?"
      },
      // Module 4 (now): How to Cut Your Music
      {
        moduleTitle: "Module 4: How to Cut Your Music",
        lessonTitle: "What Is a Cut? (16-Bar vs 32-Bar)",
        notes: "A cut is a shortened excerpt of your song — usually the most effective section that best showcases your voice and storytelling.\n\nFirst, let's talk about the term '16-bar cut.' It's become the default language, but bars are an arbitrary measurement. The real measure is time. A verse in 4/4 at a slow tempo might take 30 seconds. The same 16 bars in a fast pop-rock song might fly by in 12 seconds. So when you say '16-bar cut,' what you really mean is something that runs between 30 and 45 seconds.\n\nHere's what the numbers actually mean in the room:\n- 30-45 seconds: A tight, effective cut. Shows what you can do, doesn't outstay its welcome.\n- 45-60 seconds: Pushing it. If you're going past 45 seconds, it had better be worth it — every extra second needs to earn its place.\n- 60-90 seconds: A 32-bar equivalent. Allows for a more developed arc, but be aware of the room's energy.\n\nThere's a practical tradeoff to keep in mind: the pains and gains. If you sing a shorter cut, you give the panel more time. If they like what they hear, they may ask for a second song. A tight 30-second cut that leaves them wanting more is better than a 90-second cut that goes on too long. But this isn't gospel — some songs need a bit more room, and that's fine. Just know that every bar you add is a bar they have to sit through.",
        adminNotes: "Give your own guidance on how to identify the right 16 or 32 bars. What are you looking for?"
      },
      {
        moduleTitle: "Module 4: How to Cut Your Music",
        lessonTitle: "Making Logical, Performable Cuts",
        notes: "A good cut feels like a complete musical thought — not a fragment. It should make sense harmonically and emotionally, even without the context of the full song.\n\nLet's clear up a big misconception: your cut doesn't need an arc. The full song has an arc — that's the composer's job. Your cut just needs to communicate what the song is about. How much of the song's story can you keep in a short excerpt? The opposite is also a useful question: how much can you take out before the song makes no sense at all?\n\nHere are the practical principles:\n\n- Cut at the end of a phrase, not mid-thought. A bracket in the middle of a barline is messy and hard to read. Don't cut through a bar. If you need to start mid-bar, it's usually better to find a cleaner entry point.\n- Avoid starting on a pickup bar where possible. Starting on a weak beat can feel unsettled.\n- Don't start a cut on the word 'and' — it implies something happened before. If your cut starts on 'and' or 'but', the panel feels like they've missed something.\n- Don't jump around erratically. A cut that goes from half a verse to a second verse to a final belt is chaotic both for the accompanist and the listener. Sing a chunk. Get as much story as you can.\n- The ending of your cut should feel conclusive. If the song doesn't have a natural ending, that's fine — you can land on a held note or a cut-off. But make sure it doesn't just trail off.\n\nA good way to start cutting: look at the lyrics first. Put them in a Google Doc and read them as text. The natural shape of the lyrics will tell you where the cut might live. If you're jumping around between half-sentences, the cut is going to be hard to follow.\n\nOne more thing: contemporary musical theatre songs often get over-cut. People try to cram in too many sections — a bit of verse, a pre-chorus, a chorus, a bridge, a belt ending — and the result is a choppy, confusing excerpt. Sometimes a simpler cut from a single section does the job better.",
        adminNotes: "Step-by-step: how do you find a good cutting point? What do you listen for? What makes a cut feel awkward or abrupt?"
      },
      {
        moduleTitle: "Module 4: How to Cut Your Music",
        lessonTitle: "The Correct Bracket Notation",
        notes: "When marking a cut in your music, use a clear bracket system:\n- Use a thick black or red line to mark the start and end of your cut\n- Draw the cross from the bottom left corner to the top right corner of the bar\n- The bracket should point inward toward the music that is to be played\n- Don't face the brackets outward — it scrambles the brain's reading flow\n\nBox method: draw a box around the bars you're cutting, then cross from bottom left to top right. This is the cleanest visual signal. The box tells the accompanist 'do not play any of this' with no ambiguity.\n\nIf a bracket ends at the natural end of the song, you don't need to bracket it — the end of the page is clear enough. But if your instinct says to add one, it doesn't hurt.\n\nLabeling START and END: Optional. Some people find it gives them a psychological boost — like a little pump of confidence — to write 'START' at their entry point. It's fine if you want to do that. Just know it's not strictly necessary if your brackets are clear.\n\nUsing a single chord as an intro: If you want just one chord to set the tempo and then silence before you begin, write the chord and mark 'tacet' over the rest of the bar. This tells the accompanist: play that chord, then stop and wait for my breath.\n\nBonus tip: Use a ruler. Clean lines matter. A wobbly freehand cross can be ambiguous. A ruler sends a professional signal.",
        adminNotes: "Add an image or diagram here showing correct bracket notation vs common mistakes."
      },
      // Module 5 (now): How to Annotate
      {
        moduleTitle: "Module 5: How to Annotate and Mark Up Your Music",
        lessonTitle: "General Annotation Tips & Marking Cuts",
        notes: "- Use a pen, not pencil — pencil is too light and smudges\n- Use yellow highlighter only\n- Do not highlight lyrics\n- Highlight key and time signature changes, not entire sections\n- Highlight tempo markings and fermatas\n- Keep lines clean and straight\n\nCrossing out lyrics: If you've cut a section that has lyrics, strike through the words. Don't just bracket the bars and leave the lyrics visible. The accompanist's eye will naturally follow the text, and they may hesitate, wondering if you're going to sing those words. A simple line through the lyrics removes all doubt.\n\nComping vs playing the melody: In most professional settings, the accompanist will not play the melody from your sheet music — they'll comp (play the accompaniment as written, supporting your voice without doubling it). If you're lost during a cut, a good accompanist may subtly highlight the melody to help you find your place. But this is a rescue, not the default. Don't rely on the piano to carry the tune.",
        adminNotes: "Explain why highlighting lyrics is a major distraction for sight-reading pianists."
      },
      // Module 6 (now): Physical Preparation
      {
        moduleTitle: "Module 6: Physical Preparation of Your Music",
        lessonTitle: "Always Keep the First Page & Printing Quality",
        notes: "Even if your cut starts on page three, always keep page one visible in your folder. It provides the accompanist with the key signature, time signature, tempo marking, and the full context of the piece.\n\nThink about it from the accompanist's perspective: they open your music and see page three. Immediately their brain has to work out what key they're in, what time signature, what the song is, what the world is. If they can see page one — even if it's entirely crossed out — they download all that information in a split second and feel oriented.\n\nAs a rule of thumb: if removing the first page raises more questions than it answers, keep it.\n\nPrinting Quality:\n- Ensure no staves are cut off at the edges\n- Music staves should be horizontally aligned — no crooked printing\n- Print in black and white, high contrast — not greyscale\n- If you're using a photocopy, check for blurriness or fading. If the page looks even slightly grey, find the original and re-copy.",
        adminNotes: "Explain why keeping page one is a non-negotiable rule for professional auditions."
      },
      // Module 9 (now): Approaching and Talking to Your Accompanist
      {
        moduleTitle: "Module 9: Approaching and Talking to Your Accompanist",
        lessonTitle: "How to Approach & Walk Them Through the Music",
        notes: "How to Approach:\n- Walk to the side of the piano — not behind it\n- Standing behind the piano means your music is upside down and you're crowding the accompanist's space\n- Own your space — stand tall, don't shrink\n- Smile. A warm 'How are you?' is a lovely opener\n\nWalking Them Through the Music:\n- Show them the structure of your cut — where it starts, where it ends\n- Highlight any tricky moments — unexpected modulations, fermatas, tight cues, cut-offs\n- A useful question to ask yourself: does this raise more questions? If the accompanist will look at your music and wonder what's happening, you haven't communicated enough.\n- Save tempo for last — let them absorb the context of the piece first",
        adminNotes: "Explain why standing behind the piano is a common but highly disruptive mistake."
      },
      {
        moduleTitle: "Module 9: Approaching and Talking to Your Accompanist",
        lessonTitle: "Delivering Tempo & Introductions",
        notes: "Once you've walked them through the music, get to the end of the cut, then turn back to the beginning and deliver your tempo.\n\nIntroduction or No Introduction?:\n- Be decisive about whether your piece has an introduction\n- If you don't want an introduction, mark this clearly in the music and tell the accompanist\n- If you do want an introduction, keep it purposeful — its job is to give you the key and the tempo\n\nA note on intro length: some people give themselves too much intro. Eight bars of piano before the vocal enters can feel like an eternity in an audition — for you, for the panel, and for the accompanist who has to play it. If you can start right on the vocal, and you have the confidence to do it, that can be a powerful choice.\n\nBut starting on the vocal requires conviction. You can't count yourself in from the piano and then hesitantly find the note. As an accompanist, all I need is your breath. One breath, and I know where we are. There's no need to tap, count, or explain. Just breathe and go.\n\nIf your intro is very short — a single chord, for example — you can write 'tacet' over the rest of the bar after that chord. The accompanist will play the chord and wait for you.\n\nIf the panel offers to cut the intro down, that's fine. They're trying to move things along. If you detect this happening, just nod and say yes. Don't fight to keep your eight-bar intro.",
        adminNotes: "Explain how to mark 'No Intro' or 'Start on Vocal' clearly in the sheet music."
      },
      // Module 10 (now): Walking Into the Audition Room
      {
        moduleTitle: "Module 10: Walking Into the Audition Room",
        lessonTitle: "The Order of Events & Closing the Audition",
        notes: "The Order of Events:\n1. Enter the room with presence\n2. Acknowledge the panel and accompanist\n3. Approach the piano and walk through your music\n4. Deliver tempo\n5. Walk to your spot, ground yourself, and sing\n6. Thank the room, collect your music, and exit with grace\n\nIt's worth understanding what kind of room you're walking into. Some classes billed as 'mock auditions' are really acting-through-song classes in disguise. They give you feedback on your performance and your arc — which is valuable, but it's not the same thing as practising the act of auditioning. A true mock audition should rehearse the mechanics: walking in, handing over music, delivering tempo, singing cold, exiting. If you're in a room that leans toward acting feedback, recognise that and adjust your expectations.",
        adminNotes: "Walk through the sequence clearly. This is the choreography of the audition. Make it feel straightforward and achievable."
      },
    ];

    let updated = 0;
    for (const u of updates) {
      const dbMod = allUpdatedMods.find(m => m.title === u.moduleTitle);
      if (!dbMod) {
        console.log(`Module not found: "${u.moduleTitle}" — skipping`);
        continue;
      }
      const dbLes = allLessons.find(l => l.moduleId === dbMod.id && l.title === u.lessonTitle);
      if (!dbLes) {
        console.log(`Lesson not found: "${u.lessonTitle}" in "${u.moduleTitle}" — skipping`);
        continue;
      }
      await db.update(lessons)
        .set({ notes: u.notes, adminNotes: u.adminNotes })
        .where(eq(lessons.id, dbLes.id));
      updated++;
    }

    revalidatePath("/admin");
    revalidatePath("/portal");
    revalidatePath("/modules");
    revalidatePath("/admin/tree");
    revalidatePath("/admin/modules");
    return {
      success: true,
      newModule: "Module 1: Choosing Your Audition Repertoire",
      newLessonsCreated: newLessons.length,
      lessonsUpdated: updated,
      modulesRenumbered: lvl1Mods.length,
    };
  } catch (error) {
    console.error("Error restructuring course:", error);
    throw new Error("Failed to restructure course: " + (error as Error).message);
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

export async function fixCourseStructure() {
  try {
    // Get all levels in order
    const allLevels = await db.select().from(levels).orderBy(levels.displayOrder);
    // Get all modules ordered by level then displayOrder
    const allMods = await db.select().from(modules).orderBy(modules.displayOrder);

    let globalNum = 0;

    for (const lvl of allLevels) {
      const lvlMods = allMods.filter(m => m.levelId === lvl.id)
        .sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0));

      for (let i = 0; i < lvlMods.length; i++) {
        globalNum++;

        // Fix displayOrder to be sequential within level
        const correctDisplayOrder = i + 1;
        if ((lvlMods[i].displayOrder ?? 0) !== correctDisplayOrder) {
          await db.update(modules)
            .set({ displayOrder: correctDisplayOrder })
            .where(eq(modules.id, lvlMods[i].id));
        }

        // Fix title to match global sequential number
        const oldTitle = lvlMods[i].title;
        const titleBody = oldTitle.includes(": ")
          ? oldTitle.split(": ").slice(1).join(": ")
          : oldTitle;
        const newTitle = `Module ${globalNum}: ${titleBody}`;
        if (newTitle !== oldTitle) {
          await db.update(modules)
            .set({ title: newTitle })
            .where(eq(modules.id, lvlMods[i].id));
        }
      }
    }

    revalidatePath("/admin");
    revalidatePath("/admin/tree");
    revalidatePath("/admin/modules");
    revalidatePath("/portal");
    revalidatePath("/modules");
    return { success: true };
  } catch (error: any) {
    console.error("Error fixing course structure:", error.message);
    throw new Error("Failed to fix course structure: " + error.message);
  }
}