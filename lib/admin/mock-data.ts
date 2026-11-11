import type {
  PreviewCourse,
  PreviewEnrollment,
  PreviewFeedback,
  PreviewLesson,
  PreviewStudent,
} from "./types";

export type {
  PreviewCourse,
  PreviewEnrollment,
  PreviewFeedback,
  PreviewLesson,
  PreviewStudent,
} from "./types";

// Entirely fictional UI fixtures. Not derived from student progress or a backend.
// Names, goals, and feedback are authored examples, never real submissions.
export const previewStudents: PreviewStudent[] = [
  { id: "learner-01", name: "Demo learner 01", level: "A2 · Elementary", goals: ["Start friendly conversations", "Ask follow-up questions"] },
  { id: "learner-02", name: "Demo learner 02", level: "B1 · Intermediate", goals: ["Explain work tasks clearly"] },
  { id: "learner-03", name: "Demo learner 03", level: "A2 · Elementary", goals: ["Talk about everyday routines"] },
  { id: "learner-04", name: "Demo learner 04", level: "B1 · Intermediate", goals: ["Contribute to team discussions"] },
  { id: "learner-05", name: "Demo learner 05", level: "A2 · Elementary", goals: ["Order with confidence"] },
  { id: "learner-06", name: "Demo learner 06", level: "A2 · Elementary", goals: ["Describe interests", "Keep a conversation going"] },
  { id: "learner-07", name: "Demo learner 07", level: "B1 · Intermediate", goals: ["Give a short presentation"] },
  { id: "learner-08", name: "Demo learner 08", level: "A2 · Elementary", goals: ["Understand short spoken messages"] },
  { id: "learner-09", name: "Demo learner 09", level: "A2 · Elementary", goals: ["Hear key words in conversations"] },
  { id: "learner-10", name: "Demo learner 10", level: "B1 · Intermediate", goals: ["Write helpful work messages"] },
  { id: "learner-11", name: "Demo learner 11", level: "A2 · Elementary", goals: ["Ask for clarification politely"] },
  { id: "learner-12", name: "Demo learner 12", level: "A2 · Elementary", goals: ["Follow simple directions"] },
];

export const previewLessons: PreviewLesson[] = [
  { id: "everyday-01", courseId: "everyday", title: "A warm hello", order: 1, minutes: 8, objective: "Greet someone and introduce yourself.", exerciseType: "Dialogue practice" },
  { id: "everyday-02", courseId: "everyday", title: "Your everyday rhythm", order: 2, minutes: 10, objective: "Describe a simple daily routine.", exerciseType: "Sentence building" },
  { id: "everyday-03", courseId: "everyday", title: "A little café chat", order: 3, minutes: 12, objective: "Order a drink and ask about the menu.", exerciseType: "Role play" },
  { id: "everyday-04", courseId: "everyday", title: "Things we enjoy", order: 4, minutes: 9, objective: "Share interests and ask a follow-up question.", exerciseType: "Speaking prompts" },
  { id: "everyday-05", courseId: "everyday", title: "Make a small plan", order: 5, minutes: 11, objective: "Suggest an activity and agree on a meeting place.", exerciseType: "Dialogue practice" },
  { id: "work-01", courseId: "work", title: "Meet the team", order: 1, minutes: 10, objective: "Introduce your role and ask about a colleague's tasks.", exerciseType: "Role play" },
  { id: "work-02", courseId: "work", title: "A clear little update", order: 2, minutes: 12, objective: "Summarize a task and its next step.", exerciseType: "Speaking prompts" },
  { id: "work-03", courseId: "work", title: "Ask for a hand", order: 3, minutes: 8, objective: "Request help politely and explain what you need.", exerciseType: "Sentence building" },
  { id: "work-04", courseId: "work", title: "Messages that help", order: 4, minutes: 14, objective: "Write a brief message with a clear request.", exerciseType: "Guided writing" },
  { id: "work-05", courseId: "work", title: "Your voice in a meeting", order: 5, minutes: 15, objective: "Offer an idea and respond to another suggestion.", exerciseType: "Role play" },
  { id: "listening-01", courseId: "listening", title: "Catch the main idea", order: 1, minutes: 7, objective: "Identify the topic of a short conversation.", exerciseType: "Listening choice" },
  { id: "listening-02", courseId: "listening", title: "Listen for the little details", order: 2, minutes: 10, objective: "Pick out quantities and locations in a spoken message.", exerciseType: "Listening match" },
  { id: "listening-03", courseId: "listening", title: "One more time, please", order: 3, minutes: 8, objective: "Ask a speaker to repeat or clarify a phrase.", exerciseType: "Dialogue practice" },
  { id: "listening-04", courseId: "listening", title: "Follow the next step", order: 4, minutes: 12, objective: "Put simple spoken instructions in order.", exerciseType: "Sequence sorting" },
  { id: "listening-05", courseId: "listening", title: "Hear how they feel", order: 5, minutes: 9, objective: "Recognize friendly and uncertain tones in short replies.", exerciseType: "Listening choice" },
  { id: "travel-01", courseId: "travel", title: "Find your way", order: 1, minutes: 10, objective: "Ask for directions to a nearby place.", exerciseType: "Role play" },
  { id: "travel-02", courseId: "travel", title: "A ticket to explore", order: 2, minutes: 11, objective: "Ask about a route and choose a ticket.", exerciseType: "Dialogue practice" },
  { id: "travel-03", courseId: "travel", title: "Settle in gently", order: 3, minutes: 12, objective: "Ask simple questions about a room and its facilities.", exerciseType: "Speaking prompts" },
  { id: "travel-04", courseId: "travel", title: "A small discovery", order: 4, minutes: 9, objective: "Ask for a local recommendation and say thank you.", exerciseType: "Role play" },
];

