const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const { test } = require("node:test");
const ts = require("typescript");

// Load these dependency-free TS modules without emitting files or adding a runner.
function loadFixtureModule(name) {
  const filename = path.join(__dirname, name);
  const source = fs.readFileSync(filename, "utf8");
  const compiled = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
  });
  const context = { exports: {} };
  vm.runInNewContext(compiled.outputText, context, { filename });
  return context.exports;
}

const { adminNavigation, isAdminRouteActive } = loadFixtureModule("navigation.ts");
const {
  previewStudents, previewCourses, previewLessons,
  previewEnrollments, previewFeedback, previewTotals,
} = loadFixtureModule("mock-data.ts");
const root = path.resolve(__dirname, "../..");

test("all eight navigation destinations have concrete route files", () => {
  assert.equal(adminNavigation.length, 8);
  assert.equal(new Set(adminNavigation.map((item) => item.href)).size, 8);
  for (const item of adminNavigation) {
    assert.ok(fs.existsSync(path.join(root, "app", item.href, "page.tsx")), item.href);
  }
});

test("overview is exact and section matching respects segment boundaries", () => {
  assert.equal(isAdminRouteActive("/admin", "/admin"), true);
  assert.equal(isAdminRouteActive("/admin/", "/admin"), true);
  assert.equal(isAdminRouteActive("/admin/students", "/admin"), false);
  assert.equal(isAdminRouteActive("/admin/students/", "/admin/students"), true);
  assert.equal(isAdminRouteActive("/admin/students/demo", "/admin/students"), true);
  assert.equal(isAdminRouteActive("/admin/students-extra", "/admin/students"), false);
  assert.equal(isAdminRouteActive("/home", "/admin"), false);
});

function assertFields(record, fields) {
  assert.deepEqual(Object.keys(record).sort(), [...fields].sort());
}

function assertText(value) {
  assert.equal(typeof value, "string");
  assert.ok(value.trim().length > 0);
}

test("fixture collections meet preview scale and have stable unique identifiers", () => {
  for (const [records, minimum] of [
    [previewStudents, 12], [previewCourses, 4], [previewLessons, 18],
    [previewEnrollments, 12], [previewFeedback, 8],
  ]) {
    assert.ok(records.length >= minimum);
    assert.equal(new Set(records.map((record) => record.id)).size, records.length);
    for (const record of records) assertText(record.id);
  }
  const secondLoad = loadFixtureModule("mock-data.ts");
  for (const key of ["previewStudents", "previewCourses", "previewLessons", "previewEnrollments", "previewFeedback"]) {
    assert.equal(JSON.stringify(secondLoad[key]), JSON.stringify({
      previewStudents, previewCourses, previewLessons, previewEnrollments, previewFeedback,
    }[key]));
  }
});

test("learners have fictional names, levels, and meaningful synthetic goals", () => {
  assert.equal(new Set(previewStudents.map((student) => student.name)).size, previewStudents.length);
  for (const student of previewStudents) {
    assertFields(student, ["id", "name", "level", "goals"]);
    assert.match(student.name, /^Demo learner \d{2}$/);
    assert.notEqual(student.id, student.name);
    assertText(student.level);
    assert.ok(Array.isArray(student.goals) && student.goals.length > 0);
    student.goals.forEach(assertText);
  }
});

test("courses describe sample content and derive lesson counts from records", () => {
  assert.ok(previewCourses.some((course) => course.status === "Published"));
  assert.ok(previewCourses.some((course) => course.status === "Draft"));
  for (const course of previewCourses) {
    assertFields(course, ["id", "title", "description", "level", "lessons", "status"]);
    [course.title, course.description, course.level].forEach(assertText);
    assert.ok(["Published", "Draft"].includes(course.status));
    const lessons = previewLessons.filter((lesson) => lesson.courseId === course.id);
    assert.ok(lessons.length > 0);
    assert.equal(course.lessons, lessons.length);
    const orders = lessons.map((lesson) => lesson.order).sort((a, b) => a - b);
    assert.equal(new Set(orders).size, lessons.length);
    assert.equal(JSON.stringify(orders), JSON.stringify(lessons.map((_, index) => index + 1)));
  }
});

