
import React, { useState, useEffect, useMemo } from 'react';
import { Employee, EmployeeService } from '../../services/EmployeeService';
import { translations } from '../../utils/translations';
import { Language } from '../../App';
import * as XLSX from 'xlsx';

interface HolidayViewProps {
  user: Employee;
  lang: Language;
}

interface Holiday {
  date: string;
  nameTh: string;
  nameEn: string;
}

const DEFAULT_HOLIDAYS: Holiday[] = [
  { date: '2025-01-01', nameTh: 'วันขึ้นปีใหม่', nameEn: "New Year's Day" },
  { date: '2025-02-12', nameTh: 'วันมาฆบูชา', nameEn: 'Makha Bucha Day' },
  { date: '2025-04-06', nameTh: 'วันจักรี', nameEn: 'Chakri Memorial Day' },
  { date: '2025-04-13', nameTh: 'วันสงกรานต์', nameEn: 'Songkran Festival' },
  { date: '2025-04-14', nameTh: 'วันสงกรานต์', nameEn: 'Songkran Festival' },
  { date: '2025-04-15', nameTh: 'วันสงกรานต์', nameEn: 'Songkran Festival' },
  { date: '2025-05-01', nameTh: 'วันแรงงานแห่งชาติ', nameEn: 'National Labour Day' },
  { date: '2025-05-05', nameTh: 'วันฉัตรมงคล', nameEn: 'Coronation Day' },
  { date: '2025-05-11', nameTh: 'วันวิสาขบูชา', nameEn: 'Visakha Bucha Day' },
  { date: '2025-06-03', nameTh: 'วันเฉลิมพระชนมพรรษาพระราชินี', nameEn: "H.M. Queen Suthida's Birthday" },
  { date: '2025-07-28', nameTh: 'วันเฉลิมพระชนมพรรษา ร.10', nameEn: "H.M. King's Birthday" },
  { date: '2025-08-12', nameTh: 'วันแม่แห่งชาติ', nameEn: "H.M. Queen Sirikit The Queen Mother's Birthday" },
  { date: '2025-10-13', nameTh: 'วันนวมินทรมหาราช', nameEn: 'King Bhumibol Adulyadej Memorial Day' },
  { date: '2025-10-23', nameTh: 'วันปิยมหาราช', nameEn: 'Chulalongkorn Day' },
  { date: '2025-12-05', nameTh: 'วันพ่อแห่งชาติ', nameEn: "Father's Day" },
  { date: '2025-12-10', nameTh: 'วันรัฐธรรมนูญ', nameEn: 'Constitution Day' },
  { date: '2025-12-31', nameTh: 'วันสิ้นปี', nameEn: "New Year's Eve" },
];

