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
const { previewStudents, previewCourses, previewEnrollments, previewTotals } = loadFixtureModule("mock-data.ts");
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

test("headline totals are derived from the synthetic fixtures", () => {
  assert.equal(previewTotals.students, previewStudents.length);
  assert.equal(previewTotals.courses, previewCourses.length);
  assert.equal(previewTotals.lessons, previewCourses.reduce((sum, course) => sum + course.lessons, 0));
  assert.equal(previewTotals.enrollments, previewEnrollments.length);
  assert.equal(previewCourses.filter((course) => course.status === "Published").length, 2);
  assert.equal(previewCourses.filter((course) => course.status === "Draft").length, 1);
});

test("enrollments reference valid fictional learners and published sample courses", () => {
  assert.equal(new Set(previewEnrollments.map((item) => item.id)).size, previewEnrollments.length);
  for (const enrollment of previewEnrollments) {
    assert.ok(previewStudents.includes(enrollment.studentId));
    assert.match(enrollment.studentId, /^Demo learner \d{2}$/);
    assert.ok(previewCourses.some((course) => course.id === enrollment.courseId && course.status === "Published"));
  }
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
