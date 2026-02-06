
import React, { useMemo } from 'react';
import { TimeRecord, Employee, EmployeeService } from '../../../services/EmployeeService';
import { translations } from '../../../utils/translations';
import { Language } from '../../../App';

interface EmployeeHomeProps {
  time: Date;
  isCheckedIn: boolean;
  statusText: string;
  onAction: (type: 'CHECK_IN' | 'CHECK_OUT') => void;
  history: TimeRecord[];
  lang: Language;
  user: Employee;
  onJobUpdate: () => void;
  refreshTrigger: number;
  setRefreshTrigger: React.Dispatch<React.SetStateAction<number>>;
}

export const EmployeeHome: React.FC<EmployeeHomeProps> = ({ 
  time, isCheckedIn, statusText, onAction, history, lang, user, onJobUpdate, refreshTrigger, setRefreshTrigger 
}) => {
  const t = translations[lang];
  const headCls = lang === 'TH' ? 'font-prompt font-bold' : 'font-montserrat font-bold';
  const subHeadCls = lang === 'TH' ? 'font-prompt font-medium' : 'font-montserrat font-semibold';
  const bodyCls = lang === 'TH' ? 'font-prompt font-normal' : 'font-montserrat font-normal';

  const pendingAssignments = useMemo(() => {
    return EmployeeService.getAssignments(user.id).filter(a => a.status === 'PENDING');
  }, [user.id, refreshTrigger]);

  const handleAssignmentStatus = (id: string, status: 'ACCEPTED' | 'REJECTED') => {
    EmployeeService.updateAssignmentStatus(id, status);
    setRefreshTrigger(prev => prev + 1);
    onJobUpdate();
  };

  return (
    <div className="flex flex-col gap-6 h-full animate-in">
        <div className="w-full bg-white rounded-[40px] shadow-sm border border-slate-100 p-8 flex flex-col items-center justify-center text-center relative overflow-hidden">
            <div className={`text-primary text-[18px] mb-2 ${subHeadCls}`}>
                {time.toLocaleDateString(lang === 'TH' ? 'th-TH' : 'en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
            </div>
            <div className="flex flex-col items-center gap-3 mb-6">
                <div className="text-4xl">🐈</div>
                <div className={`px-5 py-1.5 bg-slate-50 rounded-full text-[12px] text-slate-400 font-medium ${bodyCls}`}>
                    {isCheckedIn ? statusText : t.status_not_checked_in}
                </div>
            </div>
            <div className="text-[80px] sm:text-[100px] lg:text-[110px] xl:text-[120px] font-montserrat font-bold text-[#1a2138] leading-none mb-10 tracking-tighter">
                {time.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-lg">
                <button 
                    onClick={() => onAction('CHECK_IN')} 
                    disabled={isCheckedIn}
                    className={`py-6 rounded-[2rem] text-xl shadow-xl transition-all ${isCheckedIn ? 'bg-slate-100 text-slate-300' : 'bg-primary text-white hover:scale-[1.02] active:scale-95 shadow-red-100'} ${headCls}`}
                >
                    {t.check_in_btn}
                </button>
                <button 
                    onClick={() => onAction('CHECK_OUT')} 
                    disabled={!isCheckedIn}
                    className={`py-6 rounded-[2rem] text-xl border-[3px] transition-all ${!isCheckedIn ? 'border-slate-100 text-slate-200' : 'border-primary text-primary hover:bg-red-50 hover:scale-[1.02] active:scale-95'} ${headCls}`}
                >
                    {t.check_out_btn}
                </button>
            </div>
        </div>

        {pendingAssignments.length > 0 && (
            <div className="w-full bg-amber-50 rounded-[40px] shadow-sm border border-amber-200 p-8 flex flex-col gap-6 animate-in">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-amber-400 rounded-full flex items-center justify-center text-white shadow-sm">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>
                    </div>
                    <h2 className={`text-xl text-amber-800 ${headCls}`}>{t.assign_pending}</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {pendingAssignments.map(task => (
                        <div key={task.id} className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-amber-100 flex flex-col gap-4 group">
                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-2">
                                        <span className={`text-[10px] font-bold text-amber-500 uppercase tracking-widest ${subHeadCls}`}>New Task Assigned</span>
                                        <span className="bg-amber-100 text-amber-600 text-[10px] px-2 py-0.5 rounded-full font-bold">{task.time}</span>
                                    </div>
                                    <span className="text-[10px] text-slate-400 font-medium">{new Date(task.date).toLocaleDateString()}</span>
                                </div>
                                <h3 className={`text-lg text-charcoal font-bold ${headCls}`}>{task.customerName}</h3>
                                <p className={`text-sm text-slate-500 mt-1 line-clamp-2 ${bodyCls}`}>{task.activity}</p>
                            </div>
                            <div className="flex gap-2 pt-2">
                                <button onClick={() => handleAssignmentStatus(task.id, 'ACCEPTED')} className="flex-1 py-3 bg-green-500 text-white rounded-2xl text-xs font-bold shadow-md shadow-green-100 active:scale-95 transition-all">{t.assign_accept}</button>
                                <button onClick={() => handleAssignmentStatus(task.id, 'REJECTED')} className="flex-1 py-3 bg-slate-50 text-slate-400 rounded-2xl text-xs font-bold hover:bg-slate-100 active:scale-95 transition-all">{t.assign_reject}</button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        )}

        <div className="w-full flex-1 bg-white rounded-[40px] shadow-sm border border-slate-100 p-8 flex flex-col min-h-[400px]">
             <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-50">
                 <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center text-blue-500">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    </div>
                    <h2 className={`text-xl text-charcoal ${headCls}`}>{t.history_title}</h2>
                 </div>
             </div>
             <div className="flex-1 overflow-auto min-h-0 pr-2">
                 {history.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-slate-300">
                        <span className={bodyCls}>{t.no_data}</span>
                    </div>
                 ) : (
                    <table className="w-full text-left border-collapse">
                        <thead className="sticky top-0 bg-white shadow-sm z-10">
                            <tr>
                                <th className={`pb-3 pt-1 text-xs font-bold text-slate-400 uppercase tracking-wider ${subHeadCls}`}>{t.table_date}</th>
                                <th className={`pb-3 pt-1 text-xs font-bold text-slate-400 uppercase tracking-wider ${subHeadCls}`}>{t.table_time}</th>
                                <th className={`pb-3 pt-1 text-xs font-bold text-slate-400 uppercase tracking-wider ${subHeadCls}`}>{t.table_location}</th>
                                <th className={`pb-3 pt-1 text-xs font-bold text-slate-400 uppercase tracking-wider text-right ${subHeadCls}`}>{t.table_status}</th>
                            </tr>
                        </thead>
                        <tbody className={`text-sm ${bodyCls}`}>
                            {history.map((record) => {
                                const date = new Date(record.timestamp);
                                return (
                                    <tr key={record.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50 transition-colors">
                                        <td className="py-3 text-slate-600">
                                            {date.toLocaleDateString(lang === 'TH' ? 'th-TH' : 'en-GB', { day: '2-digit', month: '2-digit', year: '2-digit' })}
                                        </td>
                                        <td className="py-3 font-bold text-charcoal">
                                            {date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </td>
                                        <td className="py-3 max-w-[150px] truncate text-slate-500" title={record.location}>
                                            <div className="flex items-center gap-1.5">
                                                <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${record.type === 'CHECK_IN' ? 'bg-blue-400' : 'bg-slate-300'}`}></span>
                                                {record.location}
                                            </div>
                                        </td>
                                        <td className="py-3 text-right">
                                            {record.status !== 'NONE' && (
                                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider ${record.status === 'LATE' ? 'bg-amber-100 text-amber-600' : 'bg-green-100 text-green-600'}`}>
                                                    {record.status === 'LATE' ? t.status_late : t.status_normal}
                                                </span>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                 )}
             </div>
        </div>
    </div>
  );
};
