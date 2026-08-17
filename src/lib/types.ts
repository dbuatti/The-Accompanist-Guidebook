export interface CourseResource {
  id: string;
  lessonId: string;
  title: string;
  url: string;
  description: string | null;
  displayOrder: number;
  createdAt: Date;
}

export interface CourseLesson {
  id: string;
  moduleId: string;
  title: string;
  slug: string;
  videoUrl: string;
  duration: string;
  notes: string | null;
  adminNotes: string | null;
  cliffnotes: string | null;
  isPublished: boolean;
  displayOrder: number;
  createdAt: Date;
  hasVideo: boolean;
  videoStatus: string;
  filmingDate: Date | null;
  resources: CourseResource[];
}

export interface CourseModule {
  id: string;
  levelId: string | null;
  title: string;
  slug: string;
  wrapUpVideoUrl: string | null;
  isPublished: boolean;
  displayOrder: number;
  createdAt: Date;
  moduleNumber: number;
  lessons: CourseLesson[];
}

export interface CourseLevel {
  id: string;
  title: string;
  displayOrder: number;
  createdAt: Date;
  modules: CourseModule[];
}

export interface CourseProgress {
  id: string;
  userId: string;
  lessonId: string;
  lastPosition: number;
  completedAt: Date | null;
}
