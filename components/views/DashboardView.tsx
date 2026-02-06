
import React, { useMemo } from 'react';
import { Employee, TimeRecord, Job, EmployeeService } from '../../services/EmployeeService';
import { translations } from '../../utils/translations';
import { Language } from '../../App';

interface DashboardViewProps {
  isCheckedIn: boolean;
  allEmployees: Employee[];
  history: TimeRecord[];
  user: Employee;
  lang: Language;
  jobs: Job[];
  selectedOffice: string;
  onJobUpdate: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ isCheckedIn, allEmployees, history, user, lang, jobs, selectedOffice, onJobUpdate }) => {
  const t = translations[lang];
  const headCls = lang === 'TH' ? 'font-prompt font-bold' : 'font-montserrat font-bold';
  const bodyCls = lang === 'TH' ? 'font-prompt font-normal' : 'font-montserrat font-normal';
  const subHeadCls = lang === 'TH' ? 'font-prompt font-medium' : 'font-montserrat font-semibold';

  const isHR = user.role === 'HR' || user.role === 'EXECUTIVE';
  const todayDateString = new Date().toDateString();
  const todayStr = new Date().toLocaleDateString('en-CA');

  // 1. กรองพนักงาน (แสดงเฉพาะพนักงานทั่วไป ซ่อนผู้บริหารและ HR)
  const displayedEmployees = useMemo(() => {
    return allEmployees.filter(emp => emp.role === 'EMPLOYEE');
  }, [allEmployees]);

  // 2. ข้อมูลสถิติด้านบน
  const activeEmployeesCount = useMemo(() => {
    return displayedEmployees.filter(emp => {
      const empHistory = EmployeeService.getTimeHistory(emp.email);
      const latest = empHistory[0];
      return latest && latest.type === 'CHECK_IN' && new Date(latest.timestamp).toDateString() === todayDateString;
    }).length;
  }, [displayedEmployees, todayDateString]);

  const missionStats = useMemo(() => {
    const todayJobs = jobs.filter(j => j.date === todayStr && (isHR ? true : j.employeeId === user.id));
    return { total: todayJobs.length, done: todayJobs.filter(j => j.status === 'DONE').length };
  }, [jobs, isHR, user.id, todayStr]);

  const leaveRequests = useMemo(() => EmployeeService.getAllLeaveRequests(), []);
  const otRequests = useMemo(() => EmployeeService.getAllOTRequests(), []);

  const leaveCountToday = useMemo(() => {
    return leaveRequests.filter(r => r.status === 'APPROVED' && todayStr >= r.startDate && todayStr <= r.endDate).length;
  }, [leaveRequests, todayStr]);

  const otPendingCount = useMemo(() => {
    return otRequests.filter(r => r.status === 'PENDING').length;
  }, [otRequests]);

  // 3. ข้อมูลสรุปงานรายสัปดาห์
  const weeklyJobStats = useMemo(() => {
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0,0,0,0);
    const endOfWeek = new Date(now);
    endOfWeek.setDate(now.getDate() + (6 - now.getDay()));
    endOfWeek.setHours(23,59,59,999);

    const myWeeklyJobs = jobs.filter(j => {
      const jobDate = new Date(j.date);
      return j.employeeId === user.id && jobDate >= startOfWeek && jobDate <= endOfWeek;
    });

    const total = myWeeklyJobs.length;
    const done = myWeeklyJobs.filter(j => j.status === 'DONE').length;
    const inProgress = myWeeklyJobs.filter(j => j.status === 'IN_PROGRESS').length;
    const notStarted = myWeeklyJobs.filter(j => j.status === 'NOT_STARTED').length;
    const percentDone = total > 0 ? Math.round((done / total) * 100) : 0;

    return { total, done, inProgress, notStarted, percentDone };
  }, [jobs, user.id]);

  const dailySessions = useMemo(() => EmployeeService.getDailySessions(), []);

  return (
    <div className="w-full flex flex-col gap-8 animate-in pb-10">
       {/* Header */}
       <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className={`text-4xl text-charcoal ${headCls}`}>{t.dashboard_title}</h1>
            <p className={`text-slate-400 text-sm mt-1 ${bodyCls}`}>Real-time activity and team availability overview</p>
          </div>
          <div className="bg-white px-5 py-3 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-3">
              <div className="w-2.5 h-2.5 bg-primary rounded-full animate-pulse"></div>
              <span className={`text-[11px] font-bold text-slate-500 uppercase tracking-widest ${bodyCls}`}>Active Office: {selectedOffice}</span>
          </div>
       </div>

       {/* Top Summary Cards */}
       <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-[#EBF5FF] rounded-[30px] p-8 flex flex-col justify-between h-[160px] relative overflow-hidden group border border-blue-100/50 hover:shadow-lg transition-all">
             <div className="flex items-center gap-3 text-blue-600 relative z-10">
                <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-sm">
                   <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                </div>
                <span className="text-[12px] tracking-widest font-bold uppercase">{t.card_attendance}</span>
             </div>
             <div className={`text-5xl text-blue-600 relative z-10 ${headCls}`}>
                {activeEmployeesCount} <span className="text-2xl opacity-40 ml-1">/{displayedEmployees.length}</span>
             </div>
          </div>

          <div className="bg-[#F0FDF4] rounded-[30px] p-8 flex flex-col justify-between h-[160px] relative overflow-hidden group border border-green-100/50 hover:shadow-lg transition-all">
             <div className="flex items-center gap-3 text-green-600 relative z-10">
                <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-sm">
                   <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                </div>
                <span className="text-[12px] tracking-widest font-bold uppercase">{t.card_mission}</span>
             </div>
             <div className={`text-5xl text-green-600 relative z-10 ${headCls}`}>
                {missionStats.done} <span className="text-2xl opacity-40 ml-1">/{missionStats.total}</span>
             </div>
          </div>

          <div className="bg-[#FFF7ED] rounded-[30px] p-8 flex flex-col justify-between h-[160px] relative overflow-hidden group border border-orange-100/50 hover:shadow-lg transition-all">
             <div className="flex items-center gap-3 text-orange-600 relative z-10">
                <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-sm">
                   <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2-2v12a2 2 0 002 2z" /></svg>
                </div>
                <span className="text-[12px] tracking-widest font-bold uppercase">{t.card_leave}</span>
             </div>
             <div className={`text-5xl text-orange-600 relative z-10 ${headCls}`}>{leaveCountToday}</div>
          </div>

          <div className="bg-[#FEF2F2] rounded-[30px] p-8 flex flex-col justify-between h-[160px] relative overflow-hidden group border border-red-100/50 hover:shadow-lg transition-all">
             <div className="flex items-center gap-3 text-red-600 relative z-10">
                <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-sm">
                   <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                </div>
                <span className="text-[12px] tracking-widest font-bold uppercase">{t.card_ot}</span>
             </div>
             <div className={`text-5xl text-red-600 relative z-10 ${headCls}`}>{otPendingCount}</div>
          </div>
       </div>

       {/* Weekly Job Summary */}
       <div className="w-full bg-white rounded-[40px] p-8 shadow-sm border border-slate-100 animate-in">
          <div className="flex items-center gap-4 mb-8">
             <div className="w-1.5 h-8 bg-primary rounded-full"></div>
             <h2 className={`text-2xl font-bold text-charcoal ${headCls}`}>{lang === 'TH' ? 'สรุปงานรายสัปดาห์ของคุณ' : 'Your Weekly Job Summary'}</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
             <div className="bg-slate-50/50 rounded-[30px] p-6 border border-slate-100 flex flex-col items-start relative group overflow-hidden">
                <span className="text-slate-400 text-[11px] font-bold uppercase tracking-widest mb-2">{lang === 'TH' ? 'ทั้งหมด' : 'Total'}</span>
                <div className="flex items-baseline gap-2">
                   <span className={`text-4xl text-charcoal ${headCls}`}>{weeklyJobStats.total}</span>
                   <span className="text-slate-400 font-bold text-xs">Jobs</span>
                </div>
             </div>
             <div className="bg-green-50/50 rounded-[30px] p-6 border border-green-100 flex flex-col items-start relative group overflow-hidden">
                <span className="text-green-600 text-[11px] font-bold uppercase tracking-widest mb-2">{lang === 'TH' ? 'เสร็จสิ้น' : 'Completed'}</span>
                <div className="flex items-baseline gap-2">
                   <span className={`text-4xl text-green-600 ${headCls}`}>{weeklyJobStats.done}</span>
                   <span className="text-green-400 font-bold text-sm ml-1">{weeklyJobStats.percentDone}%</span>
                </div>
             </div>
             <div className="bg-amber-50/50 rounded-[30px] p-6 border border-amber-100 flex flex-col items-start relative group overflow-hidden">
                <span className="text-amber-600 text-[11px] font-bold uppercase tracking-widest mb-2">{lang === 'TH' ? 'ความคืบหน้า' : 'In Progress'}</span>
                <span className={`text-4xl text-amber-600 ${headCls}`}>{weeklyJobStats.inProgress}</span>
             </div>
             <div className="bg-blue-50/50 rounded-[30px] p-6 border border-blue-100 flex flex-col items-start relative group overflow-hidden">
                <span className="text-blue-600 text-[11px] font-bold uppercase tracking-widest mb-2">{lang === 'TH' ? 'รอดำเนินการ' : 'Pending'}</span>
                <span className={`text-4xl text-blue-600 ${headCls}`}>{weeklyJobStats.notStarted}</span>
             </div>
          </div>
       </div>

       {/* Team Status */}
       <div className="bg-white rounded-[40px] p-8 md:p-10 shadow-sm border border-slate-100">
           <div className="flex items-center gap-4 mb-8">
               <div className="w-1.5 h-8 bg-blue-600 rounded-full"></div>
               <h2 className={`text-xl font-bold uppercase tracking-wider text-charcoal ${headCls}`}>{t.team_status_title}</h2>
           </div>
           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-5">
               {displayedEmployees.map((emp) => {
                   const empHistory = EmployeeService.getTimeHistory(emp.email);
                   const todayCheckIn = empHistory.find(r => r.type === 'CHECK_IN' && new Date(r.timestamp).toDateString() === todayDateString);
                   
                   const statusTime = todayCheckIn 
                       ? new Date(todayCheckIn.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
                       : (lang === 'TH' ? 'ยังไม่เข้างาน' : 'N/A');

                   const empSession = dailySessions.find(s => s.employeeId === emp.id && s.date === todayStr);
                   const officeLabel = empSession 
                       ? (empSession.office === 'BANGKOK' ? (lang === 'TH' ? 'กรุงเทพฯ' : 'Bangkok') : (lang === 'TH' ? 'ชลบุรี' : 'Chonburi'))
                       : (lang === 'TH' ? 'ไม่ได้ระบุ' : 'Offline');

                   // ตรวจสอบความว่างจากงานในปฏิทินวันนี้
                   const activeJob = jobs.find(j => 
                       j.employeeId === emp.id && 
                       j.date === todayStr && 
                       j.status !== 'DONE'
                   );

                   return (
                       <div key={emp.id} className="bg-slate-50 rounded-[35px] p-6 flex flex-col gap-4 group hover:bg-white hover:shadow-xl border border-transparent hover:border-slate-100 transition-all relative overflow-hidden">
                           <div className={`absolute top-0 right-0 w-2 h-full ${todayCheckIn ? 'bg-emerald-500' : 'bg-slate-200'}`}></div>

                           <div className="flex items-center gap-4">
                               <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-lg font-bold text-white shadow-sm ${todayCheckIn ? 'bg-primary' : 'bg-slate-400'}`}>
                                   {emp.nicknameEn?.charAt(0).toUpperCase() || '?'}
                               </div>
                               <div className="min-w-0 flex-1">
                                   <div className={`text-base text-charcoal font-bold truncate ${headCls}`}>{lang === 'TH' ? emp.nicknameTh : emp.nicknameEn}</div>
                                   <div className="text-[9px] font-bold uppercase text-slate-400 truncate">{emp.position}</div>
                               </div>
                           </div>

                           <div className="flex flex-col gap-3 border-t border-slate-100 pt-4">
                              <div className="flex items-center justify-between text-[11px] font-bold">
                                <div className="flex flex-col">
                                   <span className={`uppercase tracking-widest ${todayCheckIn ? 'text-blue-600' : 'text-slate-300'}`}>
                                      {officeLabel}
                                   </span>
                                   <span className="text-[8px] text-slate-400 font-normal uppercase">{lang === 'TH' ? 'สำนักงาน' : 'Office'}</span>
                                </div>
                                <div className="flex flex-col items-end">
                                   <div className={`tracking-wider ${todayCheckIn ? 'text-charcoal' : 'text-slate-300'}`}>
                                       {statusTime}
                                   </div>
                                   <span className="text-[8px] text-slate-400 font-normal uppercase">{lang === 'TH' ? 'เวลาเข้างาน' : 'Check-in'}</span>
                                </div>
                              </div>

                              {/* Availability Badge */}
                              <div className="flex flex-col gap-1.5 p-3 rounded-[1.2rem] bg-white border border-slate-100/50 shadow-sm transition-all group-hover:border-slate-200">
                                 <div className="flex items-center gap-2">
                                    <div className={`w-2.5 h-2.5 rounded-full ${activeJob ? 'bg-red-500 animate-pulse' : 'bg-emerald-500'}`}></div>
                                    <span className={`text-[11px] font-black tracking-tight ${activeJob ? 'text-red-600' : 'text-emerald-600'}`}>
                                       {activeJob 
                                         ? (lang === 'TH' ? 'ไม่ว่าง (BUSY)' : 'BUSY') 
                                         : (lang === 'TH' ? 'ว่าง (AVAILABLE)' : 'AVAILABLE')}
                                    </span>
                                 </div>
                                 {activeJob && (
                                    <div className="text-[10px] text-slate-400 font-medium line-clamp-1 italic leading-tight ml-4">
                                       {activeJob.customerName}: {activeJob.activity.replace(/\[.*?\]/g, '').trim()}
                                    </div>
                                 )}
                              </div>
                           </div>
                       </div>
                   );
               })}
           </div>
       </div>
    </div>
  );
};
