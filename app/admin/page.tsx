import Link from "next/link";
import { AdminIcon } from "@/components/admin/AdminIcon";
import { SectionCard, StatCard, StatusBadge } from "@/components/admin/AdminUI";
import {
  previewCourses,
  previewEnrollments,
  previewStudents,
  previewTotals,
} from "@/lib/admin/mock-data";

export default function AdminOverviewPage() {
  const shownEnrollments = previewEnrollments.slice(0, 6);
  const publishedCourses = previewCourses.filter((course) => course.status === "Published").length;
  const draftCourses = previewCourses.filter((course) => course.status === "Draft").length;

  return (
    <>
      <div className="admin-page-heading admin-overview-heading">
        <div>
          <span className="admin-eyebrow">A BIG PICTURE. A LITTLE CLARITY.</span>
          <h1>Your learning workspace.</h1>
          <p>Bring your learners, lessons, and next steps into focus.</p>
        </div>
        <span className="admin-badge">
          Phase 02 <span aria-hidden="true">·</span> Design preview
        </span>
      </div>

      <section className="admin-welcome" aria-labelledby="admin-welcome-title">
        <div className="admin-welcome-copy">
          <span className="admin-eyebrow">THE LEO WAY</span>
          <h2 id="admin-welcome-title">
            Behind every little win,<br />a thoughtful learning experience.
          </h2>
          <p>Your space to shape what comes next. Explore the workspace with a small, clearly labeled set of sample data.</p>
          <Link href="/admin/courses" className="admin-button admin-button-gold">
            Explore courses <span aria-hidden="true">↗</span>
          </Link>
        </div>
        <div className="admin-welcome-art" aria-hidden="true">
          <span className="admin-art-ring admin-art-ring-outer" />
          <span className="admin-art-ring admin-art-ring-inner" />
          <div className="admin-art-book">
            <svg width="74" height="74" viewBox="0 0 80 80" fill="none">
              <path d="M40 24c-9-6-19-6-29-3v35c10-3 20-3 29 3 9-6 19-6 29-3V21c-10-3-20-3-29 3Z" stroke="currentColor" strokeWidth="3" strokeLinejoin="round" />
              <path d="M40 24v35M20 30l11 2M20 39l11 2M49 32l11-2M49 41l11-2" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
            </svg>
          </div>
          <span className="admin-art-spark">✦</span>
          <span className="admin-art-label">LEARN. GROW. REPEAT.</span>
        </div>
      </section>

      <div className="admin-section-label">
        <h2>Workspace at a glance</h2>
        <span>Synthetic dataset · Not live metrics</span>
      </div>
      <section className="admin-stat-grid" aria-label="Mock dataset totals">
        <StatCard label="Sample students" value={previewTotals.students} icon="students" detail="Fictional learner profiles" />
        <StatCard label="Sample courses" value={previewTotals.courses} icon="courses" detail={`${publishedCourses} published · ${draftCourses} draft`} />
        <StatCard label="Sample lessons" value={previewTotals.lessons} icon="lessons" detail="Across the sample curriculum" />
        <StatCard label="Sample enrollments" value={previewTotals.enrollments} icon="enrollments" detail="Fictional learner-course connections" />
      </section>

      <div className="admin-dashboard-grid">
        <SectionCard
          title="Sample enrollments"
          eyebrow="THE LEARNING JOURNEY"
          action={
            <Link href="/admin/enrollments" className="admin-text-link">
              Enrollments <span aria-hidden="true">↗</span>
            </Link>
          }
        >
          <p className="admin-panel-footnote">
            Showing {shownEnrollments.length} of {previewTotals.enrollments} sample enrollments.
          </p>
          <div className="admin-table-scroll" role="region" aria-label="Sample enrollment table, horizontally scrollable" tabIndex={0}>
            <table className="admin-table">
              <caption className="admin-sr-only">
                First {shownEnrollments.length} of {previewTotals.enrollments} fictional enrollments. These are UI fixtures, not real student records.
              </caption>
              <thead>
                <tr>
                  <th scope="col">Learner</th>
                  <th scope="col">Course</th>
                  <th scope="col">Status</th>
                </tr>
              </thead>
              <tbody>
                {shownEnrollments.map((enrollment, index) => {
                  const student = previewStudents.find((item) => item.id === enrollment.studentId);
                  const course = previewCourses.find((item) => item.id === enrollment.courseId);

                  return (
                    <tr key={enrollment.id}>
                      <td>
                        <div className="admin-learner-cell">
                          <span className="admin-avatar" aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
                          <span>
                            <strong>{student?.name}</strong>
                            <small>{enrollment.id}</small>
                          </span>
                        </div>
                      </td>
                      <td>{course?.title}</td>
                      <td><StatusBadge>{enrollment.status}</StatusBadge></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <p className="admin-panel-footnote">Illustrative records only. No student accounts are connected.</p>
        </SectionCard>

        <SectionCard
          title="A considered curriculum"
          eyebrow="SAMPLE COURSE LIBRARY"
          action={<Link href="/admin/courses" className="admin-icon-link" aria-label="Explore course preview">↗</Link>}
        >
          <div className="admin-course-list">
            {previewCourses.map((course, index) => (
              <article className="admin-course-item" key={course.id}>
                <div className="admin-course-number">{String(index + 1).padStart(2, "0")}</div>
                <div className="admin-course-copy">
                  <h3>{course.title}</h3>
                  <p>{course.level} <span aria-hidden="true">·</span> {course.lessons} lessons</p>
                  <StatusBadge>{course.status}</StatusBadge>
                </div>
              </article>
            ))}
          </div>
          <p className="admin-panel-footnote">Statuses describe mock content, not actual publication.</p>
        </SectionCard>
      </div>

      <SectionCard title="Make room for what’s next." eyebrow="YOUR NEXT STEP" className="admin-next-panel">
        <div className="admin-quick-links">
          {([
            { href: "/admin/students", title: "Meet your learners", text: "Preview the student directory", icon: "students" },
            { href: "/admin/lessons", title: "Shape a lesson", text: "Explore the lesson workspace", icon: "lessons" },
            { href: "/admin/feedback", title: "Keep listening", text: "Visit the feedback workspace", icon: "feedback" },
          ] as const).map((item) => (
            <Link href={item.href} className="admin-quick-link" key={item.href}>
              <span className="admin-quick-icon"><AdminIcon name={item.icon} /></span>
              <span><strong>{item.title}</strong><small>{item.text}</small></span>
              <span className="admin-quick-arrow" aria-hidden="true">↗</span>
            </Link>
          ))}
        </div>
      </SectionCard>
    </>
  );
}
