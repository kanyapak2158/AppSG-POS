
import React, { useState, useEffect } from 'react';
import { LoginForm } from './components/LoginForm';
import { Dashboard } from './components/Dashboard';
import { Employee, EmployeeService } from './services/EmployeeService';

export type Language = 'TH' | 'EN';

const App: React.FC = () => {
  const [user, setUser] = useState<Employee | null>(null);
  const [lang, setLang] = useState<Language>('TH');
  const [selectedOffice, setSelectedOffice] = useState<string>('BANGKOK');
  const [isInitializing, setIsInitializing] = useState(true);

  // ตรวจสอบ Session เมื่อเปิดแอป
  useEffect(() => {
    const savedUser = EmployeeService.getCurrentUser();
    const savedSession = localStorage.getItem('SGDATA_LAST_SESSION');
    if (savedUser) {
      setUser(savedUser);
      if (savedSession) {
        const sessionData = JSON.parse(savedSession);
        setSelectedOffice(sessionData.office || 'BANGKOK');
      }
    }
    setIsInitializing(false);

    // Listener สำหรับตรวจการ Logout จาก Tab อื่น
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'SGDATA_CURRENT_USER' && !e.newValue) {
        setUser(null);
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const handleLogin = (employee: Employee, team: string) => {
    setUser(employee);
    setSelectedOffice(team);
    EmployeeService.setCurrentUser(employee);
    localStorage.setItem('SGDATA_LAST_SESSION', JSON.stringify({ office: team, date: new Date().toISOString() }));
  };

  const handleLogout = () => {
    setUser(null);
    EmployeeService.logout();
  };

  const toggleLang = () => {
    setLang(prev => prev === 'TH' ? 'EN' : 'TH');
  };

  if (isInitializing) {
    return <div className="min-h-screen flex items-center justify-center bg-softGrey font-prompt">กำลังโหลดข้อมูล...</div>;
  }

  if (!user) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center p-4 bg-softGrey">
        <main className="w-full max-w-[480px]">
          <LoginForm onLogin={handleLogin} lang={lang} onLangToggle={toggleLang} />
        </main>
      </div>
    );
  }

  return (
    <Dashboard 
      user={user} 
      onLogout={handleLogout} 
      lang={lang} 
      onLangToggle={toggleLang} 
      selectedOffice={selectedOffice}
    />
  );
};

export default App;
