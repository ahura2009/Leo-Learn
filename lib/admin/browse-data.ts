import {
  previewStudents, previewCourses, previewLessons, previewEnrollments, previewFeedback,
} from "./mock-data";
import type { BrowseDataset, BrowseRecord, BrowseFilter } from "./browse-query";

const studentName = (id: string) => previewStudents.find((student) => student.id === id)?.name ?? "Unknown sample learner";
const courseTitle = (id: string) => previewCourses.find((course) => course.id === id)?.title ?? "Unknown sample course";
const filtersFor = (records: BrowseRecord[], entries: [string, string][]): BrowseFilter[] => entries.map(([key, label]) => ({
  key, label,
  options: [...new Set(records.map((record) => String(record.values[key])))].sort((a, b) => a.localeCompare(b, "en", { numeric: true })),
}));

const courses: BrowseRecord[] = previewCourses.map((course) => ({
  id: course.id,
  values: { title: course.title, level: course.level, lessons: course.lessons, status: course.status },
  details: [
    { label: "Course ID", value: course.id },
    { label: "Level", value: course.level },
    { label: "Sample content status", value: `${course.status} (illustrative only)` },
    { label: "Description", value: course.description },
  ],
  sections: [{ title: "Sample lesson sequence", items: previewLessons.filter((lesson) => lesson.courseId === course.id).sort((a, b) => a.order - b.order).map((lesson) => `${lesson.order}. ${lesson.title} · ${lesson.minutes} min`) }],
}));
const lessons: BrowseRecord[] = previewLessons.map((lesson) => ({
  id: lesson.id,
  values: { title: lesson.title, course: courseTitle(lesson.courseId), order: lesson.order, minutes: lesson.minutes, type: lesson.exerciseType },
  details: [
    { label: "Lesson ID", value: lesson.id },
    { label: "Sample course", value: courseTitle(lesson.courseId) },
    { label: "Sequence", value: String(lesson.order) },
    { label: "Duration", value: `${lesson.minutes} minutes` },
    { label: "Exercise type", value: lesson.exerciseType },
    { label: "Learning objective", value: lesson.objective },
  ],
}));
const students: BrowseRecord[] = previewStudents.map((student) => ({
  id: student.id,
  values: { name: student.name, level: student.level, enrollments: previewEnrollments.filter((enrollment) => enrollment.studentId === student.id).length },
  details: [{ label: "Learner ID", value: student.id }, { label: "Sample level", value: student.level }],
  sections: [
    { title: "Sample learning goals", items: student.goals },
    { title: "Sample enrollments", items: previewEnrollments.filter((enrollment) => enrollment.studentId === student.id).map((enrollment) => `${courseTitle(enrollment.courseId)} · ${enrollment.status}`) },
  ],
}));
const enrollments: BrowseRecord[] = previewEnrollments.map((enrollment) => ({
  id: enrollment.id,
  values: { learner: studentName(enrollment.studentId), course: courseTitle(enrollment.courseId), status: enrollment.status },
  details: [
    { label: "Enrollment ID", value: enrollment.id },
    { label: "Sample learner", value: studentName(enrollment.studentId) },
    { label: "Learner ID", value: enrollment.studentId },
    { label: "Sample course", value: courseTitle(enrollment.courseId) },
    { label: "Course ID", value: enrollment.courseId },
    { label: "Sample progress status", value: enrollment.status },
  ],
}));
const feedback: BrowseRecord[] = previewFeedback.map((item) => ({
  id: item.id,
  values: { learner: studentName(item.studentId), course: courseTitle(item.courseId), topic: item.topic, status: item.status },
  details: [
    { label: "Feedback ID", value: item.id },
    { label: "Sample learner", value: studentName(item.studentId) },
    { label: "Sample course", value: courseTitle(item.courseId) },
    { label: "Topic", value: item.topic },
    { label: "Sample review status", value: item.status },
    { label: "Fictional feedback message", value: item.message },
  ],
}));

export const browseDatasets: Record<"courses" | "lessons" | "students" | "enrollments" | "feedback", BrowseDataset> = {
  courses: {
    id: "courses", title: "Courses", singular: "course", eyebrow: "A CONSIDERED CURRICULUM",
    description: "Explore the sample course library, inspect lesson sequences, and find room for the next little win.",
    primaryKey: "title", columns: [{ key: "title", label: "Course" }, { key: "level", label: "Level" }, { key: "lessons", label: "Lessons" }, { key: "status", label: "Content status", badge: true }],
    filters: filtersFor(courses, [["level", "Level"], ["status", "Content status"]]), records: courses,
  },
  lessons: {
    id: "lessons", title: "Lessons", singular: "lesson", eyebrow: "SMALL STEPS. REAL POSSIBILITIES.",
    description: "Browse fictional lessons, their learning objectives, and the sequence that brings a sample course together.",
    primaryKey: "title", columns: [{ key: "title", label: "Lesson" }, { key: "course", label: "Course" }, { key: "order", label: "Sequence" }, { key: "minutes", label: "Minutes" }, { key: "type", label: "Exercise type" }],
    filters: filtersFor(lessons, [["course", "Course"], ["type", "Exercise type"]]), records: lessons,
  },
  students: {
    id: "students", title: "Students", singular: "learner", eyebrow: "EVERY LEARNER HAS A NEXT STEP",
    description: "Explore fictional learner profiles, sample goals, and course assignments. No real student accounts are connected.",
    primaryKey: "name", columns: [{ key: "name", label: "Learner" }, { key: "level", label: "Level" }, { key: "enrollments", label: "Enrollments" }],
    filters: filtersFor(students, [["level", "Level"]]), records: students,
  },
  enrollments: {
    id: "enrollments", title: "Enrollments", singular: "enrollment", eyebrow: "CONNECTING THE LEARNING JOURNEY",
    description: "Inspect sample course assignments and progress labels. These records do not reflect real learning activity.",
    primaryKey: "learner", columns: [{ key: "learner", label: "Learner" }, { key: "course", label: "Course" }, { key: "status", label: "Progress status", badge: true }],
    filters: filtersFor(enrollments, [["course", "Course"], ["status", "Progress status"]]), records: enrollments,
  },
  feedback: {
    id: "feedback", title: "Feedback", singular: "feedback item", eyebrow: "A SPACE FOR LISTENING",
    description: "Browse fictional feedback examples. No messages have been submitted by real learners, and no replies or review changes are available.",
    primaryKey: "learner", columns: [{ key: "learner", label: "Learner" }, { key: "course", label: "Course" }, { key: "topic", label: "Topic" }, { key: "status", label: "Review status", badge: true }],
    filters: filtersFor(feedback, [["topic", "Topic"], ["status", "Review status"]]), records: feedback,
  },
};
