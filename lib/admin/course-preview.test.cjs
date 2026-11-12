const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const { test } = require("node:test");
const ts = require("typescript");

const filename = path.join(__dirname, "course-preview.ts");
const code = ts.transpileModule(fs.readFileSync(filename, "utf8"), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
}).outputText;
const context = {
  exports: {},
  require: () => assert.fail("Course metadata must have no runtime dependencies"),
};
vm.runInNewContext(code, context, { filename });
const {
  COURSE_LEVELS,
  COURSE_TITLE_MAX,
  COURSE_DESCRIPTION_MAX,
  validateCourseMetadata,
  applyCourseMetadata,
  clonePreviewCourses,
} = context.exports;
const plain = (value) => JSON.parse(JSON.stringify(value));
const valid = {
  title: "Everyday English",
  description: "Practice useful everyday conversations.",
  level: "A1 · Beginner",
};
const fixtures = Object.freeze([
  Object.freeze({ id: "course-1", ...valid, lessons: 8, status: "Published" }),
  Object.freeze({
    id: "course-2",
    title: "Travel English",
    description: "Conversations for travel.",
    level: "A2 · Elementary",
    lessons: 12,
    status: "Draft",
  }),
]);

test("exports the exact level allowlist and length limits", () => {
  assert.deepEqual(Array.from(COURSE_LEVELS), [
    "A1 · Beginner", "A2 · Elementary", "B1 · Intermediate", "B2 · Upper intermediate",
  ]);
  assert.equal(COURSE_TITLE_MAX, 100);
  assert.equal(COURSE_DESCRIPTION_MAX, 1000);
});

test("valid metadata has no errors for every allowed level", () => {
  for (const level of COURSE_LEVELS) {
    assert.deepEqual(plain(validateCourseMetadata({ ...valid, level })), {});
  }
});

test("validation accepts surrounding whitespace without changing its input", () => {
  const input = Object.freeze({ title: " \tHello \n", description: "  Practice\t ", level: " A1 · Beginner " });
  assert.deepEqual(plain(validateCourseMetadata(input)), {});
  assert.equal(input.title, " \tHello \n");
});

test("empty and whitespace-only titles and descriptions are required", () => {
  for (const value of ["", " \t\n "]) {
    const errors = validateCourseMetadata({ ...valid, title: value, description: value });
    assert.ok(errors.title);
    assert.ok(errors.description);
    assert.equal(errors.level, undefined);
  }
});

test("length limits are inclusive and measured after trimming", () => {
  assert.deepEqual(plain(validateCourseMetadata({
    ...valid,
    title: `  ${"t".repeat(COURSE_TITLE_MAX)}  `,
    description: `\n${"d".repeat(COURSE_DESCRIPTION_MAX)}\t`,
  })), {});
});

test("title over its limit reports only the title error", () => {
  const errors = validateCourseMetadata({ ...valid, title: "t".repeat(COURSE_TITLE_MAX + 1) });
  assert.deepEqual(Object.keys(errors), ["title"]);
  assert.ok(errors.title);
});

test("description over its limit reports only the description error", () => {
  const errors = validateCourseMetadata({ ...valid, description: "d".repeat(COURSE_DESCRIPTION_MAX + 1) });
  assert.deepEqual(Object.keys(errors), ["description"]);
  assert.ok(errors.description);
});

test("levels reject missing, unknown, abbreviated and incorrectly capitalized values", () => {
  for (const level of ["", " \t", "C1 · Advanced", "A1", "a1 · Beginner", "B2 · Upper Intermediate"]) {
    assert.ok(validateCourseMetadata({ ...valid, level }).level, level);
  }
});

test("validation reports all invalid fields together", () => {
  const errors = validateCourseMetadata({ title: "", description: "", level: "" });
  assert.deepEqual(Object.keys(errors).sort(), ["description", "level", "title"]);
});

