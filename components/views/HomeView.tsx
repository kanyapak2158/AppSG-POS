
import React, { useState } from 'react';
import { TimeRecord, Employee } from '../../services/EmployeeService';
import { Language } from '../../App';
import { EmployeeHome } from './employee/EmployeeHome';
import { AdminHome } from './admin/AdminHome';

interface HomeViewProps {
  time: Date;
  isCheckedIn: boolean;
  statusText: string;
  onAction: (type: 'CHECK_IN' | 'CHECK_OUT') => void;
  history: TimeRecord[];
  lang: Language;
  user: Employee;
  allEmployees: Employee[];
  onJobUpdate: () => void;
}

export const HomeView: React.FC<HomeViewProps> = (props) => {
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const isHR = props.user.role === 'HR' || props.user.role === 'EXECUTIVE';

  if (isHR) {
    return (
      <AdminHome 
        lang={props.lang} 
        allEmployees={props.allEmployees} 
        refreshTrigger={refreshTrigger}
        setRefreshTrigger={setRefreshTrigger}
        user={props.user} // เพิ่มการส่ง user prop
      />
    );
  }

  return (
    <EmployeeHome 
      {...props} 
      refreshTrigger={refreshTrigger}
      setRefreshTrigger={setRefreshTrigger}
    />
  );
};
