
export interface Employee {
  id: string;
  nameTh: string;
  nameEn: string;
  nicknameTh: string;
  nicknameEn: string;
  position: string;
  phone: string;
  email: string;
  password?: string;
  role: 'EXECUTIVE' | 'HR' | 'EMPLOYEE';
}

export interface TimeRecord {
  id: string;
  email: string;
  type: 'CHECK_IN' | 'CHECK_OUT';
  status: 'NORMAL' | 'LATE' | 'NONE';
  timestamp: string;
  location: string;
  coords: { latitude: number; longitude: number } | null;
}

export interface Job {
  id: string;
  employeeId: string;
  date: string;
  customerName: string;
  activity: string;
  status: 'NOT_STARTED' | 'IN_PROGRESS' | 'DONE';
  remark: string;
  packingList?: PackingList;
}

// Added missing interfaces to fix build errors across views
export interface LeaveRequest {
  id: string;
  employeeId: string;
  type: 'SICK' | 'BUSINESS' | 'VACATION';
  startDate: string;
  endDate: string;
  days: number;
  reason: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  timestamp: string;
  coordinatorId?: string;
  coordinatorStatus?: 'PENDING' | 'ACCEPTED' | 'REJECTED';
}

export interface OTRequest {
  id: string;
  employeeId: string;
  date: string;
  startTime: string;
  endTime: string;
  reason: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  timestamp: string;
}

export interface AssignedTask {
  id: string;
  assignerId: string;
  employeeId: string;
  date: string;
  time: string;
  customerName: string;
  activity: string;
  remark: string;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED';
  timestamp: string;
}

export interface LoginSession {
  employeeId: string;
  office: string;
  date: string;
}

export interface EasyPassActivity {
  id: string;
  location: string;
  type: string;
  category: string;
  amount: number;
  timestamp: string;
}

export interface PackingList {
  customerBrand: string;
  project: string;
  deliveryDate: string;
  mainSet: {
    posTerminal: { model: string; qty: string };
    posLicense: { qty: string };
  };
  peripherals: {
    cashDrawer: boolean;
    receiptPrinter: boolean;
    barcodeScanner: boolean;
    customerDisplay: boolean;
  };
  digitalSignage: {
    screen: { size: string };
    powerAdapter: boolean;
    accessories: string;
  };
  cables: {
    powerCable: boolean;
    lanCable: boolean;
    usbCable: boolean;
    hdmiVga: boolean;
    adapterConverter: boolean;
    others: string;
  };
  specialRemarks: string;
  signatures: {
    orderer: string;
    orderDate: string;
    packer: string;
    packDate: string;
    deliverer: string;
    deliveryDate: string;
  };
}

// Keys for LocalStorage
const EMP_STORAGE_KEY = 'SGDATA_EMPLOYEES_DB';
const CURRENT_USER_KEY = 'SGDATA_CURRENT_USER';
const HISTORY_KEY = 'SGDATA_TIME_HISTORY';
const JOBS_KEY = 'SGDATA_JOBS';

