import type { PreviewCourse } from "./types";

export const COURSE_LEVELS = [
  "A1 · Beginner",
  "A2 · Elementary",
  "B1 · Intermediate",
  "B2 · Upper intermediate",
] as const;

export const COURSE_TITLE_MAX = 100;
export const COURSE_DESCRIPTION_MAX = 1000;

export type CourseMetadataInput = {
  title: string;
  description: string;
  level: string;
};

export type CourseMetadataErrors = Partial<
  Record<"title" | "description" | "level" | "form", string>
>;

export function validateCourseMetadata(
  input: CourseMetadataInput,
): CourseMetadataErrors {
  const errors: CourseMetadataErrors = {};
  const title = input.title.trim();
  const description = input.description.trim();
  const level = input.level.trim();

  if (!title) {
    errors.title = "Enter a course title.";
  } else if (title.length > COURSE_TITLE_MAX) {
    errors.title = `Keep the title to ${COURSE_TITLE_MAX} characters or fewer.`;
  }

  if (!description) {
    errors.description = "Enter a course description.";
  } else if (description.length > COURSE_DESCRIPTION_MAX) {
    errors.description = `Keep the description to ${COURSE_DESCRIPTION_MAX} characters or fewer.`;
  }

  if (!COURSE_LEVELS.some((option) => option === level)) {
    errors.level = "Choose a valid course level.";
  }

  return errors;
}

export function applyCourseMetadata(
  courses: PreviewCourse[],
  courseId: string,
  input: CourseMetadataInput,
): { ok: true; courses: PreviewCourse[] } | { ok: false; errors: CourseMetadataErrors } {
  if (!courses.some((course) => course.id === courseId)) {
    return { ok: false, errors: { form: "Course not found." } };
  }

  const errors = validateCourseMetadata(input);
  if (Object.keys(errors).length > 0) {
    return { ok: false, errors };
  }

  return {
    ok: true,
    courses: courses.map((course) =>
      course.id === courseId
        ? {
            ...course,
            title: input.title.trim(),
            description: input.description.trim(),
            level: input.level.trim(),
          }
        : course,
    ),
  };
}

export function clonePreviewCourses(courses: PreviewCourse[]): PreviewCourse[] {
  return courses.map((course) => ({ ...course }));
}
