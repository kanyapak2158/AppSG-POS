
import React, { useState, useEffect } from 'react';
import { Employee, EmployeeService, LeaveRequest, OTRequest, Job } from '../../services/EmployeeService';
import { translations } from '../../utils/translations';
import { Language } from '../../App';
import { EmployeeRequest } from './employee/EmployeeRequest';
import { AdminRequest } from './admin/AdminRequest';

interface RequestViewProps {
  user: Employee;
  lang: Language;
}

export const RequestView: React.FC<RequestViewProps> = ({ user, lang }) => {
  const isHR = user.role === 'HR' || user.role === 'EXECUTIVE';
  
  // ตั้งค่า Tab เริ่มต้น: HR เริ่มที่ JOBS, Employee เริ่มที่ LEAVE
  const [activeTab, setActiveTab] = useState<'LEAVE' | 'OT' | 'JOBS'>(isHR ? 'JOBS' : 'LEAVE');
  const [leaveHistory, setLeaveHistory] = useState<LeaveRequest[]>([]);
  const [otHistory, setOtHistory] = useState<OTRequest[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [allEmployees, setAllEmployees] = useState<Employee[]>([]);
  const [statusMsg, setStatusMsg] = useState('');
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const t = translations[lang];
  const headCls = lang === 'TH' ? 'font-prompt font-bold' : 'font-montserrat font-bold';

  // Fix: handle async call to getAllEmployees which returns a Promise
  const refreshData = async () => {
    if (isHR) {
      setLeaveHistory(EmployeeService.getAllLeaveRequests());
      setOtHistory(EmployeeService.getAllOTRequests());
      setJobs(EmployeeService.getJobs());
    } else {
      setLeaveHistory(EmployeeService.getLeaveRequests(user.id));
      setOtHistory(EmployeeService.getOTRequests(user.id));
    }
    const employees = await EmployeeService.getAllEmployees();
    setAllEmployees(employees);
  };

  useEffect(() => {
    refreshData();
  }, [user.id, refreshTrigger]);

  const handleUpdateStatus = (type: 'LEAVE' | 'OT' | 'JOBS', id: string, status: 'APPROVED' | 'REJECTED') => {
    if (type === 'LEAVE') {
      const allLeaves = EmployeeService.getAllLeaveRequests();
      const req = allLeaves.find(r => r.id === id);
      if (req) EmployeeService.saveLeaveRequest({ ...req, status });
    } else if (type === 'OT') {
      const allOTs = EmployeeService.getAllOTRequests();
      const req = allOTs.find(r => r.id === id);
      if (req) EmployeeService.saveOTRequest({ ...req, status });
    } else if (type === 'JOBS') {
      const allJobs = EmployeeService.getJobs();
      const job = allJobs.find(j => j.id === id);
      if (job) {
        EmployeeService.saveJob({ ...job, status: status === 'APPROVED' ? 'DONE' : 'NOT_STARTED' });
      }
    }
    setRefreshTrigger(prev => prev + 1);
  };

  const handleSuccess = () => {
    setRefreshTrigger(prev => prev + 1);
    setStatusMsg(t.req_success_msg);
    setTimeout(() => setStatusMsg(''), 3000);
  };

  return (
    <div className="w-full h-full flex flex-col gap-6 animate-in">
        <h1 className={`text-4xl text-charcoal ${headCls}`}>{isHR ? (lang === 'TH' ? 'ศูนย์อนุมัติคำขอ (Approval Center)' : 'Approval Center') : t.req_title}</h1>
        <div className="bg-white rounded-[40px] shadow-sm border border-slate-100 flex flex-col min-h-0 h-full overflow-hidden">
             <div className="flex border-b border-slate-100 p-2 gap-2 shrink-0">
                {/* ลำดับปุ่มสำหรับ HR/Executive: JOBS -> LEAVE -> OT */}
                {isHR && (
                  <button onClick={() => setActiveTab('JOBS')} className={`flex-1 py-4 rounded-[30px] text-sm font-bold transition-all ${activeTab === 'JOBS' ? 'bg-primary text-white shadow-md' : 'text-slate-400 hover:bg-slate-50'}`}>{lang === 'TH' ? 'อนุมัติงาน' : 'Job Approvals'}</button>
                )}
                
                <button onClick={() => setActiveTab('LEAVE')} className={`flex-1 py-4 rounded-[30px] text-sm font-bold transition-all ${activeTab === 'LEAVE' ? 'bg-primary text-white shadow-md' : 'text-slate-400 hover:bg-slate-50'}`}>{isHR ? (lang === 'TH' ? 'อนุมัติการลา' : 'Leave Approvals') : t.req_leave_tab}</button>
                <button onClick={() => setActiveTab('OT')} className={`flex-1 py-4 rounded-[30px] text-sm font-bold transition-all ${activeTab === 'OT' ? 'bg-primary text-white shadow-md' : 'text-slate-400 hover:bg-slate-50'}`}>{isHR ? (lang === 'TH' ? 'อนุมัติ OT' : 'OT Approvals') : t.req_ot_tab}</button>
             </div>
             <div className="flex-1 overflow-y-auto p-4 md:p-10">
                {statusMsg && <div className="mb-8 p-4 text-center rounded-2xl font-bold bg-green-50 text-green-700 border border-green-100 animate-in">{statusMsg}</div>}
                
                {isHR ? (
                  <AdminRequest 
                    user={user} 
                    lang={lang} 
                    allEmployees={allEmployees} 
                    leaveHistory={leaveHistory} 
                    otHistory={otHistory} 
                    jobs={jobs}
                    activeTab={activeTab} 
                    onUpdateStatus={handleUpdateStatus} 
                  />
                ) : (
                  <EmployeeRequest 
                    user={user} 
                    lang={lang} 
                    allEmployees={allEmployees} 
                    leaveHistory={leaveHistory} 
                    otHistory={otHistory} 
                    onSuccess={handleSuccess} 
                    activeTab={activeTab as 'LEAVE' | 'OT'}
                  />
                )}
             </div>
        </div>
    </div>
  );
};
