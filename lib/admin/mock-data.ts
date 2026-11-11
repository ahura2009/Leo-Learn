// Entirely synthetic UI fixtures. Not derived from student progress or a backend.
export type PreviewCourse = { id: string; title: string; level: string; lessons: number; status: "Published" | "Draft" };
export type PreviewEnrollment = { id: string; studentId: string; courseId: string; status: "In progress" | "Not started" | "Completed" };

export const previewStudents = ["Demo learner 01", "Demo learner 02", "Demo learner 03", "Demo learner 04", "Demo learner 05", "Demo learner 06"];
export const previewCourses: PreviewCourse[] = [
  { id: "everyday", title: "Everyday conversations", level: "A2 · Elementary", lessons: 8, status: "Published" },
  { id: "work", title: "English at work", level: "B1 · Intermediate", lessons: 6, status: "Published" },
  { id: "travel", title: "A little travel English", level: "A1 · Beginner", lessons: 4, status: "Draft" },
];
export const previewEnrollments: PreviewEnrollment[] = [
  { id: "DEMO-001", studentId: previewStudents[0], courseId: "everyday", status: "In progress" },
  { id: "DEMO-002", studentId: previewStudents[1], courseId: "work", status: "Not started" },
  { id: "DEMO-003", studentId: previewStudents[2], courseId: "everyday", status: "Completed" },
  { id: "DEMO-004", studentId: previewStudents[3], courseId: "work", status: "In progress" },
  { id: "DEMO-005", studentId: previewStudents[4], courseId: "everyday", status: "Not started" },
  { id: "DEMO-006", studentId: previewStudents[5], courseId: "everyday", status: "In progress" },
];
export const previewTotals = {
  students: previewStudents.length,
  courses: previewCourses.length,
  lessons: previewCourses.reduce((total, course) => total + course.lessons, 0),
  enrollments: previewEnrollments.length,
};
