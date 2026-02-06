
import React from 'react';
import { Employee } from '../../services/EmployeeService';
import { translations } from '../../utils/translations';
import { Language } from '../../App';

interface ProfileViewProps {
  user: Employee;
  lang: Language;
}

export const ProfileView: React.FC<ProfileViewProps> = ({ user, lang }) => {
  const t = translations[lang];
  const headCls = lang === 'TH' ? 'font-prompt font-bold' : 'font-montserrat font-bold';
  const subHeadCls = lang === 'TH' ? 'font-prompt font-medium' : 'font-montserrat font-semibold';
  const bodyCls = lang === 'TH' ? 'font-prompt font-normal' : 'font-montserrat font-normal';

  const infoItems = [
    { label: lang === 'TH' ? 'รหัสพนักงาน' : 'Employee ID', value: user.id },
    { label: lang === 'TH' ? 'ชื่อ-นามสกุล (ไทย)' : 'Name (TH)', value: user.nameTh },
    { label: lang === 'TH' ? 'ชื่อ-นามสกุล (อังกฤษ)' : 'Name (EN)', value: user.nameEn },
    { label: lang === 'TH' ? 'ชื่อเล่น' : 'Nickname', value: `${user.nicknameTh} (${user.nicknameEn})` },
    { label: lang === 'TH' ? 'ตำแหน่ง' : 'Position', value: user.position },
    { label: lang === 'TH' ? 'เบอร์โทรศัพท์' : 'Phone', value: user.phone },
    { label: lang === 'TH' ? 'อีเมล' : 'Email', value: user.email },
    { label: lang === 'TH' ? 'ระดับสิทธิ์' : 'Role', value: user.role, isBadge: true },
  ];

  return (
    <div className="w-full flex flex-col gap-10 animate-in pb-10">
      <h1 className={`text-4xl text-charcoal ${headCls}`}>{t.menu.profile}</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Card */}
        <div className="lg:col-span-1 flex flex-col items-center">
          <div className="w-full bg-white rounded-[40px] p-10 shadow-sm border border-slate-100 flex flex-col items-center text-center">
            <div className="w-40 h-40 bg-slate-100 rounded-full flex items-center justify-center text-slate-300 mb-6 border-4 border-slate-50 shadow-inner">
               <svg className="w-24 h-24" fill="currentColor" viewBox="0 0 20 20">
                 <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
               </svg>
            </div>
            <h2 className={`text-2xl text-charcoal mb-1 ${headCls}`}>{lang === 'TH' ? user.nameTh : user.nameEn}</h2>
            <p className={`text-primary font-bold uppercase tracking-wider text-sm mb-6 ${subHeadCls}`}>{user.position}</p>
            
            <div className="w-full pt-6 border-t border-slate-50 flex flex-col gap-3">
               <div className="flex items-center justify-between text-xs px-2">
                  <span className="text-slate-400 font-bold uppercase">{lang === 'TH' ? 'สถานะพนักงาน' : 'Status'}</span>
                  <span className="text-green-500 font-bold uppercase">Active</span>
               </div>
               <div className="flex items-center justify-between text-xs px-2">
                  <span className="text-slate-400 font-bold uppercase">{lang === 'TH' ? 'วันที่เริ่มงาน' : 'Join Date'}</span>
                  <span className="text-charcoal font-bold">01/01/2024</span>
               </div>
            </div>
          </div>
        </div>

        {/* Info Grid */}
        <div className="lg:col-span-2 bg-white rounded-[40px] p-10 shadow-sm border border-slate-100">
           <div className="flex items-center gap-4 mb-10">
              <div className="w-1.5 h-8 bg-primary rounded-full"></div>
              <h2 className={`text-xl font-bold text-charcoal uppercase tracking-widest ${headCls}`}>
                 {lang === 'TH' ? 'รายละเอียดข้อมูลพนักงาน' : 'Employee Details'}
              </h2>
           </div>
           
           <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
              {infoItems.map((item, idx) => (
                <div key={idx} className="flex flex-col gap-1 group">
                   <label className={`text-[10px] font-bold text-slate-400 uppercase tracking-[0.1em] ${subHeadCls}`}>
                      {item.label}
                   </label>
                   {item.isBadge ? (
                      <div>
                        <span className="inline-block px-3 py-1 rounded-lg bg-charcoal text-white text-xs font-bold uppercase tracking-widest mt-1">
                          {item.value}
                        </span>
                      </div>
                   ) : (
                      <p className={`text-lg text-charcoal border-b-2 border-transparent group-hover:border-primary/10 transition-colors pb-1 ${headCls}`}>
                        {item.value || '-'}
                      </p>
                   )}
                </div>
              ))}
           </div>

           <div className="mt-16 p-8 bg-slate-50 rounded-[30px] border border-slate-100 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-5">
                 <svg className="w-32 h-32" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                 </svg>
              </div>
              <p className={`text-xs text-slate-400 mb-2 uppercase font-bold tracking-widest ${subHeadCls}`}>
                 {lang === 'TH' ? 'หมายเหตุ' : 'System Note'}
              </p>
              <p className={`text-sm text-slate-500 leading-relaxed ${bodyCls}`}>
                 {lang === 'TH' 
                   ? 'ข้อมูลส่วนตัวถูกดึงมาจากระบบฐานข้อมูลกลาง หากต้องการแก้ไขข้อมูลกรุณาติดต่อฝ่ายบุคคล (HR) เพื่อดำเนินการปรับปรุงข้อมูลให้ถูกต้อง' 
                   : 'Profile data is synced from the central database. If you need to update any information, please contact HR for verification and processing.'}
              </p>
           </div>
        </div>
      </div>
    </div>
  );
};
