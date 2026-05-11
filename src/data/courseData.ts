import { Module } from "../types/course";

export const courseData: Module[] = [
  {
    id: "mod-1",
    title: "The Basics of Communication",
    lessons: [
      {
        id: "lesson-1-1",
        title: "Introduction to the Accompanist",
        videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ", // Placeholder
        duration: "05:20",
        notes: "In this lesson, we cover the fundamental mindset of working with a collaborative pianist. It's a partnership, not a service. Key takeaways: Be prepared, be polite, and be clear about your artistic intent."
      },
      {
        id: "lesson-1-2",
        title: "Speaking the Language",
        videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
        duration: "08:45",
        notes: "Learn the musical terminology that helps you communicate tempo, dynamics, and style without confusion. We'll discuss terms like 'rubato', 'colla voce', and 'a tempo'."
      }
    ]
  },
  {
    id: "mod-2",
    title: "Sheet Music Preparation",
    lessons: [
      {
        id: "lesson-2-1",
        title: "The Perfect Audition Book",
        videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
        duration: "12:10",
        notes: "How to organize your binder for maximum efficiency. We talk about double-sided printing, non-glare sleeves, and the importance of clear cuts."
      },
      {
        id: "lesson-2-2",
        title: "Marking Your Music",
        videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
        duration: "10:30",
        notes: "A guide to marking cuts, tempo changes, and acting beats in a way that is legible for a pianist sight-reading your music in a high-pressure audition."
      }
    ]
  }
];