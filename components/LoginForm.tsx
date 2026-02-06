
import React, { useState, useEffect } from 'react';
import { EmployeeService, Employee } from '../services/EmployeeService';
import { Language } from '../App';
import { translations } from '../utils/translations';

type Team = 'BANGKOK' | 'CHONBURI';

interface LoginFormProps {
  onLogin: (employee: Employee, team: Team) => void;
  lang: Language;
  onLangToggle: () => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({ onLogin, lang, onLangToggle }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [team, setTeam] = useState<Team>('BANGKOK');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isForgotOpen, setIsForgotOpen] = useState(false);

  // Forgot Password State
  const [fEmail, setFEmail] = useState('');
  const [fNewPass, setFNewPass] = useState('');
  const [fConfirmPass, setFConfirmPass] = useState('');
  const [fStatus, setFStatus] = useState<{ type: 'success' | 'error', msg: string } | null>(null);

  const t = (translations as any)[lang];
  
  // Typography mapping as per user instruction
  const headCls = lang === 'TH' ? 'font-prompt font-bold' : 'font-montserrat font-bold';
  const subHeadCls = lang === 'TH' ? 'font-prompt font-medium' : 'font-montserrat font-semibold';
  const bodyCls = lang === 'TH' ? 'font-prompt font-normal' : 'font-montserrat font-normal';

