// ============================================================
//  TA Task Board — Data File
//  Edit this file to update the website.
//  Fields:
//    id          : task number
//    title       : task name (Thai or English)
//    category    : "Employment Process" or "System Maintenance"
//    status      : "todo" or "done"
//    type        : "task" or "meeting"
//    due_date    : "YYYY-MM-DD" or "" for none
//    time        : "10:00 AM" or "" (for meetings)
//    location    : "Room 315" or "" (for meetings)
//    description : details
// ============================================================

const TASKS = [
  {
    id: 1,
    title: "Review application process on EMS system",
    category: "System Maintenance",
    status: "todo",
    type: "task",
    due_date: "",
    time: "",
    location: "",
    description: "Review the TA application process on the EMS system to ensure it is functioning correctly and meets current requirements."
  },
  {
    id: 2,
    title: "Review process \"การแต่งตั้ง\" of each TA type",
    category: "System Maintenance",
    status: "todo",
    type: "task",
    due_date: "",
    time: "",
    location: "",
    description: "Review the appointment (การแต่งตั้ง) process for each TA type to ensure procedures are correct and up to date."
  },
  {
    id: 3,
    title: "Review รายการเอกสารประกอบการสมัคร",
    category: "System Maintenance",
    status: "todo",
    type: "task",
    due_date: "",
    time: "",
    location: "",
    description: "Review the list of required application documents (รายการเอกสารประกอบการสมัคร) to ensure completeness and accuracy."
  },
  {
    id: 4,
    title: "ทำประกาศรับสมัคร",
    category: "Employment Process",
    status: "done",
    type: "task",
    due_date: "2026-05-11",
    time: "",
    location: "",
    description: "Prepare and publish the TA recruitment announcement (ประกาศรับสมัคร) for the upcoming semester."
  },
  {
    id: 5,
    title: "ทำประกาศทุน TA สำหรับ Summer",
    category: "Employment Process",
    status: "done",
    type: "task",
    due_date: "",
    time: "",
    location: "",
    description: "Prepare and publish the TA scholarship announcement (ประกาศทุน TA) for the Summer semester."
  },
  {
    id: 6,
    title: "ทำร่าง TOR ฉบับใหม่แยกตามรายตำแหน่ง (ระบุวิชาและ section)",
    category: "System Maintenance",
    status: "todo",
    type: "task",
    due_date: "2026-05-26",
    time: "",
    location: "",
    description: "Draft a new TOR (Terms of Reference) separated by position, specifying subject and section for each role."
  },
  {
    id: 7,
    title: "ทำข้อมูลชั่วโมงการจ้างแยกตามวิชา เพื่อดูแนวโน้มจำนวนการใช้เงิน",
    category: "System Maintenance",
    status: "todo",
    type: "task",
    due_date: "2026-05-26",
    time: "",
    location: "",
    description: "Compile employment hours data separated by subject to analyze spending trends and budget usage patterns."
  },
  {
    id: 8,
    title: "ตรวจสอบตารางสอนสาขา DG เพื่อดูโอกาสการจ้าง TA นักศึกษา",
    category: "System Maintenance",
    status: "todo",
    type: "task",
    due_date: "2026-05-26",
    time: "",
    location: "",
    description: "Review the DG department teaching schedule to identify opportunities for hiring student TAs."
  },
  {
    id: 9,
    title: "ทำ Flow การทำงานโดยมีข้อมูลวันที่ตามปฏิทินการศึกษา กิจกรรม ระยะเวลา และเอกสารที่เกี่ยวข้อง",
    category: "System Maintenance",
    status: "todo",
    type: "task",
    due_date: "2026-05-26",
    time: "",
    location: "",
    description: "Create a workflow diagram with academic calendar dates, activities, duration, and related documents (document numbers or links)."
  },
  {
    id: 10,
    title: "ทำระบบประเมิน รับ Feedback จากอาจารย์",
    category: "System Maintenance",
    status: "todo",
    type: "task",
    due_date: "",
    time: "",
    location: "",
    description: "Build an anonymous TA evaluation system for instructors. Measures knowledge level, communication, and problem-solving of TAs. Instructor names hidden; visible only to faculty. Includes a consent form."
  },
  {
    id: 11,
    title: "ปรับเอกสารเบิกเป็นแนวนอน",
    category: "System Maintenance",
    status: "todo",
    type: "task",
    due_date: "",
    time: "",
    location: "",
    description: "Reformat the expense reimbursement document to landscape (horizontal) orientation."
  },
  {
    id: 12,
    title: "Meeting to create workflow",
    category: "System Maintenance",
    status: "todo",
    type: "meeting",
    due_date: "2026-05-28",
    time: "10:00 AM",
    location: "Room 315",
    description: "Meeting scheduled to work on creating the TA employment workflow (related to task #9)."
  }
];
