
import React, { useRef, useEffect, useState } from 'react';
import { EmployeeService } from '../../services/EmployeeService';
import { translations } from '../../utils/translations';
import { Language } from '../../App';

declare const google: any;

interface TeamMapViewProps {
  lang: Language;
}

export const TeamMapView: React.FC<TeamMapViewProps> = ({ lang }) => {
  const teamMapRef = useRef<HTMLDivElement>(null);
  const [mapError, setMapError] = useState(false);
  const [teamLocations, setTeamLocations] = useState<any[]>([]);
  const t = translations[lang];
  const headCls = lang === 'TH' ? 'font-prompt font-bold' : 'font-montserrat font-bold';
  const bodyCls = lang === 'TH' ? 'font-prompt font-normal' : 'font-montserrat font-normal';

  useEffect(() => {
    const locations = EmployeeService.getTeamLocations();
    setTeamLocations(locations);

    if (typeof google === 'undefined' || !google.maps) {
        setMapError(true);
        return;
    }
    
    const timeout = setTimeout(() => {
        if (teamMapRef.current && google.maps && google.maps.Map) {
            try {
                const defaultCenter = { lat: 13.7563, lng: 100.5018 };
                
                const map = new google.maps.Map(teamMapRef.current, {
                    center: locations.length > 0 && locations[0].record.coords ? 
                        { lat: locations[0].record.coords.latitude, lng: locations[0].record.coords.longitude } : 
                        defaultCenter,
                    zoom: 10,
                    disableDefaultUI: false,
                    streetViewControl: false,
                    mapTypeControl: false,
                });

                const bounds = new google.maps.LatLngBounds();
                let hasPoints = false;

                locations.forEach(loc => {
                    if (loc.record.coords) {
                        const position = { lat: loc.record.coords.latitude, lng: loc.record.coords.longitude };
                        const marker = new google.maps.Marker({
                            position,
                            map,
                            title: lang === 'TH' ? loc.employee.nicknameTh : loc.employee.nicknameEn,
                            animation: google.maps.Animation.DROP
                        });

                        const contentString = `
                            <div style="font-family: 'Prompt', sans-serif; padding: 5px;">
                                <h3 style="font-weight: bold; margin-bottom: 4px; color: #D0342C;">
                                    ${lang === 'TH' ? loc.employee.nicknameTh : loc.employee.nicknameEn}
                                </h3>
                                <p style="font-size: 12px; color: #666; margin-bottom: 2px;">
                                    ${new Date(loc.record.timestamp).toLocaleString(lang === 'TH' ? 'th-TH' : 'en-GB')}
                                </p>
                                <p style="font-size: 12px; color: #333;">${loc.record.location}</p>
                            </div>
                        `;
                        const infowindow = new google.maps.InfoWindow({ content: contentString });
                        marker.addListener("click", () => { infowindow.open({ anchor: marker, map }); });

                        bounds.extend(position);
                        hasPoints = true;
                    }
                });

                if (hasPoints) {
                    map.fitBounds(bounds);
                    const listener = google.maps.event.addListener(map, "idle", () => { 
                        if (map.getZoom() > 16) map.setZoom(16); 
                        google.maps.event.removeListener(listener); 
                    });
                }
            } catch (e) { 
              console.error("Team Map init error", e);
              setMapError(true);
            }
        }
    }, 100);

    return () => clearTimeout(timeout);
  }, [lang]);

  return (
    <div className="w-full flex flex-col gap-10 animate-in h-full pb-10">
        <h1 className={`text-4xl text-charcoal ${headCls}`}>{t.team_map_title}</h1>
        
        <div className="bg-white rounded-[40px] p-4 shadow-sm border border-slate-100 flex-1 overflow-hidden relative flex flex-col">
            {mapError ? (
                <div className="w-full h-full flex flex-col p-6 overflow-y-auto">
                    <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4 mb-6 flex items-center gap-3">
                        <div className="w-10 h-10 bg-amber-400 rounded-full flex items-center justify-center text-white shrink-0">
                           <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                        </div>
                        <p className={`text-sm text-amber-800 ${bodyCls}`}>
                           {lang === 'TH' 
                            ? 'ระบบแผนที่ขัดข้อง (Billing/API Error) กำลังแสดงรายการตำแหน่งในรูปแบบข้อความแทน' 
                            : 'Map service unavailable. Showing location list view fallback.'}
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {teamLocations.map((loc, idx) => (
                            <div key={idx} className="bg-slate-50 p-5 rounded-3xl border border-slate-100 flex flex-col gap-2">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white font-bold">
                                        {loc.employee.nicknameEn.charAt(0)}
                                    </div>
                                    <div>
                                        <p className="font-bold text-charcoal">{lang === 'TH' ? loc.employee.nicknameTh : loc.employee.nicknameEn}</p>
                                        <p className="text-[10px] text-slate-400 font-bold uppercase">{loc.employee.position}</p>
                                    </div>
                                </div>
                                <div className="mt-2 pt-2 border-t border-slate-200/50">
                                    <p className="text-xs text-slate-600 font-medium truncate">{loc.record.location}</p>
                                    <p className="text-[10px] text-slate-400 mt-1">{new Date(loc.record.timestamp).toLocaleString()}</p>
                                </div>
                            </div>
                        ))}
                        {teamLocations.length === 0 && (
                            <div className="col-span-full py-20 text-center text-slate-300 italic">{t.map_no_data}</div>
                        )}
                    </div>
                </div>
            ) : (
                <div ref={teamMapRef} className="w-full h-full rounded-[30px] overflow-hidden">
                    <div className="w-full h-full flex items-center justify-center bg-slate-50">
                        <span className="text-slate-400 animate-pulse">{t.map_loading}</span>
                    </div>
                </div>
            )}
        </div>
    </div>
  );
};
