
import React, { useState, useMemo } from 'react';
import { Employee, Job, EmployeeService } from '../../../services/EmployeeService';
import { translations } from '../../../utils/translations';
import { Language } from '../../../App';
import { JobModal } from '../../modals/JobModal';

interface EmployeeCalendarProps {
  jobs: Job[];
  user: Employee;
  allEmployees: Employee[];
  lang: Language;
  onJobUpdate: () => void;
  selectedDate: Date;
  setSelectedDate: (d: Date) => void;
  calendarDate: Date;
  changeMonth: (offset: number) => void;
  toLocalISOString: (d: Date) => string;
  getDaysInMonth: (d: Date) => (Date | null)[];
}

export const EmployeeCalendar: React.FC<EmployeeCalendarProps> = ({ 
  jobs, user, allEmployees, lang, onJobUpdate, selectedDate, setSelectedDate, calendarDate, changeMonth, toLocalISOString, getDaysInMonth 
}) => {
  const t = translations[lang];
  const headCls = lang === 'TH' ? 'font-prompt font-bold' : 'font-montserrat font-bold';
  const subHeadCls = lang === 'TH' ? 'font-prompt font-medium' : 'font-montserrat font-semibold';
  const bodyCls = lang === 'TH' ? 'font-prompt font-normal' : 'font-montserrat font-normal';

  const [isJobModalOpen, setIsJobModalOpen] = useState(false);
  const [editingJob, setEditingJob] = useState<Job | null>(null);
  const [jobForm, setJobForm] = useState<Partial<Job>>({ customerName: '', activity: '', status: 'NOT_STARTED', remark: '' });

  const selectedDateString = toLocalISOString(selectedDate);
  const todayStr = toLocalISOString(new Date());

  // สถิติรายสัปดาห์คำนวณตาม "สัปดาห์ของวันที่เลือก"
  const weeklyStats = useMemo(() => {
    const baseDate = new Date(selectedDate);
    const startOfWeek = new Date(baseDate);
    startOfWeek.setDate(baseDate.getDate() - baseDate.getDay());
    startOfWeek.setHours(0,0,0,0);
    const endOfWeek = new Date(baseDate);
    endOfWeek.setDate(baseDate.getDate() + (6 - baseDate.getDay()));
    endOfWeek.setHours(23,59,59,999);

    const weekJobs = jobs.filter(j => {
      const jobDate = new Date(j.date);
      return j.employeeId === user.id && jobDate >= startOfWeek && jobDate <= endOfWeek;
    });

    return {
      total: weekJobs.length,
      done: weekJobs.filter(j => j.status === 'DONE').length,
      inProgress: weekJobs.filter(j => j.status === 'IN_PROGRESS').length,
      notStarted: weekJobs.filter(j => j.status === 'NOT_STARTED').length
    };
  }, [jobs, user.id, selectedDate]);

  // ตารางรายสัปดาห์คำนวณตาม "สัปดาห์ของวันที่เลือก" เพื่อให้ดูย้อนหลังได้
  const weeklyGroupedJobs = useMemo(() => {
    const baseDate = new Date(selectedDate);
    const startOfWeek = new Date(baseDate);
    startOfWeek.setDate(baseDate.getDate() - baseDate.getDay());
    startOfWeek.setHours(0,0,0,0);
    const endOfWeek = new Date(baseDate);
    endOfWeek.setDate(baseDate.getDate() + (6 - baseDate.getDay()));
    endOfWeek.setHours(23,59,59,999);

    const weekJobs = jobs.filter(j => {
      const jobDate = new Date(j.date);
      return j.employeeId === user.id && jobDate >= startOfWeek && jobDate <= endOfWeek;
    }).sort((a, b) => a.date.localeCompare(b.date));

    const dateGroups: Record<string, Record<string, Job[]>> = {};
    weekJobs.forEach(job => {
      if (!dateGroups[job.date]) dateGroups[job.date] = {};
      if (!dateGroups[job.date][job.customerName]) dateGroups[job.date][job.customerName] = [];
      dateGroups[job.date][job.customerName].push(job);
    });
    return dateGroups;
  }, [jobs, user.id, selectedDate]);

  const handleJobSubmit = () => {
    const newJob: Job = {
      id: editingJob ? editingJob.id : Date.now().toString(),
      employeeId: user.id,
      date: toLocalISOString(selectedDate),
      customerName: jobForm.customerName || '-',
      activity: jobForm.activity || '',
      status: jobForm.status as any || 'NOT_STARTED',
      remark: jobForm.remark || ''
    };
    EmployeeService.saveJob(newJob);
    onJobUpdate();
    setIsJobModalOpen(false);
  };

  const handleJobDelete = (id: string) => {
    EmployeeService.deleteJob(id);
    onJobUpdate();
    setIsJobModalOpen(false);
  };

  const handleShiftWeek = (offsetDays: number) => {
    const newD = new Date(selectedDate);
    newD.setDate(newD.getDate() + offsetDays);
    setSelectedDate(newD);
  };

  const days = getDaysInMonth(calendarDate);

  return (
    <div className="flex flex-col gap-10 animate-in h-full pb-10">
        {/* Row 1: ปฏิทินและการเพิ่มงาน */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-8 bg-white rounded-[40px] p-8 shadow-sm border border-slate-100 flex flex-col min-h-[500px]">
               <div className="flex items-center justify-between mb-8">
                  <h2 className={`text-3xl text-charcoal ${headCls}`}>{calendarDate.toLocaleDateString(lang === 'TH' ? 'th-TH' : 'en-GB', { month: 'long', year: 'numeric' })}</h2>
                  <div className="flex gap-2">
                     <button onClick={() => changeMonth(-1)} className="w-12 h-12 rounded-2xl bg-slate-50 hover:bg-slate-100 flex items-center justify-center text-slate-500 transition-all active:scale-90"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7"/></svg></button>
                     <button onClick={() => changeMonth(1)} className="w-12 h-12 rounded-2xl bg-slate-50 hover:bg-slate-100 flex items-center justify-center text-slate-500 transition-all active:scale-90"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7"/></svg></button>
                  </div>
               </div>
               <div className="grid grid-cols-7 mb-4">
                  {['S','M','T','W','T','F','S'].map((d,i) => (<div key={i} className={`text-center text-xs font-bold text-slate-300 py-2 uppercase tracking-widest ${headCls}`}>{d}</div>))}
               </div>
               <div className="grid grid-cols-7 gap-3 flex-1 auto-rows-fr">
                  {days.map((d, i) => {
                     if (!d) return <div key={i} />;
                     const dateStr = toLocalISOString(d);
                     const isSelected = selectedDateString === dateStr;
                     const isToday = todayStr === dateStr;
                     const myDayJobs = jobs.filter(j => j.date === dateStr && j.employeeId === user.id);

                     return (
                        <button key={i} onClick={() => setSelectedDate(d)} className={`rounded-3xl flex flex-col items-center justify-center relative transition-all border-2 min-h-[60px] ${isSelected ? 'border-primary bg-primary/5 shadow-md scale-[1.02]' : 'border-transparent hover:bg-slate-50'} ${isToday ? 'bg-slate-100' : ''}`}>
                           <span className={`text-base font-bold ${isSelected ? 'text-primary' : isToday ? 'text-charcoal' : 'text-slate-500'}`}>{d.getDate()}</span>
                           {myDayJobs.length > 0 && <div className="absolute bottom-3 w-1.5 h-1.5 bg-primary rounded-full"></div>}
                        </button>
                     );
                  })}
               </div>
            </div>

            <div className="lg:col-span-4 flex flex-col gap-6">
               <div className="bg-charcoal text-white rounded-[40px] p-8 shadow-xl flex flex-col gap-6">
                  <div>
                    <span className="text-white/40 text-[10px] font-bold uppercase tracking-[0.2em] mb-1 block">Selected Date</span>
                    <h3 className={`text-2xl ${headCls}`}>{selectedDate.toLocaleDateString(lang === 'TH' ? 'th-TH' : 'en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</h3>
                  </div>
                  <button onClick={() => { setEditingJob(null); setJobForm({ customerName: '', activity: '', status: 'NOT_STARTED', remark: '' }); setIsJobModalOpen(true); }} className="w-full py-5 bg-primary text-white rounded-2xl flex items-center justify-center gap-3 shadow-lg shadow-red-900/20 active:scale-95 hover:bg-red-700 transition-all">
                     <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4"/></svg>
                     <span className={`text-base ${headCls}`}>{t.add_job}</span>
                  </button>
               </div>
               <div className="flex-1 bg-white rounded-[40px] p-8 border border-slate-100 shadow-sm overflow-y-auto max-h-[300px]">
                  <h4 className={`text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 ${headCls}`}>Quick Summary</h4>
                  <div className="space-y-4">
                     <div className="flex items-center justify-between"><span className="text-sm font-medium text-slate-500">Missions this week</span><span className="font-bold text-charcoal">{weeklyStats.total}</span></div>
                     <div className="flex items-center justify-between"><span className="text-sm font-medium text-slate-500">Completed</span><span className="font-bold text-green-500">{weeklyStats.done}</span></div>
                  </div>
               </div>
            </div>
        </div>

        {/* Row 2: ตารางรายสัปดาห์ (ดูย้อนหลังได้ตามปฏิทิน + ลูกศรเลื่อนสัปดาห์) */}
        <div className="w-full bg-white rounded-[40px] p-8 md:p-12 shadow-sm border border-slate-100 animate-in">
           <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-10 gap-4 border-b border-slate-100 pb-8">
              <div className="flex flex-col gap-1">
                 <h2 className={`text-3xl font-bold text-charcoal uppercase tracking-wider ${headCls}`}>{lang === 'TH' ? 'ตารางงานรายสัปดาห์' : 'Weekly Work Schedule'}</h2>
                 <p className={`text-primary font-bold ${subHeadCls}`}>{lang === 'TH' ? `ช่วงสัปดาห์ของวันที่ ${selectedDate.toLocaleDateString('th-TH')}` : `Schedule for the week of ${selectedDate.toLocaleDateString()}`}</p>
              </div>
              
              {/* แผงควบคุมสัปดาห์ที่เลือกพร้อมลูกศรเลื่อน */}
              <div className="flex items-center gap-3 bg-slate-50 p-2 rounded-2xl border border-slate-100 shadow-inner no-print">
                 <button 
                   onClick={() => handleShiftWeek(-7)}
                   className="w-10 h-10 rounded-xl bg-white hover:bg-slate-100 flex items-center justify-center text-slate-400 shadow-sm transition-all active:scale-90"
                 >
                   <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7"/></svg>
                 </button>
                 <div className="px-4 text-center min-w-[160px]">
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest block mb-0.5">Selected Week</span>
                    <span className="text-xs font-bold text-charcoal">
                       {(() => {
                           const base = new Date(selectedDate);
                           const start = new Date(base); start.setDate(base.getDate() - base.getDay());
                           const end = new Date(base); end.setDate(base.getDate() + (6 - base.getDay()));
                           
                           if (lang === 'TH') {
                               const fmt = (d: Date) => `${d.getDate()}/${d.getMonth()+1}/${d.getFullYear() + 543}`;
                               return `${fmt(start)} - ${fmt(end)}`;
                           }
                           return `${start.toLocaleDateString()} - ${end.toLocaleDateString()}`;
                       })()}
                    </span>
                 </div>
                 <button 
                   onClick={() => handleShiftWeek(7)}
                   className="w-10 h-10 rounded-xl bg-white hover:bg-slate-100 flex items-center justify-center text-slate-400 shadow-sm transition-all active:scale-90"
                 >
                   <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7"/></svg>
                 </button>
              </div>
           </div>

           <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-slate-200 min-w-[800px]">
                 <thead>
                    <tr className="bg-slate-100 text-charcoal">
                       <th className={`border border-slate-200 py-4 px-4 text-xs font-bold uppercase ${headCls}`}>ลำดับ</th>
                       <th className={`border border-slate-200 py-4 px-4 text-xs font-bold uppercase ${headCls}`}>ชื่อลูกค้า</th>
                       <th className={`border border-slate-200 py-4 px-4 text-xs font-bold uppercase ${headCls}`}>กิจกรรม / รายละเอียด</th>
                       <th className={`border border-slate-200 py-4 px-4 text-xs font-bold uppercase ${headCls}`}>สถานะ</th>
                    </tr>
                 </thead>
                 <tbody className={`text-[12px] ${bodyCls}`}>
                    {Object.keys(weeklyGroupedJobs).length === 0 ? (
                       <tr><td colSpan={4} className="py-20 text-center text-slate-300 italic">ไม่มีข้อมูลงานในช่วงสัปดาห์นี้</td></tr>
                    ) : (
                       Object.entries(weeklyGroupedJobs).map(([date, custGroups]) => (
                          <React.Fragment key={date}>
                             <tr className="bg-slate-50">
                                <td colSpan={4} className="py-3 px-6 font-black text-primary border border-slate-200 tracking-widest bg-red-50/50">
                                   📅 {new Date(date).toLocaleDateString(lang === 'TH' ? 'th-TH' : 'en-GB', { weekday: 'long', day: 'numeric', month: 'long' })}
                                </td>
                             </tr>
                             {Object.entries(custGroups).map(([customer, jobList], custIdx) => (
                                <React.Fragment key={customer}>
                                   {jobList.map((job, jobIdx) => (
                                      <tr key={job.id} className="hover:bg-slate-50/50 transition-colors group">
                                         {jobIdx === 0 && (
                                            <>
                                               <td className="border border-slate-200 py-4 px-4 text-center font-bold text-slate-400" rowSpan={jobList.length}>{custIdx + 1}</td>
                                               <td className={`border border-slate-200 py-4 px-6 font-bold text-charcoal ${headCls}`} rowSpan={jobList.length}>{customer}</td>
                                            </>
                                         )}
                                         <td className="border border-slate-200 py-4 px-6 text-slate-600 font-medium">
                                            <div className="flex items-center justify-between">
                                               <span>{job.activity}</span>
                                               <button onClick={() => { setEditingJob(job); setJobForm(job); setIsJobModalOpen(true); }} className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg bg-slate-100 text-slate-400 hover:text-primary transition-all no-print ml-2">
                                                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                                               </button>
                                            </div>
                                         </td>
                                         <td className="border border-slate-200 py-4 px-4 text-center">
                                            <span className={`px-2 py-1 rounded-lg text-[10px] font-bold uppercase ${job.status === 'DONE' ? 'bg-green-100 text-green-600' : job.status === 'IN_PROGRESS' ? 'bg-amber-100 text-amber-600' : 'bg-slate-100 text-slate-400'}`}>
                                               {job.status === 'DONE' ? t.status_done : job.status === 'IN_PROGRESS' ? t.status_in_progress : t.status_not_started}
                                            </span>
                                         </td>
                                      </tr>
                                   ))}
                                </React.Fragment>
                             ))}
                          </React.Fragment>
                       ))
                    )}
                 </tbody>
              </table>
           </div>
        </div>

        <JobModal 
          isOpen={isJobModalOpen}
          onClose={() => setIsJobModalOpen(false)}
          editingJob={editingJob}
          jobForm={jobForm}
          setJobForm={setJobForm}
          selectedDate={selectedDate}
          lang={lang}
          onSubmit={handleJobSubmit}
          onDelete={handleJobDelete}
        />
    </div>
  );
};
