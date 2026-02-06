
import React from 'react';
import { Employee, LeaveRequest, OTRequest, Job } from '../../../services/EmployeeService';
import { translations } from '../../../utils/translations';
import { Language } from '../../../App';

interface AdminRequestProps {
  user: Employee;
  lang: Language;
  allEmployees: Employee[];
  leaveHistory: LeaveRequest[];
  otHistory: OTRequest[];
  jobs?: Job[];
  activeTab: 'LEAVE' | 'OT' | 'JOBS';
  onUpdateStatus: (type: 'LEAVE' | 'OT' | 'JOBS', id: string, status: 'APPROVED' | 'REJECTED') => void;
}

export const AdminRequest: React.FC<AdminRequestProps> = ({ user, lang, allEmployees, leaveHistory, otHistory, jobs = [], activeTab, onUpdateStatus }) => {
  const t = translations[lang];
  const headCls = lang === 'TH' ? 'font-prompt font-bold' : 'font-montserrat font-bold';
  const subHeadCls = lang === 'TH' ? 'font-prompt font-medium' : 'font-montserrat font-semibold';
  const bodyCls = lang === 'TH' ? 'font-prompt font-normal' : 'font-montserrat font-normal';

  const policyItems = [
    { type: 'SICK', emoji: '🤒', entitled: 30, desc: t.req_policy_sick_desc },
    { type: 'BUSINESS', emoji: '🏠', entitled: 10, desc: t.req_policy_business_desc },
    { type: 'VACATION', emoji: '🏖️', entitled: 10, desc: t.req_policy_vacation_desc }
  ];

  const getJobStatusLabel = (status: string) => {
    switch(status) {
      case 'DONE': return lang === 'TH' ? 'ทำเสร็จแล้ว' : 'Completed';
      case 'IN_PROGRESS': return lang === 'TH' ? 'กำลังทำ' : 'In Progress';
      default: return lang === 'TH' ? 'ยังไม่เริ่ม' : 'Not Started';
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-10 animate-in pb-10">
       {/* แสดง Leave Policy เฉพาะเมื่อเลือกแถบการลาเท่านั้น */}
       {activeTab === 'LEAVE' && (
         <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {policyItems.map((policy) => (
               <div key={policy.type} className="bg-white rounded-[35px] border border-slate-100 p-8 shadow-sm group hover:shadow-xl transition-all">
                  <div className="flex flex-col items-center text-center">
                     <div className="text-4xl mb-3">{policy.emoji}</div>
                     <h3 className={`text-xl text-charcoal mb-1 ${headCls}`}>{t[`req_leave_${policy.type.toLowerCase() as any}` as any]}</h3>
                     <div className="text-sm text-slate-400 font-bold mb-4 uppercase tracking-wider">{policy.entitled} {lang === 'TH' ? 'วัน' : 'days'} / year</div>
                     <div className="border-t border-slate-50 pt-4 w-full">
                        <p className={`text-[11px] leading-relaxed text-slate-400 text-left whitespace-pre-line ${bodyCls}`}>{policy.desc}</p>
                     </div>
                  </div>
               </div>
            ))}
         </div>
       )}

       <div className="bg-white rounded-[40px] p-8 md:p-10 shadow-sm border border-slate-100">
           <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                 <div className="w-1.5 h-8 bg-amber-400 rounded-full"></div>
                 <h2 className={`text-2xl font-bold text-charcoal uppercase tracking-wider ${headCls}`}>
                    {activeTab === 'LEAVE' ? (lang === 'TH' ? 'รายการขอลางานที่รออนุมัติ' : 'Pending Leave Requests') : 
                     activeTab === 'OT' ? (lang === 'TH' ? 'รายการขอ OT ที่รออนุมัติ' : 'Pending OT Requests') : 
                     (lang === 'TH' ? 'รายงานการปฏิบัติงานที่ส่งมาตรวจสอบ' : 'Reported Jobs for Review')}
                 </h2>
              </div>
           </div>

           <div className="space-y-4">
              {activeTab === 'LEAVE' && (
                leaveHistory.filter(r => r.status === 'PENDING').length === 0 ? (
                  <div className="py-20 text-center text-slate-300 border-2 border-dashed border-slate-100 rounded-[35px] bg-slate-50/30">
                     <div className="text-4xl mb-2">☕</div>
                     <p className={`font-bold uppercase tracking-widest text-xs ${bodyCls}`}>{t.no_data}</p>
                  </div>
                ) : (
                  leaveHistory.filter(r => r.status === 'PENDING').map(req => {
                    const emp = allEmployees.find(e => e.id === req.employeeId);
                    return (
                       <div key={req.id} className="bg-slate-50 p-6 rounded-[2.5rem] flex flex-col md:flex-row items-center justify-between gap-6 border border-slate-100 hover:bg-white hover:shadow-xl transition-all group">
                          <div className="flex items-center gap-4 flex-1">
                             <div className="w-16 h-16 rounded-2xl bg-white flex items-center justify-center text-2xl font-bold text-slate-400 shrink-0 shadow-sm border border-slate-100 group-hover:bg-primary group-hover:text-white transition-all">
                                {emp?.nicknameEn ? emp.nicknameEn.charAt(0) : 'L'}
                             </div>
                             <div className="text-left">
                                <div className={`text-lg font-bold text-charcoal ${headCls}`}>
                                   {lang === 'TH' ? emp?.nameTh : emp?.nameEn} ({lang === 'TH' ? emp?.nicknameTh : emp?.nicknameEn})
                                </div>
                                <div className="text-xs text-slate-500 font-medium mt-1">
                                   <span className="font-bold text-primary">{t[`req_leave_${req.type.toLowerCase() as any}` as any]}</span> • {new Date(req.startDate).toLocaleDateString()} - {new Date(req.endDate).toLocaleDateString()} ({req.days} วัน)
                                </div>
                                <div className="mt-2 text-[12px] text-slate-400 italic bg-white px-3 py-1.5 rounded-xl border border-slate-100 inline-block">
                                   "{req.reason || 'No reason provided'}"
                                </div>
                             </div>
                          </div>
                          <div className="flex gap-2 shrink-0">
                             <button onClick={() => onUpdateStatus('LEAVE', req.id, 'APPROVED')} className="px-8 py-3 bg-green-500 text-white rounded-2xl text-xs font-bold hover:bg-green-600 shadow-lg shadow-green-100 active:scale-95 transition-all">Approve</button>
                             <button onClick={() => onUpdateStatus('LEAVE', req.id, 'REJECTED')} className="px-8 py-3 bg-white text-red-500 border border-red-100 rounded-2xl text-xs font-bold hover:bg-red-50 active:scale-95 transition-all">Reject</button>
                          </div>
                       </div>
                    );
                  })
                )
              )}

              {activeTab === 'OT' && (
                otHistory.filter(r => r.status === 'PENDING').length === 0 ? (
                  <div className="py-20 text-center text-slate-300 border-2 border-dashed border-slate-100 rounded-[35px] bg-slate-50/30">
                     <div className="text-4xl mb-2">☕</div>
                     <p className={`font-bold uppercase tracking-widest text-xs ${bodyCls}`}>{t.no_data}</p>
                  </div>
                ) : (
                  otHistory.filter(r => r.status === 'PENDING').map(req => {
                    const emp = allEmployees.find(e => e.id === req.employeeId);
                    return (
                       <div key={req.id} className="bg-slate-50 p-6 rounded-[2.5rem] flex flex-col md:flex-row items-center justify-between gap-6 border border-slate-100 hover:bg-white hover:shadow-xl transition-all group">
                          <div className="flex items-center gap-4 flex-1">
                             <div className="w-16 h-16 rounded-2xl bg-white flex items-center justify-center text-2xl font-bold text-slate-400 shrink-0 shadow-sm border border-slate-100 group-hover:bg-amber-400 group-hover:text-white transition-all">
                                {emp?.nicknameEn ? emp.nicknameEn.charAt(0) : 'O'}
                             </div>
                             <div className="text-left">
                                <div className={`text-lg font-bold text-charcoal ${headCls}`}>
                                   {lang === 'TH' ? emp?.nameTh : emp?.nameEn} ({lang === 'TH' ? emp?.nicknameTh : emp?.nicknameEn})
                                </div>
                                <div className="text-xs text-slate-500 font-medium mt-1">
                                   <span className="font-bold text-amber-500 uppercase tracking-widest">OT REQUEST</span> • {new Date(req.date).toLocaleDateString()} • {req.startTime} - {req.endTime}
                                </div>
                                <div className="mt-2 text-[12px] text-slate-400 italic bg-white px-3 py-1.5 rounded-xl border border-slate-100 inline-block">
                                   "{req.reason || 'No reason provided'}"
                                </div>
                             </div>
                          </div>
                          <div className="flex gap-2 shrink-0">
                             <button onClick={() => onUpdateStatus('OT', req.id, 'APPROVED')} className="px-8 py-3 bg-green-500 text-white rounded-2xl text-xs font-bold hover:bg-green-600 shadow-lg shadow-green-100 active:scale-95 transition-all">Approve</button>
                             <button onClick={() => onUpdateStatus('OT', req.id, 'REJECTED')} className="px-8 py-3 bg-white text-red-500 border border-red-100 rounded-2xl text-xs font-bold hover:bg-red-50 active:scale-95 transition-all">Reject</button>
                          </div>
                       </div>
                    );
                  })
                )
              )}

              {activeTab === 'JOBS' && (
                jobs.filter(j => j.status === 'DONE' || j.status === 'IN_PROGRESS').length === 0 ? (
                  <div className="py-20 text-center text-slate-300 border-2 border-dashed border-slate-100 rounded-[35px] bg-slate-50/30">
                     <div className="text-4xl mb-2">📋</div>
                     <p className={`font-bold uppercase tracking-widest text-xs ${bodyCls}`}>{t.no_data}</p>
                  </div>
                ) : (
                  jobs.filter(j => j.status === 'DONE' || j.status === 'IN_PROGRESS').map(job => {
                    const emp = allEmployees.find(e => e.id === job.employeeId);
                    return (
                       <div key={job.id} className="bg-slate-50 p-6 rounded-[2.5rem] flex flex-col md:flex-row items-center justify-between gap-6 border border-slate-100 hover:bg-white hover:shadow-xl transition-all group">
                          <div className="flex items-center gap-4 flex-1">
                             <div className="w-16 h-16 rounded-2xl bg-white flex items-center justify-center text-2xl font-bold text-slate-400 shrink-0 shadow-sm border border-slate-100 group-hover:bg-blue-500 group-hover:text-white transition-all">
                                {emp?.nicknameEn ? emp.nicknameEn.charAt(0) : 'J'}
                             </div>
                             <div className="text-left">
                                <div className={`text-lg font-bold text-charcoal ${headCls}`}>
                                   {lang === 'TH' ? emp?.nameTh : emp?.nameEn} ({lang === 'TH' ? emp?.nicknameTh : emp?.nicknameEn})
                                </div>
                                <div className="text-xs text-slate-500 font-medium mt-1">
                                   <span className={`font-bold uppercase tracking-widest ${job.status === 'DONE' ? 'text-green-500' : 'text-blue-500'}`}>
                                     {getJobStatusLabel(job.status)}
                                   </span> • {job.customerName} • {new Date(job.date).toLocaleDateString()}
                                </div>
                                <div className="mt-2 text-[12px] text-slate-600 font-medium bg-white px-3 py-1.5 rounded-xl border border-slate-100 inline-block">
                                   {job.activity}
                                </div>
                             </div>
                          </div>
                          <div className="flex gap-2 shrink-0">
                             <button onClick={() => onUpdateStatus('JOBS', job.id, 'APPROVED')} className="px-8 py-3 bg-blue-500 text-white rounded-2xl text-xs font-bold hover:bg-blue-600 shadow-lg shadow-blue-100 active:scale-95 transition-all">Confirm</button>
                             <button onClick={() => onUpdateStatus('JOBS', job.id, 'REJECTED')} className="px-8 py-3 bg-white text-slate-400 border border-slate-100 rounded-2xl text-xs font-bold hover:bg-slate-50 active:scale-95 transition-all">Redo</button>
                          </div>
                       </div>
                    );
                  })
                )
              )}
           </div>
       </div>

       <div className="bg-white rounded-[40px] p-8 border border-slate-100">
           <h2 className={`text-xl text-charcoal mb-6 flex items-center gap-3 ${headCls}`}>
              <div className="w-1.5 h-6 bg-slate-300 rounded-full"></div>
              {lang === 'TH' ? 'ประวัติการตรวจสอบล่าสุด' : 'Recent Review History'}
           </h2>
           <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                 <thead>
                    <tr className="border-b border-slate-100">
                       <th className={`pb-4 px-4 text-xs font-bold text-slate-400 uppercase ${subHeadCls}`}>{lang === 'TH' ? 'พนักงาน' : 'Employee'}</th>
                       <th className={`pb-4 px-4 text-xs font-bold text-slate-400 uppercase ${subHeadCls}`}>{t.table_date}</th>
                       <th className={`pb-4 px-4 text-xs font-bold text-slate-400 uppercase ${subHeadCls}`}>{lang === 'TH' ? 'รายการ' : 'Type'}</th>
                       <th className={`pb-4 px-4 text-xs font-bold text-slate-400 uppercase text-right ${subHeadCls}`}>{t.table_status}</th>
                    </tr>
                 </thead>
                 <tbody className={`text-[13px] ${bodyCls}`}>
                    {activeTab === 'LEAVE' ? (
                       leaveHistory.filter(r => r.status !== 'PENDING').slice(0, 5).map(req => {
                          const emp = allEmployees.find(e => e.id === req.employeeId);
                          return (
                             <tr key={req.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50 transition-colors">
                                <td className="py-4 px-4 font-bold text-charcoal">{lang === 'TH' ? emp?.nicknameTh : emp?.nicknameEn}</td>
                                <td className="py-4 px-4 text-slate-500">{new Date(req.startDate).toLocaleDateString()} - {new Date(req.endDate).toLocaleDateString()}</td>
                                <td className="py-4 px-4 font-medium text-slate-400">{t[`req_leave_${req.type.toLowerCase() as any}` as any]}</td>
                                <td className="py-4 px-4 text-right">
                                   <span className={`px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wider ${req.status === 'APPROVED' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                                      {t[`req_status_${req.status.toLowerCase() as 'approved' | 'rejected'}`]}
                                   </span>
                                </td>
                             </tr>
                          )
                       })
                    ) : activeTab === 'OT' ? (
                       otHistory.filter(r => r.status !== 'PENDING').slice(0, 5).map(req => {
                          const emp = allEmployees.find(e => e.id === req.employeeId);
                          return (
                             <tr key={req.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50 transition-colors">
                                <td className="py-4 px-4 font-bold text-charcoal">{lang === 'TH' ? emp?.nicknameTh : emp?.nicknameEn}</td>
                                <td className="py-4 px-4 text-slate-500">{new Date(req.date).toLocaleDateString()}</td>
                                <td className="py-4 px-4 font-medium text-slate-400">OT Request</td>
                                <td className="py-4 px-4 text-right">
                                   <span className={`px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wider ${req.status === 'APPROVED' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                                      {t[`req_status_${req.status.toLowerCase() as 'approved' | 'rejected'}`]}
                                   </span>
                                </td>
                             </tr>
                          )
                       })
                    ) : (
                       jobs.filter(j => j.status === 'DONE').slice(0, 5).map(job => {
                          const emp = allEmployees.find(e => e.id === job.employeeId);
                          return (
                             <tr key={job.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50 transition-colors">
                                <td className="py-4 px-4 font-bold text-charcoal">{lang === 'TH' ? emp?.nicknameTh : emp?.nicknameEn}</td>
                                <td className="py-4 px-4 text-slate-500">{new Date(job.date).toLocaleDateString()}</td>
                                <td className="py-4 px-4 font-medium text-slate-400">{job.customerName}</td>
                                <td className="py-4 px-4 text-right">
                                   <span className={`px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wider bg-green-100 text-green-600`}>
                                      Confirmed
                                   </span>
                                </td>
                             </tr>
                          )
                       })
                    )}
                 </tbody>
              </table>
           </div>
       </div>
    </div>
  );
};
