
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Employee, EmployeeService, LeaveRequest, OTRequest } from '../../../services/EmployeeService';
import { translations } from '../../../utils/translations';
import { Language } from '../../../App';

interface EmployeeRequestProps {
  user: Employee;
  lang: Language;
  allEmployees: Employee[];
  leaveHistory: LeaveRequest[];
  otHistory: OTRequest[];
  onSuccess: () => void;
  activeTab: 'LEAVE' | 'OT';
}

const CustomDatePicker = ({ value, onChange, lang, min }: { value: string, onChange: (val: string) => void, lang: Language, min?: string }) => {
  const headCls = lang === 'TH' ? 'font-prompt font-bold' : 'font-montserrat font-bold';
  const displayDate = useMemo(() => {
    if (!value) return '';
    const [y, m, d] = value.split('-');
    return `${d}/${m}/${y}`;
  }, [value]);

  return (
    <div className="relative group w-full cursor-pointer h-[60px]">
       <input 
          type="date" 
          required
          min={min}
          value={value}
          onKeyDown={(e) => e.preventDefault()}
          onChange={(e) => onChange(e.target.value)}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-30"
       />
       <div className={`absolute inset-0 w-full h-full px-5 bg-slate-200 rounded-2xl flex items-center justify-between transition-all border-2 border-slate-300 group-hover:bg-white group-hover:shadow-md ${!value ? 'text-slate-500' : 'text-charcoal'} z-10`}>
          <span className={`text-xl tracking-wide ${headCls}`}>
             {displayDate || (lang === 'TH' ? 'วว/ดด/ปปปป' : 'DD/MM/YYYY')}
          </span>
          <svg className="w-6 h-6 text-slate-500 group-hover:text-primary transition-colors pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2-2v12a2 2 0 002 2z" />
          </svg>
       </div>
    </div>
  );
};

const TimePicker = ({ value, onChange, lang }: { value: string, onChange: (val: string) => void, lang: Language }) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const [h, m] = value ? value.split(':') : ['00', '00'];
  const headCls = lang === 'TH' ? 'font-prompt font-bold' : 'font-montserrat font-bold';

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const hours = Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, '0'));
  const minutes = Array.from({ length: 60 }, (_, i) => i.toString().padStart(2, '0'));

  return (
    <div className="relative" ref={containerRef}>
       <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="w-full px-5 h-[60px] bg-slate-200 rounded-2xl flex items-center justify-between transition-all border-2 border-slate-300 hover:bg-white hover:shadow-md active:scale-[0.99] group focus:border-slate-100 outline-none"
       >
          <span className={`text-xl text-charcoal tracking-wide ${headCls}`}>{value}</span>
          <svg className="w-6 h-6 text-slate-500 group-hover:text-primary transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
       </button>
       {isOpen && (
          <div className="absolute top-full left-0 w-full mt-2 bg-white rounded-2xl shadow-xl border border-slate-100 z-50 p-2 h-64 flex overflow-hidden animate-in">
             <div className="flex-1 overflow-y-auto px-1 py-1 space-y-1">
                 {hours.map(hour => (
                     <div key={hour} onClick={() => onChange(`${hour}:${m}`)} className={`text-center py-2 rounded-xl text-sm font-bold cursor-pointer transition-colors ${hour === h ? 'bg-primary text-white' : 'text-slate-400 hover:bg-slate-50'}`}>{hour}</div>
                 ))}
             </div>
             <div className="w-px bg-slate-100 my-2 mx-1"></div>
             <div className="flex-1 overflow-y-auto px-1 py-1 space-y-1">
                 {minutes.map(min => (
                     <div key={min} onClick={() => { onChange(`${h}:${min}`); setIsOpen(false); }} className={`text-center py-2 rounded-xl text-sm font-bold cursor-pointer transition-colors ${min === m ? 'bg-primary text-white' : 'text-slate-400 hover:bg-slate-50'}`}>{min}</div>
                 ))}
             </div>
          </div>
       )}
    </div>
  );
};