test("apply trims metadata and updates only the selected course", () => {
  const result = applyCourseMetadata(fixtures, "course-1", {
    title: "  Updated title  ", description: "\nUpdated description\t", level: " B1 · Intermediate ",
  });
  assert.equal(result.ok, true);
  assert.deepEqual(plain(result.courses[0]), {
    ...fixtures[0], title: "Updated title", description: "Updated description", level: "B1 · Intermediate",
  });
  assert.deepEqual(plain(result.courses[1]), fixtures[1]);
  assert.notEqual(result.courses, fixtures);
  assert.notEqual(result.courses[0], fixtures[0]);
});

test("invalid metadata cannot update or mutate source courses", () => {
  const before = JSON.stringify(fixtures);
  const result = applyCourseMetadata(fixtures, "course-1", { title: "", description: "", level: "" });
  assert.equal(result.ok, false);
  assert.ok(result.errors.title && result.errors.description && result.errors.level);
  assert.equal(result.courses, undefined);
  assert.equal(JSON.stringify(fixtures), before);
});

test("unknown IDs and empty course lists return a form error", () => {
  for (const courses of [fixtures, []]) {
    const result = applyCourseMetadata(courses, "missing", valid);
    assert.equal(result.ok, false);
    assert.ok(result.errors.form);
    assert.equal(result.courses, undefined);
  }
  const result = applyCourseMetadata(fixtures, "missing", { title: "", description: "", level: "" });
  assert.equal(result.ok, false);
  assert.ok(result.errors.form);
});

test("runtime extra fields cannot change identity, publication or lesson count", () => {
  const before = JSON.stringify(fixtures);
  const input = Object.freeze({
    ...valid, title: "Safe update", id: "hijacked", status: "Draft", lessons: 999, unexpected: "ignored",
  });
  const result = applyCourseMetadata(fixtures, "course-1", input);
  assert.equal(result.ok, true);
  assert.equal(result.courses[0].id, "course-1");
  assert.equal(result.courses[0].status, "Published");
  assert.equal(result.courses[0].lessons, 8);
  assert.equal(result.courses[0].unexpected, undefined);
  assert.equal(JSON.stringify(fixtures), before);
});

test("clone produces a fresh array and fresh objects with exact fixture fidelity", () => {
  const cloned = clonePreviewCourses(fixtures);
  assert.notEqual(cloned, fixtures);
  assert.deepEqual(plain(cloned), fixtures);
  for (let index = 0; index < fixtures.length; index++) {
    assert.notEqual(cloned[index], fixtures[index]);
  }
  cloned[0].title = "Local only";
  cloned[1].status = "Published";
  assert.equal(fixtures[0].title, valid.title);
  assert.equal(fixtures[1].status, "Draft");
  assert.deepEqual(plain(clonePreviewCourses([])), []);
});

test("successive edits preserve earlier edits and reset restores fresh fixtures", () => {
  const initial = clonePreviewCourses(fixtures);
  const first = applyCourseMetadata(initial, "course-1", { ...valid, title: "First edit" });
  assert.equal(first.ok, true);
  const second = applyCourseMetadata(first.courses, "course-2", { ...valid, title: "Second edit" });
  assert.equal(second.ok, true);
  const third = applyCourseMetadata(second.courses, "course-1", { ...valid, title: "Third edit" });
  assert.equal(third.ok, true);
  assert.equal(first.courses[0].title, "First edit");
  assert.equal(second.courses[0].title, "First edit");
  assert.equal(second.courses[1].title, "Second edit");
  assert.equal(third.courses[0].title, "Third edit");
  assert.equal(third.courses[1].title, "Second edit");
  assert.deepEqual(plain(initial), fixtures);
  const reset = clonePreviewCourses(fixtures);
  assert.deepEqual(plain(reset), fixtures);
  for (let index = 0; index < reset.length; index++) {
    assert.notEqual(reset[index], initial[index]);
    assert.notEqual(reset[index], third.courses[index]);
    assert.notEqual(reset[index], fixtures[index]);
  }
});
