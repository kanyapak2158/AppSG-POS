
import React, { useState, useMemo } from 'react';
import { EmployeeService, EasyPassActivity } from '../../../services/EmployeeService';
import { translations } from '../../../utils/translations';
import { Language } from '../../../App';

interface EasyPassViewProps {
  lang: Language;
}

export const EasyPassView: React.FC<EasyPassViewProps> = ({ lang }) => {
  const t = translations[lang];
  const headCls = lang === 'TH' ? 'font-prompt font-bold' : 'font-montserrat font-bold';
  const bodyCls = lang === 'TH' ? 'font-prompt font-normal' : 'font-montserrat font-normal';
  
  const [activeMonth, setActiveMonth] = useState('January');
  const activities = useMemo(() => EmployeeService.getEasyPassActivities(), []);

  // Format timestamp like the image: "21 Jan 26 12:39"
  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    const day = d.getDate();
    const month = d.toLocaleDateString('en-GB', { month: 'short' });
    const year = String(d.getFullYear()).slice(-2);
    const time = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
    return `${day} ${month} ${year} ${time}`;
  };

  return (
    <div className="w-full flex flex-col items-center bg-softGrey min-h-full animate-in pb-10">
      <div className="w-full max-w-[500px] bg-white rounded-[40px] shadow-2xl overflow-hidden flex flex-col border border-slate-100">
        
        {/* Header - Navy Blue */}
        <div className="bg-[#004794] px-8 py-10 flex items-center gap-6">
          <button className="text-white">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7"/></svg>
          </button>
          <h1 className={`text-white text-3xl ${headCls}`}>{t.activity_title}</h1>
        </div>

        {/* Vehicle Info Card */}
        <div className="px-8 py-8 flex items-center justify-between border-b border-slate-50">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-white border border-slate-200 flex items-center justify-center p-2 shadow-sm overflow-hidden">
               <img src="https://upload.wikimedia.org/wikipedia/commons/4/4c/EXAT_Logo.png" alt="Logo" className="w-full h-auto" />
            </div>
            <div>
               <div className="text-slate-400 text-sm font-bold font-montserrat uppercase tracking-wider">Jaecoo</div>
               <div className="text-charcoal text-2xl font-bold font-montserrat tracking-tight">1295556053</div>
            </div>
          </div>
          <button className="px-6 py-2.5 rounded-full border-2 border-blue-100 text-[#004794] text-sm font-bold font-montserrat hover:bg-blue-50 transition-colors">
            {t.etax_invoice}
          </button>
        </div>

        {/* Month Navigation Tabs */}
        <div className="bg-slate-50 mx-4 mt-4 p-1.5 rounded-[1.5rem] flex gap-1 border border-slate-200/50 shadow-inner">
          {['January', 'December', 'November'].map(month => (
            <button 
              key={month}
              onClick={() => setActiveMonth(month)}
              className={`flex-1 py-3.5 rounded-[1.2rem] text-sm font-bold transition-all ${activeMonth === month ? 'bg-[#004794] text-white shadow-lg' : 'text-slate-400 hover:bg-white'}`}
            >
              {month}
            </button>
          ))}
        </div>

        {/* Activity List */}
        <div className="p-4 space-y-2 overflow-y-auto max-h-[600px] custom-scrollbar">
          {activities.map((item) => (
            <div key={item.id} className="bg-white px-4 py-5 flex items-start justify-between border-b border-slate-50 last:border-0 hover:bg-slate-50 transition-colors">
              <div className="flex gap-4">
                {/* Status Dot */}
                <div className={`w-3 h-3 rounded-full mt-2 shrink-0 ${item.type === 'TOPUP' ? 'bg-[#3CB043]' : 'bg-[#D0342C]'}`}></div>
                <div className="flex flex-col gap-1">
                  <h3 className={`text-charcoal text-lg leading-tight font-bold ${headCls}`}>{item.location}</h3>
                  <div className="flex flex-col">
                    <span className="text-slate-400 text-[13px] font-bold uppercase tracking-wide">{item.category}</span>
                  </div>
                </div>
              </div>

              <div className="text-right flex flex-col gap-1 shrink-0">
                <span className={`text-xl font-bold font-montserrat tracking-tight ${item.amount < 0 ? 'text-[#D0342C]' : 'text-[#3CB043]'}`}>
                  {item.amount < 0 ? item.amount.toFixed(2) : `+${item.amount.toFixed(2)}`}
                </span>
                <span className="text-slate-400 text-[11px] font-bold font-montserrat whitespace-nowrap">
                  {formatDate(item.timestamp)}
                </span>
              </div>
            </div>
          ))}
        </div>

      </div>
      
      {/* Visual Decor - Similar to HomeView for branding consistency */}
      <div className="mt-8 text-slate-300 text-[10px] font-bold uppercase tracking-[0.3em] font-montserrat">
        Easy Pass Activity Management System
      </div>
    </div>
  );
};
