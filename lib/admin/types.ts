export type PreviewStudent = {
  id: string;
  name: string;
  level: string;
  goals: string[];
};

export type PreviewCourse = {
  id: string;
  title: string;
  description: string;
  level: string;
  lessons: number;
  status: "Published" | "Draft";
};

export type PreviewLesson = {
  id: string;
  courseId: string;
  title: string;
  order: number;
  minutes: number;
  objective: string;
  exerciseType: string;
};

export type PreviewEnrollment = {
  id: string;
  studentId: string;
  courseId: string;
  status: "In progress" | "Not started" | "Completed";
};

export type PreviewFeedback = {
  id: string;
  studentId: string;
  courseId: string;
  topic: string;
  status: "New" | "Reviewed";
  message: string;
};
