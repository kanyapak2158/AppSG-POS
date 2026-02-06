
import React, { useState, useEffect } from 'react';
import { Employee, EmployeeService } from '../../services/EmployeeService';
import { translations } from '../../utils/translations';
import { Language } from '../../App';

interface EmployeeManagementViewProps {
  lang: Language;
  onUpdate: () => void;
}

export const EmployeeManagementView: React.FC<EmployeeManagementViewProps> = ({ lang, onUpdate }) => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [statusMsg, setStatusMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [form, setForm] = useState<Partial<Employee>>({
    id: '', nameTh: '', nameEn: '', nicknameTh: '', nicknameEn: '',
    position: '', phone: '', email: '', password: '', role: 'EMPLOYEE'
  });

  const t = translations[lang];
  const headCls = lang === 'TH' ? 'font-prompt font-bold' : 'font-montserrat font-bold';
  const subHeadCls = lang === 'TH' ? 'font-prompt font-medium' : 'font-montserrat font-semibold';
  const bodyCls = lang === 'TH' ? 'font-prompt font-normal' : 'font-montserrat font-normal';

  const refreshList = async () => {
    const data = await EmployeeService.getAllEmployees();
    setEmployees(data);
  };

  useEffect(() => {
    refreshList();
  }, []);

  const handleEdit = (emp: Employee) => {
    setEditingEmployee(emp);
    setForm(emp);
    setIsModalOpen(true);
  };

  const handleAddNew = () => {
    setEditingEmployee(null);
    setForm({
      id: Date.now().toString(),
      nameTh: '', nameEn: '', nicknameTh: '', nicknameEn: '',
      position: '', phone: '', email: '', password: '', role: 'EMPLOYEE'
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const success = await EmployeeService.saveEmployee(form as Employee);
    if (success) {
      await refreshList();
      onUpdate();
      setIsModalOpen(false);
      setStatusMsg(t.emp_save_success);
      setTimeout(() => setStatusMsg(''), 3000);
    }
    setIsSubmitting(false);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm(lang === 'TH' ? 'ยืนยันการลบพนักงาน?' : 'Confirm delete employee?')) {
        await EmployeeService.deleteEmployee(id);
        await refreshList();
        onUpdate();
    }
  };

  return (
    <div className="w-full flex flex-col gap-8 animate-in pb-10">
      <div className="flex items-center justify-between">
         <h1 className={`text-4xl text-charcoal ${headCls}`}>{t.emp_mgmt_title}</h1>
         <button onClick={handleAddNew} className="bg-primary text-white px-8 py-4 rounded-[20px] shadow-xl shadow-red-100 flex items-center gap-2 active:scale-95 hover:bg-red-700 transition-all">
             <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" /></svg>
             <span className={`text-sm ${headCls}`}>{t.emp_add_btn}</span>
         </button>
      </div>

      {statusMsg && (
          <div className="bg-green-50 text-green-700 p-4 rounded-2xl border border-green-100 font-bold text-center animate-in">
              {statusMsg}
          </div>
      )}

      <div className="bg-white rounded-[40px] shadow-sm border border-slate-100 overflow-hidden">
          <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[1200px]">
                  <thead>
                      <tr className="bg-slate-50/50 border-b border-slate-100">
                          <th className={`py-5 px-6 text-[10px] text-slate-400 uppercase font-bold tracking-widest ${subHeadCls}`}>{lang === 'TH' ? 'ชื่อภาษาไทย' : 'Name (TH)'}</th>
                          <th className={`py-5 px-6 text-[10px] text-slate-400 uppercase font-bold tracking-widest ${subHeadCls}`}>{lang === 'TH' ? 'ชื่อภาษาอังกฤษ' : 'Name (EN)'}</th>
                          <th className={`py-5 px-6 text-[10px] text-slate-400 uppercase font-bold tracking-widest ${subHeadCls}`}>{lang === 'TH' ? 'ชื่อเล่นไทย' : 'Nick (TH)'}</th>
                          <th className={`py-5 px-6 text-[10px] text-slate-400 uppercase font-bold tracking-widest ${subHeadCls}`}>{lang === 'TH' ? 'ชื่อเล่นอังกฤษ' : 'Nick (EN)'}</th>
                          <th className={`py-5 px-6 text-[10px] text-slate-400 uppercase font-bold tracking-widest ${subHeadCls}`}>Position</th>
                          <th className={`py-5 px-6 text-[10px] text-slate-400 uppercase font-bold tracking-widest ${subHeadCls}`}>Phone</th>
                          <th className={`py-5 px-6 text-[10px] text-slate-400 uppercase font-bold tracking-widest ${subHeadCls}`}>Email</th>
                          <th className={`py-5 px-6 text-[10px] text-slate-400 uppercase font-bold tracking-widest ${subHeadCls}`}>Password</th>
                          <th className={`py-5 px-6 text-[10px] text-slate-400 uppercase font-bold tracking-widest ${subHeadCls}`}>Role</th>
                          <th className={`py-5 px-6 text-[10px] text-slate-400 uppercase font-bold tracking-widest text-right ${subHeadCls}`}>Actions</th>
                      </tr>
                  </thead>
                  <tbody className={`text-[13px] ${bodyCls}`}>
                      {employees.map(emp => (
                          <tr key={emp.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                              <td className="py-4 px-6 font-bold text-charcoal">{emp.nameTh}</td>
                              <td className="py-4 px-6 text-slate-600 font-medium">{emp.nameEn}</td>
                              <td className="py-4 px-6 text-slate-500">{emp.nicknameTh}</td>
                              <td className="py-4 px-6 text-slate-500">{emp.nicknameEn}</td>
                              <td className="py-4 px-6 font-bold text-primary/80">{emp.position}</td>
                              <td className="py-4 px-6 text-slate-500">{emp.phone}</td>
                              <td className="py-4 px-6 text-slate-400 font-montserrat">{emp.email}</td>
                              <td className="py-4 px-6 text-slate-300 font-mono tracking-tighter">{emp.password}</td>
                              <td className="py-4 px-6">
                                  <span className={`px-2 py-1 rounded-md text-[9px] font-bold uppercase ${emp.role === 'EMPLOYEE' ? 'bg-blue-50 text-blue-500' : emp.role === 'HR' ? 'bg-amber-50 text-amber-600' : 'bg-charcoal text-white'}`}>
                                      {emp.role}
                                  </span>
                              </td>
                              <td className="py-4 px-6 text-right">
                                  <div className="flex items-center justify-end gap-2">
                                      <button onClick={() => handleEdit(emp)} className="p-2 rounded-xl bg-slate-100 text-slate-400 hover:bg-primary hover:text-white transition-all">
                                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                                      </button>
                                      <button onClick={() => handleDelete(emp.id)} className="p-2 rounded-xl bg-slate-100 text-slate-400 hover:bg-red-500 hover:text-white transition-all">
                                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-4v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                      </button>
                                  </div>
                              </td>
                          </tr>
                      ))}
                  </tbody>
              </table>
          </div>
      </div>

      {isModalOpen && (
          <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
              <div className="absolute inset-0 bg-charcoal/40 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}></div>
              <div className="relative bg-white w-full max-w-4xl rounded-[3rem] shadow-2xl p-10 flex flex-col animate-in max-h-[90vh] overflow-y-auto">
                  <h2 className={`text-2xl mb-8 ${headCls}`}>{editingEmployee ? t.emp_edit_btn : t.emp_add_btn}</h2>
                  <form onSubmit={handleSubmit} className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                              <label className={`block text-[10px] font-bold text-slate-400 uppercase mb-2 ${subHeadCls}`}>{t.emp_th_name}</label>
                              <input required type="text" value={form.nameTh} onChange={e => setForm({...form, nameTh: e.target.value})} className="w-full px-5 py-3 rounded-2xl bg-slate-50 border border-slate-100 outline-none focus:border-primary transition-all text-sm font-bold" />
                          </div>
                          <div>
                              <label className={`block text-[10px] font-bold text-slate-400 uppercase mb-2 ${subHeadCls}`}>{t.emp_en_name}</label>
                              <input required type="text" value={form.nameEn} onChange={e => setForm({...form, nameEn: e.target.value})} className="w-full px-5 py-3 rounded-2xl bg-slate-50 border border-slate-100 outline-none focus:border-primary transition-all text-sm font-bold" />
                          </div>
                          <div>
                              <label className={`block text-[10px] font-bold text-slate-400 uppercase mb-2 ${subHeadCls}`}>{t.emp_th_nick}</label>
                              <input type="text" value={form.nicknameTh} onChange={e => setForm({...form, nicknameTh: e.target.value})} className="w-full px-5 py-3 rounded-2xl bg-slate-50 border border-slate-100 outline-none focus:border-primary transition-all text-sm font-bold" />
                          </div>
                          <div>
                              <label className={`block text-[10px] font-bold text-slate-400 uppercase mb-2 ${subHeadCls}`}>{t.emp_en_nick}</label>
                              <input type="text" value={form.nicknameEn} onChange={e => setForm({...form, nicknameEn: e.target.value})} className="w-full px-5 py-3 rounded-2xl bg-slate-50 border border-slate-100 outline-none focus:border-primary transition-all text-sm font-bold" />
                          </div>
                          <div>
                              <label className={`block text-[10px] font-bold text-slate-400 uppercase mb-2 ${subHeadCls}`}>{t.emp_pos}</label>
                              <input required type="text" value={form.position} onChange={e => setForm({...form, position: e.target.value})} className="w-full px-5 py-3 rounded-2xl bg-slate-50 border border-slate-100 outline-none focus:border-primary transition-all text-sm font-bold" />
                          </div>
                          <div>
                              <label className={`block text-[10px] font-bold text-slate-400 uppercase mb-2 ${subHeadCls}`}>{t.emp_phone}</label>
                              <input required type="text" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} className="w-full px-5 py-3 rounded-2xl bg-slate-50 border border-slate-100 outline-none focus:border-primary transition-all text-sm font-bold" />
                          </div>
                          <div>
                              <label className={`block text-[10px] font-bold text-slate-400 uppercase mb-2 ${subHeadCls}`}>{t.emp_email}</label>
                              <input required type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} className="w-full px-5 py-3 rounded-2xl bg-slate-50 border border-slate-100 outline-none focus:border-primary transition-all text-sm font-bold" />
                          </div>
                          <div>
                              <label className={`block text-[10px] font-bold text-slate-400 uppercase mb-2 ${subHeadCls}`}>{t.emp_pass}</label>
                              <input required type="text" value={form.password} onChange={e => setForm({...form, password: e.target.value})} className="w-full px-5 py-3 rounded-2xl bg-slate-50 border border-slate-100 outline-none focus:border-primary transition-all text-sm font-bold" />
                          </div>
                          <div className="md:col-span-2">
                              <label className={`block text-[10px] font-bold text-slate-400 uppercase mb-2 ${subHeadCls}`}>{t.emp_role}</label>
                              <div className="grid grid-cols-3 gap-3">
                                  {(['EMPLOYEE', 'HR', 'EXECUTIVE'] as const).map(role => (
                                      <label key={role} className="cursor-pointer">
                                          <input type="radio" name="role" value={role} checked={form.role === role} onChange={e => setForm({...form, role: e.target.value as any})} className="peer sr-only" />
                                          <div className="py-3 text-center border-2 border-slate-100 rounded-xl font-bold text-xs text-slate-400 peer-checked:bg-charcoal peer-checked:text-white peer-checked:border-transparent transition-all">
                                              {role}
                                          </div>
                                      </label>
                                  ))}
                              </div>
                          </div>
                      </div>
                      <div className="flex gap-4 pt-6">
                          <button type="button" onClick={() => setIsModalOpen(false)} className={`flex-1 py-4 text-slate-400 font-bold hover:bg-slate-50 rounded-2xl transition-all ${bodyCls}`}>
                              {t.btn_cancel}
                          </button>
                          <button type="submit" disabled={isSubmitting} className={`flex-[2] py-4 bg-primary text-white font-bold rounded-2xl shadow-xl shadow-red-100 active:scale-95 transition-all ${headCls}`}>
                              {isSubmitting ? 'Processing...' : t.btn_confirm}
                          </button>
                      </div>
                  </form>
              </div>
          </div>
      )}
    </div>
  );
};