test("lessons have valid course relationships, positive ordering and durations", () => {
  for (const lesson of previewLessons) {
    assertFields(lesson, ["id", "courseId", "title", "order", "minutes", "objective", "exerciseType"]);
    assert.ok(previewCourses.some((course) => course.id === lesson.courseId));
    [lesson.title, lesson.objective, lesson.exerciseType].forEach(assertText);
    assert.ok(Number.isInteger(lesson.order) && lesson.order > 0);
    assert.ok(Number.isInteger(lesson.minutes) && lesson.minutes > 0);
  }
});

test("headline totals are derived from the synthetic fixtures", () => {
  assertFields(previewTotals, ["students", "courses", "lessons", "enrollments"]);
  assert.equal(previewTotals.students, previewStudents.length);
  assert.equal(previewTotals.courses, previewCourses.length);
  assert.equal(previewTotals.lessons, previewLessons.length);
  assert.equal(previewTotals.lessons, previewCourses.reduce((sum, course) => sum + course.lessons, 0));
  assert.equal(previewTotals.enrollments, previewEnrollments.length);
});

test("enrollments reference fictional learners and published courses without duplicate pairs", () => {
  const pairs = new Set();
  for (const enrollment of previewEnrollments) {
    assertFields(enrollment, ["id", "studentId", "courseId", "status"]);
    assert.ok(previewStudents.some((student) => student.id === enrollment.studentId));
    assert.ok(previewCourses.some((course) => course.id === enrollment.courseId && course.status === "Published"));
    assert.ok(["In progress", "Not started", "Completed"].includes(enrollment.status));
    const pair = JSON.stringify([enrollment.studentId, enrollment.courseId]);
    assert.ok(!pairs.has(pair), `Duplicate enrollment: ${pair}`);
    pairs.add(pair);
  }
});

test("feedback is explicitly fictional and belongs to an enrolled learner-course pair", () => {
  for (const feedback of previewFeedback) {
    assertFields(feedback, ["id", "studentId", "courseId", "topic", "status", "message"]);
    assertText(feedback.topic);
    assert.match(feedback.message, /^Fictional demo feedback: .+/);
    assert.ok(["New", "Reviewed"].includes(feedback.status));
    assert.ok(previewStudents.some((student) => student.id === feedback.studentId));
    assert.ok(previewCourses.some((course) => course.id === feedback.courseId));
    assert.ok(previewEnrollments.some((enrollment) =>
      enrollment.studentId === feedback.studentId && enrollment.courseId === feedback.courseId));
  }
});

test("fixture records contain no email addresses or calendar dates", () => {
  const serialized = JSON.stringify({ previewStudents, previewCourses, previewLessons, previewEnrollments, previewFeedback });
  assert.doesNotMatch(serialized, /[\w.+-]+@[\w.-]+\.[a-z]{2,}|\b\d{4}-\d{2}-\d{2}\b/i);
});

test("admin source does not import or mutate student progress or request a backend", () => {
  const dirs = ["app/admin", "components/admin", "lib/admin"];
  for (const dir of dirs) {
    const visit = (folder) => {
      for (const entry of fs.readdirSync(folder, { withFileTypes: true })) {
        const filename = path.join(folder, entry.name);
        if (entry.isDirectory()) visit(filename);
        else if (/\.tsx?$/.test(entry.name)) {
          const source = fs.readFileSync(filename, "utf8");
          assert.doesNotMatch(source, /progress-store|localStorage|sessionStorage|\bfetch\s*\(|course-data/, filename);
        }
      }
    };
    visit(path.join(root, dir));
  }
});
