
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Employee, EmployeeService, PackingList, Job } from '../../../services/EmployeeService';
import { translations } from '../../../utils/translations';
import { Language } from '../../../App';

declare const google: any;

interface EmployeeFieldServiceProps {
  user: Employee;
  allEmployees: Employee[];
  lang: Language;
  onJobUpdate: () => void;
}

export const EmployeeFieldService: React.FC<EmployeeFieldServiceProps> = ({ user, allEmployees, lang, onJobUpdate }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [currentLoc, setCurrentLoc] = useState<{lat: number, lng: number} | null>(null);
  const [destLoc, setDestLoc] = useState<{lat: number, lng: number} | null>(null);
  const [distance, setDistance] = useState<string>('');
  const [companions, setCompanions] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [mapError, setMapError] = useState<string | null>(null);

  const todayStr = new Date().toLocaleDateString('en-CA');

  const [formData, setFormData] = useState({
      taskName: '',
      customerName: '',
      team: 'BANGKOK',
      activity: '',
      date: todayStr,
      remark: ''
  });

  const [packingList, setPackingList] = useState<PackingList>({
    customerBrand: '',
    project: '',
    deliveryDate: todayStr,
    mainSet: { posTerminal: { model: '', qty: '' }, posLicense: { qty: '' } },
    peripherals: { cashDrawer: false, receiptPrinter: false, barcodeScanner: false, customerDisplay: false },
    digitalSignage: { screen: { size: '' }, powerAdapter: false, accessories: '' },
    cables: { powerCable: false, lanCable: false, usbCable: false, hdmiVga: false, adapterConverter: false, others: '' },
    specialRemarks: '',
    signatures: {
      orderer: user.nicknameTh || user.nameTh, orderDate: todayStr,
      packer: '', packDate: '',
      deliverer: '', deliveryDate: ''
    }
  });

  const mapRef = useRef<HTMLDivElement>(null);
  const t = translations[lang];
  const headCls = lang === 'TH' ? 'font-prompt font-bold' : 'font-montserrat font-bold';
  const bodyCls = lang === 'TH' ? 'font-prompt font-normal' : 'font-montserrat font-normal';

  // กรองเฉพาะพนักงานเท่านั้น (ซ่อน Executive และ HR ในรายชื่อผู้ติดตาม)
  const availableCompanions = useMemo(() => {
    return allEmployees.filter(emp => emp.role === 'EMPLOYEE' && emp.id !== user.id);
  }, [allEmployees, user.id]);

  useEffect(() => {
    const handleMapError = () => {
      setMapError('BILLING_ERROR');
    };
    window.addEventListener('google-maps-auth-error', handleMapError);

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((pos) => {
        const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setCurrentLoc(coords);
        setDestLoc(coords);
        if (currentStep === 1) {
          setTimeout(() => {
            try {
              initMap(coords);
            } catch (e) {
              console.error("Map Init Failed", e);
            }
          }, 100);
        }
      }, (err) => {
        setMapError('GPS_DENIED');
      });
    }

    return () => window.removeEventListener('google-maps-auth-error', handleMapError);
  }, [currentStep]);

  const initMap = (coords: {lat: number, lng: number}) => {
    if (mapRef.current && typeof google !== 'undefined' && google.maps && google.maps.Map) {
      try {
        const map = new google.maps.Map(mapRef.current, {
          center: coords,
          zoom: 15,
          disableDefaultUI: true,
        });

        const destMarker = new google.maps.Marker({
          position: coords,
          map,
          draggable: true,
          icon: 'http://maps.google.com/mapfiles/ms/icons/red-dot.png'
        });

        destMarker.addListener('dragend', (e: any) => {
          const newPos = { lat: e.latLng.lat(), lng: e.latLng.lng() };
          setDestLoc(newPos);
          calculateDistance(coords, newPos);
        });
      } catch (e) {
        setMapError('MAP_LOAD_FAILED');
      }
    }
  };

  const calculateDistance = (origin: any, dest: any) => {
    if (typeof google === 'undefined' || !google.maps || !google.maps.DistanceMatrixService) {
        setMapError('API_NOT_ENABLED');
        return;
    }
    
    const service = new google.maps.DistanceMatrixService();
    service.getDistanceMatrix({
      origins: [origin],
      destinations: [dest],
      travelMode: 'DRIVING',
    }, (response: any, status: any) => {
      if (status === 'OK' && response.rows[0].elements[0].distance) {
        setDistance(response.rows[0].elements[0].distance.text);
      } else {
        console.warn("Distance Matrix failed", status);
        if (status === 'REQUEST_DENIED') {
            setMapError('DISTANCE_API_DENIED');
        }
      }
    });
  };

  const pastPackingLists = useMemo(() => {
    const jobs = EmployeeService.getJobs();
    return jobs.filter(j => j.packingList).map(j => j.packingList!);
  }, []);

  const filteredPastProjects = pastPackingLists.filter(pl => 
    pl.project.toLowerCase().includes(searchQuery.toLowerCase()) || 
    pl.customerBrand.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const loadPreviousProject = (prev: PackingList) => {
    const nowLocalStr = new Date().toLocaleDateString('en-CA');
    setPackingList({
      ...prev,
      deliveryDate: nowLocalStr,
      signatures: {
        ...prev.signatures,
        orderDate: nowLocalStr
      }
    });
    setFormData({
      ...formData,
      customerName: prev.customerBrand,
      activity: `Delivery for ${prev.project}`
    });
    setIsSearchOpen(false);
  };

  const handleRequestApproval = () => {
    if (!formData.customerName || !formData.taskName) {
      const msg = lang === 'TH' ? 'กรุณาระบุชื่องานและชื่อลูกค้าก่อนขออนุมัติ' : 'Please provide Task Name and Customer Name before requesting approval';
      setStatusMsg(msg);
      setTimeout(() => setStatusMsg(''), 3000);
      return;
    }

    const companionNames = allEmployees
        .filter(emp => companions.includes(emp.id))
        .map(emp => lang === 'TH' ? emp.nicknameTh : emp.nicknameEn)
        .join(', ');

    const approvalJob: Job = {
        id: `REQ_MERGE_${Date.now()}`,
        employeeId: user.id,
        date: formData.date,
        customerName: formData.customerName,
        activity: `[ขออนุมัติรวมทีม] งาน: ${formData.taskName} | กิจกรรม: ${formData.activity}`,
        remark: `ทีมสำนักงาน: ${formData.team === 'BANGKOK' ? 'กรุงเทพฯ' : 'ชลบุรี'}${companionNames ? ` | สมาชิก: ${companionNames}` : ''}`,
        status: 'IN_PROGRESS'
    };

    EmployeeService.saveJob(approvalJob);
    onJobUpdate();

    setStatusMsg(lang === 'TH' ? 'ส่งคำขออนุมัติรวมทีมไปยังผู้บริหารและ HR เรียบร้อยแล้ว' : 'Team merge request sent for Executive/HR approval');
    setTimeout(() => setStatusMsg(''), 4000);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    
    const companionNames = allEmployees
        .filter(emp => companions.includes(emp.id))
        .map(emp => lang === 'TH' ? emp.nicknameTh : emp.nicknameEn)
        .join(', ');

    const jobData = {
        ...formData,
        activity: `[Field Service Trip] ${formData.taskName ? `[${formData.taskName}] ` : ''}${formData.activity}`,
        remark: `${companionNames ? `Companions: ${companionNames} | ` : ''}Team: ${formData.team}`,
        packingList: packingList
    };

    EmployeeService.saveFieldServiceJob(user, companions, jobData);
    onJobUpdate();
    
    setStatusMsg(t.fs_save_success);
    setIsSaving(false);
    setTimeout(() => {
      setStatusMsg('');
      setCurrentStep(1);
    }, 3000);

    const nowLocalStr = new Date().toLocaleDateString('en-CA');
    setFormData({ taskName: '', customerName: '', team: 'BANGKOK', activity: '', date: nowLocalStr, remark: '' });
    setPackingList({
      customerBrand: '', project: '', deliveryDate: nowLocalStr,
      mainSet: { posTerminal: { model: '', qty: '' }, posLicense: { qty: '' } },
      peripherals: { cashDrawer: false, receiptPrinter: false, barcodeScanner: false, customerDisplay: false },
      digitalSignage: { screen: { size: '' }, powerAdapter: false, accessories: '' },
      cables: { powerCable: false, lanCable: false, usbCable: false, hdmiVga: false, adapterConverter: false, others: '' },
      specialRemarks: '',
      signatures: { orderer: user.nicknameTh || user.nameTh, orderDate: nowLocalStr, packer: '', packDate: '', deliverer: '', deliveryDate: '' }
    });
    setCompanions([]);
  };

  const renderTripStep = () => (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 flex-1 min-h-0 animate-in">
      <div className="xl:col-span-7 flex flex-col gap-4 min-h-[400px]">
        <div className="bg-white p-4 rounded-[40px] shadow-sm border border-slate-100 flex-1 relative overflow-hidden">
          {mapError ? (
            <div className="w-full h-full rounded-[30px] bg-slate-100 flex flex-col items-center justify-center p-10 text-center">
              <div className="text-4xl mb-4">📍</div>
              <h3 className={`text-lg text-slate-600 mb-2 ${headCls}`}>ระบบแผนที่ขัดข้อง (API Error)</h3>
              <p className="text-sm text-slate-400 mb-4">
                {mapError === 'BILLING_ERROR' ? 'กรุณาเปิดใช้งาน Billing ใน Google Cloud Console' : 'กรุณาเปิดใช้งาน Distance Matrix API ในระบบ'}
              </p>
              <div className="text-[10px] text-amber-600 font-mono bg-amber-50 px-4 py-2 rounded-lg border border-amber-100">
                ErrorCode: {mapError}
              </div>
            </div>
          ) : (
            <div ref={mapRef} className="w-full h-full rounded-[30px] overflow-hidden bg-slate-50 flex items-center justify-center">
              <span className="text-slate-400">{t.map_loading}</span>
            </div>
          )}
          {!mapError && (
            <div className="absolute top-8 left-8 bg-white/90 backdrop-blur-md px-5 py-3 rounded-2xl shadow-xl border border-white flex items-center gap-3">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
              <span className="text-[11px] font-bold text-charcoal uppercase tracking-widest">{t.fs_map_hint}</span>
            </div>
          )}
          {distance && !mapError && (
            <div className="absolute bottom-8 right-8 bg-charcoal text-white px-6 py-3 rounded-2xl shadow-2xl flex flex-col items-center">
              <span className="text-[9px] text-white/50 uppercase font-bold tracking-widest mb-0.5">{t.fs_distance}</span>
              <span className="text-xl font-bold font-montserrat">{distance}</span>
            </div>
          )}
        </div>
      </div>

      <div className="xl:col-span-5 flex flex-col">
        <div className="bg-white rounded-[40px] shadow-sm border border-slate-100 p-8 md:p-10 flex-1 overflow-y-auto">
          <h2 className={`text-2xl text-charcoal mb-8 ${headCls}`}>{t.fs_form_title}</h2>
          <div className="space-y-6">
            <div>
              <label className="block text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-2 ml-1">{t.fs_task_name}</label>
              <input value={formData.taskName} onChange={e => setFormData({...formData, taskName: e.target.value})} type="text" className="w-full px-6 py-4 rounded-2xl bg-slate-50 border-2 border-transparent focus:bg-white focus:border-primary outline-none text-sm font-bold text-charcoal transition-all shadow-inner" placeholder="..." />
            </div>
            <div>
              <label className="block text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-2 ml-1">{t.job_customer}</label>
              <input required value={formData.customerName} onChange={e => {
                setFormData({...formData, customerName: e.target.value});
                setPackingList({...packingList, customerBrand: e.target.value});
              }} type="text" className="w-full px-6 py-4 rounded-2xl bg-slate-50 border-2 border-transparent focus:bg-white focus:border-primary outline-none text-sm font-bold text-charcoal transition-all shadow-inner" placeholder="..." />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-2 ml-1">{t.table_date}</label>
                <div className="relative group">
                  <input 
                    required 
                    value={formData.date} 
                    onChange={e => setFormData({...formData, date: e.target.value})} 
                    type="date" 
                    className="w-full px-5 py-4 rounded-2xl bg-slate-100 border-2 border-primary/40 focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none text-sm font-bold text-charcoal transition-all shadow-md active:scale-[0.98]" 
                  />
                </div>
              </div>
              <div>
                <label className="block text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-2 ml-1">{t.fs_time}</label>
                <div className="relative group">
                  <input 
                    required 
                    type="time" 
                    className="w-full px-5 py-4 rounded-2xl bg-slate-100 border-2 border-primary/40 focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none text-sm font-bold text-charcoal transition-all shadow-md active:scale-[0.98]" 
                    defaultValue="09:00" 
                  />
                </div>
              </div>
            </div>
            <div>
              <label className="block text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-2 ml-1">{t.job_activity}</label>
              <textarea required rows={3} value={formData.activity} onChange={e => setFormData({...formData, activity: e.target.value})} className="w-full px-6 py-4 rounded-2xl bg-slate-50 border-2 border-transparent focus:bg-white focus:border-primary outline-none text-sm font-medium text-charcoal transition-all resize-none shadow-inner" placeholder="..." />
            </div>
            <div>
              <label className="block text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-2 ml-1">{t.fs_companions}</label>
              <div className="flex flex-wrap gap-2">
                {availableCompanions.map(emp => (
                  <button key={emp.id} type="button" onClick={() => setCompanions(prev => prev.includes(emp.id) ? prev.filter(id => id !== emp.id) : [...prev, emp.id])}
                    className={`px-3 py-2 rounded-xl text-[11px] font-bold border-2 transition-all ${companions.includes(emp.id) ? 'bg-primary border-primary text-white shadow-lg' : 'bg-white border-slate-100 text-slate-400 hover:border-primary/20'}`}
                  >
                    {lang === 'TH' ? emp.nicknameTh : emp.nicknameEn}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-2 ml-1">{t.fs_team_select}</label>
              <div className="grid grid-cols-2 gap-3">
                 {[
                   { id: 'BANGKOK', label: t.fs_team_bkk },
                   { id: 'CHONBURI', label: t.fs_team_chon }
                 ].map(team => (
                   <button 
                     key={team.id}
                     type="button"
                     onClick={() => setFormData({...formData, team: team.id})}
                     className={`py-3 rounded-xl text-xs font-bold transition-all border-2 ${formData.team === team.id ? 'bg-charcoal text-white border-charcoal shadow-md' : 'bg-white text-slate-400 border-slate-100 hover:border-slate-200'}`}
                   >
                     {team.label}
                   </button>
                 ))}
              </div>
            </div>

            <div className="flex flex-col gap-3 pt-2">
              <button 
                type="button" 
                onClick={handleRequestApproval} 
                className={`w-full py-4 bg-white border-2 border-primary text-primary rounded-[1.5rem] text-sm font-bold shadow-sm hover:bg-red-50 active:scale-95 transition-all flex items-center justify-center gap-2 ${headCls}`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                {t.btn_request_approval}
              </button>
              
              <button type="button" onClick={() => setCurrentStep(2)} className={`w-full py-5 bg-charcoal text-white rounded-[2rem] text-lg shadow-xl hover:bg-black active:scale-95 transition-all ${headCls}`}>
                Next: Hardware List &rarr;
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderHardwareStep = () => (
    <div className="w-full bg-[#F8F9FB] rounded-[40px] shadow-inner p-4 md:p-8 animate-in">
      <div className="max-w-5xl mx-auto bg-white rounded-[3rem] shadow-sm border border-slate-100 p-8 md:p-12 overflow-hidden relative">
        <div className="absolute top-0 right-0 w-64 h-64 bg-slate-50 rounded-full -translate-y-1/2 translate-x-1/2 opacity-50"></div>

        <div className="flex flex-col md:flex-row items-start justify-between mb-12 relative z-10">
          <div className="flex flex-col gap-1">
             <div className="font-montserrat font-bold text-4xl tracking-tighter text-charcoal flex items-center gap-2">
               <span className="text-primary">SGDATA</span>POS
             </div>
             <h2 className={`text-sm text-slate-400 font-bold uppercase tracking-[0.2em] ${headCls}`}>{t.pl_title}</h2>
          </div>
          <div className="flex flex-col md:items-end gap-3 mt-6 md:mt-0">
             <div className="flex flex-col md:items-end">
               <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{t.pl_dept}</span>
               <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{t.pl_attach}</span>
             </div>
             <button type="button" onClick={() => setIsSearchOpen(true)} className="flex items-center gap-2 bg-slate-50 hover:bg-primary hover:text-white px-5 py-2.5 rounded-2xl text-[11px] font-bold text-charcoal transition-all shadow-sm border border-slate-100">
               <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
               {t.pl_search_btn}
             </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-12 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 bg-slate-50/50 p-8 rounded-[2rem] border border-slate-100">
             <div className="space-y-2">
               <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">{t.pl_cust}</label>
               <input type="text" value={packingList.customerBrand} onChange={e => setPackingList({...packingList, customerBrand: e.target.value})} className="w-full bg-white rounded-xl border border-slate-200 focus:border-primary focus:ring-1 focus:ring-primary outline-none px-4 py-3 font-bold text-charcoal transition-all" placeholder="..." />
             </div>
             <div className="space-y-2">
               <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">{t.pl_project}</label>
               <input type="text" value={packingList.project} onChange={e => setPackingList({...packingList, project: e.target.value})} className="w-full bg-white rounded-xl border border-slate-200 focus:border-primary focus:ring-1 focus:ring-primary outline-none px-4 py-3 font-bold text-charcoal transition-all" placeholder="..." />
             </div>
             <div className="space-y-2">
               <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">{t.pl_date}</label>
               <div className="relative">
                 <input 
                    type="date" 
                    value={packingList.deliveryDate} 
                    onChange={e => setPackingList({...packingList, deliveryDate: e.target.value})} 
                    className="w-full bg-slate-100 rounded-xl border-2 border-primary/40 focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none px-4 py-3 font-bold text-charcoal transition-all shadow-md active:scale-[0.98]" 
                 />
               </div>
             </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-8">
              <section className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-8 h-8 rounded-xl bg-red-50 flex items-center justify-center text-primary">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                  </div>
                  <h3 className={`text-sm font-bold text-charcoal uppercase tracking-widest ${headCls}`}>{t.pl_main}</h3>
                </div>
                <div className="space-y-5">
                   <div className="flex flex-col gap-2">
                     <div className="flex items-center gap-3">
                       <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${packingList.mainSet.posTerminal.model ? 'bg-primary border-primary' : 'border-slate-200'}`}>
                         {packingList.mainSet.posTerminal.model && <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20"><path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" /></svg>}
                       </div>
                       <span className="text-xs font-bold text-slate-500">{t.pl_pos_term}</span>
                     </div>
                     <div className="grid grid-cols-2 gap-3 pl-8">
                       <input type="text" value={packingList.mainSet.posTerminal.model} onChange={e => setPackingList({...packingList, mainSet: {...packingList.mainSet, posTerminal: {...packingList.mainSet.posTerminal, model: e.target.value}}})} className="w-full bg-slate-50 rounded-lg px-3 py-2 text-xs border border-transparent focus:border-primary outline-none font-medium" placeholder="Model name" />
                       <div className="flex items-center gap-2">
                         <span className="text-[10px] text-slate-400 font-bold uppercase">{t.pl_qty}:</span>
                         <input type="number" value={packingList.mainSet.posTerminal.qty} onChange={e => setPackingList({...packingList, mainSet: {...packingList.mainSet, posTerminal: {...packingList.mainSet.posTerminal, qty: e.target.value}}})} className="w-full bg-slate-50 rounded-lg px-3 py-2 text-xs border border-transparent focus:border-primary outline-none font-bold text-center" placeholder="0" />
                       </div>
                     </div>
                   </div>
                   <div className="flex flex-col gap-2 pt-2 border-t border-slate-50">
                     <div className="flex items-center gap-3">
                       <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${packingList.mainSet.posLicense.qty ? 'bg-primary border-primary' : 'border-slate-200'}`}>
                         {packingList.mainSet.posLicense.qty && <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20"><path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" /></svg>}
                       </div>
                       <span className="text-xs font-bold text-slate-500">{t.pl_pos_license}</span>
                     </div>
                     <div className="pl-8">
                       <div className="flex items-center gap-2 max-w-[150px]">
                         <span className="text-[10px] text-slate-400 font-bold uppercase">{t.pl_qty}:</span>
                         <input type="number" value={packingList.mainSet.posLicense.qty} onChange={e => setPackingList({...packingList, mainSet: {...packingList.mainSet, posLicense: {qty: e.target.value}}})} className="w-full bg-slate-50 rounded-lg px-3 py-2 text-xs border border-transparent focus:border-primary outline-none font-bold text-center" placeholder="0" />
                       </div>
                     </div>
                   </div>
                </div>
              </section>

              <section className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center text-blue-500">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17 14v6m-3-3h6M6 10h2a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v2a2 2 0 002 2zm10 0h2a2 2 0 002-2V6a2 2 0 00-2-2h-2a2 2 0 00-2 2v2a2 2 0 002 2zM6 20h2a2 2 0 002-2v-2a2 2 0 00-2-2H6a2 2 0 00-2 2v2a2 2 0 002 2z" /></svg>
                  </div>
                  <h3 className={`text-sm font-bold text-charcoal uppercase tracking-widest ${headCls}`}>{t.pl_peripheral}</h3>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { key: 'cashDrawer', label: t.pl_cash },
                    { key: 'receiptPrinter', label: t.pl_printer },
                    { key: 'barcodeScanner', label: t.pl_scanner },
                    { key: 'customerDisplay', label: t.pl_display }
                  ].map(item => (
                    <label key={item.key} className={`flex items-center gap-3 cursor-pointer p-4 rounded-2xl border transition-all ${ (packingList.peripherals as any)[item.key] ? 'bg-blue-50 border-blue-100 text-blue-700' : 'bg-slate-50 border-transparent hover:border-slate-200' }`}>
                      <input type="checkbox" checked={(packingList.peripherals as any)[item.key]} onChange={e => setPackingList({...packingList, peripherals: {...packingList.peripherals, [item.key]: e.target.checked}})} className="w-4 h-4 rounded border-slate-300 text-blue-500 focus:ring-blue-400" />
                      <span className="text-[11px] font-bold uppercase tracking-wider">{item.label}</span>
                    </label>
                  ))}
                </div>
              </section>
            </div>

            <div className="space-y-8">
              <section className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-8 h-8 rounded-xl bg-amber-50 flex items-center justify-center text-amber-500">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" /></svg>
                  </div>
                  <h3 className={`text-sm font-bold text-charcoal uppercase tracking-widest ${headCls}`}>{t.pl_ds}</h3>
                </div>
                <div className="space-y-4">
                  <div className="flex flex-col gap-3 bg-slate-50 p-5 rounded-2xl border border-transparent hover:border-amber-200 transition-all">
                     <div className="flex items-center gap-3">
                       <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${packingList.digitalSignage.screen.size ? 'bg-amber-400 border-amber-400' : 'border-slate-200'}`}>
                         {packingList.digitalSignage.screen.size && <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20"><path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" /></svg>}
                       </div>
                       <span className="text-[11px] font-bold text-slate-500 uppercase">{t.pl_screen}</span>
                     </div>
                     <input type="text" value={packingList.digitalSignage.screen.size} onChange={e => setPackingList({...packingList, digitalSignage: {...packingList.digitalSignage, screen: {size: e.target.value}}})} className="w-full bg-white rounded-lg px-3 py-2 text-xs border border-slate-200 outline-none font-bold" placeholder="Size / Spec" />
                  </div>
                  
                  <div className="grid grid-cols-1 gap-3">
                    <label className={`flex items-center gap-3 cursor-pointer p-4 rounded-2xl border transition-all ${ packingList.digitalSignage.powerAdapter ? 'bg-amber-50 border-amber-100 text-amber-700' : 'bg-slate-50 border-transparent hover:border-slate-200' }`}>
                      <input type="checkbox" checked={packingList.digitalSignage.powerAdapter} onChange={e => setPackingList({...packingList, digitalSignage: {...packingList.digitalSignage, powerAdapter: e.target.checked}})} className="w-4 h-4 rounded border-slate-300 text-amber-500 focus:ring-amber-400" />
                      <span className="text-[11px] font-bold uppercase tracking-wider">{t.pl_adapter}</span>
                    </label>

                    <div className="bg-slate-50 p-5 rounded-2xl border border-transparent hover:border-slate-200 transition-all">
                       <div className="flex items-center gap-3 mb-2">
                         <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${packingList.digitalSignage.accessories ? 'bg-amber-400 border-amber-400' : 'border-slate-200'}`}>
                           {packingList.digitalSignage.accessories && <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20"><path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" /></svg>}
                         </div>
                         <span className="text-[11px] font-bold text-slate-500 uppercase">{t.pl_access}</span>
                       </div>
                       <input type="text" value={packingList.digitalSignage.accessories} onChange={e => setPackingList({...packingList, digitalSignage: {...packingList.digitalSignage, accessories: e.target.value}})} className="w-full bg-white rounded-lg px-3 py-2 text-xs border border-slate-200 outline-none font-medium" placeholder="..." />
                    </div>
                  </div>
                </div>
              </section>

              <section className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-8 h-8 rounded-xl bg-purple-50 flex items-center justify-center text-purple-500">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>
                  </div>
                  <h3 className={`text-sm font-bold text-charcoal uppercase tracking-widest ${headCls}`}>{t.pl_cable}</h3>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { key: 'powerCable', label: 'Power Cable' },
                    { key: 'lanCable', label: 'LAN Cable' },
                    { key: 'usbCable', label: 'USB Cable' },
                    { key: 'hdmiVga', label: 'HDMI / VGA' },
                    { key: 'adapterConverter', label: 'Adapter' }
                  ].map(item => (
                    <label key={item.key} className={`flex items-center gap-3 cursor-pointer p-4 rounded-2xl border transition-all ${ (packingList.cables as any)[item.key] ? 'bg-purple-50 border-purple-100 text-purple-700' : 'bg-slate-50 border-transparent hover:border-slate-200' }`}>
                      <input type="checkbox" checked={(packingList.cables as any)[item.key]} onChange={e => setPackingList({...packingList, cables: {...packingList.cables, [item.key]: e.target.checked}})} className="w-4 h-4 rounded border-slate-300 text-purple-500 focus:ring-purple-400" />
                      <span className="text-[10px] font-bold uppercase tracking-wider">{item.label}</span>
                    </label>
                  ))}
                  <div className={`col-span-2 p-4 rounded-2xl border transition-all ${ packingList.cables.others ? 'bg-purple-50 border-purple-100' : 'bg-slate-50 border-transparent' }`}>
                    <div className="flex items-center gap-3 mb-2">
                       <input type="checkbox" checked={!!packingList.cables.others} readOnly className="w-4 h-4 rounded border-slate-300 text-purple-500" />
                       <span className="text-[10px] font-bold uppercase text-slate-500">Others</span>
                    </div>
                    <input type="text" value={packingList.cables.others} onChange={e => setPackingList({...packingList, cables: {...packingList.cables, others: e.target.value}})} className="w-full bg-white rounded-lg px-3 py-2 text-xs border border-slate-200 outline-none" placeholder="..." />
                  </div>
                </div>
              </section>
            </div>
          </div>

          <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 01-2-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" /></svg>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">{t.pl_remarks}</label>
            </div>
            <textarea value={packingList.specialRemarks} onChange={e => setPackingList({...packingList, specialRemarks: e.target.value})} rows={3} className="w-full bg-slate-50 rounded-[1.5rem] p-6 outline-none text-sm italic text-charcoal border border-transparent focus:border-primary transition-all resize-none" placeholder="e.g. No LAN available on site, needs extra testing..." />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-8">
             {[
               { role: 'orderer', label: t.pl_sign_order, name: packingList.signatures.orderer, date: packingList.signatures.orderDate, color: 'primary' },
               { role: 'packer', label: t.pl_sign_pack, name: packingList.signatures.packer, date: packingList.signatures.packDate, color: 'charcoal' },
               { role: 'deliverer', label: t.pl_sign_deliv, name: packingList.signatures.deliverer, date: packingList.signatures.deliveryDate, color: 'charcoal' }
             ].map(sig => (
               <div key={sig.role} className="bg-slate-50 p-6 rounded-[2rem] border border-slate-100 space-y-4">
                  <div className="flex flex-col gap-1">
                     <span className={`text-[10px] font-bold uppercase tracking-widest text-${sig.color}`}>{sig.label}</span>
                     <input type="text" value={sig.name} onChange={e => setPackingList({...packingList, signatures: {...packingList.signatures, [sig.role]: e.target.value}})} className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-bold outline-none focus:border-primary" placeholder="Name" />
                  </div>
                  <div className="flex flex-col gap-1">
                     <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400">{lang === 'TH' ? 'วันที่' : 'Date'}</span>
                     <input 
                        type="date" 
                        value={sig.date} 
                        onChange={e => setPackingList({...packingList, signatures: {...packingList.signatures, [`${sig.role}Date`]: e.target.value}})} 
                        className="w-full bg-white border-2 border-primary/40 rounded-xl px-4 py-2.5 text-xs outline-none focus:border-primary shadow-sm font-bold active:scale-[0.98] transition-all" 
                     />
                  </div>
               </div>
             ))}
          </div>

          <div className="flex flex-col md:flex-row gap-4 pt-12 pb-6 border-t border-slate-100">
             <button type="button" onClick={() => setCurrentStep(1)} className="flex-1 py-5 text-slate-400 font-bold hover:bg-slate-50 rounded-[2rem] transition-all flex items-center justify-center gap-2">
               <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
               {t.btn_cancel}
             </button>
             <button type="submit" disabled={isSaving || !packingList.customerBrand} className={`flex-[2] py-5 bg-primary text-white rounded-[2rem] text-lg font-bold shadow-2xl shadow-red-200 hover:bg-red-700 active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-3 ${headCls}`}>
               {isSaving ? (
                 <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
               ) : (
                 <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" /></svg>
               )}
               {isSaving ? 'Saving...' : t.btn_confirm}
             </button>
          </div>
        </form>

        {isSearchOpen && (
          <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
             <div className="absolute inset-0 bg-charcoal/60 backdrop-blur-sm" onClick={() => setIsSearchOpen(false)}></div>
             <div className="relative bg-white w-full max-w-2xl rounded-[3rem] shadow-2xl p-10 flex flex-col animate-in max-h-[85vh] border border-slate-100">
                <div className="flex items-center justify-between mb-8">
                  <h3 className={`text-2xl text-charcoal ${headCls}`}>{t.pl_search_btn}</h3>
                  <button onClick={() => setIsSearchOpen(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors"><svg className="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" /></svg></button>
                </div>
                <div className="relative mb-8">
                  <svg className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                  <input 
                    type="text" 
                    autoFocus
                    placeholder="Search by Project name or Customer..." 
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="w-full pl-16 pr-8 py-5 rounded-[1.5rem] bg-slate-50 border-2 border-transparent focus:border-primary focus:bg-white outline-none transition-all font-bold text-charcoal"
                  />
                </div>
                <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
                   {filteredPastProjects.length === 0 ? (
                     <div className="text-center py-20">
                       <div className="text-5xl mb-4 opacity-20">📂</div>
                       <p className="text-slate-300 font-bold uppercase tracking-widest text-sm">No matching projects found</p>
                     </div>
                   ) : (
                     filteredPastProjects.map((pl, idx) => (
                       <button key={idx} onClick={() => loadPreviousProject(pl)} className="w-full bg-slate-50 p-6 rounded-[1.5rem] border-2 border-transparent hover:border-primary hover:bg-white text-left transition-all group flex items-center justify-between">
                          <div className="min-w-0 flex-1">
                            <div className="font-bold text-lg text-charcoal group-hover:text-primary transition-colors truncate">{pl.project}</div>
                            <div className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-widest">{pl.customerBrand} • {new Date(pl.deliveryDate).toLocaleDateString()}</div>
                          </div>
                          <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-slate-300 group-hover:text-primary group-hover:bg-red-50 transition-all">
                             <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" /></svg>
                          </div>
                       </button>
                     ))
                   )}
                </div>
             </div>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="w-full flex flex-col gap-6 animate-in h-full pb-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h1 className={`text-4xl text-charcoal ${headCls}`}>{t.fs_title}</h1>
          <div className="flex bg-white p-1.5 rounded-[1.5rem] gap-1 shadow-sm border border-slate-100">
             <button onClick={() => setCurrentStep(1)} className={`px-6 py-3 rounded-[1.2rem] text-[11px] font-bold transition-all flex items-center gap-2 ${currentStep === 1 ? 'bg-primary shadow-lg shadow-red-100 text-white' : 'text-slate-400 hover:bg-slate-50'}`}>
               <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${currentStep === 1 ? 'bg-white/20' : 'bg-slate-100'}`}>1</span>
               {t.pl_step_trip}
             </button>
             <button onClick={() => setCurrentStep(2)} className={`px-6 py-3 rounded-[1.2rem] text-[11px] font-bold transition-all flex items-center gap-2 ${currentStep === 2 ? 'bg-primary shadow-lg shadow-red-100 text-white' : 'text-slate-400 hover:bg-slate-50'}`}>
               <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${currentStep === 2 ? 'bg-white/20' : 'bg-slate-100'}`}>2</span>
               {t.pl_step_hw}
             </button>
          </div>
        </div>
        
        {statusMsg && (
            <div className={`p-5 rounded-[2rem] border font-bold text-center animate-in shadow-sm ${statusMsg.includes('กรุณาระบุ') ? 'bg-red-50 text-red-700 border-red-100' : 'bg-green-50 text-green-700 border-green-100'}`}>
                {statusMsg}
            </div>
        )}

        {currentStep === 1 ? renderTripStep() : renderHardwareStep()}
    </div>
  );
};
