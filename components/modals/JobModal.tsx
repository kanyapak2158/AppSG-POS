
import React from 'react';
import { Job } from '../../services/EmployeeService';
import { translations } from '../../utils/translations';
import { Language } from '../../App';

interface JobModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingJob: Job | null;
  jobForm: Partial<Job>;
  setJobForm: (form: Partial<Job>) => void;
  selectedDate: Date;
  lang: Language;
  onSubmit: () => void;
  onDelete: (id: string) => void;
}

export const JobModal: React.FC<JobModalProps> = ({ 
  isOpen, onClose, editingJob, jobForm, setJobForm, selectedDate, lang, onSubmit, onDelete 
}) => {
  if (!isOpen) return null;

  const t = translations[lang];
  const headCls = lang === 'TH' ? 'font-prompt font-bold' : 'font-montserrat font-bold';
  const subHeadCls = lang === 'TH' ? 'font-prompt font-medium' : 'font-montserrat font-semibold';

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
       <div className="absolute inset-0 bg-charcoal/40 backdrop-blur-sm" onClick={onClose}></div>
       <div className="relative bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl p-8 flex flex-col animate-in max-h-[90vh] overflow-y-auto">
          <h2 className={`text-2xl text-center mb-6 text-charcoal ${headCls}`}>
             {editingJob ? t.edit_job : t.add_job}
          </h2>
          
          <div className="space-y-4">
             <div className="text-center text-slate-400 text-sm mb-2 font-bold bg-slate-50 py-2 rounded-xl">
                {selectedDate.toLocaleDateString(lang === 'TH' ? 'th-TH' : 'en-GB', { dateStyle: 'full' })}
             </div>

             <div>
                <label className={`block text-xs font-bold text-slate-400 uppercase mb-1 ml-1 ${subHeadCls}`}>{t.job_customer}</label>
                <input 
                   type="text" 
                   value={jobForm.customerName}
                   onChange={(e) => setJobForm({...jobForm, customerName: e.target.value})}
                   className="w-full px-5 py-3 rounded-2xl bg-slate-50 border-2 border-transparent focus:bg-white focus:border-slate-100 outline-none text-charcoal transition-all"
                   placeholder="Ex. Google Thailand"
                />
             </div>

             <div>
                <label className={`block text-xs font-bold text-slate-400 uppercase mb-1 ml-1 ${subHeadCls}`}>{t.job_activity}</label>
                <textarea 
                   rows={4}
                   value={jobForm.activity}
                   onChange={(e) => setJobForm({...jobForm, activity: e.target.value})}
                   className="w-full px-5 py-3 rounded-2xl bg-slate-50 border-2 border-transparent focus:bg-white focus:border-slate-100 outline-none text-charcoal transition-all resize-none"
                   placeholder="- Setup Server&#10;- Training Staff"
                />
             </div>

             <div>
                <label className={`block text-xs font-bold text-slate-400 uppercase mb-1 ml-1 ${subHeadCls}`}>{t.job_status}</label>
                <div className="grid grid-cols-3 gap-2">
                    {[
                        { val: 'NOT_STARTED', label: t.status_not_started, color: 'bg-slate-100 text-slate-500 peer-checked:bg-slate-600 peer-checked:text-white' },
                        { val: 'IN_PROGRESS', label: t.status_in_progress, color: 'bg-amber-50 text-amber-600 peer-checked:bg-amber-400 peer-checked:text-white' },
                        { val: 'DONE', label: t.status_done, color: 'bg-green-50 text-green-600 peer-checked:bg-green-500 peer-checked:text-white' },
                    ].map(opt => (
                        <label key={opt.val} className="cursor-pointer">
                            <input 
                                type="radio" 
                                name="status" 
                                value={opt.val} 
                                checked={jobForm.status === opt.val}
                                onChange={(e) => setJobForm({...jobForm, status: e.target.value as any})}
                                className="peer sr-only"
                            />
                            <div className={`text-[10px] md:text-xs font-bold text-center py-3 rounded-xl transition-all ${opt.color}`}>
                                {opt.label}
                            </div>
                        </label>
                    ))}
                </div>
             </div>

             <div>
                <label className={`block text-xs font-bold text-slate-400 uppercase mb-1 ml-1 ${subHeadCls}`}>{t.job_remark}</label>
                <input 
                   type="text" 
                   value={jobForm.remark}
                   onChange={(e) => setJobForm({...jobForm, remark: e.target.value})}
                   className="w-full px-5 py-3 rounded-2xl bg-slate-50 border-2 border-transparent focus:bg-white focus:border-slate-100 outline-none text-charcoal transition-all"
                />
             </div>
          </div>

          <div className="mt-8 flex gap-4">
             <button 
                onClick={() => {
                   if (editingJob) {
                      onDelete(editingJob.id);
                   } else {
                      onClose();
                   }
                }}
                className={`flex-1 py-4 rounded-2xl text-slate-400 font-bold hover:bg-slate-50 transition-colors ${editingJob ? 'hover:text-red-500 hover:bg-red-50' : ''}`}
             >
                {editingJob ? t.delete_job : t.btn_cancel}
             </button>
             <button 
                onClick={onSubmit}
                disabled={!jobForm.customerName}
                className="flex-[2] py-4 bg-primary text-white font-bold rounded-2xl shadow-xl shadow-red-100 hover:shadow-red-200 active:scale-95 transition-all disabled:opacity-50"
             >
                {t.btn_confirm}
             </button>
          </div>
       </div>
    </div>
  );
};
