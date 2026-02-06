
import React from 'react';
import { Employee } from '../../services/EmployeeService';
import { Language } from '../../App';
import { EmployeeFieldService } from './employee/EmployeeFieldService';
import { AdminFieldService } from './admin/AdminFieldService';

interface FieldServiceViewProps {
  user: Employee;
  allEmployees: Employee[];
  lang: Language;
  onJobUpdate: () => void;
}

export const FieldServiceView: React.FC<FieldServiceViewProps> = (props) => {
  const isHR = props.user.role === 'HR' || props.user.role === 'EXECUTIVE';

  if (isHR) {
    return <AdminFieldService {...props} />;
  }

  return <EmployeeFieldService {...props} />;
};