// ข้อมูลเริ่มต้นตามรูปภาพ
const INITIAL_EMPLOYEES: Employee[] = [
  { id: '1', nameTh: 'Mr.Ler Teck Wee', nameEn: 'Mr.Ler Teck Wee', nicknameTh: 'คุณเลกซ์', nicknameEn: 'Lex', position: 'Executive', phone: '0894648143', email: 'Lex.Ler@sgdata.com', password: '1234', role: 'EXECUTIVE' },
  { id: '2', nameTh: 'นางสาววนิดา กุลสอนนาน', nameEn: 'Miss Wanida Kulsonnan', nicknameTh: 'คุณแหวน', nicknameEn: 'Wan', position: 'HR', phone: '0802493954', email: 'Wanida@gmail.com', password: '123456', role: 'HR' },
  { id: '3', nameTh: 'นางสาวจีรณา นุชเอก', nameEn: 'Miss Geerana Nuchake', nicknameTh: 'คุณจี', nicknameEn: 'G', position: 'BD Consultant', phone: '0911891319', email: 'geerana.nchk@gmail.com', password: '747527', role: 'EMPLOYEE' },
  { id: '4', nameTh: 'นายรุ่งโรจน์', nameEn: 'Mr Rungroj', nicknameTh: 'คุณรุ่ง', nicknameEn: 'Rung', position: 'IT Supervisor', phone: '0838758404', email: 'rungroj.m@sgdatahub.com', password: '456165', role: 'EMPLOYEE' },
  { id: '5', nameTh: 'นายศราวุฒิ มีสา', nameEn: 'Mr Sarawut Meesa', nicknameTh: 'คุณเกมส์', nicknameEn: 'Games', position: 'Sale Engineer&IT Support', phone: '0971491608', email: 'Sarawut.G@sgdatahub.com', password: '240436', role: 'EMPLOYEE' },
  { id: '6', nameTh: 'นางสาวแสงนภา ภาคภูมิ', nameEn: 'Miss Sangnabha Bhakbhoom', nicknameTh: 'คุณปุ๊กกี้', nicknameEn: 'Pookie', position: 'Sale Support', phone: '0827811401', email: 'sangnapa.pookie@sgdatahub.com', password: 'pookie44', role: 'EMPLOYEE' },
  { id: '7', nameTh: 'นายวรวิทย์ ปานนพภา', nameEn: 'Mr worawit pannoppa', nicknameTh: 'คุณดอล', nicknameEn: 'Doll', position: 'IT Support', phone: '0830876768', email: 'worawitpannoppa@gmail.com', password: '6768', role: 'EMPLOYEE' },
  { id: '8', nameTh: 'นายศุภกฤษฎิ์ แซ่โล้ว', nameEn: 'Mr.Sukrit Saelow', nicknameTh: 'คุณกิต', nicknameEn: 'Krit', position: 'IT Support', phone: '0967489291', email: 'gitzaaskyline123@gmail.com', password: '2544', role: 'EMPLOYEE' },
  { id: '9', nameTh: 'นางสาวสุวิมล แซ่คู', nameEn: 'Miss Suwimon Saeku', nicknameTh: 'คุณมุก', nicknameEn: 'Mook', position: 'Digital Marketing', phone: '0990563861', email: 'suwimon.s@sgdatahub.com', password: '332038', role: 'EMPLOYEE' },
  { id: '10', nameTh: 'นางสาวปราณปรียา แสนสนิท', nameEn: 'Miss Pranpariya Saensanit', nicknameTh: 'คุณเอิร์น', nicknameEn: 'Earn', position: 'Accounting', phone: '0971172320', email: 'pranpariya2548@gmail.com', password: '1643', role: 'EMPLOYEE' },
  { id: '11', nameTh: 'นางสาวกัญญาภัค ดนตรี', nameEn: 'Miss Kanyapak Dontree', nicknameTh: 'คุณเซีย', nicknameEn: 'Sia', position: 'Intern', phone: '0659622251', email: 'kanyapak2158@gmail.com', password: 'Ss221145', role: 'EMPLOYEE' }
];