export const EmployeeRequest: React.FC<EmployeeRequestProps> = ({ user, lang, allEmployees, leaveHistory, otHistory, onSuccess, activeTab }) => {
  const t = translations[lang];
  const headCls = lang === 'TH' ? 'font-prompt font-bold' : 'font-montserrat font-bold';
  const subHeadCls = lang === 'TH' ? 'font-prompt font-medium' : 'font-montserrat font-semibold';
  const bodyCls = lang === 'TH' ? 'font-prompt font-normal' : 'font-montserrat font-normal';

  const todayLocalStr = new Date().toLocaleDateString('en-CA');

  const [leaveForm, setLeaveForm] = useState<Partial<LeaveRequest>>({
    type: 'SICK',
    startDate: todayLocalStr,
    endDate: todayLocalStr,
    reason: '',
    coordinatorId: ''
  });

  const [otForm, setOtForm] = useState<Partial<OTRequest>>({
    date: todayLocalStr,
    startTime: '18:00',
    endTime: '21:00',
    reason: ''
  });

  const calculateDays = (start: string, end: string) => {
    if (!start || !end) return 0;
    const d1 = new Date(start);
    const d2 = new Date(end);
    const diffTime = Math.abs(d2.getTime() - d1.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  };

  const calculateOTDuration = (start: string, end: string) => {
    if (!start || !end) return '';
    const [h1, m1] = start.split(':').map(Number);
    const [h2, m2] = end.split(':').map(Number);
    let diff = (h2 * 60 + m2) - (h1 * 60 + m1);
    if (diff < 0) diff += 24 * 60;
    const hours = Math.floor(diff / 60);
    const mins = diff % 60;
    if (lang === 'TH') return `${hours} ชม. ${mins} นาที`;
    return `${hours} hrs ${mins} mins`;
  };

  const handleLeaveSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!leaveForm.startDate || !leaveForm.endDate) return;

    const request: LeaveRequest = {
      id: Date.now().toString(),
      employeeId: user.id,
      type: leaveForm.type as any,
      startDate: leaveForm.startDate,
      endDate: leaveForm.endDate,
      days: calculateDays(leaveForm.startDate, leaveForm.endDate),
      reason: leaveForm.reason || '',
      status: 'PENDING',
      timestamp: new Date().toISOString(),
      coordinatorId: leaveForm.coordinatorId || undefined,
      coordinatorStatus: leaveForm.coordinatorId ? 'PENDING' : undefined
    };

    EmployeeService.saveLeaveRequest(request);
    onSuccess();
    setLeaveForm({ type: 'SICK', startDate: todayLocalStr, endDate: todayLocalStr, reason: '', coordinatorId: '' });
  };

  const handleOTSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!otForm.date) return;

    const request: OTRequest = {
      id: Date.now().toString(),
      employeeId: user.id,
      date: otForm.date,
      startTime: otForm.startTime || '',
      endTime: otForm.endTime || '',
      reason: otForm.reason || '',
      status: 'PENDING',
      timestamp: new Date().toISOString()
    };

    EmployeeService.saveOTRequest(request);
    onSuccess();
    setOtForm({ date: todayLocalStr, startTime: '18:00', endTime: '21:00', reason: '' });
  };

  const incomingHandover = useMemo(() => {
    return EmployeeService.getAllLeaveRequests().filter(r => r.coordinatorId === user.id && r.coordinatorStatus === 'PENDING');
  }, [user.id, leaveHistory]);

  const handleAcceptHandover = (req: LeaveRequest) => {
    const updated = { ...req, coordinatorStatus: 'ACCEPTED' as const };
    EmployeeService.saveLeaveRequest(updated);
    onSuccess();
  };

  return (
    <div className="max-w-6xl mx-auto space-y-12 animate-in pb-10">
         {/* ... contents remain the same ... */}
         {activeTab === 'LEAVE' && (
             <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                 {([
                     { type: 'SICK', emoji: '🤒', color: 'bg-primary', lightColor: 'bg-red-50', entitled: 30, desc: t.req_policy_sick_desc },
                     { type: 'BUSINESS', emoji: '🏠', color: 'bg-charcoal', lightColor: 'bg-slate-100', entitled: 10, desc: t.req_policy_business_desc },
                     { type: 'VACATION', emoji: '🏖️', color: 'bg-amber-500', lightColor: 'bg-amber-50', entitled: 10, desc: t.req_policy_vacation_desc }
                 ] as const).map((policy) => {
                    const stats = { used: 0, count: 0 };
                    leaveHistory.forEach(req => { 
                        if (req.status === 'APPROVED' && req.type === policy.type) { 
                            stats.used += req.days; 
                            stats.count += 1; 
                        } 
                    });
                    return (
                        <div key={policy.type} className="bg-white rounded-[35px] border border-slate-100 p-8 shadow-sm flex flex-col relative overflow-hidden group hover:shadow-xl transition-all">
                            <div className="flex flex-col items-center text-center">
                                <div className="text-4xl mb-3">{policy.emoji}</div>
                                <h3 className={`text-2xl text-charcoal mb-1 ${headCls}`}>{t[`req_leave_${policy.type.toLowerCase() as any}` as any]}</h3>
                                <div className="flex items-baseline gap-2 mb-4">
                                    <span className="text-5xl font-bold text-slate-200 group-hover:text-charcoal transition-colors">{policy.entitled}</span>
                                    <span className="text-slate-400 font-bold text-sm">{lang === 'TH' ? 'วัน' : 'days'}</span>
                                </div>
                            </div>
                            <div className={`${policy.lightColor} rounded-3xl overflow-hidden mb-6 border border-slate-200/50`}>
                                <div className="flex divide-x divide-slate-200/50">
                                    <div className="flex-1 p-4 text-center">
                                        <p className="text-[10px] text-slate-400 font-bold uppercase mb-1">{t.req_used}</p>
                                        <p className={`text-xl font-bold text-charcoal ${headCls}`}>{stats.used}</p>
                                    </div>
                                    <div className="flex-1 p-4 text-center bg-white/40">
                                        <p className="text-[10px] text-slate-400 font-bold uppercase mb-1">{t.req_remaining}</p>
                                        <p className={`text-xl font-bold ${policy.type === 'SICK' ? 'text-primary' : 'text-charcoal'} ${headCls}`}>{policy.entitled - stats.used}</p>
                                    </div>
                                </div>
                            </div>
                            <div className="border-t border-slate-50 pt-6"><p className={`text-[11px] leading-relaxed text-slate-500 italic ${bodyCls}`}>{policy.desc}</p></div>
                        </div>
                    );
                 })}
             </div>
         )}

         {incomingHandover.length > 0 && activeTab === 'LEAVE' && (
             <div className="bg-amber-50 border border-amber-100 rounded-[30px] p-8 mb-4 max-w-4xl mx-auto">
                 <h3 className={`text-amber-800 text-lg font-bold mb-4 flex items-center gap-2 ${headCls}`}>
                     <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
                     {t.req_handover_incoming}
                 </h3>
                 <div className="space-y-4">
                     {incomingHandover.map(req => {
                         const sender = allEmployees.find(e => e.id === req.employeeId);
                         return (
                             <div key={req.id} className="bg-white p-6 rounded-2xl shadow-sm border border-amber-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                                 <div>
                                     <p className={`text-base font-bold text-charcoal ${subHeadCls}`}>{lang === 'TH' ? sender?.nicknameTh : sender?.nicknameEn} ({t[`req_leave_${req.type.toLowerCase() as 'sick' | 'business' | 'vacation'}`]})</p>
                                     <p className="text-sm text-slate-400">{new Date(req.startDate).toLocaleDateString()} - {new Date(req.endDate).toLocaleDateString()} ({req.days} {t.req_total_days})</p>
                                 </div>
                                 <button onClick={() => handleAcceptHandover(req)} className="px-6 py-3 bg-amber-500 text-white rounded-xl text-sm font-bold shadow-md hover:bg-amber-600 transition-all">{t.req_handover_btn_accept}</button>
                             </div>
                         );
                     })}
                 </div>
             </div>
         )}

         <div className="bg-slate-100/50 rounded-[40px] p-8 md:p-12 border border-slate-100 max-w-4xl mx-auto">
             <form onSubmit={activeTab === 'LEAVE' ? handleLeaveSubmit : handleOTSubmit} className="space-y-8">
                 {activeTab === 'LEAVE' ? (
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                         <div className="md:col-span-2">
                             <label className={`block text-xs text-slate-400 uppercase font-bold mb-3 ml-1 ${subHeadCls}`}>{t.req_leave_type}</label>
                             <div className="grid grid-cols-3 gap-3">
                                {[ { id: 'SICK', label: t.req_leave_sick, color: 'peer-checked:bg-primary' }, { id: 'BUSINESS', label: t.req_leave_business, color: 'peer-checked:bg-charcoal' }, { id: 'VACATION', label: t.req_leave_vacation, color: 'peer-checked:bg-amber-500' } ].map(type => (
                                    <label key={type.id} className="cursor-pointer">
                                        <input type="radio" name="leaveType" value={type.id} checked={leaveForm.type === type.id} onChange={e => setLeaveForm({...leaveForm, type: e.target.value as any})} className="peer sr-only" />
                                        <div className={`py-4 rounded-2xl border-2 border-slate-200 text-slate-400 text-center text-sm font-bold transition-all peer-checked:text-white peer-checked:border-transparent peer-checked:shadow-lg ${type.color}`}>{type.label}</div>
                                    </label>
                                ))}
                             </div>
                         </div>
                         <div>
                             <label className={`block text-xs text-slate-400 uppercase font-bold mb-3 ml-1 ${subHeadCls}`}>{t.req_from}</label>
                             <CustomDatePicker value={leaveForm.startDate || ''} onChange={val => setLeaveForm({...leaveForm, startDate: val})} lang={lang} />
                         </div>
                         <div>
                             <label className={`block text-xs text-slate-400 uppercase font-bold mb-3 ml-1 ${subHeadCls}`}>{t.req_to}</label>
                             <CustomDatePicker value={leaveForm.endDate || ''} onChange={val => setLeaveForm({...leaveForm, endDate: val})} lang={lang} min={leaveForm.startDate} />
                         </div>
                         <div className="md:col-span-2">
                             <label className={`block text-xs text-slate-400 uppercase font-bold mb-3 ml-1 ${subHeadCls}`}>{t.req_handover_title}</label>
                             <select value={leaveForm.coordinatorId} onChange={e => setLeaveForm({...leaveForm, coordinatorId: e.target.value})} className="w-full px-5 h-[60px] bg-slate-200 rounded-2xl border-2 border-slate-300 outline-none text-charcoal appearance-none cursor-pointer font-bold">
                                <option value="">{t.req_select_coordinator}</option>
                                {allEmployees.filter(e => e.id !== user.id).map(e => (<option key={e.id} value={e.id}>{lang === 'TH' ? e.nameTh : e.nameEn} ({lang === 'TH' ? e.nicknameTh : e.nicknameEn})</option>))}
                             </select>
                         </div>
                         <div className="md:col-span-2">
                             <label className={`block text-xs text-slate-400 uppercase font-bold mb-3 ml-1 ${subHeadCls}`}>{t.req_reason}</label>
                             <textarea rows={4} value={leaveForm.reason} onChange={e => setLeaveForm({...leaveForm, reason: e.target.value})} className="w-full px-6 py-5 bg-white rounded-[2rem] border-2 border-slate-200 outline-none text-charcoal resize-none font-medium" placeholder="..." />
                         </div>
                         <button type="submit" disabled={!leaveForm.startDate || !leaveForm.endDate} className={`md:col-span-2 w-full py-6 bg-primary text-white text-xl rounded-[2rem] shadow-xl shadow-red-100 hover:bg-red-700 active:scale-95 transition-all ${headCls} disabled:opacity-50`}>{t.req_submit}</button>
                     </div>
                 ) : (
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="md:col-span-2">
                            <label className={`block text-xs text-slate-400 uppercase font-bold mb-3 ml-1 ${subHeadCls}`}>{t.req_ot_date}</label>
                            <CustomDatePicker value={otForm.date || ''} onChange={val => setOtForm({...otForm, date: val})} lang={lang} />
                        </div>
                        <div className="space-y-2">
                            <label className={`block text-xs text-slate-400 uppercase font-bold mb-3 ml-1 ${subHeadCls}`}>{t.req_ot_start}</label>
                            <TimePicker value={otForm.startTime || '18:00'} onChange={val => setOtForm({...otForm, startTime: val})} lang={lang} />
                        </div>
                        <div className="space-y-2">
                            <label className={`block text-xs text-slate-400 uppercase font-bold mb-3 ml-1 ${subHeadCls}`}>{t.req_ot_end}</label>
                            <TimePicker value={otForm.endTime || '21:00'} onChange={val => setOtForm({...otForm, endTime: val})} lang={lang} />
                        </div>
                        <div className="md:col-span-2">
                            <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 flex items-center justify-between">
                                <span className={`text-xs font-bold text-blue-600 uppercase tracking-wider ${subHeadCls}`}>{t.req_ot_total}</span>
                                <span className={`text-xl font-bold text-blue-700 ${headCls}`}>
                                    {calculateOTDuration(otForm.startTime || '', otForm.endTime || '') || '-'}
                                </span>
                            </div>
                        </div>
                        <div className="md:col-span-2">
                            <label className={`block text-xs text-slate-400 uppercase font-bold mb-3 ml-1 ${subHeadCls}`}>{t.req_reason}</label>
                            <textarea rows={4} value={otForm.reason} onChange={e => setOtForm({...otForm, reason: e.target.value})} className="w-full px-6 py-5 bg-white rounded-[2rem] border-2 border-slate-200 outline-none text-charcoal resize-none font-medium" placeholder="..." />
                        </div>
                        <button type="submit" disabled={!otForm.date} className={`md:col-span-2 w-full py-6 bg-primary text-white text-xl rounded-[2rem] shadow-xl shadow-red-100 hover:bg-red-700 active:scale-95 transition-all ${headCls} disabled:opacity-50`}>{t.req_submit}</button>
                    </div>
                 )}
             </form>
         </div>

         <div className="bg-white rounded-[40px] p-8 border border-slate-100 max-w-5xl mx-auto">
             <h2 className={`text-2xl text-charcoal mb-8 flex items-center gap-3 ${headCls}`}><div className="w-1.5 h-8 bg-primary rounded-full"></div>{activeTab === 'LEAVE' ? t.req_history_title : t.req_ot_history_title}</h2>
             <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="border-b border-slate-100">
                            <th className={`pb-4 px-4 text-xs font-bold text-slate-400 uppercase ${subHeadCls}`}>{t.table_date}</th>
                            <th className={`pb-4 px-4 text-xs font-bold text-slate-400 uppercase ${subHeadCls}`}>{activeTab === 'LEAVE' ? t.req_leave_type : t.table_time}</th>
                            <th className={`pb-4 px-4 text-xs font-bold text-slate-400 uppercase ${subHeadCls}`}>{activeTab === 'LEAVE' ? t.req_coordinator_label : t.req_ot_total}</th>
                            <th className={`pb-4 px-4 text-xs font-bold text-slate-400 uppercase text-center ${subHeadCls}`}>{activeTab === 'LEAVE' ? t.req_total_days : ''}</th>
                            <th className={`pb-4 px-4 text-xs font-bold text-slate-400 uppercase text-right ${subHeadCls}`}>{t.table_status}</th>
                        </tr>
                    </thead>
                    <tbody className={`text-sm ${bodyCls}`}>
                        {activeTab === 'LEAVE' ? (
                            leaveHistory.map(req => {
                                const coordinator = allEmployees.find(e => e.id === req.coordinatorId);
                                return (
                                    <tr key={req.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50 transition-colors">
                                        <td className="py-5 px-4 text-slate-600">{new Date(req.startDate).toLocaleDateString()} - {new Date(req.endDate).toLocaleDateString()}</td>
                                        <td className="py-5 px-4"><span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${req.type === 'SICK' ? 'bg-red-50 text-red-600' : req.type === 'BUSINESS' ? 'bg-blue-50 text-blue-600' : 'bg-amber-50 text-amber-600'}`}>{t[`req_leave_${req.type.toLowerCase() as 'sick' | 'business' | 'vacation'}`]}</span></td>
                                        <td className="py-5 px-4 text-slate-500 font-medium">{coordinator ? (lang === 'TH' ? coordinator.nicknameTh : coordinator.nicknameEn) : '-'}</td>
                                        <td className="py-5 px-4 text-center font-bold text-charcoal">{req.days}</td>
                                        <td className="py-5 px-4 text-right"><span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${req.status === 'APPROVED' ? 'bg-green-50 text-green-600' : req.status === 'REJECTED' ? 'bg-red-50 text-red-600' : 'bg-slate-50 text-slate-500'}`}>{t[`req_status_${req.status.toLowerCase() as 'pending' | 'approved' | 'rejected'}`]}</span></td>
                                    </tr>
                                );
                            })
                        ) : (
                            otHistory.map(req => (
                                <tr key={req.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50 transition-colors">
                                    <td className="py-5 px-4 text-slate-600">{new Date(req.date).toLocaleDateString()}</td>
                                    <td className="py-5 px-4 font-bold text-charcoal">{req.startTime} - {req.endTime}</td>
                                    <td className="py-5 px-4 text-blue-600 font-bold">{calculateOTDuration(req.startTime, req.endTime)}</td>
                                    <td className="py-5 px-4 text-right"><span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${req.status === 'APPROVED' ? 'bg-green-50 text-green-600' : req.status === 'REJECTED' ? 'bg-red-50 text-red-600' : 'bg-slate-50 text-slate-500'}`}>{t[`req_status_${req.status.toLowerCase() as 'pending' | 'approved' | 'rejected'}`]}</span></td>
                                </tr>
                            ))
                        )}
                        {(activeTab === 'LEAVE' ? leaveHistory.length : otHistory.length) === 0 && <tr><td colSpan={5} className="py-10 text-center text-slate-300">{t.no_data}</td></tr>}
                    </tbody>
                </table>
             </div>
         </div>
    </div>
  );
};
