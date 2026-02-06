
import React, { useState } from 'react';
import { Employee, Job } from '../../services/EmployeeService';
import { translations } from '../../utils/translations';
import { Language } from '../../App';
import { EmployeeCalendar } from './employee/EmployeeCalendar';
import { AdminCalendar } from './admin/AdminCalendar';

interface CalendarViewProps {
  jobs: Job[];
  user: Employee;
  allEmployees: Employee[];
  lang: Language;
  onJobUpdate: () => void;
  forceTeamView?: boolean;
}

export const CalendarView: React.FC<CalendarViewProps> = (props) => {
  const [calendarDate, setCalendarDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const isExecutive = props.user.role === 'EXECUTIVE' || props.user.role === 'HR';
  const showTeamView = props.forceTeamView || isExecutive;

  const t = translations[props.lang];
  const headCls = props.lang === 'TH' ? 'font-prompt font-bold' : 'font-montserrat font-bold';

  const toLocalISOString = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDay = new Date(year, month, 1).getDay();
    const days = [];
    for (let i = 0; i < firstDay; i++) days.push(null);
    for (let i = 1; i <= daysInMonth; i++) days.push(new Date(year, month, i));
    return days;
  };

  const changeMonth = (offset: number) => {
    const newDate = new Date(calendarDate);
    newDate.setMonth(newDate.getMonth() + offset);
    setCalendarDate(newDate);
  };

  const calendarProps = {
    ...props,
    selectedDate,
    setSelectedDate,
    calendarDate,
    changeMonth,
    toLocalISOString,
    getDaysInMonth
  };

  return (
    <div className="w-full flex flex-col gap-6 animate-in h-full">
         <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
           <div className="flex flex-col">
              <h1 className={`text-4xl text-charcoal ${headCls}`}>{showTeamView ? (props.lang === 'TH' ? 'ปฏิทินติดตามงานพนักงาน' : 'Employees Activity Monitor') : t.calendar_title}</h1>
           </div>
         </div>
         {showTeamView ? (
           <AdminCalendar {...calendarProps} />
         ) : (
           <EmployeeCalendar {...calendarProps} />
         )}
    </div>
  );
};