export const EmployeeService = {
  // --- EMPLOYEE DB MANAGEMENT (LocalStorage) ---
  getAllEmployees: async (): Promise<Employee[]> => {
    const saved = localStorage.getItem(EMP_STORAGE_KEY);
    if (!saved) {
      localStorage.setItem(EMP_STORAGE_KEY, JSON.stringify(INITIAL_EMPLOYEES));
      return INITIAL_EMPLOYEES;
    }
    return JSON.parse(saved);
  },

  saveEmployee: async (emp: Employee): Promise<boolean> => {
    try {
      const all = await EmployeeService.getAllEmployees();
      const index = all.findIndex(e => e.id === emp.id);
      if (index !== -1) {
        all[index] = emp;
      } else {
        all.push(emp);
      }
      localStorage.setItem(EMP_STORAGE_KEY, JSON.stringify(all));
      return true;
    } catch (e) {
      return false;
    }
  },

  deleteEmployee: async (id: string): Promise<boolean> => {
    try {
      let all = await EmployeeService.getAllEmployees();
      all = all.filter(e => e.id !== id);
      localStorage.setItem(EMP_STORAGE_KEY, JSON.stringify(all));
      return true;
    } catch (e) {
      return false;
    }
  },

  // --- AUTHENTICATION ---
  authenticate: async (email: string, pass: string): Promise<Employee | null> => {
    const all = await EmployeeService.getAllEmployees();
    const found = all.find(e => e.email === email && e.password === pass);
    return found || null;
  },

  setCurrentUser: (user: Employee) => {
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
  },

  getCurrentUser: (): Employee | null => {
    const saved = localStorage.getItem(CURRENT_USER_KEY);
    return saved ? JSON.parse(saved) : null;
  },

  logout: () => {
    localStorage.removeItem(CURRENT_USER_KEY);
  },

  updatePassword: async (email: string, newPass: string): Promise<boolean> => {
    const all = await EmployeeService.getAllEmployees();
    const index = all.findIndex(e => e.email === email);
    if (index !== -1) {
      all[index].password = newPass;
      localStorage.setItem(EMP_STORAGE_KEY, JSON.stringify(all));
      return true;
    }
    return false;
  },

  // --- TIME ATTENDANCE ---
  saveTimeRecord: (record: TimeRecord) => {
    const history = EmployeeService.getTimeHistory(record.email);
    history.unshift(record);
    localStorage.setItem(`${HISTORY_KEY}_${record.email}`, JSON.stringify(history));
  },

  getTimeHistory: (email: string): TimeRecord[] => {
    const saved = localStorage.getItem(`${HISTORY_KEY}_${email}`);
    return saved ? JSON.parse(saved) : [];
  },

  // Added missing method for TeamMapView to show current positions
  getTeamLocations: (): { employee: Employee; record: TimeRecord }[] => {
    const employeesRaw = localStorage.getItem(EMP_STORAGE_KEY);
    const employees: Employee[] = employeesRaw ? JSON.parse(employeesRaw) : INITIAL_EMPLOYEES;
    return employees.map(emp => {
      const history = EmployeeService.getTimeHistory(emp.email);
      return { employee: emp, record: history[0] };
    }).filter(item => item.record !== undefined);
  },

  // --- JOB & TASK MANAGEMENT ---
  getJobs: (): Job[] => {
    const saved = localStorage.getItem(JOBS_KEY);
    return saved ? JSON.parse(saved) : [];
  },

  saveJob: (job: Job) => {
    const jobs = EmployeeService.getJobs();
    const index = jobs.findIndex(j => j.id === job.id);
    if (index !== -1) jobs[index] = job;
    else jobs.push(job);
    localStorage.setItem(JOBS_KEY, JSON.stringify(jobs));
  },

  deleteJob: (jobId: string) => {
    let jobs = EmployeeService.getJobs();
    jobs = jobs.filter(j => j.id !== jobId);
    localStorage.setItem(JOBS_KEY, JSON.stringify(jobs));
  },

  // Helpers
  saveCredentials: (email: string, pass: string, remember: boolean) => {
    if (remember) localStorage.setItem('REMEMBER_ME', JSON.stringify({ email, pass }));
    else localStorage.removeItem('REMEMBER_ME');
  },
  getSavedCredentials: () => {
    const saved = localStorage.getItem('REMEMBER_ME');
    return saved ? JSON.parse(saved) : null;
  },
  getDailySessions: (): LoginSession[] => {
    const saved = localStorage.getItem('SGDATA_SESSIONS');
    return saved ? JSON.parse(saved) : [];
  },
  saveLoginSession: (id: string, office: string) => {
    const sessions = EmployeeService.getDailySessions();
    const localDate = new Date().toLocaleDateString('en-CA'); // YYYY-MM-DD local
    const existingIdx = sessions.findIndex(s => s.employeeId === id && s.date === localDate);
    
    if (existingIdx !== -1) {
      sessions[existingIdx].office = office;
    } else {
      sessions.push({ employeeId: id, office, date: localDate });
    }
    
    localStorage.setItem('SGDATA_SESSIONS', JSON.stringify(sessions));
  },
  saveAssignment: (task: AssignedTask) => {
    const all = EmployeeService.getAssignments();
    all.push(task);
    localStorage.setItem('SGDATA_ASSIGNMENTS', JSON.stringify(all));
  },
  getAssignments: (id?: string): AssignedTask[] => {
    const saved = localStorage.getItem('SGDATA_ASSIGNMENTS');
    const all = saved ? JSON.parse(saved) : [];
    return id ? all.filter((a: any) => a.employeeId === id) : all;
  },
  updateAssignmentStatus: (id: string, s: 'ACCEPTED' | 'REJECTED') => {
    const all = EmployeeService.getAssignments();
    const i = all.findIndex((a: any) => a.id === id);
    if (i !== -1) {
      all[i].status = s;
      localStorage.setItem('SGDATA_ASSIGNMENTS', JSON.stringify(all));
    }
  },
  deleteAssignment: (id: string) => {
    let all = EmployeeService.getAssignments();
    all = all.filter((a: any) => a.id !== id);
    localStorage.setItem('SGDATA_ASSIGNMENTS', JSON.stringify(all));
  },
  getAllLeaveRequests: (): LeaveRequest[] => JSON.parse(localStorage.getItem('SGDATA_LEAVES') || '[]'),
  saveLeaveRequest: (r: LeaveRequest) => {
    const all = EmployeeService.getAllLeaveRequests();
    const i = all.findIndex((x: any) => x.id === r.id);
    if (i !== -1) all[i] = r; else all.push(r);
    localStorage.setItem('SGDATA_LEAVES', JSON.stringify(all));
  },
  getLeaveRequests: (id: string): LeaveRequest[] => EmployeeService.getAllLeaveRequests().filter((r: any) => r.employeeId === id),
  getAllOTRequests: (): OTRequest[] => JSON.parse(localStorage.getItem('SGDATA_OTS') || '[]'),
  saveOTRequest: (r: OTRequest) => {
    const all = EmployeeService.getAllOTRequests();
    const i = all.findIndex((x: any) => x.id === r.id);
    if (i !== -1) i[i] = r; else all.push(r);
    localStorage.setItem('SGDATA_OTS', JSON.stringify(all));
  },
  getOTRequests: (id: string): OTRequest[] => EmployeeService.getAllOTRequests().filter((r: any) => r.employeeId === id),
  getUploadedHolidays: () => JSON.parse(localStorage.getItem('SGDATA_HOLIDAYS') || 'null'),
  saveUploadedHolidays: (h: any) => localStorage.setItem('SGDATA_HOLIDAYS', JSON.stringify(h)),
  clearUploadedHolidays: () => localStorage.removeItem('SGDATA_HOLIDAYS'),
  getEasyPassActivities: (): EasyPassActivity[] => [
    { id: '1', location: 'Rama 9 Toll', type: 'PAYMENT', category: 'Expressway', amount: -40.0, timestamp: new Date().toISOString() }
  ],
  saveFieldServiceJob: (currentUser: any, companions: string[], data: any) => {
    const baseId = Date.now().toString();
    const job = { ...data, id: baseId, employeeId: currentUser.id, status: 'IN_PROGRESS' };
    EmployeeService.saveJob(job);
    companions.forEach((id, idx) => {
      EmployeeService.saveJob({ ...job, id: `${baseId}_${idx}`, employeeId: id, activity: `${data.activity} (Companion)` });
    });
  }
};
