
import React from 'react';
import { TimeRecord } from '../../services/EmployeeService';
import { translations } from '../../utils/translations';
import { Language } from '../../App';

interface HistoryViewProps {
  history: TimeRecord[];
  lang: Language;
}

export const HistoryView: React.FC<HistoryViewProps> = ({ history, lang }) => {
  const t = translations[lang];
  const headCls = lang === 'TH' ? 'font-prompt font-bold' : 'font-montserrat font-bold';
  const subHeadCls = lang === 'TH' ? 'font-prompt font-medium' : 'font-montserrat font-semibold';
  const bodyCls = lang === 'TH' ? 'font-prompt font-normal' : 'font-montserrat font-normal';

  return (
    <div className="w-full flex flex-col gap-10 animate-in h-full">
       <h1 className={`text-4xl text-charcoal ${headCls}`}>{t.history_title}</h1>
       <div className="bg-white rounded-[40px] p-8 shadow-sm border border-slate-100 flex-1 overflow-hidden flex flex-col">
          {history.length === 0 ? (
             <div className="flex-1 flex flex-col items-center justify-center text-slate-300">
                <svg className="w-20 h-20 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                <span className={bodyCls}>{t.no_data}</span>
             </div>
          ) : (
             <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                   <thead>
                      <tr className="border-b border-slate-100">
                         <th className={`py-4 px-4 text-slate-400 font-normal text-sm uppercase tracking-wider ${subHeadCls}`}>{t.table_date}</th>
                         <th className={`py-4 px-4 text-slate-400 font-normal text-sm uppercase tracking-wider ${subHeadCls}`}>{t.table_time}</th>
                         <th className={`py-4 px-4 text-slate-400 font-normal text-sm uppercase tracking-wider ${subHeadCls}`}>{t.table_type}</th>
                         <th className={`py-4 px-4 text-slate-400 font-normal text-sm uppercase tracking-wider ${subHeadCls}`}>{t.table_location}</th>
                         <th className={`py-4 px-4 text-slate-400 font-normal text-sm uppercase tracking-wider ${subHeadCls}`}>{t.table_status}</th>
                      </tr>
                   </thead>
                   <tbody>
                      {history.map((record) => {
                         const date = new Date(record.timestamp);
                         return (
                            <tr key={record.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors group">
                               <td className={`py-5 px-4 text-charcoal ${bodyCls}`}>
                                  {date.toLocaleDateString(lang === 'TH' ? 'th-TH' : 'en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                               </td>
                               <td className={`py-5 px-4 text-charcoal font-bold ${headCls}`}>
                                  {date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                               </td>
                               <td className="py-5 px-4">
                                  <span className={`px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider ${
                                     record.type === 'CHECK_IN' ? 'bg-blue-50 text-blue-600' : 'bg-slate-100 text-slate-500'
                                  }`}>
                                     {record.type === 'CHECK_IN' ? t.type_in : t.type_out}
                                  </span>
                               </td>
                               <td className={`py-5 px-4 text-charcoal text-sm max-w-[200px] truncate ${bodyCls}`} title={record.location}>
                                  {record.location}
                               </td>
                               <td className="py-5 px-4">
                                  {record.status !== 'NONE' && (
                                     <span className={`flex items-center gap-1.5 ${
                                        record.status === 'LATE' ? 'text-amber-500' : 'text-green-500'
                                     } font-bold text-sm ${subHeadCls}`}>
                                        <span className={`w-2 h-2 rounded-full ${record.status === 'LATE' ? 'bg-amber-500' : 'bg-green-500'}`}></span>
                                        {record.status === 'LATE' ? t.status_late : t.status_normal}
                                     </span>
                                  )}
                               </td>
                            </tr>
                         );
                      })}
                   </tbody>
                </table>
             </div>
          )}
       </div>
    </div>
  );
};