  useEffect(() => {
    const saved = EmployeeService.getSavedCredentials();
    if (saved) {
      setEmail(saved.email);
      setPassword(saved.pass);
      setRememberMe(true);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    try {
      const employee = await EmployeeService.authenticate(email, password);
      if (employee) {
        EmployeeService.saveCredentials(email, password, rememberMe);
        EmployeeService.saveLoginSession(employee.id, team);
        onLogin(employee, team);
      } else {
        setError(t.errorAuth || (lang === 'TH' ? 'อีเมลหรือรหัสผ่านไม่ถูกต้อง' : 'Invalid email or password'));
      }
    } catch (err) {
      setError('System Error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (fNewPass !== fConfirmPass) {
        setFStatus({ type: 'error', msg: lang === 'TH' ? 'รหัสผ่านไม่ตรงกัน' : 'Passwords do not match' });
        return;
    }
    const success = await EmployeeService.updatePassword(fEmail, fNewPass);
    if (success) {
        setFStatus({ type: 'success', msg: lang === 'TH' ? 'เปลี่ยนรหัสผ่านสำเร็จ' : 'Password updated successfully' });
        setTimeout(() => { 
          setIsForgotOpen(false); 
          setFStatus(null); 
          setFEmail(''); 
          setFNewPass(''); 
          setFConfirmPass(''); 
        }, 2000);
    } else {
        setFStatus({ type: 'error', msg: lang === 'TH' ? 'ไม่พบอีเมลในระบบ' : 'Email not found' });
    }
  };

  return (
    <div className="bg-white rounded-[4rem] shadow-2xl p-10 md:p-14 relative animate-in w-full max-w-[480px]">
      {/* Language Toggle Button at Top Right */}
      <button 
        onClick={onLangToggle}
        className="absolute top-10 right-10 w-12 h-10 rounded-2xl bg-[#F8F9FB] flex items-center justify-center font-montserrat font-bold text-[13px] text-charcoal hover:bg-slate-100 transition-colors border border-slate-50 uppercase shadow-sm"
      >
        {lang === 'TH' ? 'EN' : 'TH'}
      </button>

      {/* Brand Header - Adjusted to match the provided logo image */}
      <div className="flex flex-col items-center mb-10 mt-4 select-none">
        <div className="flex items-center justify-center font-montserrat font-bold text-[48px] tracking-tight leading-tight">
          <span className="text-[#D0342C]">SGDATA</span>
          <span className="text-[#4A4A4A]">POS</span>
        </div>
        <p className="text-[11px] tracking-[0.4em] font-montserrat font-bold text-[#A1ADB9] uppercase mt-2">HR Management Portal</p>
      </div>

      {/* Page Title */}
      <div className="text-center mb-10">
        <h1 className={`text-[42px] leading-tight text-charcoal mb-1 ${headCls}`}>
          {t.loginTitle}
        </h1>
        <p className={`text-[15px] font-medium text-[#A1ADB9] ${subHeadCls}`}>
          {t.loginSub}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Office Selection Section */}
        <div className="space-y-3">
          <label className={`block text-[14px] font-medium text-[#A1ADB9] ml-1 ${bodyCls}`}>
            {t.office}
          </label>
          <div className="grid grid-cols-2 gap-4">
            {(['BANGKOK', 'CHONBURI'] as Team[]).map((tValue) => (
              <button
                key={tValue}
                type="button"
                onClick={() => setTeam(tValue)}
                className={`py-5 rounded-[1.8rem] text-[15px] font-bold transition-all ${
                  team === tValue 
                  ? 'bg-[#4A4A4A] text-white shadow-xl shadow-slate-300 scale-[1.02]' 
                  : 'bg-[#F8F9FB] text-[#A1ADB9] hover:bg-slate-50'
                } font-montserrat`}
              >
                {tValue}
              </button>
            ))}
          </div>
        </div>

        {/* Email Field */}
        <div className="space-y-2">
          <label className={`block text-[14px] font-medium text-[#A1ADB9] ml-1 ${bodyCls}`}>
            {t.email}
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={`w-full h-[68px] px-8 rounded-[1.8rem] bg-[#F8F9FB] border-none outline-none text-[#4A4A4A] text-[16px] transition-all font-medium placeholder:text-slate-200 ${bodyCls} shadow-inner`}
            placeholder="example@sgdatahub.com"
            required
          />
        </div>

        {/* Password Field */}
        <div className="space-y-2">
          <label className={`block text-[14px] font-medium text-[#A1ADB9] ml-1 ${bodyCls}`}>
            {t.password}
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={`w-full h-[68px] px-8 rounded-[1.8rem] bg-[#F8F9FB] border-none outline-none text-[#4A4A4A] text-[16px] transition-all font-medium placeholder:text-slate-200 font-montserrat tracking-widest shadow-inner`}
            placeholder="••••••••"
            required
          />
        </div>

        {/* Remember Me Checkbox */}
        <div className="flex items-center px-4">
          <label className="flex items-center gap-4 cursor-pointer group">
            <div className="relative">
              <input 
                type="checkbox" 
                checked={rememberMe} 
                onChange={(e) => setRememberMe(e.target.checked)} 
                className="peer h-6 w-6 cursor-pointer appearance-none rounded-md bg-[#F8F9FB] border border-slate-200 checked:bg-[#4A4A4A] transition-all"
              />
              <svg className="absolute left-1 top-1 h-4 w-4 text-white opacity-0 peer-checked:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <span className={`text-[15px] text-[#A1ADB9] group-hover:text-slate-600 transition-colors ${bodyCls}`}>
              {t.rememberMe}
            </span>
          </label>
        </div>

        {/* Error Message Display */}
        {error && (
          <div className={`bg-red-50 text-primary p-4 rounded-[1.8rem] text-[13px] ${bodyCls} text-center font-bold border border-red-100 animate-in`}>
            {error}
          </div>
        )}

        {/* Main Action Button */}
        <button
          type="submit"
          disabled={isLoading}
          className={`w-full py-6 bg-[#D0342C] text-white rounded-[1.8rem] text-[20px] shadow-2xl shadow-red-100 transition-all hover:bg-red-700 active:scale-[0.98] disabled:opacity-50 ${headCls}`}
        >
          {isLoading ? t.processing : t.signInBtn}
        </button>

        {/* Forgot Password Link */}
        <div className="text-center pt-4">
          <button 
            type="button" 
            onClick={() => setIsForgotOpen(true)}
            className={`text-[15px] font-medium text-[#A1ADB9] hover:text-[#D0342C] transition-colors underline underline-offset-8 decoration-slate-200 ${bodyCls}`}
          >
            {t.forgotLink}
          </button>
        </div>
      </form>

      {/* Forgot Password Modal */}
      {isForgotOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-charcoal/40 backdrop-blur-sm animate-in">
           <div className="bg-white w-full max-w-md rounded-[3.5rem] shadow-2xl p-10 md:p-12 flex flex-col relative border border-slate-100">
              <button 
                onClick={() => setIsForgotOpen(false)} 
                className="absolute top-10 right-10 text-slate-300 hover:text-charcoal transition-colors p-2"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              
              <h2 className={`text-2xl text-charcoal mb-2 ${headCls}`}>
                {t.forgotLink}
              </h2>
              <p className={`text-sm text-slate-400 mb-10 leading-relaxed ${bodyCls}`}>
                {lang === 'TH' ? 'กรุณากรอกอีเมลของคุณเพื่อตั้งรหัสผ่านใหม่' : 'Please enter your email to reset your password.'}
              </p>
              
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className={`text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1 ${subHeadCls}`}>Email Address</label>
                  <input 
                    type="email" 
                    value={fEmail} 
                    onChange={e => setFEmail(e.target.value)} 
                    className="w-full px-6 py-4 rounded-2xl bg-[#F8F9FB] border border-transparent focus:bg-white focus:border-slate-100 outline-none font-bold text-charcoal shadow-inner" 
                    placeholder="user@sgdatahub.com" 
                  />
                </div>
                <div className="space-y-2">
                  <label className={`text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1 ${subHeadCls}`}>New Password</label>
                  <input 
                    type="password" 
                    value={fNewPass} 
                    onChange={e => setFNewPass(e.target.value)} 
                    className="w-full px-6 py-4 rounded-2xl bg-[#F8F9FB] border border-transparent focus:bg-white focus:border-slate-100 outline-none font-bold text-charcoal shadow-inner" 
                    placeholder="••••••••" 
                  />
                </div>
                <div className="space-y-2">
                  <label className={`text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1 ${subHeadCls}`}>Confirm Password</label>
                  <input 
                    type="password" 
                    value={fConfirmPass} 
                    onChange={e => setFConfirmPass(e.target.value)} 
                    className="w-full px-6 py-4 rounded-2xl bg-[#F8F9FB] border border-transparent focus:bg-white focus:border-slate-100 outline-none font-bold text-charcoal shadow-inner" 
                    placeholder="••••••••" 
                  />
                </div>

                {fStatus && (
                   <div className={`p-4 rounded-2xl text-xs font-bold text-center border animate-in ${fStatus.type === 'success' ? 'bg-green-50 text-green-600 border-green-100' : 'bg-red-50 text-primary border-red-100'}`}>
                      {fStatus.msg}
                   </div>
                )}

                <button 
                  onClick={handleResetPassword} 
                  className={`w-full py-5 bg-charcoal text-white rounded-[1.8rem] font-bold shadow-xl hover:bg-black active:scale-[0.98] transition-all mt-4 tracking-widest ${headCls}`}
                >
                  RESET PASSWORD
                </button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};
