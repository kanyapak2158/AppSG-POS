
import React, { useState, useMemo } from 'react';
import { Employee, Job } from '../../../services/EmployeeService';
import { translations } from '../../../utils/translations';
import { Language } from '../../../App';

interface AdminCalendarProps {
  jobs: Job[];
  allEmployees: Employee[];
  lang: Language;
  selectedDate: Date;
  setSelectedDate: (d: Date) => void;
  calendarDate: Date;
  changeMonth: (offset: number) => void;
  toLocalISOString: (d: Date) => string;
  getDaysInMonth: (d: Date) => (Date | null)[];
}

export const AdminCalendar: React.FC<AdminCalendarProps> = ({ 
  jobs, allEmployees, lang, selectedDate, setSelectedDate, calendarDate, changeMonth, toLocalISOString, getDaysInMonth 
}) => {
  const t = translations[lang];
  const headCls = lang === 'TH' ? 'font-prompt font-bold' : 'font-montserrat font-bold';
  const subHeadCls = lang === 'TH' ? 'font-prompt font-medium' : 'font-montserrat font-semibold';
  const bodyCls = lang === 'TH' ? 'font-prompt font-normal' : 'font-montserrat font-normal';

  const [viewMode, setViewMode] = useState<'DAILY' | 'WEEKLY'>('DAILY');
  const selectedDateString = toLocalISOString(selectedDate);
  
  // กรองเฉพาะพนักงาน (ซ่อน Executive และ HR)
  const filteredEmployeesList = useMemo(() => {
    return allEmployees.filter(emp => emp.role === 'EMPLOYEE');
  }, [allEmployees]);

  // คำนวณช่วงวันที่ของสัปดาห์ที่เลือก
  const weekRange = useMemo(() => {
    const start = new Date(selectedDate);
    start.setDate(selectedDate.getDate() - selectedDate.getDay());
    start.setHours(0,0,0,0);
    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    end.setHours(23,59,59,999);
    return { start, end };
  }, [selectedDate]);

  // กรองงานรายวัน (เฉพาะพนักงานที่กรองแล้ว)
  const dailyJobs = useMemo(() => {
    return jobs.filter(j => 
      j.date === selectedDateString && 
      filteredEmployeesList.some(e => e.id === j.employeeId)
    );
  }, [jobs, selectedDateString, filteredEmployeesList]);

  // จัดกลุ่มงานตามพนักงาน (รายวัน)
  const groupedJobsDaily = useMemo(() => {
    const groups: Record<string, { employee: Employee; jobs: Job[] }> = {};
    filteredEmployeesList.forEach(emp => { groups[emp.id] = { employee: emp, jobs: [] }; });
    dailyJobs.forEach(job => { if (groups[job.employeeId]) groups[job.employeeId].jobs.push(job); });
    return Object.values(groups).sort((a, b) => b.jobs.length - a.jobs.length);
  }, [filteredEmployeesList, dailyJobs]);

  // จัดกลุ่มงานตามพนักงาน (รายสัปดาห์)
  const groupedJobsWeekly = useMemo(() => {
    const groups: Record<string, { employee: Employee; jobs: Job[] }> = {};
    filteredEmployeesList.forEach(emp => { groups[emp.id] = { employee: emp, jobs: [] }; });
    
    const weeklyJobs = jobs.filter(j => {
      const jDate = new Date(j.date);
      return jDate >= weekRange.start && jDate <= weekRange.end && 
             filteredEmployeesList.some(e => e.id === j.employeeId);
    });

    weeklyJobs.forEach(job => { if (groups[job.employeeId]) groups[job.employeeId].jobs.push(job); });
    return Object.values(groups).sort((a, b) => b.jobs.length - a.jobs.length);
  }, [filteredEmployeesList, jobs, weekRange]);

  const stats = useMemo(() => {
    const activeJobs = viewMode === 'DAILY' ? dailyJobs : jobs.filter(j => {
      const jd = new Date(j.date);
      return jd >= weekRange.start && jd <= weekRange.end && 
             filteredEmployeesList.some(e => e.id === j.employeeId);
    });
    return {
      total: activeJobs.length,
      staff: (viewMode === 'DAILY' ? groupedJobsDaily : groupedJobsWeekly).filter(g => g.jobs.length > 0).length,
      done: activeJobs.filter(j => j.status === 'DONE').length
    };
  }, [viewMode, dailyJobs, jobs, weekRange, groupedJobsDaily, groupedJobsWeekly, filteredEmployeesList]);

  const days = getDaysInMonth(calendarDate);

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'DONE': return 'bg-green-50 text-green-600';
      case 'IN_PROGRESS': return 'bg-amber-50 text-amber-600';
      default: return 'bg-slate-50 text-slate-400';
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-in h-full">
        {/* Left Side: Calendar Control */}
        <div className="lg:col-span-5 bg-white rounded-[40px] p-8 shadow-sm border border-slate-100 flex flex-col h-[650px]">
           <div className="flex items-center justify-between mb-8">
              <div className="flex flex-col">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">{lang === 'TH' ? 'ตัวเลือกวันที่' : 'Select Date'}</span>
                <h2 className={`text-2xl text-charcoal ${headCls}`}>
                  {calendarDate.toLocaleDateString(lang === 'TH' ? 'th-TH' : 'en-GB', { month: 'long', year: 'numeric' })}
                </h2>
              </div>
              <div className="flex gap-2">
                 <button onClick={() => changeMonth(-1)} className="w-12 h-12 rounded-2xl bg-slate-50 hover:bg-slate-100 flex items-center justify-center text-slate-500 transition-all active:scale-90"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7"/></svg></button>
                 <button onClick={() => changeMonth(1)} className="w-12 h-12 rounded-2xl bg-slate-50 hover:bg-slate-100 flex items-center justify-center text-slate-500 transition-all active:scale-90"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7"/></svg></button>
              </div>
           </div>
           
           <div className="grid grid-cols-7 mb-4">
              {['S','M','T','W','T','F','S'].map((d,i) => (
                <div key={i} className={`text-center text-[10px] font-black text-slate-300 py-2 uppercase tracking-widest ${headCls}`}>{d}</div>
              ))}
           </div>

           <div className="grid grid-cols-7 gap-3 flex-1 auto-rows-fr">
              {days.map((d, i) => {
                 if (!d) return <div key={i} />;
                 const dateStr = toLocalISOString(d);
                 const isSelected = selectedDateString === dateStr;
                 const isToday = toLocalISOString(new Date()) === dateStr;
                 const dayJobsCount = jobs.filter(j => j.date === dateStr && filteredEmployeesList.some(e => e.id === j.employeeId)).length;

                 return (
                    <button 
                      key={i} 
                      onClick={() => setSelectedDate(d)} 
                      className={`rounded-3xl flex flex-col items-center justify-center relative transition-all border-2 group ${
                        isSelected 
                        ? 'border-primary bg-primary/5 shadow-lg shadow-red-50' 
                        : 'border-transparent hover:border-slate-100 hover:bg-slate-50'
                      } ${isToday ? 'ring-2 ring-primary/20' : ''}`}
                    >
                       <span className={`text-sm font-bold ${isSelected ? 'text-primary' : isToday ? 'text-charcoal underline underline-offset-4' : 'text-slate-500'}`}>
                         {d.getDate()}
                       </span>
                       {dayJobsCount > 0 && (
                         <div className="absolute bottom-3 flex gap-1 items-center justify-center w-full px-1">
                            <div className={`text-[9px] font-black px-1.5 py-0.5 rounded-full ${isSelected ? 'bg-primary text-white' : 'bg-slate-100 text-slate-400 group-hover:bg-primary/10 group-hover:text-primary'}`}>
                                {dayJobsCount}
                            </div>
                         </div>
                       )}
                    </button>
                 );
              })}
           </div>
        </div>

        {/* Right Side: Jobs Monitor */}
        <div className="lg:col-span-7 flex flex-col gap-6 h-[650px]">
           {/* Monitor Header with Toggle */}
           <div className="bg-charcoal text-white rounded-[40px] p-8 shadow-xl flex flex-col sm:flex-row items-center justify-between shrink-0 relative overflow-hidden gap-6">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2"></div>
              <div className="relative z-10 flex-1">
                <div className="text-white/50 text-[10px] font-bold uppercase tracking-widest mb-1">{viewMode === 'DAILY' ? (lang === 'TH' ? 'พิกัดพนักงานรายวัน' : 'Daily Monitor') : (lang === 'TH' ? 'แผนงานทีมรายสัปดาห์' : 'Team Weekly Roadmap')}</div>
                <div className={`text-xl ${headCls}`}>
                   {viewMode === 'DAILY' 
                     ? selectedDate.toLocaleDateString(lang === 'TH' ? 'th-TH' : 'en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
                     : `${weekRange.start.getDate()} - ${weekRange.end.toLocaleDateString(lang === 'TH' ? 'th-TH' : 'en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}`
                   }
                </div>
              </div>
              
              <div className="relative z-10 flex bg-white/10 p-1.5 rounded-2xl gap-1 shrink-0">
                 <button onClick={() => setViewMode('DAILY')} className={`px-5 py-2 rounded-xl text-[11px] font-bold transition-all ${viewMode === 'DAILY' ? 'bg-white text-charcoal shadow-lg' : 'text-white/60 hover:text-white'}`}>{lang === 'TH' ? 'รายวัน' : 'Daily'}</button>
                 <button onClick={() => setViewMode('WEEKLY')} className={`px-5 py-2 rounded-xl text-[11px] font-bold transition-all ${viewMode === 'WEEKLY' ? 'bg-white text-charcoal shadow-lg' : 'text-white/60 hover:text-white'}`}>{lang === 'TH' ? 'รายสัปดาห์' : 'Weekly'}</button>
              </div>
           </div>

           {/* Stats Summary */}
           <div className="grid grid-cols-3 gap-4">
              <div className="bg-white p-6 rounded-[30px] border border-slate-100 shadow-sm flex flex-col items-center">
                 <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">{lang === 'TH' ? 'ภารกิจ' : 'Jobs'}</span>
                 <span className={`text-2xl text-charcoal ${headCls}`}>{stats.total}</span>
              </div>
              <div className="bg-white p-6 rounded-[30px] border border-slate-100 shadow-sm flex flex-col items-center">
                 <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">{lang === 'TH' ? 'พนักงาน' : 'Staff'}</span>
                 <span className={`text-2xl text-primary ${headCls}`}>{stats.staff}</span>
              </div>
              <div className="bg-white p-6 rounded-[30px] border border-slate-100 shadow-sm flex flex-col items-center">
                 <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">{lang === 'TH' ? 'เสร็จสิ้น' : 'Done'}</span>
                 <span className={`text-2xl text-green-500 ${headCls}`}>{stats.done}</span>
              </div>
           </div>

           {/* List Display */}
           <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar min-h-0 pb-4">
              {(viewMode === 'DAILY' ? groupedJobsDaily : groupedJobsWeekly).map((group) => (
                <div key={group.employee.id} className="bg-white rounded-[30px] border border-slate-100 shadow-sm overflow-hidden group hover:shadow-md transition-all">
                  <div className="bg-slate-50 px-6 py-4 flex items-center justify-between border-b border-slate-100">
                     <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-2xl flex items-center justify-center text-sm font-bold shadow-sm ${group.jobs.length > 0 ? 'bg-primary text-white' : 'bg-slate-200 text-slate-400'}`}>
                           {group.employee.nicknameEn.charAt(0)}
                        </div>
                        <div>
                           <div className={`text-sm font-bold text-charcoal ${headCls}`}>{lang === 'TH' ? group.employee.nicknameTh : group.employee.nicknameEn}</div>
                           <div className="text-[10px] text-slate-400 font-bold uppercase">{group.employee.position}</div>
                        </div>
                     </div>
                     <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${group.jobs.length > 0 ? 'bg-blue-50 text-blue-600' : 'bg-slate-100 text-slate-300'}`}>
                        {group.jobs.length} {lang === 'TH' ? 'งาน' : 'Jobs'}
                     </span>
                  </div>
                  
                  <div className="p-4 space-y-2">
                     {group.jobs.length === 0 ? (
                        <p className="text-[11px] text-slate-300 italic text-center py-2">{lang === 'TH' ? 'ยังไม่มีงานบันทึกไว้' : 'No activities recorded'}</p>
                     ) : (
                        viewMode === 'DAILY' ? (
                          group.jobs.map(job => (
                            <div key={job.id} className="bg-slate-50 p-4 rounded-2xl flex items-start justify-between gap-4">
                               <div className="min-w-0 flex-1">
                                  <h4 className={`text-[13px] font-bold text-charcoal truncate ${subHeadCls}`}>{job.customerName}</h4>
                                  <p className={`text-[11px] text-slate-500 line-clamp-1 ${bodyCls}`}>{job.activity}</p>
                               </div>
                               <span className={`px-2 py-0.5 rounded-lg text-[9px] font-bold uppercase shrink-0 ${getStatusBadge(job.status)}`}>{job.status}</span>
                            </div>
                          ))
                        ) : (
                          <div className="space-y-4">
                             {/* Group weekly jobs by Date for each employee */}
                             {Array.from(new Set(group.jobs.map(j => j.date))).sort().map(dateStr => {
                                const dayJobs = group.jobs.filter(j => j.date === dateStr);
                                const d = new Date(dateStr);
                                return (
                                  <div key={dateStr} className="border-l-2 border-primary/20 pl-4 py-1">
                                     <div className={`text-[10px] font-black text-primary uppercase tracking-widest mb-2 ${headCls}`}>
                                       {d.toLocaleDateString(lang === 'TH' ? 'th-TH' : 'en-GB', { weekday: 'short', day: 'numeric', month: 'short' })}
                                     </div>
                                     <div className="space-y-2">
                                        {dayJobs.map(job => (
                                          <div key={job.id} className="bg-slate-50/50 p-3 rounded-xl border border-slate-100 flex flex-col gap-1">
                                             <div className="flex items-center justify-between">
                                                <span className={`text-[12px] font-bold text-charcoal truncate ${subHeadCls}`}>{job.customerName}</span>
                                                <span className={`w-2 h-2 rounded-full ${getStatusBadge(job.status).split(' ')[0]}`}></span>
                                             </div>
                                             <p className={`text-[11px] text-slate-500 line-clamp-1 ${bodyCls}`}>{job.activity}</p>
                                          </div>
                                        ))}
                                     </div>
                                  </div>
                                );
                             })}
                          </div>
                        )
                     )}
                  </div>
                </div>
              ))}
           </div>
        </div>
    </div>
  );
};
