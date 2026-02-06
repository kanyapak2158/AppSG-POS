
import React from 'react';
import { Employee, EmployeeService } from '../../../services/EmployeeService';
import { translations } from '../../../utils/translations';
import { Language } from '../../../App';
import * as XLSX from 'xlsx';

interface ReportViewProps {
  user: Employee;
  lang: Language;
}

export const ReportView: React.FC<ReportViewProps> = ({ user, lang }) => {
  const t = translations[lang];
  const headCls = lang === 'TH' ? 'font-prompt font-bold' : 'font-montserrat font-bold';
  const bodyCls = lang === 'TH' ? 'font-prompt font-normal' : 'font-montserrat font-normal';

  // 1. Export Attendance Data
  const exportAttendance = () => {
    const wb = XLSX.utils.book_new();
    const history = EmployeeService.getTimeHistory(user.email);
    const data = history.map(r => ({
      [lang === 'TH' ? 'วันที่' : 'Date']: new Date(r.timestamp).toLocaleDateString(),
      [lang === 'TH' ? 'เวลา' : 'Time']: new Date(r.timestamp).toLocaleTimeString(),
      [lang === 'TH' ? 'ประเภท' : 'Type']: r.type === 'CHECK_IN' ? (lang === 'TH' ? 'เข้างาน' : 'In') : (lang === 'TH' ? 'ออกงาน' : 'Out'),
      [lang === 'TH' ? 'สถานที่' : 'Location']: r.location,
      [lang === 'TH' ? 'สถานะ' : 'Status']: r.status
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    XLSX.utils.book_append_sheet(wb, ws, "Attendance");
    XLSX.writeFile(wb, `SGDATA_Attendance_${user.nicknameEn}_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  // 2. Export Requests (Leave & OT)
  const exportRequests = () => {
    const wb = XLSX.utils.book_new();
    
    const leaves = EmployeeService.getLeaveRequests(user.id);
    const leaveData = leaves.map(l => ({
      [lang === 'TH' ? 'ประเภทการลา' : 'Leave Type']: l.type,
      [lang === 'TH' ? 'เริ่มวันที่' : 'Start']: l.startDate,
      [lang === 'TH' ? 'ถึงวันที่' : 'End']: l.endDate,
      [lang === 'TH' ? 'จำนวนวัน' : 'Days']: l.days,
      [lang === 'TH' ? 'เหตุผล' : 'Reason']: l.reason,
      [lang === 'TH' ? 'สถานะ' : 'Status']: l.status
    }));
    const leaveWS = XLSX.utils.json_to_sheet(leaveData);
    XLSX.utils.book_append_sheet(wb, leaveWS, "Leaves");

    const ots = EmployeeService.getOTRequests(user.id);
    const otData = ots.map(o => ({
      [lang === 'TH' ? 'วันที่ทำ OT' : 'OT Date']: o.date,
      [lang === 'TH' ? 'เวลาเริ่ม' : 'Start']: o.startTime,
      [lang === 'TH' ? 'เวลาสิ้นสุด' : 'End']: o.endTime,
      [lang === 'TH' ? 'เหตุผล' : 'Reason']: o.reason,
      [lang === 'TH' ? 'สถานะ' : 'Status']: o.status
    }));
    const otWS = XLSX.utils.json_to_sheet(otData);
    XLSX.utils.book_append_sheet(wb, otWS, "OT");

    XLSX.writeFile(wb, `SGDATA_Requests_${user.nicknameEn}_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  // 3. Export Job History
  const exportJobs = () => {
    const wb = XLSX.utils.book_new();
    const jobs = EmployeeService.getJobs().filter(j => j.employeeId === user.id);
    const data = jobs.map(j => ({
      [lang === 'TH' ? 'วันที่' : 'Date']: j.date,
      [lang === 'TH' ? 'ลูกค้า' : 'Customer']: j.customerName,
      [lang === 'TH' ? 'กิจกรรม' : 'Activity']: j.activity,
      [lang === 'TH' ? 'สถานะ' : 'Status']: j.status,
      [lang === 'TH' ? 'หมายเหตุ' : 'Remark']: j.remark
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    XLSX.utils.book_append_sheet(wb, ws, "Jobs");
    XLSX.writeFile(wb, `SGDATA_Jobs_${user.nicknameEn}_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const reportCards = [
    {
      title: lang === 'TH' ? 'รายงานประวัติเวลา' : 'Attendance Report',
      desc: lang === 'TH' ? 'ประวัติการเช็คอิน-เช็คเอาท์ และสถานที่ปฏิบัติงาน' : 'Check-in/out history and locations',
      icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z',
      color: 'bg-blue-50 text-blue-500',
      btnColor: 'bg-blue-600 hover:bg-blue-700 shadow-blue-100',
      action: exportAttendance
    },
    {
      title: lang === 'TH' ? 'รายงานการลาและโอที' : 'Leave & OT Report',
      desc: lang === 'TH' ? 'สรุปรายการขอลางานทุกประเภทและประวัติการขอ OT' : 'Leave requests and OT history summary',
      icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
      color: 'bg-amber-50 text-amber-500',
      btnColor: 'bg-amber-500 hover:bg-amber-600 shadow-amber-100',
      action: exportRequests
    },
    {
      title: lang === 'TH' ? 'รายงานปฏิบัติงาน' : 'Job Activity Report',
      desc: lang === 'TH' ? 'สรุปรายการงานที่ได้รับมอบหมายและสถานะงานทั้งหมด' : 'Assigned tasks and job status summary',
      icon: 'M13 10V3L4 14h7v7l9-11h-7z',
      color: 'bg-green-50 text-green-500',
      btnColor: 'bg-green-600 hover:bg-green-700 shadow-green-100',
      action: exportJobs
    }
  ];

  return (
    <div className="w-full flex flex-col gap-10 animate-in pb-10 h-full">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className={`text-4xl text-charcoal ${headCls}`}>{t.report_title}</h1>
          <p className={`text-slate-400 text-sm mt-1 ${bodyCls}`}>
            {lang === 'TH' ? 'เลือกประเภทข้อมูลที่ต้องการส่งออกเป็นไฟล์ Excel' : 'Choose report type to export as Excel file'}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {reportCards.map((card, idx) => (
            <div key={idx} className="bg-white rounded-[40px] p-8 shadow-sm border border-slate-100 flex flex-col items-center justify-between text-center group hover:shadow-xl transition-all h-[360px]">
               <div className={`w-24 h-24 ${card.color} rounded-[35px] flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                  <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={card.icon} />
                  </svg>
               </div>
               <div>
                  <h3 className={`text-xl text-charcoal mb-2 ${headCls}`}>{card.title}</h3>
                  <p className={`text-xs text-slate-400 mb-8 px-4 leading-relaxed ${bodyCls}`}>
                     {card.desc}
                  </p>
               </div>
               <button 
                  onClick={card.action}
                  className={`w-full py-4 ${card.btnColor} text-white rounded-2xl shadow-lg font-bold active:scale-95 transition-all ${headCls}`}
               >
                  Download Excel
               </button>
            </div>
          ))}
      </div>
    </div>
  );
};