const courseSamples: Omit<PreviewCourse, "lessons">[] = [
  { id: "everyday", title: "Everyday conversations", description: "Small, friendly exchanges for a little more confidence each day.", level: "A2 · Elementary", status: "Published" },
  { id: "work", title: "English at work", description: "Thoughtful practice for clear messages and a confident team voice.", level: "B1 · Intermediate", status: "Published" },
  { id: "listening", title: "Little listening wins", description: "Make room for the main idea, the details, and the next step.", level: "A2 · Elementary", status: "Published" },
  { id: "travel", title: "A little travel English", description: "Gentle first steps for finding your way and exploring somewhere new.", level: "A1 · Beginner", status: "Draft" },
];

export const previewCourses: PreviewCourse[] = courseSamples.map((course) => ({
  ...course,
  lessons: previewLessons.filter((lesson) => lesson.courseId === course.id).length,
}));

export const previewEnrollments: PreviewEnrollment[] = [
  { id: "DEMO-001", studentId: "learner-01", courseId: "everyday", status: "In progress" },
  { id: "DEMO-002", studentId: "learner-02", courseId: "work", status: "Not started" },
  { id: "DEMO-003", studentId: "learner-03", courseId: "everyday", status: "Completed" },
  { id: "DEMO-004", studentId: "learner-04", courseId: "work", status: "In progress" },
  { id: "DEMO-005", studentId: "learner-05", courseId: "everyday", status: "Not started" },
  { id: "DEMO-006", studentId: "learner-06", courseId: "everyday", status: "In progress" },
  { id: "DEMO-007", studentId: "learner-07", courseId: "work", status: "In progress" },
  { id: "DEMO-008", studentId: "learner-08", courseId: "listening", status: "Completed" },
  { id: "DEMO-009", studentId: "learner-09", courseId: "listening", status: "In progress" },
  { id: "DEMO-010", studentId: "learner-10", courseId: "work", status: "Not started" },
  { id: "DEMO-011", studentId: "learner-11", courseId: "listening", status: "In progress" },
  { id: "DEMO-012", studentId: "learner-12", courseId: "listening", status: "Not started" },
  { id: "DEMO-013", studentId: "learner-01", courseId: "listening", status: "Not started" },
  { id: "DEMO-014", studentId: "learner-08", courseId: "everyday", status: "In progress" },
];

export const previewFeedback: PreviewFeedback[] = [
  { id: "feedback-01", studentId: "learner-01", courseId: "everyday", topic: "Conversation practice", status: "New", message: "Fictional demo feedback: another café dialogue could offer a helpful next step." },
  { id: "feedback-02", studentId: "learner-03", courseId: "everyday", topic: "Lesson pacing", status: "Reviewed", message: "Fictional demo feedback: the short routine practice is an example of a comfortable pace." },
  { id: "feedback-03", studentId: "learner-04", courseId: "work", topic: "Meeting practice", status: "New", message: "Fictional demo feedback: a second meeting role play could add variety." },
  { id: "feedback-04", studentId: "learner-06", courseId: "everyday", topic: "Speaking prompts", status: "Reviewed", message: "Fictional demo feedback: extra interest prompts could support longer exchanges." },
  { id: "feedback-05", studentId: "learner-07", courseId: "work", topic: "Clear updates", status: "New", message: "Fictional demo feedback: a model task update could make the objective clearer." },
  { id: "feedback-06", studentId: "learner-08", courseId: "listening", topic: "Listening details", status: "Reviewed", message: "Fictional demo feedback: another short listening example could reinforce key words." },
  { id: "feedback-07", studentId: "learner-09", courseId: "listening", topic: "Instructions", status: "New", message: "Fictional demo feedback: an extra sequence activity could offer useful repetition." },
  { id: "feedback-08", studentId: "learner-11", courseId: "listening", topic: "Clarification", status: "Reviewed", message: "Fictional demo feedback: a polite clarification phrase card could be a useful recap." },
];

export const previewTotals = {
  students: previewStudents.length,
  courses: previewCourses.length,
  lessons: previewLessons.length,
  enrollments: previewEnrollments.length,
};
