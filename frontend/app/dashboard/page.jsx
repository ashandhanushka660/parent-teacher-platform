"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const API_BASE = (process.env.NEXT_PUBLIC_API_URL || "").replace(/\/$/, "");
const apiFetch = (path, options) => fetch(`${API_BASE}${path}`, options);

function TrendGraph({ title, values, color }) {
  const points = values.length > 1
    ? values.map((value, index) => `${(index / (values.length - 1)) * 100},${100 - value}`).join(" ")
    : "0,100 100,100";

  return (
    <div className="rounded-lg border border-blue-200 bg-blue-50/70 p-3">
      <div className="mb-2 flex items-center justify-between text-xs font-bold text-slate-700">
        <span>{title}</span>
        <span className="font-mono text-[10px] text-slate-500">0-100%</span>
      </div>
      <svg viewBox="0 0 100 100" className="h-32 w-full" role="img" aria-label={title} preserveAspectRatio="none">
        <path d="M0 25H100M0 50H100M0 75H100" stroke="#bfdbfe" strokeWidth="0.6" />
        <polyline points={points} fill="none" stroke={color} strokeWidth="2.5" vectorEffect="non-scaling-stroke" />
        {values.map((value, index) => (
          <circle key={index} cx={values.length > 1 ? (index / (values.length - 1)) * 100 : 50} cy={100 - value} r="2" fill={color} />
        ))}
      </svg>
    </div>
  );
}

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [studentData, setStudentData] = useState(null);
  const [teacherStudentData, setTeacherStudentData] = useState(null);
  const [studentsList, setStudentsList] = useState([]);
  const [teachersList, setTeachersList] = useState([]);
  const [allAttendanceList, setAllAttendanceList] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);

  // TEACHER DYNAMIC EXAM TEMPLATE STATE
  const [examTypesList, setExamTypesList] = useState(["TERM_TEST", "MONTHLY_TEST", "QUIZ"]);
  const [examTemplateName, setExamTemplateName] = useState("TERM_TEST");
  const [customExamName, setCustomExamName] = useState("");
  const [examDate, setExamDate] = useState(new Date().toISOString().split("T")[0]);

  const [templateSubjects, setTemplateSubjects] = useState([
    { id: "s1", name: "Mathematics", max: 100 },
    { id: "s2", name: "Science", max: 100 }
  ]);
  const [newSubjectName, setNewSubjectName] = useState("");
  const [newSubjectMax, setNewSubjectMax] = useState(100);

  const [studentSearchQuery, setStudentSearchQuery] = useState("");
  const [selectedStudentForMarks, setSelectedStudentForMarks] = useState(null);
  const [marksEntries, setMarksEntries] = useState({});
  const [isSubmittingBatch, setIsSubmittingBatch] = useState(false);

  // Other Teacher Forms
  const [attendanceForm, setAttendanceForm] = useState({ studentUsername: "", date: new Date().toISOString().split("T")[0], status: "PRESENT", remarks: "On time" });
  const [extraForm, setExtraForm] = useState({ studentUsername: "", activityName: "", category: "SPORTS", achievementLevel: "Participant", teacherRemarks: "" });
  const [assignmentForm, setAssignmentForm] = useState({ title: "", subject: "Science", description: "", deadline: new Date().toISOString().split("T")[0] });
  const [assignments, setAssignments] = useState([]);

  // Teacher Inbox & Chat State
  const [teacherInbox, setTeacherInbox] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [teacherSearchQuery, setTeacherSearchQuery] = useState("");
  const [selectedTeachers, setSelectedTeachers] = useState([]);
  const [parentDirectMessage, setParentDirectMessage] = useState("");
  const [sendingMessage, setSendingMessage] = useState(false);
  const [messageSuccess, setMessageSuccess] = useState("");

  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (!storedUser) {
      router.push("/login");
    } else {
      const parsed = JSON.parse(storedUser);
      setUser(parsed);

      const targetId = parsed.role === "ROLE_STUDENT" ? parsed.userId : parsed.linkedStudentId;
      if (targetId) fetchStudentData(targetId);

      if (parsed.role === "ROLE_TEACHER") {
        fetchStudentsList();
        fetchAllAttendance();
        fetchTeacherInbox(parsed.userId);
        fetchExamTypes();
      }

      fetchTeachersList();
      fetchAssignments();
      fetchLeaderboard();
      fetchNotices();
    }
  }, [router]);

  const fetchExamTypes = async () => {
    try {
      const res = await apiFetch("/api/academic/exam-types");
      if (res.ok) setExamTypesList(await res.json());
    } catch (e) { console.error(e); }
  };

  const fetchLeaderboard = async () => {
    try {
      const res = await apiFetch("/api/academic/leaderboard");
      if (res.ok) setLeaderboard(await res.json());
    } catch (e) { console.error(e); }
  };

  const fetchStudentData = async (studentId) => {
    try {
      const res = await apiFetch(`/api/academic/student-data/${studentId}`);
      if (res.ok) setStudentData(await res.json());
    } catch (e) { console.error(e); }
  };

  const fetchTeacherStudentData = async (studentId) => {
    try {
      const res = await apiFetch(`/api/academic/student-data/${studentId}`);
      if (res.ok) setTeacherStudentData(await res.json());
    } catch (e) { console.error(e); }
  };

  const fetchNotices = async () => {
    try {
      const res = await apiFetch("/api/academic/notices");
      if (res.ok) setMessages(await res.json());
    } catch (e) { console.error(e); }
  };

  const fetchStudentsList = async () => {
    try {
      const res = await apiFetch("/api/academic/students");
      if (res.ok) {
        const data = await res.json();
        setStudentsList(data);
        if (data.length > 0) {
          setAttendanceForm(prev => ({ ...prev, studentUsername: data[0].studentId }));
          setExtraForm(prev => ({ ...prev, studentUsername: data[0].studentId }));
        }
      }
    } catch (e) { console.error(e); }
  };

  const fetchTeachersList = async () => {
    try {
      const res = await apiFetch("/api/academic/teachers");
      if (res.ok) setTeachersList(await res.json());
    } catch (e) { console.error(e); }
  };

  const fetchAllAttendance = async () => {
    try {
      const res = await apiFetch("/api/academic/all-attendance");
      if (res.ok) setAllAttendanceList(await res.json());
    } catch (e) { console.error(e); }
  };

  const fetchTeacherInbox = async (tId) => {
    try {
      const res = await apiFetch(`/api/academic/teacher-inbox/${tId}`);
      if (res.ok) {
        const data = await res.json();
        setTeacherInbox(data.messages || []);
        setUnreadCount(data.unreadCount || 0);
      }
    } catch (e) { console.error(e); }
  };

  const fetchAssignments = async () => {
    try {
      const res = await apiFetch("/api/academic/assignments");
      if (res.ok) setAssignments(await res.json());
    } catch (e) { console.error(e); }
  };

  // TEACHER DYNAMIC TEMPLATE FUNCTIONS
  const handleAddSubjectToTemplate = () => {
    if (!newSubjectName.trim()) return;
    setTemplateSubjects([...templateSubjects, { id: Date.now().toString(), name: newSubjectName.trim(), max: newSubjectMax }]);
    setNewSubjectName("");
  };

  const updateSubjectMax = (id, value) => {
    setTemplateSubjects(prev => prev.map(subject => subject.id === id ? { ...subject, max: value } : subject));
  };

  const moveSubject = (index, dir) => {
    const newItems = [...templateSubjects];
    if (dir === 'up' && index > 0) {
      [newItems[index - 1], newItems[index]] = [newItems[index], newItems[index - 1]];
    } else if (dir === 'down' && index < newItems.length - 1) {
      [newItems[index + 1], newItems[index]] = [newItems[index], newItems[index + 1]];
    }
    setTemplateSubjects(newItems);
  };

  const removeSubject = (index) => {
    setTemplateSubjects(templateSubjects.filter((_, i) => i !== index));
  };

  const handleMarkInputChange = (id, value) => {
    setMarksEntries({ ...marksEntries, [id]: value });
  };

  const handleMarksKeyDown = (e, index) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const nextInput = document.getElementById(`mark-input-${index + 1}`);
      if (nextInput) {
        nextInput.focus();
      } else {
        document.getElementById("submit-batch-btn").focus();
      }
    }
  };

  const submitBatchMarks = async () => {
    if (!selectedStudentForMarks) return alert("Select a student from the list first.");
    if (templateSubjects.length === 0) return alert("Your template has no subjects.");

    const finalExamType = examTemplateName === "OTHER" 
      ? (customExamName.trim() ? customExamName.trim().toUpperCase().replace(/\s+/g, "_") : "CUSTOM_TEST") 
      : examTemplateName;

    const invalidSubject = templateSubjects.find(sub => {
      const max = Number(sub.max);
      const marks = Number(marksEntries[sub.id] || 0);
      return !Number.isFinite(max) || max <= 0 || marks < 0 || marks > max;
    });
    if (invalidSubject) return alert(`Marks for ${invalidSubject.name} must be between 0 and its maximum marks.`);

    const payload = templateSubjects.map(sub => ({
      studentUsername: selectedStudentForMarks.studentId,
      subject: sub.name,
      examType: finalExamType,
      marks: parseFloat(marksEntries[sub.id] || 0),
      maxMarks: parseFloat(sub.max),
      evaluationDate: examDate,
      teacherFeedback: ""
    }));

    setIsSubmittingBatch(true);
    try {
      const res = await apiFetch("/api/academic/marks/batch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        alert(`Successfully inserted ${payload.length} marks for ${selectedStudentForMarks.fullName}!`);
        
        // Add new custom exam to dropdown dynamically
        if (examTemplateName === "OTHER" && customExamName.trim()) {
          setExamTypesList(prev => [...new Set([...prev, finalExamType])]);
          setExamTemplateName(finalExamType);
          setCustomExamName("");
        }

        setMarksEntries({});
        setSelectedStudentForMarks(null);
        setStudentSearchQuery("");
        fetchLeaderboard();
      }
    } catch (e) {
      console.error(e);
      alert("Failed to submit marks.");
    } finally {
      setIsSubmittingBatch(false);
    }
  };

  const handlePostAttendance = async (e) => {
    e.preventDefault();
    if (!attendanceForm.studentUsername) return alert("Select or enter a Student ID.");
    await apiFetch("/api/academic/attendance", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(attendanceForm)
    });
    alert("Attendance recorded!");
    fetchAllAttendance();
  };

  const handlePostExtra = async (e) => {
    e.preventDefault();
    if (!extraForm.studentUsername) return alert("Select or enter a Student ID.");
    await apiFetch("/api/academic/extracurricular", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(extraForm)
    });
    alert("Extracurricular recorded!");
  };

  const handlePostAssignment = async (e) => {
    e.preventDefault();
    await apiFetch("/api/academic/assignments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(assignmentForm)
    });
    alert("Assignment broadcasted!");
    fetchAssignments();
  };

  const toggleTeacherSelection = (tId) => {
    setSelectedTeachers(prev => prev.includes(tId) ? prev.filter(id => id !== tId) : [...prev, tId]);
  };

  const handleSendParentDirectMessage = async (e) => {
    e.preventDefault();
    if (selectedTeachers.length === 0) return alert("Select at least one teacher.");
    if (!parentDirectMessage.trim()) return;

    setSendingMessage(true);
    setMessageSuccess("");

    try {
      const res = await apiFetch("/api/academic/direct-messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          senderId: user.userId,
          senderName: user.fullName,
          teacherIds: selectedTeachers,
          message: parentDirectMessage
        })
      });

      if (res.ok) {
        setMessageSuccess(`✓ Direct message sent to ${selectedTeachers.length} selected teacher(s)!`);
        setParentDirectMessage("");
        setSelectedTeachers([]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSendingMessage(false);
    }
  };

  const handleMarkAsRead = async (messageId) => {
    await apiFetch(`/api/academic/mark-message-read/${messageId}`, { method: "POST" });
    if (user?.userId) fetchTeacherInbox(user.userId);
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    const res = await apiFetch("/api/academic/notices", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ authorId: user.userId, authorName: user.fullName, message: newMessage })
    });
    if (res.ok) {
      setNewMessage("");
      fetchNotices();
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    router.push("/login");
  };

  if (!user) return null;

  const filteredTeachers = teachersList.filter(t =>
    t.fullName.toLowerCase().includes(teacherSearchQuery.toLowerCase()) ||
    t.teacherId.toLowerCase().includes(teacherSearchQuery.toLowerCase()) ||
    t.subjectSpecialization.toLowerCase().includes(teacherSearchQuery.toLowerCase())
  );

  const filteredStudents = studentsList.filter(s => 
    s.fullName.toLowerCase().includes(studentSearchQuery.toLowerCase()) ||
    s.studentId.toLowerCase().includes(studentSearchQuery.toLowerCase())
  );

  const analyticsData = user.role === "ROLE_TEACHER" ? teacherStudentData : studentData;

  const marksTimeline = (analyticsData?.marks || []).map((m, idx) => ({
    label: m.subject.length > 8 ? m.subject.substring(0, 8) + ".." : m.subject,
    fullSubject: m.subject,
    examType: m.examType,
    score: Math.round((m.marks / m.maxMarks) * 100),
    rawMarks: m.marks,
    maxMarks: m.maxMarks,
    date: m.evaluationDate || `Eval ${idx + 1}`
  }));

  const extraTimeline = (analyticsData?.extracurriculars || []).map((e, idx) => {
    const levelScore = e.achievementLevel.includes("Gold") || e.achievementLevel.includes("Captain") ? 95 :
                       e.achievementLevel.includes("Silver") || e.achievementLevel.includes("Prefect") ? 85 :
                       e.achievementLevel.includes("Bronze") || e.achievementLevel.includes("Member") ? 75 : 65;
    return {
      activity: e.activityName,
      category: e.category,
      level: e.achievementLevel,
      score: levelScore,
      date: e.activityDate || `Term ${idx + 1}`
    };
  });

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col justify-between font-sans">
      <div>
        {/* HEADER */}
        <header className="border-b border-slate-200 bg-white px-6 py-4 flex justify-between items-center shadow-sm">
          <div>
            <h1 className="text-xl font-bold tracking-wide text-indigo-700">Parent-Teacher Interactivity Platform</h1>
            <span className="text-xs text-emerald-600 font-mono font-semibold">● Zero-Trust Subnet Verified</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right text-xs">
              <p className="font-semibold text-slate-800">{user.fullName}</p>
              <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-indigo-50 text-indigo-700 border border-indigo-200 font-mono">
                {user.userId} ({user.role.replace("ROLE_", "")})
              </span>
            </div>
            <button
              onClick={handleLogout}
              className="rounded-lg bg-rose-50 border border-rose-200 px-3 py-1.5 text-xs font-semibold text-rose-700 hover:bg-rose-100 transition"
            >
              Sign Out
            </button>
          </div>
        </header>

        <div className="bg-indigo-50 border-b border-indigo-200 px-6 py-2.5 text-center text-xs text-indigo-800">
          ✨ <span className="font-semibold">Dedication:</span> In memory of my school principal A.M. Karunarathne (RIS)
        </div>

        <main className="max-w-6xl mx-auto p-6 space-y-6">

          {/* ACADEMIC BILLBOARD */}
          <div className="rounded-2xl border border-amber-200 bg-white p-6 shadow-md space-y-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-amber-50 rounded-full blur-3xl opacity-50 -mr-20 -mt-20"></div>
            <div className="flex justify-between items-center border-b border-slate-100 pb-4 relative z-10">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-amber-600 font-mono">Institutional Achievement Billboard</span>
                <h2 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2">🏆 Term Academic Leaderboard</h2>
              </div>
              <button onClick={fetchLeaderboard} className="text-xs font-semibold text-blue-700 hover:underline">↻ Refresh Rankings</button>
            </div>

            {/* Top 3 Podium Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 relative z-10">
              <div className="order-2 md:order-1 rounded-xl border border-slate-200 bg-slate-50 p-5 text-center shadow-sm">
                <span className="text-3xl block mb-1">🥈</span>
                <span className="text-[11px] font-bold text-slate-500 font-mono uppercase">2nd Place</span>
                <p className="text-base font-bold text-slate-800 mt-1">{leaderboard[1]?.fullName || "Kavindi Jayawardena"}</p>
                <p className="text-xs font-mono text-indigo-600">{leaderboard[1]?.studentId || "S-1002"} ({leaderboard[1]?.gender || "Daughter"})</p>
                <div className="mt-3 bg-white rounded-lg py-1.5 px-3 inline-block border border-slate-200 shadow-sm">
                  <span className="text-xs text-slate-500 font-semibold">Average: </span>
                  <span className="text-sm font-bold text-emerald-600">{leaderboard[1]?.averageScore || "90.0"}%</span>
                </div>
              </div>

              <div className="order-1 md:order-2 rounded-xl border border-amber-300 bg-amber-50 p-6 text-center shadow-md scale-105">
                <span className="text-4xl block mb-1">🥇</span>
                <span className="text-xs font-bold text-amber-700 font-mono uppercase tracking-wide">Class Champion</span>
                <p className="text-lg font-extrabold text-amber-900 mt-1">{leaderboard[0]?.fullName || "Naveen Fernando"}</p>
                <p className="text-xs font-mono text-amber-700">{leaderboard[0]?.studentId || "S-1001"} ({leaderboard[0]?.gender || "Son"})</p>
                <div className="mt-3 bg-white rounded-lg py-1.5 px-4 inline-block border border-amber-200 shadow-sm">
                  <span className="text-xs text-amber-700 font-semibold">Average: </span>
                  <span className="text-base font-extrabold text-amber-600">{leaderboard[0]?.averageScore || "95.0"}%</span>
                </div>
              </div>

              <div className="order-3 md:order-3 rounded-xl border border-slate-200 bg-slate-50 p-5 text-center shadow-sm">
                <span className="text-3xl block mb-1">🥉</span>
                <span className="text-[11px] font-bold text-amber-700 font-mono uppercase">3rd Place</span>
                <p className="text-base font-bold text-slate-800 mt-1">{leaderboard[2]?.fullName || "Sachithra Bandara"}</p>
                <p className="text-xs font-mono text-indigo-600">{leaderboard[2]?.studentId || "S-1003"} ({leaderboard[2]?.gender || "Son"})</p>
                <div className="mt-3 bg-white rounded-lg py-1.5 px-3 inline-block border border-slate-200 shadow-sm">
                  <span className="text-xs text-slate-500 font-semibold">Average: </span>
                  <span className="text-sm font-bold text-emerald-600">{leaderboard[2]?.averageScore || "83.3"}%</span>
                </div>
              </div>
            </div>

            <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white relative z-10">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-50 uppercase text-[10px] font-bold text-slate-500 border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-4 w-16">Position</th>
                    <th className="py-2.5 px-4">Student ID</th>
                    <th className="py-2.5 px-4">Student Name</th>
                    <th className="py-2.5 px-4">Relationship</th>
                    <th className="py-2.5 px-4">Evaluated Subjects</th>
                    <th className="py-2.5 px-4 text-right">Cumulative Average</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {leaderboard.map((item) => (
                    <tr key={item.studentId} className="hover:bg-slate-50 transition">
                      <td className="py-2.5 px-4 font-bold text-sm text-slate-900">
                        {item.rank === 1 ? "🥇 1st" : item.rank === 2 ? "🥈 2nd" : item.rank === 3 ? "🥉 3rd" : `#${item.rank}`}
                      </td>
                      <td className="py-2.5 px-4 font-mono font-bold text-indigo-600">{item.studentId}</td>
                      <td className="py-2.5 px-4 font-semibold text-slate-800">{item.fullName}</td>
                      <td className="py-2.5 px-4 text-indigo-600 font-semibold">{item.gender || "Son"}</td>
                      <td className="py-2.5 px-4 text-slate-500">{item.subjectsCount} Subjects Recorded</td>
                      <td className="py-2.5 px-4 text-right font-bold text-emerald-600 font-mono text-sm">{item.averageScore}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* TEACHER DYNAMIC MATRIX OVERHAUL */}
          {user.role === "ROLE_TEACHER" && (
            <div className="space-y-6">
              <div className="rounded-xl border border-indigo-200 bg-white p-6 shadow-md">
                <h2 className="text-xl font-bold text-indigo-700 mb-6 border-b border-slate-100 pb-3">
                  Dynamic Teacher Assessment Matrix
                </h2>
                
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                  
                  {/* LEFT COLUMN: Template Builder */}
                  <div className="lg:col-span-4 bg-slate-50 rounded-xl p-5 border border-slate-200 space-y-4 shadow-inner">
                    <div>
                      <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2 mb-1">
                        🛠️ Exam Template Builder
                      </h3>
                      <p className="text-[10px] text-slate-500 mb-3">Select exam date, dynamic test type, and subject order.</p>
                      
                      {/* DYNAMIC DROPDOWN FOR ASSESSMENT NAME AND DATE PICKER */}
                      <label className="block text-xs font-semibold text-slate-600 mb-1">Assessment Name & Date</label>
                      <div className="flex gap-2 mb-3">
                        <select 
                          className="flex-1 bg-white border border-slate-300 rounded p-2 text-xs font-bold focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none" 
                          value={examTemplateName} 
                          onChange={(e) => setExamTemplateName(e.target.value)} 
                        >
                          {examTypesList.map(type => (
                            <option key={type} value={type}>{type.replace(/_/g, " ")}</option>
                          ))}
                          <option value="OTHER">Other (Specify Custom Name)</option>
                        </select>
                        <input
                          type="date"
                          className="w-32 bg-white border border-slate-300 rounded p-2 text-xs font-bold text-slate-600 outline-none focus:border-indigo-500"
                          value={examDate}
                          onChange={(e) => setExamDate(e.target.value)}
                        />
                      </div>

                      {/* Custom Name Input if OTHER is selected */}
                      {examTemplateName === "OTHER" && (
                        <input 
                          type="text" 
                          placeholder="Enter Custom Assessment Name..."
                          className="w-full bg-white border border-indigo-300 rounded p-2 text-xs font-bold focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none mb-3" 
                          value={customExamName} 
                          onChange={(e) => setCustomExamName(e.target.value)} 
                        />
                      )}
                    </div>

                    <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-sm space-y-2">
                      <label className="block text-[10px] font-bold uppercase text-slate-500">Add New Subject to Order</label>
                      <div className="flex gap-2">
                        <input 
                          type="text" 
                          className="flex-1 bg-slate-50 border border-slate-300 rounded px-2 py-1.5 text-xs outline-none focus:border-indigo-500" 
                          placeholder="Subject Name" 
                          value={newSubjectName} 
                          onChange={(e) => setNewSubjectName(e.target.value)}
                        />
                        <input 
                          type="number" 
                          className="w-16 bg-slate-50 border border-slate-300 rounded px-2 py-1.5 text-xs outline-none focus:border-indigo-500" 
                          placeholder="Max" 
                          value={newSubjectMax} 
                          onChange={(e) => setNewSubjectMax(e.target.value)}
                        />
                      </div>
                      <button onClick={handleAddSubjectToTemplate} className="w-full bg-slate-200 hover:bg-slate-300 text-slate-800 text-[11px] font-bold py-1.5 rounded transition">
                        + Add Subject to Form
                      </button>
                    </div>

                    {/* Draggable/Orderable Template List */}
                    <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                      {templateSubjects.map((sub, idx) => (
                        <div key={sub.id} className="flex justify-between items-center bg-white border border-slate-200 p-2 rounded shadow-sm group">
                          <div className="flex flex-col">
                            <span className="text-xs font-bold text-indigo-700">{sub.name}</span>
                            <span className="text-[10px] font-mono text-slate-500">Max: {sub.max}</span>
                          </div>
                          <div className="flex items-center gap-1 opacity-60 group-hover:opacity-100 transition">
                            <button onClick={() => moveSubject(idx, 'up')} disabled={idx === 0} className="p-1 hover:bg-slate-100 rounded text-slate-600 disabled:opacity-30">↑</button>
                            <button onClick={() => moveSubject(idx, 'down')} disabled={idx === templateSubjects.length-1} className="p-1 hover:bg-slate-100 rounded text-slate-600 disabled:opacity-30">↓</button>
                            <button onClick={() => removeSubject(idx)} className="p-1 hover:bg-rose-100 text-rose-600 rounded ml-1">✕</button>
                          </div>
                        </div>
                      ))}
                      {templateSubjects.length === 0 && <p className="text-xs text-center text-slate-400 py-4">No subjects added.</p>}
                    </div>
                  </div>

                  {/* RIGHT COLUMN: AWS Student Selector & Fast Entry Form */}
                  <div className="lg:col-span-8 bg-white rounded-xl p-5 border border-slate-200 shadow-sm space-y-4">
                    
                    {/* Step 1: Search & Select Student */}
                    <div>
                      <h3 className="text-sm font-bold text-slate-800 mb-2">1. Select Student (AWS-Style Directory)</h3>
                      <input
                        type="text"
                        placeholder="Search by Student ID (S-XXXX) or Name..."
                        className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-xs text-slate-900 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 mb-2"
                        value={studentSearchQuery}
                        onChange={(e) => setStudentSearchQuery(e.target.value)}
                      />
                      
                      <div className="max-h-40 overflow-y-auto border border-slate-200 rounded-lg bg-slate-50 shadow-inner">
                        <table className="w-full text-left text-xs">
                          <thead className="bg-slate-100 border-b border-slate-200 sticky top-0">
                            <tr>
                              <th className="py-2 px-3 w-10 text-center">Select</th>
                              <th className="py-2 px-3 text-slate-600">ID</th>
                              <th className="py-2 px-3 text-slate-600">Name</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {filteredStudents.map((s) => (
                              <tr 
                                key={s.studentId} 
                                onClick={() => {
                                  setSelectedStudentForMarks(s);
                                  fetchTeacherStudentData(s.studentId);
                                }}
                                className={`cursor-pointer transition hover:bg-white ${selectedStudentForMarks?.studentId === s.studentId ? "bg-indigo-50 border-l-2 border-indigo-500" : ""}`}
                              >
                                <td className="py-2 px-3 text-center">
                                  <input 
                                    type="radio" 
                                    checked={selectedStudentForMarks?.studentId === s.studentId}
                                    onChange={() => {}}
                                    className="accent-indigo-600 cursor-pointer"
                                  />
                                </td>
                                <td className="py-2 px-3 font-mono font-bold text-indigo-600">{s.studentId}</td>
                                <td className="py-2 px-3 font-semibold text-slate-800">{s.fullName}</td>
                              </tr>
                            ))}
                            {filteredStudents.length === 0 && (
                              <tr><td colSpan="3" className="py-4 text-center text-slate-500">No matching students found.</td></tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* Step 2: Fast Matrix Entry */}
                    {selectedStudentForMarks ? (
                      <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-5 shadow-sm mt-4 transition-all">
                        <div className="flex justify-between items-center mb-4">
                          <h3 className="text-sm font-bold text-indigo-800">
                            2. Entering Marks for <span className="underline decoration-indigo-300 underline-offset-4">{selectedStudentForMarks.fullName}</span>
                          </h3>
                          <span className="bg-indigo-200 text-indigo-800 text-[10px] font-bold px-2 py-0.5 rounded font-mono">
                            {examTemplateName === "OTHER" ? (customExamName.trim() || "CUSTOM") : examTemplateName.replace(/_/g, " ")} | {examDate}
                          </span>
                        </div>
                        
                        <div className="space-y-3 mb-6">
                          {templateSubjects.map((sub, idx) => (
                            <div key={sub.id} className="flex items-center gap-4 bg-white p-2 rounded-lg border border-slate-200 shadow-sm">
                              <span className="w-6 text-center font-bold text-slate-300 text-xs">{idx + 1}.</span>
                              <div className="flex-1">
                                <p className="text-xs font-bold text-slate-700">{sub.name}</p>
                                <p className="text-[10px] font-mono text-slate-500">Max: {sub.max}</p>
                              </div>
                              <div className="flex items-center gap-2">
                                <input
                                  type="number"
                                  min="1"
                                  step="0.01"
                                  value={sub.max}
                                  onChange={(e) => updateSubjectMax(sub.id, e.target.value)}
                                  className="w-20 bg-slate-50 border border-slate-300 rounded p-2 text-xs font-bold text-center text-slate-900 outline-none focus:border-indigo-500"
                                  aria-label={`Maximum marks for ${sub.name}`}
                                />
                                <span className="text-[10px] text-slate-400">max</span>
                              </div>
                              <div className="relative">
                                <input
                                  id={`mark-input-${idx}`}
                                  type="number"
                                  className="w-24 bg-slate-50 border border-slate-300 rounded p-2 text-sm font-bold text-center text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 transition shadow-inner"
                                  placeholder="0"
                                  value={marksEntries[sub.id] || ""}
                                  onChange={(e) => handleMarkInputChange(sub.id, e.target.value)}
                                  onKeyDown={(e) => handleMarksKeyDown(e, idx)}
                                />
                                <span className="absolute right-2 top-2 text-[10px] text-slate-400 pointer-events-none mt-0.5">pts</span>
                              </div>
                            </div>
                          ))}
                          {templateSubjects.length === 0 && (
                            <p className="text-xs text-rose-600 bg-rose-50 border border-rose-200 p-3 rounded text-center font-semibold">
                              Please add subjects to the template on the left.
                            </p>
                          )}
                        </div>

                        <button 
                          id="submit-batch-btn"
                          onClick={submitBatchMarks}
                          disabled={isSubmittingBatch || templateSubjects.length === 0}
                          className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold py-3 rounded-lg shadow-md transition disabled:opacity-50"
                        >
                          {isSubmittingBatch ? "Saving..." : `Save Marks for ${selectedStudentForMarks.studentId}`}
                        </button>
                      </div>
                    ) : (
                      <div className="h-32 flex items-center justify-center border-2 border-dashed border-slate-200 rounded-xl bg-slate-50 mt-4">
                        <p className="text-xs text-slate-500 font-semibold">Select a student from the directory above to enter marks.</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Attendance & Inbox Layout */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="rounded-xl border border-emerald-200 bg-white p-6 shadow-md">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-bold text-emerald-700">Complete Attendance Log</h2>
                    <button onClick={fetchAllAttendance} className="text-xs text-emerald-600 font-semibold hover:underline">↻ Refresh Log</button>
                  </div>
                  <div className="overflow-x-auto max-h-60 overflow-y-auto border border-slate-200 rounded-lg">
                    <table className="w-full text-left text-sm text-slate-700">
                      <thead className="bg-slate-50 text-xs uppercase text-slate-500 border-b border-slate-200 sticky top-0">
                        <tr>
                          <th className="py-2.5 px-4">Student ID</th>
                          <th className="py-2.5 px-4">Date</th>
                          <th className="py-2.5 px-4">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {allAttendanceList.map((a, idx) => (
                          <tr key={idx} className="hover:bg-slate-50 transition">
                            <td className="py-2.5 px-4 font-mono font-bold text-indigo-600">{a.studentUsername}</td>
                            <td className="py-2.5 px-4 text-xs">{a.date}</td>
                            <td className="py-2.5 px-4">
                              <span className={`text-[10px] uppercase px-2 py-0.5 rounded font-bold ${a.status === "PRESENT" ? "bg-emerald-100 text-emerald-700 border border-emerald-200" : a.status === "LATE" ? "bg-amber-100 text-amber-700 border border-amber-200" : "bg-rose-100 text-rose-700 border border-rose-200"}`}>
                                {a.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="rounded-xl border border-indigo-200 bg-white p-6 shadow-md">
                  <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center gap-2">
                      <h2 className="text-lg font-bold text-indigo-700">Teacher Direct Inbox</h2>
                      {unreadCount > 0 && (
                        <span className="bg-rose-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full animate-pulse shadow-md">
                          {unreadCount} NEW
                        </span>
                      )}
                    </div>
                    <button onClick={() => fetchTeacherInbox(user.userId)} className="text-xs text-indigo-600 font-semibold hover:underline">↻ Refresh</button>
                  </div>

                  <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                    {teacherInbox.map((msg) => (
                      <div key={msg.id} className={`p-4 rounded-lg border text-xs space-y-1 shadow-sm transition ${!msg.isRead ? "bg-indigo-50 border-indigo-300" : "bg-white border-slate-200"}`}>
                        <div className="flex justify-between items-center">
                          <span className="font-bold text-slate-800">{msg.senderName} <span className="text-slate-500 font-mono">({msg.senderId})</span></span>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] text-slate-400">{new Date(msg.createdAt).toLocaleDateString()}</span>
                            {!msg.isRead && (
                              <button onClick={() => handleMarkAsRead(msg.id)} className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded text-[10px] font-bold hover:bg-emerald-100 transition">
                                Mark Read
                              </button>
                            )}
                          </div>
                        </div>
                        <p className="text-slate-600 mt-1">{msg.message}</p>
                      </div>
                    ))}
                    {teacherInbox.length === 0 && <p className="text-xs text-slate-400 py-3 text-center">No parent communications received yet.</p>}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* PARENT DASHBOARD & DIRECT CONTACT CHANNEL */}
          {user.role === "ROLE_PARENT" && (
            <div className="space-y-6">
              <div className="rounded-xl border border-indigo-200 bg-white p-6 shadow-md">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <h2 className="text-2xl font-bold text-slate-900">Welcome, {user.fullName}! 👋</h2>
                    <p className="text-xs text-slate-500 mt-1">
                      Monitoring linked student <span className="font-mono font-bold text-indigo-700 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded">{user.linkedStudentId}</span>
                    </p>
                  </div>
                  <div className="bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 text-right">
                    <span className="text-[10px] text-slate-500 block uppercase font-semibold">Your Parent ID</span>
                    <span className="text-sm font-bold font-mono text-indigo-600">{user.userId}</span>
                  </div>
                </div>
              </div>

              {/* AWS-Style Teacher Search Box */}
              <div className="rounded-xl border border-indigo-200 bg-white p-6 shadow-md space-y-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="text-lg font-bold text-indigo-700">Direct Teacher Contact Channel</h2>
                    <p className="text-xs text-slate-500">Search, tag, and send priority communications directly to teachers.</p>
                  </div>
                  <span className="text-xs bg-indigo-100 border border-indigo-200 px-3 py-1 rounded text-indigo-700 font-mono font-bold">
                    {selectedTeachers.length} Teacher(s) Tagged
                  </span>
                </div>

                {messageSuccess && (
                  <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-lg text-xs font-semibold">
                    {messageSuccess}
                  </div>
                )}

                <input
                  type="text"
                  placeholder="Search by Teacher Name (Mr./Mrs.), ID (T-XXXX), or Subject..."
                  className="w-full rounded-lg border border-slate-300 bg-slate-50 px-4 py-2.5 text-xs text-slate-900 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 shadow-inner"
                  value={teacherSearchQuery}
                  onChange={(e) => setTeacherSearchQuery(e.target.value)}
                />

                <div className="max-h-52 overflow-y-auto rounded-lg border border-slate-200 bg-white shadow-inner">
                  <table className="w-full text-left text-xs text-slate-700">
                    <thead className="bg-slate-50 uppercase text-[10px] font-bold text-slate-500 border-b border-slate-200 sticky top-0">
                      <tr>
                        <th className="py-2.5 px-3 w-10 text-center">Select</th>
                        <th className="py-2.5 px-3">Teacher ID</th>
                        <th className="py-2.5 px-3">Teacher Name</th>
                        <th className="py-2.5 px-3">Specialization</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredTeachers.map((t) => (
                        <tr
                          key={t.teacherId}
                          onClick={() => toggleTeacherSelection(t.teacherId)}
                          className={`cursor-pointer transition hover:bg-slate-50 ${selectedTeachers.includes(t.teacherId) ? "bg-indigo-50 border-l-2 border-indigo-500" : ""}`}
                        >
                          <td className="py-2.5 px-3 text-center">
                            <input
                              type="checkbox"
                              checked={selectedTeachers.includes(t.teacherId)}
                              onChange={() => {}}
                              className="accent-indigo-600 cursor-pointer"
                            />
                          </td>
                          <td className="py-2.5 px-3 font-mono font-bold text-indigo-600">{t.teacherId}</td>
                          <td className="py-2.5 px-3 font-semibold text-slate-800">{t.fullName}</td>
                          <td className="py-2.5 px-3 text-slate-500">{t.subjectSpecialization}</td>
                        </tr>
                      ))}
                      {filteredTeachers.length === 0 && (
                        <tr><td colSpan="4" className="py-4 text-center text-slate-500">No matching teachers found.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>

                <form onSubmit={handleSendParentDirectMessage} className="space-y-3 pt-2">
                  <textarea
                    rows="3"
                    required
                    placeholder="Type your inquiry or message for the tagged teacher(s)..."
                    className="w-full rounded-lg border border-slate-300 bg-slate-50 p-3 text-xs text-slate-900 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 shadow-inner"
                    value={parentDirectMessage}
                    onChange={(e) => setParentDirectMessage(e.target.value)}
                  />
                  <div className="flex justify-between items-center">
                    <span className="text-[11px] font-semibold text-slate-500">
                      {selectedTeachers.length === 0 ? "Select at least one teacher above." : `Ready to notify ${selectedTeachers.length} teacher(s).`}
                    </span>
                    <button
                      type="submit"
                      disabled={sendingMessage || selectedTeachers.length === 0}
                      className="rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-2 text-xs font-semibold text-white transition hover:from-blue-700 hover:to-indigo-700 shadow-md disabled:opacity-40"
                    >
                      {sendingMessage ? "Dispatching..." : "Send to Selected Teachers"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* DEDICATED STUDENT / CHILD ANALYTICS HEADER, KPI CARDS & TIMELINE GRAPHS */}
          {(user.role === "ROLE_STUDENT" || user.role === "ROLE_PARENT" || (user.role === "ROLE_TEACHER" && analyticsData)) && (
            <div className="space-y-6">
              
              <div className="rounded-xl border border-indigo-200 bg-white p-5 flex items-center justify-between shadow-md">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-500 font-mono">Academic Performance Report</span>
                  <h3 className="text-lg font-extrabold text-slate-900 mt-0.5">
                    Here <span className="text-indigo-600">{analyticsData?.gender || "Student"}</span>, <span className="text-indigo-700 underline decoration-indigo-300 underline-offset-4">{analyticsData?.studentName || user.fullName}</span> (<span className="font-mono font-bold text-emerald-600">{analyticsData?.studentId || user.userId}</span>) has achieved the following analytics:
                  </h3>
                </div>
                <div className="bg-slate-50 border border-slate-200 rounded-lg px-3.5 py-1.5 text-right hidden sm:block shadow-inner">
                  <span className="text-[10px] text-slate-500 block font-semibold">Classification</span>
                  <span className="text-xs font-bold text-indigo-600 uppercase">{analyticsData?.gender || "Student"}</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="p-4 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-100 border border-blue-200 shadow-sm relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-16 h-16 bg-blue-200/60 rounded-full blur-xl -mr-4 -mt-4"></div>
                  <span className="text-xs font-bold text-blue-700 uppercase">Class Average</span>
                  <p className="text-2xl font-extrabold text-blue-700 mt-1 relative z-10">{analyticsData?.analytics?.averageScore || "0"}%</p>
                </div>
                <div className="p-4 rounded-xl bg-gradient-to-br from-sky-50 to-blue-100 border border-blue-200 shadow-sm relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-16 h-16 bg-sky-200/60 rounded-full blur-xl -mr-4 -mt-4"></div>
                  <span className="text-xs font-bold text-sky-700 uppercase">Attendance Rate</span>
                  <p className="text-2xl font-extrabold text-sky-700 mt-1 relative z-10">{analyticsData?.analytics?.attendanceRate || "0"}%</p>
                </div>
                <div className="p-4 rounded-xl bg-gradient-to-br from-indigo-50 to-blue-100 border border-indigo-200 shadow-sm relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-16 h-16 bg-indigo-200/60 rounded-full blur-xl -mr-4 -mt-4"></div>
                  <span className="text-xs font-bold text-indigo-700 uppercase">ML Forecast (Next Term)</span>
                  <p className="text-2xl font-extrabold text-indigo-700 mt-1 relative z-10">{analyticsData?.analytics?.predictedScore || "0"}%</p>
                </div>
                <div className="p-4 rounded-xl bg-gradient-to-br from-cyan-50 to-blue-100 border border-cyan-200 shadow-sm relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-16 h-16 bg-cyan-200/60 rounded-full blur-xl -mr-4 -mt-4"></div>
                  <span className="text-xs font-bold text-cyan-700 uppercase">Cohort Ranking</span>
                  <p className="text-2xl font-extrabold text-cyan-700 mt-1 relative z-10">{analyticsData?.analytics?.rankPosition || "Unranked"}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-md space-y-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-sm font-bold text-indigo-700 flex items-center gap-2">
                        📈 Academic Mark Progression
                      </h3>
                      <p className="text-[11px] text-slate-500 mt-0.5">Chronological test scores timeline</p>
                    </div>
                    <span className="text-[10px] font-bold font-mono bg-indigo-50 border border-indigo-200 text-indigo-700 px-2 py-0.5 rounded">
                      Scale: 0 - 100%
                    </span>
                  </div>

                  {marksTimeline.length > 0 ? (
                    <div className="space-y-4 pt-2">
                      <TrendGraph title="Academic time and progress" values={marksTimeline.map(item => item.score)} color="#2563eb" />
                      <div className="space-y-3">
                        {marksTimeline.map((item, idx) => (
                          <div key={idx} className="space-y-1">
                            <div className="flex justify-between text-xs">
                              <span className="font-bold text-slate-800">
                                {item.fullSubject} <span className="text-[10px] text-indigo-500 font-mono">({item.examType.replace(/_/g, " ")})</span>
                              </span>
                              <span className="font-mono font-extrabold text-emerald-600">{item.score}%</span>
                            </div>
                            <div className="w-full bg-slate-100 rounded-full h-3 p-0.5 border border-slate-200 shadow-inner">
                              <div
                                className="bg-gradient-to-r from-indigo-400 to-emerald-400 h-full rounded-full transition-all duration-500 shadow-sm"
                                style={{ width: `${item.score}%` }}
                              />
                            </div>
                            <div className="flex justify-between text-[10px] font-bold text-slate-400 font-mono">
                              <span>Timeline Point #{idx + 1}</span>
                              <span>{item.date}</span>
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                        <span>Trend: <strong className="text-emerald-600 font-bold">+4.2% Growth Velocity</strong></span>
                        <span className="text-indigo-600 font-bold font-mono bg-indigo-50 px-2 py-0.5 rounded">Evaluations: {marksTimeline.length}</span>
                      </div>
                    </div>
                  ) : (
                    <div className="h-32 flex items-center justify-center border-2 border-dashed border-slate-200 rounded-lg text-xs font-semibold text-slate-400 mt-2">
                      No chronological evaluations recorded yet.
                    </div>
                  )}
                </div>

                <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-md space-y-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-sm font-bold text-amber-600 flex items-center gap-2">
                        🏅 Extracurricular Milestones
                      </h3>
                      <p className="text-[11px] text-slate-500 mt-0.5">Participation intensity & sports index</p>
                    </div>
                    <span className="text-[10px] font-bold font-mono bg-amber-50 border border-amber-200 text-amber-700 px-2 py-0.5 rounded">
                      Activity Index
                    </span>
                  </div>

                  {extraTimeline.length > 0 ? (
                    <div className="space-y-4 pt-2">
                      <TrendGraph title="Extracurricular progress" values={extraTimeline.map(item => item.score)} color="#d97706" />
                      <div className="space-y-3">
                        {extraTimeline.map((item, idx) => (
                          <div key={idx} className="space-y-1">
                            <div className="flex justify-between text-xs">
                              <span className="font-bold text-slate-800">
                                {item.activity} <span className="text-[10px] text-amber-600 font-mono">({item.category})</span>
                              </span>
                              <span className="font-mono font-extrabold text-amber-600">{item.level}</span>
                            </div>
                            <div className="w-full bg-slate-100 rounded-full h-3 p-0.5 border border-slate-200 shadow-inner">
                              <div
                                className="bg-gradient-to-r from-amber-400 to-yellow-400 h-full rounded-full transition-all duration-500 shadow-sm"
                                style={{ width: `${item.score}%` }}
                              />
                            </div>
                            <div className="flex justify-between text-[10px] font-bold text-slate-400 font-mono">
                              <span>Milestone #{idx + 1}</span>
                              <span>{item.date}</span>
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                        <span>Overall Index: <strong className="text-amber-600 font-bold">Distinction Standing</strong></span>
                        <span className="text-amber-600 font-bold font-mono bg-amber-50 px-2 py-0.5 rounded">Activities: {extraTimeline.length}</span>
                      </div>
                    </div>
                  ) : (
                    <div className="h-32 flex items-center justify-center border-2 border-dashed border-slate-200 rounded-lg text-xs font-semibold text-slate-400 mt-2">
                      No extracurricular milestones logged yet.
                    </div>
                  )}
                </div>
              </div>

              <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-md">
                <h2 className="text-lg font-bold text-indigo-700 mb-4">Assessment Records (Term & Monthly)</h2>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm text-slate-300">
                    <thead className="bg-slate-50 text-xs uppercase text-slate-500 border-b border-slate-200">
                      <tr>
                        <th className="py-2.5 px-4">Subject</th>
                        <th className="py-2.5 px-4">Evaluation Type</th>
                        <th className="py-2.5 px-4">Score</th>
                        <th className="py-2.5 px-4">Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {analyticsData?.marks?.map((m, idx) => (
                        <tr key={idx}>
                          <td className="py-3 px-4 font-semibold text-slate-800">{m.subject}</td>
                          <td className="py-3 px-4 font-mono text-xs text-indigo-600">{m.examType.replace(/_/g, " ")}</td>
                          <td className="py-3 px-4 font-bold text-emerald-600">{m.marks} / {m.maxMarks}</td>
                          <td className="py-3 px-4 text-slate-500 text-xs">{m.evaluationDate}</td>
                        </tr>
                      ))}
                      {(!analyticsData?.marks || analyticsData.marks.length === 0) && (
                        <tr>
                          <td colSpan="4" className="py-4 text-center text-xs text-slate-500">No marks recorded yet for ID: {user.role === "ROLE_STUDENT" ? user.userId : user.linkedStudentId}</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-md">
                <h2 className="text-lg font-bold text-amber-600 mb-4">Extracurricular Activity Portfolio</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {analyticsData?.extracurriculars?.map((e, idx) => (
                    <div key={idx} className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs space-y-1">
                      <p className="font-bold text-amber-800">{e.activityName} <span className="font-mono text-[10px] text-amber-600">({e.category})</span></p>
                      <p className="text-amber-700 font-semibold">Achievement: {e.achievementLevel}</p>
                    </div>
                  ))}
                  {(!analyticsData?.extracurriculars || analyticsData.extracurriculars.length === 0) && (
                    <p className="text-xs text-slate-500">No extracurricular activities logged yet.</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* INTERACTIVE FORUM */}
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-md">
            <h2 className="text-lg font-bold text-indigo-700 mb-4">Public Notice Board & Forum</h2>
            <div className="space-y-3 mb-4 max-h-60 overflow-y-auto pr-2">
              {messages.map((m) => (
                <div key={m.id} className="rounded-lg bg-blue-50 p-3 border border-blue-200 shadow-sm text-sm">
                  <span className="font-bold text-indigo-700 text-xs block mb-1">{m.authorName} ({m.authorId}) · {new Date(m.createdAt).toLocaleString()}</span>
                  <p className="text-slate-700 font-medium">{m.message}</p>
                </div>
              ))}
              {messages.length === 0 && <p className="text-xs text-slate-500">No notices have been published yet.</p>}
            </div>

            {user.role === "ROLE_TEACHER" && <form onSubmit={handleSendMessage} className="flex gap-2">
              <input
                type="text"
                className="flex-1 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 shadow-inner"
                placeholder={`Post message as ${user.fullName} (${user.userId})...`}
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
              />
              <button
                type="submit"
                className="rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-2.5 text-sm font-bold text-white shadow-md hover:from-blue-700 hover:to-indigo-700 transition"
              >
                Send
              </button>
            </form>}
          </div>

        </main>
      </div>

      <footer className="border-t border-slate-200 bg-slate-50 py-5 text-center text-xs font-semibold text-slate-500 shadow-inner">
        Parent-Teacher Interactivity Platform • In memory of my school principal A.M. Karunarathne (RIS)
      </footer>
    </div>
  );
}
