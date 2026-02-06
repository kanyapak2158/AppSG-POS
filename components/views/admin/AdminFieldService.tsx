
import React, { useMemo, useState } from 'react';
import { Employee, EmployeeService, Job } from '../../../services/EmployeeService';
import { translations } from '../../../utils/translations';
import { Language } from '../../../App';

interface AdminFieldServiceProps {
  user: Employee;
  allEmployees: Employee[];
  lang: Language;
  onJobUpdate: () => void;
}

export const AdminFieldService: React.FC<AdminFieldServiceProps> = ({ user, allEmployees, lang, onJobUpdate }) => {
  const t = translations[lang];
  const headCls = lang === 'TH' ? 'font-prompt font-bold' : 'font-montserrat font-bold';
  const subHeadCls = lang === 'TH' ? 'font-prompt font-medium' : 'font-montserrat font-semibold';
  const bodyCls = lang === 'TH' ? 'font-prompt font-normal' : 'font-montserrat font-normal';

  const [searchTerm, setSearchTerm] = useState('');
  const [filterDate, setFilterDate] = useState('');

  const fieldServiceJobs = useMemo(() => {
    const allJobs = EmployeeService.getJobs();
    return allJobs.filter(j => j.activity.includes('[Field Service Trip]'))
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, []);

  const filteredJobs = useMemo(() => {
    return fieldServiceJobs.filter(j => {
      const emp = allEmployees.find(e => e.id === j.employeeId);
      const nameMatch = emp ? 
        (emp.nameTh.toLowerCase().includes(searchTerm.toLowerCase()) || 
         emp.nicknameTh.toLowerCase().includes(searchTerm.toLowerCase()) ||
         emp.nicknameEn.toLowerCase().includes(searchTerm.toLowerCase())) : false;
      const customerMatch = j.customerName.toLowerCase().includes(searchTerm.toLowerCase());
      const dateMatch = filterDate ? j.date === filterDate : true;
      return (nameMatch || customerMatch) && dateMatch;
    });
  }, [fieldServiceJobs, searchTerm, filterDate, allEmployees]);

  const totalTripsThisMonth = useMemo(() => {
      const currentMonth = new Date().toISOString().substring(0, 7);
      return fieldServiceJobs.filter(j => j.date.startsWith(currentMonth)).length;
  }, [fieldServiceJobs]);

  return (
    <div className="w-full h-full flex flex-col gap-8 animate-in pb-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
                <h1 className={`text-4xl text-charcoal ${headCls}`}>รายงานสรุปงานภาคสนาม</h1>
                <p className={`text-slate-400 text-sm mt-2 ${bodyCls}`}>ตรวจสอบประวัติการเดินทางและปฏิบัติงานภาคสนามของพนักงานทั้งหมด</p>
            </div>

            <div className="flex items-center gap-4">
                <div className="bg-white px-6 py-3 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
                    <div className="text-right">
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest block mb-0.5">รวมงานภาคสนามเดือนนี้</span>
                        <span className={`text-2xl text-primary ${headCls}`}>{totalTripsThisMonth} รายการ</span>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center text-primary">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                    </div>
                </div>
            </div>
        </div>

        <div className="bg-white rounded-[30px] p-6 shadow-sm border border-slate-100 flex flex-wrap items-center gap-4">
            <div className="flex-1 min-w-[250px] relative">
                <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                <input 
                    type="text" 
                    placeholder="ค้นหาชื่อพนักงาน หรือ ชื่อลูกค้า..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-11 pr-6 py-3 bg-slate-50 border border-transparent focus:border-primary focus:bg-white rounded-2xl outline-none transition-all text-sm"
                />
            </div>
            <div className="min-w-[180px]">
                <input 
                    type="date" 
                    value={filterDate}
                    onChange={(e) => setFilterDate(e.target.value)}
                    className="w-full px-5 py-3 bg-slate-50 border border-transparent focus:border-primary focus:bg-white rounded-2xl outline-none transition-all text-sm font-bold text-slate-500"
                />
            </div>
        </div>

        <div className="bg-white rounded-[40px] shadow-sm border border-slate-100 overflow-hidden flex-1 flex flex-col">
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[900px]">
                    <thead>
                        <tr className="bg-slate-50/50 border-b border-slate-100">
                            <th className={`py-5 px-8 text-[10px] text-slate-400 uppercase font-bold tracking-widest ${subHeadCls}`}>วันที่ / เวลา</th>
                            <th className={`py-5 px-8 text-[10px] text-slate-400 uppercase font-bold tracking-widest ${subHeadCls}`}>พนักงาน</th>
                            <th className={`py-5 px-8 text-[10px] text-slate-400 uppercase font-bold tracking-widest ${subHeadCls}`}>ลูกค้า / สถานที่</th>
                            <th className={`py-5 px-8 text-[10px] text-slate-400 uppercase font-bold tracking-widest ${subHeadCls}`}>รายละเอียดงาน</th>
                            <th className={`py-5 px-8 text-[10px] text-slate-400 uppercase font-bold tracking-widest text-right ${subHeadCls}`}>สถานะ</th>
                        </tr>
                    </thead>
                    <tbody className={`text-sm ${bodyCls}`}>
                        {filteredJobs.length === 0 ? (
                            <tr><td colSpan={5} className="py-20 text-center text-slate-300 italic">ไม่พบข้อมูลงานภาคสนาม</td></tr>
                        ) : (
                            filteredJobs.map((job) => {
                                const emp = allEmployees.find(e => e.id === job.employeeId);
                                return (
                                    <tr key={job.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors group">
                                        <td className="py-5 px-8 font-bold text-charcoal">{new Date(job.date).toLocaleDateString()}</td>
                                        <td className="py-5 px-8 flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl bg-charcoal text-white flex items-center justify-center font-bold text-xs">{emp?.nicknameEn.charAt(0)}</div>
                                            <div>
                                                <div className={`font-bold text-charcoal ${headCls}`}>{emp ? (lang === 'TH' ? emp.nicknameTh : emp.nicknameEn) : 'Unknown'}</div>
                                            </div>
                                        </td>
                                        <td className="py-5 px-8 text-charcoal text-xs font-bold">{job.customerName}</td>
                                        <td className="py-5 px-8 text-slate-500 text-[11px] line-clamp-2">{job.activity.replace('[Field Service Trip]', '').trim()}</td>
                                        <td className="py-5 px-8 text-right">
                                            <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${job.status === 'DONE' ? 'bg-green-100 text-green-600' : 'bg-amber-100 text-amber-600'}`}>
                                                {job.status === 'DONE' ? 'Completed' : 'Active'}
                                            </span>
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    </div>
  );
};