export const HolidayView: React.FC<HolidayViewProps> = ({ user, lang }) => {
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [statusMsg, setStatusMsg] = useState('');

  const t = translations[lang];
  const headCls = lang === 'TH' ? 'font-prompt font-bold' : 'font-montserrat font-bold';
  const bodyCls = lang === 'TH' ? 'font-prompt font-normal' : 'font-montserrat font-normal';

  const refreshData = () => {
    const savedHolidays = EmployeeService.getUploadedHolidays();
    setHolidays(savedHolidays && savedHolidays.length > 0 ? savedHolidays : DEFAULT_HOLIDAYS);
  };

  useEffect(() => {
    refreshData();
  }, []);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const result = evt.target?.result;
      if (file.name.endsWith('.json')) {
        try {
          const json = JSON.parse(result as string);
          if (Array.isArray(json)) {
            EmployeeService.saveUploadedHolidays(json);
            refreshData();
            setStatusMsg(t.req_upload_success);
          } else throw new Error();
        } catch (err) { setStatusMsg(t.req_upload_error); }
      } else {
        try {
          const data = new Uint8Array(result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: 'array', cellDates: false });
          const firstSheet = workbook.SheetNames[0];
          const rows = XLSX.utils.sheet_to_json(workbook.Sheets[firstSheet], { header: 1, defval: "" }) as any[][];
          
          const mapped: Holiday[] = [];
          for (let i = 1; i < rows.length; i++) {
              const row = rows[i];
              if (row && row.length >= 1) {
                  let dValue = row[0];
                  let dateStr = '';
                  if (typeof dValue === 'number') {
                      const dateObj = XLSX.SSF.parse_date_code(dValue);
                      dateStr = `${dateObj.y}-${String(dateObj.m).padStart(2, '0')}-${String(dateObj.d).padStart(2, '0')}`;
                  } else if (typeof dValue === 'string') {
                      const parts = dValue.trim().split(/[/.-]/);
                      if (parts.length === 3) {
                          dateStr = parts[0].length === 4 ? `${parts[0]}-${parts[1].padStart(2, '0')}-${parts[2].padStart(2, '0')}` : `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
                      }
                  }
                  if (dateStr && !isNaN(new Date(dateStr).getTime())) {
                      mapped.push({ date: dateStr, nameTh: row[1] ? String(row[1]).trim() : '', nameEn: row[2] ? String(row[2]).trim() : '' });
                  }
              }
          }
          if (mapped.length > 0) {
            EmployeeService.saveUploadedHolidays(mapped);
            refreshData();
            setStatusMsg(t.req_upload_success);
          } else throw new Error();
        } catch (err) { setStatusMsg(t.req_upload_error); }
      }
      setTimeout(() => setStatusMsg(''), 3000);
      e.target.value = '';
    };
    if (file.name.endsWith('.json')) reader.readAsText(file);
    else reader.readAsArrayBuffer(file);
  };

  const sortedHolidays = useMemo(() => {
      return [...holidays].sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [holidays]);

  const upcomingHoliday = useMemo(() => {
      const today = new Date();
      today.setHours(0,0,0,0);
      return sortedHolidays.find(h => new Date(h.date) >= today);
  }, [sortedHolidays]);

  return (
    <div className="w-full h-full flex flex-col gap-6 animate-in">
        <h1 className={`text-4xl text-charcoal ${headCls}`}>{t.req_holiday_tab}</h1>
        <div className="bg-white rounded-[40px] shadow-sm border border-slate-100 flex flex-col flex-1 overflow-y-auto p-4 md:p-10">
            {statusMsg && (
                <div className={`mb-8 p-4 text-center rounded-2xl font-bold border animate-in ${statusMsg === t.req_upload_error ? 'bg-red-50 text-red-700 border-red-100' : 'bg-green-50 text-green-700 border-green-100'}`}>
                    {statusMsg}
                </div>
            )}
            <div className="max-w-4xl mx-auto animate-in space-y-10 pb-10 w-full">
                {upcomingHoliday && (
                    <div className="bg-gradient-to-r from-charcoal to-slate-700 rounded-[35px] p-8 md:p-10 text-white shadow-2xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:scale-110 transition-transform duration-700"></div>
                        <div className="relative z-10">
                            <div className="inline-flex px-3 py-1 bg-primary rounded-lg text-[10px] font-bold uppercase tracking-widest mb-4">{t.holiday_upcoming}</div>
                            <h2 className={`text-3xl md:text-4xl mb-2 ${headCls}`}>{lang === 'TH' ? upcomingHoliday.nameTh : upcomingHoliday.nameEn}</h2>
                            <p className={`text-lg text-white/60 mb-6 ${bodyCls}`}>{lang === 'TH' ? upcomingHoliday.nameEn : upcomingHoliday.nameTh}</p>
                            <div className="flex items-center gap-2 text-white/90">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2-2v12a2 2 0 002 2z" /></svg>
                                <span className={`text-xl font-medium ${bodyCls}`}>{new Date(upcomingHoliday.date).toLocaleDateString(lang === 'TH' ? 'th-TH' : 'en-GB', { dateStyle: 'full' })}</span>
                            </div>
                        </div>
                    </div>
                )}
                <div className="flex flex-wrap items-center justify-between gap-6 bg-slate-50 p-6 rounded-[30px] border border-slate-100">
                     <div className="flex flex-wrap items-center gap-3">
                        <input type="file" className="hidden" id="holidayUpload" accept=".xlsx,.xls,.json" onChange={handleFileUpload} />
                        <label htmlFor="holidayUpload" className="px-6 py-3 bg-white border border-slate-200 rounded-xl shadow-sm text-charcoal text-sm font-bold hover:bg-slate-50 transition-all cursor-pointer flex items-center gap-2"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"/></svg>{t.req_upload_holiday}</label>
                        <button onClick={() => { EmployeeService.clearUploadedHolidays(); refreshData(); }} className="px-6 py-3 text-slate-400 hover:text-red-500 font-bold text-sm transition-colors">{t.req_reset_default}</button>
                     </div>
                </div>
                <div className="space-y-4">
                    <h3 className={`text-xl text-charcoal flex items-center gap-3 mb-6 ${headCls}`}><div className="w-1 h-6 bg-primary rounded-full"></div>{t.holiday_list}</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {sortedHolidays.map((h, i) => {
                            const d = new Date(h.date);
                            return (
                                <div key={i} className="bg-white p-5 rounded-[2rem] border border-slate-100 flex items-center gap-5 hover:bg-slate-50 transition-colors group">
                                    <div className="w-16 h-16 flex flex-col items-center justify-center bg-slate-100 rounded-2xl border border-slate-200 group-hover:bg-primary/5 group-hover:border-primary/20 transition-colors shrink-0">
                                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{d.toLocaleDateString(lang === 'TH' ? 'th-TH' : 'en-GB', { weekday: 'short' })}</div>
                                        <div className={`text-2xl text-charcoal group-hover:text-primary ${headCls}`}>{d.getDate()}</div>
                                    </div>
                                    <div className="flex-1 min-w-0 text-left">
                                        <div className={`text-lg text-charcoal truncate mb-0.5 ${headCls}`}>
                                            {lang === 'TH' ? (h.nameTh || h.nameEn) : (h.nameEn || h.nameTh)}
                                        </div>
                                        <div className={`text-xs text-slate-400 mb-1 italic ${bodyCls}`}>
                                            {lang === 'TH' ? h.nameEn : h.nameTh}
                                        </div>
                                        <div className="text-[10px] text-slate-300 font-bold uppercase tracking-widest">
                                            {d.toLocaleDateString(lang === 'TH' ? 'th-TH' : 'en-GB', { month: 'long', year: 'numeric' })}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    </div>
  );
};
