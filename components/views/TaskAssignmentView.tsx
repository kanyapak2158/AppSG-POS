
import React, { useState, useEffect } from 'react';
import { Employee, EmployeeService, AssignedTask } from '../../services/EmployeeService';
import { translations } from '../../utils/translations';
import { Language } from '../../App';

interface TaskAssignmentViewProps {
  user: Employee;
  allEmployees: Employee[];
  lang: Language;
}

export const TaskAssignmentView: React.FC<TaskAssignmentViewProps> = ({ user, allEmployees, lang }) => {
  const [assignments, setAssignments] = useState<AssignedTask[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');
  const [form, setForm] = useState<{
    employeeIds: string[];
    date: string;
    time: string;
    customerName: string;
    activity: string;
    remark: string;
  }>({
    employeeIds: [],
    date: new Date().toISOString().split('T')[0],
    time: '09:00',
    customerName: '',
    activity: '',
    remark: ''
  });

  const t = translations[lang];
  const headCls = lang === 'TH' ? 'font-prompt font-bold' : 'font-montserrat font-bold';
  const subHeadCls = lang === 'TH' ? 'font-prompt font-medium' : 'font-montserrat font-semibold';
  const bodyCls = lang === 'TH' ? 'font-prompt font-normal' : 'font-montserrat font-normal';

  useEffect(() => {
    setAssignments(EmployeeService.getAssignments());
  }, []);

  const toggleEmployee = (id: string) => {
    setForm(prev => {
      const ids = prev.employeeIds.includes(id)
        ? prev.employeeIds.filter(eid => eid !== id)
        : [...prev.employeeIds, id];
      return { ...prev, employeeIds: ids };
    });
  };

  const selectAll = () => {
    const allIds = allEmployees.filter(e => e.id !== user.id).map(e => e.id);
    setForm(prev => ({ ...prev, employeeIds: allIds }));
  };

  const clearSelection = () => {
    setForm(prev => ({ ...prev, employeeIds: [] }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (form.employeeIds.length === 0) return;

    form.employeeIds.forEach(empId => {
      const newTask: AssignedTask = {
        id: `${Date.now()}_${empId}`,
        assignerId: user.id,
        employeeId: empId,
        date: form.date,
        time: form.time,
        customerName: form.customerName,
        activity: form.activity,
        remark: form.remark,
        status: 'PENDING',
        timestamp: new Date().toISOString()
      };
      EmployeeService.saveAssignment(newTask);
    });

    setAssignments(EmployeeService.getAssignments());
    setIsModalOpen(false);
    setForm({
      employeeIds: [],
      date: new Date().toISOString().split('T')[0],
      time: '09:00',
      customerName: '',
      activity: '',
      remark: ''
    });
    setStatusMsg(t.assign_success);
    setTimeout(() => setStatusMsg(''), 3000);
  };

  const handleDelete = (id: string) => {
    if (window.confirm(lang === 'TH' ? 'ยืนยันการยกเลิกการมอบหมาย?' : 'Confirm cancel assignment?')) {
      EmployeeService.deleteAssignment(id);
      setAssignments(EmployeeService.getAssignments());
    }
  };

  return (
    <div className="w-full flex flex-col gap-8 animate-in pb-10">
      <div className="flex items-center justify-between">
        <h1 className={`text-4xl text-charcoal ${headCls}`}>{t.assign_title}</h1>
        <button onClick={() => setIsModalOpen(true)} className="bg-primary text-white px-8 py-4 rounded-[20px] shadow-xl shadow-red-100 flex items-center gap-2 active:scale-95 hover:bg-red-700 transition-all">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" /></svg>
          <span className={`text-sm ${headCls}`}>{t.assign_btn}</span>
        </button>
      </div>

      {statusMsg && (
        <div className="bg-green-50 text-green-700 p-4 rounded-2xl border border-green-100 font-bold text-center animate-in">
          {statusMsg}
        </div>
      )}

      <div className="bg-white rounded-[40px] shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className={`py-5 px-6 text-xs text-slate-400 uppercase font-bold tracking-widest ${subHeadCls}`}>Employee</th>
                <th className={`py-5 px-6 text-xs text-slate-400 uppercase font-bold tracking-widest ${subHeadCls}`}>Schedule</th>
                <th className={`py-5 px-6 text-xs text-slate-400 uppercase font-bold tracking-widest ${subHeadCls}`}>Customer</th>
                <th className={`py-5 px-6 text-xs text-slate-400 uppercase font-bold tracking-widest ${subHeadCls}`}>Activity</th>
                <th className={`py-5 px-6 text-xs text-slate-400 uppercase font-bold tracking-widest ${subHeadCls}`}>Status</th>
                <th className={`py-5 px-6 text-xs text-slate-400 uppercase font-bold tracking-widest text-right ${subHeadCls}`}>Actions</th>
              </tr>
            </thead>
            <tbody className={`text-sm ${bodyCls}`}>
              {assignments.map(task => {
                const emp = allEmployees.find(e => e.id === task.employeeId);
                return (
                  <tr key={task.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                    <td className="py-5 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400 font-bold text-xs">
                          {emp?.nicknameEn.charAt(0)}
                        </div>
                        <span className="font-bold text-charcoal">{lang === 'TH' ? emp?.nicknameTh : emp?.nicknameEn}</span>
                      </div>
                    </td>
                    <td className="py-5 px-6">
                        <div className="text-slate-600 font-bold">{new Date(task.date).toLocaleDateString(lang === 'TH' ? 'th-TH' : 'en-GB', { day: '2-digit', month: 'short' })}</div>
                        <div className="text-[10px] text-slate-400 font-bold uppercase">{task.time}</div>
                    </td>
                    <td className="py-5 px-6 font-bold text-charcoal">{task.customerName}</td>
                    <td className="py-5 px-6 text-slate-600 truncate max-w-[200px]">{task.activity}</td>
                    <td className="py-5 px-6">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${task.status === 'PENDING' ? 'bg-amber-50 text-amber-600' : task.status === 'ACCEPTED' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                        {task.status === 'PENDING' ? t.assign_status_pending : task.status === 'ACCEPTED' ? t.assign_status_accepted : 'Rejected'}
                      </span>
                    </td>
                    <td className="py-5 px-6 text-right">
                      <button onClick={() => handleDelete(task.id)} className="p-2 rounded-xl bg-slate-100 text-slate-400 hover:bg-red-500 hover:text-white transition-all">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-4v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                      </button>
                    </td>
                  </tr>
                );
              })}
              {assignments.length === 0 && (
                  <tr>
                      <td colSpan={6} className="py-20 text-center text-slate-300 italic">No tasks assigned yet.</td>
                  </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-charcoal/40 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}></div>
          <div className="relative bg-white w-full max-w-2xl rounded-[3rem] shadow-2xl p-10 flex flex-col animate-in max-h-[90vh] overflow-y-auto">
            <h2 className={`text-2xl mb-8 ${headCls}`}>{t.assign_btn}</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* Employee Selection: Team or Individual */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className={`block text-[10px] font-bold text-slate-400 uppercase tracking-widest ${subHeadCls}`}>{t.assign_to}</label>
                  <div className="flex gap-2">
                    <button type="button" onClick={selectAll} className="text-[10px] font-bold text-primary hover:underline uppercase">Select Team</button>
                    <span className="text-slate-300 text-[10px]">|</span>
                    <button type="button" onClick={clearSelection} className="text-[10px] font-bold text-slate-400 hover:underline uppercase">Clear</button>
                  </div>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 bg-slate-50 p-4 rounded-2xl border border-slate-100 max-h-40 overflow-y-auto">
                  {allEmployees.filter(e => e.id !== user.id).map(emp => {
                    const isSelected = form.employeeIds.includes(emp.id);
                    return (
                      <button 
                        key={emp.id}
                        type="button"
                        onClick={() => toggleEmployee(emp.id)}
                        className={`px-3 py-2 rounded-xl text-[11px] font-bold border-2 transition-all flex items-center gap-2 truncate ${isSelected ? 'bg-primary border-primary text-white' : 'bg-white border-slate-200 text-slate-400 hover:border-primary/30'}`}
                      >
                        <div className={`w-2 h-2 rounded-full shrink-0 ${isSelected ? 'bg-white' : 'bg-slate-200'}`}></div>
                        <span className="truncate">{lang === 'TH' ? emp.nicknameTh : emp.nicknameEn}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Date and Time: High Visibility */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className={`block text-[10px] font-bold text-slate-400 uppercase mb-2 tracking-widest ${subHeadCls}`}>{t.th_date}</label>
                  <div className="relative group">
                    <input 
                      required 
                      type="date" 
                      value={form.date} 
                      onChange={e => setForm({...form, date: e.target.value})} 
                      className="w-full px-5 py-4 rounded-2xl bg-white border-2 border-primary/20 text-charcoal font-bold text-lg outline-none focus:border-primary transition-all shadow-sm"
                    />
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-primary">
                       <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                    </div>
                  </div>
                </div>
                <div>
                  <label className={`block text-[10px] font-bold text-slate-400 uppercase mb-2 tracking-widest ${subHeadCls}`}>Time</label>
                  <div className="relative group">
                    <input 
                      required 
                      type="time" 
                      value={form.time} 
                      onChange={e => setForm({...form, time: e.target.value})} 
                      className="w-full px-5 py-4 rounded-2xl bg-white border-2 border-primary/20 text-charcoal font-bold text-lg outline-none focus:border-primary transition-all shadow-sm"
                    />
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-primary">
                       <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <label className={`block text-[10px] font-bold text-slate-400 uppercase mb-2 tracking-widest ${subHeadCls}`}>{t.job_customer}</label>
                <input required type="text" value={form.customerName} onChange={e => setForm({...form, customerName: e.target.value})} className="w-full px-5 py-4 rounded-2xl bg-slate-50 border border-slate-200 outline-none focus:border-primary focus:bg-white transition-all text-sm font-bold shadow-inner" placeholder="..." />
              </div>

              <div>
                <label className={`block text-[10px] font-bold text-slate-400 uppercase mb-2 tracking-widest ${subHeadCls}`}>{t.job_activity}</label>
                <textarea required rows={3} value={form.activity} onChange={e => setForm({...form, activity: e.target.value})} className="w-full px-5 py-4 rounded-2xl bg-slate-50 border border-slate-200 outline-none focus:border-primary focus:bg-white transition-all text-sm font-medium resize-none shadow-inner" placeholder="..." />
              </div>

              <div className="flex gap-4 pt-6">
                <button type="button" onClick={() => setIsModalOpen(false)} className={`flex-1 py-4 text-slate-400 font-bold hover:bg-slate-100 rounded-2xl transition-all ${bodyCls}`}>
                  {t.btn_cancel}
                </button>
                <button 
                  type="submit" 
                  disabled={form.employeeIds.length === 0}
                  className={`flex-[2] py-4 bg-primary text-white font-bold rounded-2xl shadow-xl shadow-red-100 active:scale-95 transition-all disabled:opacity-30 ${headCls}`}
                >
                  {t.assign_btn} ({form.employeeIds.length})
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
