export interface Lesson {
  id: string;
  title: string;
  videoUrl: string;
  duration: string;
  notes: string;
}

export interface Module {
  id: string;
  title: string;
  lessons: Lesson[];
}

export interface CourseProgress {
  completedLessons: string[];
}