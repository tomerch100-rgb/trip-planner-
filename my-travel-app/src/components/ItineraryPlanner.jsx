import React, { useState } from 'react';
import { tripsAPI } from '../services/api';
import MapView from './MapView'; // החזרנו את המפה למסך!

export default function ItineraryPlanner({ savedAttractions = [], destinationName, onTripComplete }) {
  const [tripDetails, setTripDetails] = useState(null);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // הלו"ז המרכזי של הטיול - מבוסס על האטרקציות שהמשתמש משבץ
  const [itinerary, setItinerary] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [maxPrice, setMaxPrice] = useState(500);
  const [selectedForAssign, setSelectedForAssign] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  // ==========================================
  // לוגיקת תאריכים
  // ==========================================
  const handleStartPlanning = (e) => {
    e.preventDefault();
    if (!startDate || !endDate) return;

    const start = new Date(startDate);
    const end = new Date(endDate);
    const diff = Math.ceil((end - start) / (1000 * 3600 * 24)) + 1;

    if (diff <= 0) return alert("תאריך סיום חייב להיות אחרי תאריך התחלה!");

    setTripDetails({
      destination: destinationName || 'היעד שנבחר',
      startDate,
      endDate,
      daysCount: diff
    });
  };

  const tripDates = [];
  const daysOfWeek = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'];
  
  if (tripDetails) {
    let curr = new Date(tripDetails.startDate);
    const end = new Date(tripDetails.endDate);
    let dayIndex = 1;
    while (curr <= end) {
      tripDates.push({
        fullDate: curr.toISOString().split('T')[0],
        dayName: daysOfWeek[curr.getDay()],
        dayNumber: dayIndex // שומרים את מספר היום (יום 1, יום 2...)
      });
      dayIndex++;
      curr.setDate(curr.getDate() + 1);
    }
  }

  const HOURS = Array.from({ length: 15 }, (_, i) => `${String(i + 8).padStart(2, '0')}:00`);

  // ==========================================
  // סינון אטרקציות בבנק
  // ==========================================
  const filteredAttractions = savedAttractions.filter(attr => {
    const matchSearch = attr.name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchPrice = (attr.default_price || 0) <= maxPrice;
    return matchSearch && matchPrice;
  });

  // ==========================================
  // בדיקת חפיפה (מניעת כפל שיבוץ בזמן אמת)
  // ==========================================
  const checkOverlap = (dayNumber, startTime, endTime) => {
    return itinerary.some(item => {
      if (item.day_number !== dayNumber) return false;
      return (startTime < item.end_time && endTime > item.start_time);
    });
  };

  // שיבוץ אטרקציה לתוך משבצת זמן בלוח
  const handleAssignToSlot = (dayNumber, dateStr, hour) => {
    if (!selectedForAssign) return alert("אנא בחר קודם אטרקציה מבנק האטרקציות בצד.");
    
    const startTime = hour;
    const duration = 2; // שעתיים ברירת מחדל לכל אטרקציה
    const endHourNum = parseInt(startTime.split(':')[0]) + duration;
    const endTime = `${String(endHourNum).padStart(2, '0')}:00`;

    // הפעלת הבדיקה החכמה
    if (checkOverlap(dayNumber, startTime, endTime)) {
      return alert("השעה שנבחרה מתנגשת עם אטרקציה קיימת בלוח השעות!");
    }

    const newItem = {
      ...selectedForAssign, // שומר על כל שדות האטרקציה (כולל קואורדינטות למפה!)
      id: selectedForAssign.id,
      name: selectedForAssign.name,
      day_number: dayNumber,
      visit_date: dateStr,
      start_time: startTime,
      end_time: endTime,
      actual_price: selectedForAssign.default_price || 0
    };

    setItinerary([...itinerary, newItem]);
    setSelectedForAssign(null); // איפוס הבחירה
  };

  const handleRemoveItem = (attractionId, dayNumber, startTime) => {
    setItinerary(itinerary.filter(i => !(i.id === attractionId && i.day_number === dayNumber && i.start_time === startTime)));
  };

  // ==========================================
  // שמירת הלו"ז הסופי ל-Backend
  // ==========================================
  const handleSaveItinerary = async () => {
    if (itinerary.length === 0) return alert("הלוח ריק. יש לשבץ לפחות אטרקציה אחת לפני השמירה.");
    setIsSaving(true);
    
    try {
      const tripData = {
        city_ids: [1], 
        start_date: tripDetails.startDate,
        end_date: tripDetails.endDate
      };

      const tripResponse = await tripsAPI.planMultiCountryTrip(tripData);
      const newTripId = tripResponse.data.id; 

      const bulkData = {
        items: itinerary.map(item => ({
          trip_id: newTripId,
          attraction_id: item.id,
          visit_date: item.visit_date, 
          start_time: item.start_time,
          end_time: item.end_time,
          actual_price: item.actual_price
        }))
      };
      
      await tripsAPI.createBulkItinerary(bulkData);
      if (onTripComplete) onTripComplete(newTripId);

    } catch (error) {
      console.error("DEBUG Error saving trip:", error);
      alert("שגיאה בשמירת המסלול בשרת.");
    } finally {
      setIsSaving(false);
    }
  };

  // --- שלב א': בחירת תאריכים ---
  if (!tripDetails) {
    return (
      <div style={{ maxWidth: '400px', margin: '50px auto', padding: '30px', backgroundColor: '#fff', border: '1px solid #ccc', borderRadius: '12px', textAlign: 'right' }} dir="rtl">
        <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '10px', textAlign: 'center' }}>הגדרת זמנים</h2>
        <p style={{ color: '#666', marginBottom: '25px', textAlign: 'center' }}>מתי הטיול ל{destinationName}?</p>
        <form onSubmit={handleStartPlanning}>
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>תאריך יציאה</label>
            <input type="date" required value={startDate} onChange={(e) => setStartDate(e.target.value)} style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '6px' }} />
          </div>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>תאריך חזרה</label>
            <input type="date" required value={endDate} onChange={(e) => setEndDate(e.target.value)} style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '6px' }} />
          </div>
          <button type="submit" style={{ width: '100%', backgroundColor: '#2563eb', color: '#fff', padding: '12px', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>
            צור לוח תכנון
          </button>
        </form>
      </div>
    );
  }

  // --- שלב ב': הלוח המעודכן עם המערכת המשובצת והמפה ---
  return (
    <div style={{ display: 'flex', flexDirection: 'row', width: '100%', minHeight: '85vh', backgroundColor: '#f8f9fa', boxSizing: 'border-box', fontFamily: 'sans-serif' }} dir="rtl">
      
      {/* סרגל צד: בנק אטרקציות */}
      <div style={{ width: '25%', minWidth: '260px', backgroundColor: '#fff', borderLeft: '2px solid #ddd', padding: '20px', boxSizing: 'border-box', display: 'flex', flexDirection: 'column' }}>
        <h2 style={{ fontSize: '18px', fontWeight: '900', color: '#333', marginBottom: '15px', textAlign: 'right' }}>בנק אטרקציות</h2>
        <div style={{ marginBottom: '20px', textAlign: 'right' }}>
          <input 
            type="text" placeholder="חיפוש חופשי..." 
            style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px', boxSizing: 'border-box', marginBottom: '10px' }}
            value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
          />
          <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#555', display: 'block', marginBottom: '5px' }}>תקציב: עד {maxPrice}₪</label>
          <input 
            type="range" min="0" max="1500" step="50" style={{ width: '100%' }}
            value={maxPrice} onChange={e => setMaxPrice(e.target.value)}
          />
        </div>

        <div style={{ flex: 1, overflowY: 'auto' }}>
          {filteredAttractions.map(attr => (
            <div 
              key={attr.id} onClick={() => setSelectedForAssign(attr)}
              style={{
                padding: '12px',
                borderRadius: '8px',
                border: selectedForAssign?.id === attr.id ? '2px solid #e8aa75' : '1px solid #ddd',
                backgroundColor: selectedForAssign?.id === attr.id ? '#fff6ed' : '#fff',
                cursor: 'pointer',
                marginBottom: '10px',
                textAlign: 'right'
              }}
            >
              <div style={{ fontWeight: 'bold', color: '#333', fontSize: '14px' }}>{attr.name}</div>
              <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>{attr.default_price ? `${attr.default_price} ₪` : 'חינם'}</div>
            </div>
          ))}
        </div>
      </div>

      {/* הלוח המרכזי בעיצוב מחברת קשיח */}
      <div style={{ flex: 1, padding: '25px', overflowX: 'auto', boxSizing: 'border-box' }}>
        <div style={{ minWidth: '800px', margin: '0 auto' }}>
          
          {/* כותרת עליונה */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', paddingBottom: '10px', borderBottom: '2px solid #ccc' }}>
            <div style={{ textAlign: 'right' }}>
              <h1 style={{ fontSize: '28px', fontWeight: '900', color: '#444', margin: 0 }}>לוח תכנון שבועי</h1>
              <div style={{ fontSize: '14px', color: '#666', marginTop: '5px' }}>יעד: <span style={{ fontWeight: 'bold' }}>{tripDetails.destination}</span></div>
            </div>
            <button 
              onClick={handleSaveItinerary} disabled={isSaving || itinerary.length === 0}
              style={{ backgroundColor: '#333', color: '#fff', padding: '10px 24px', border: 'none', borderRadius: '20px', fontWeight: 'bold', cursor: 'pointer' }}
            >
              {isSaving ? 'שומר...' : 'שמור מסלול'}
            </button>
          </div>

          {/* מבנה הטבלה עם גבולות מוכפפים ויציבים */}
          <div style={{ backgroundColor: '#fff', border: '2px solid #999', borderRadius: '8px', overflow: 'hidden', marginBottom: '30px' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed', textAlign: 'right' }}>
              <thead>
                <tr style={{ backgroundColor: '#f2dbb8', borderBottom: '2px solid #888' }}>
                  <th style={{ width: '90px', borderLeft: '1px solid #aaa', padding: '12px', color: '#333', fontWeight: 'bold', fontSize: '14px', textAlign: 'center' }}>שעה</th>
                  {tripDates.map((dateObj) => (
                    <th key={dateObj.fullDate} style={{ borderLeft: '1px solid #aaa', padding: '12px', color: '#222', fontWeight: 'bold', textAlign: 'center' }}>
                      <div style={{ fontSize: '16px' }}>יום {dateObj.dayNumber} ({dateObj.dayName})</div>
                      <div style={{ fontSize: '11px', fontWeight: 'normal', color: '#555', marginTop: '2px' }}>{dateObj.fullDate}</div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {HOURS.map(hour => (
                  <tr key={hour} style={{ borderBottom: '1px solid #bbb' }}>
                    {/* עמודת השעה */}
                    <td style={{ borderLeft: '1px solid #aaa', backgroundColor: '#fcfaf7', padding: '10px', fontSize: '13px', fontWeight: 'bold', color: '#666', textAlign: 'center', height: '65px', boxSizing: 'border-box' }}>
                      {hour}
                    </td>
                    
                    {/* תאי הימים - מציגים את השיבוץ האמיתי מתוך ה-itinerary state */}
                    {tripDates.map(dateObj => {
                      const scheduledItem = itinerary.find(item => 
                        item.day_number === dateObj.dayNumber && item.start_time <= hour && item.end_time > hour
                      );

                      const isStartHour = scheduledItem && scheduledItem.start_time === hour;

                      if (scheduledItem) {
                        if (isStartHour) {
                          return (
                            <td key={`${dateObj.fullDate}-${hour}`} style={{ borderLeft: '1px solid #aaa', padding: '4px', verticalAlign: 'top', height: '65px', boxSizing: 'border-box' }}>
                              <div style={{ backgroundColor: '#4b5563', color: '#fff', borderRadius: '4px', padding: '8px', height: '100%', position: 'relative', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', boxSizing: 'border-box', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                                <div style={{ fontWeight: 'bold', fontSize: '12px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{scheduledItem.name}</div>
                                <div style={{ fontSize: '10px', color: '#cbd5e1', marginTop: '2px' }}>{scheduledItem.start_time} - {scheduledItem.end_time}</div>
                                <button 
                                  onClick={(e) => { e.stopPropagation(); handleRemoveItem(scheduledItem.id, dateObj.dayNumber, scheduledItem.start_time); }}
                                  style={{ position: 'absolute', top: '4px', left: '4px', background: '#ef4444', color: '#fff', border: 'none', borderRadius: '50%', width: '16px', height: '16px', fontSize: '10px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}
                                >✕</button>
                              </div>
                            </td>
                          );
                        } else {
                          return <td key={`${dateObj.fullDate}-${hour}`} style={{ borderLeft: '1px solid #aaa', backgroundColor: '#f3f4f6', height: '65px' }}></td>;
                        }
                      }

                      return (
                        <td 
                          key={`${dateObj.fullDate}-${hour}`} 
                          onClick={() => handleAssignToSlot(dateObj.dayNumber, dateObj.fullDate, hour)}
                          style={{
                            borderLeft: '1px solid #aaa',
                            height: '65px',
                            cursor: 'pointer',
                            backgroundColor: selectedForAssign ? '#fffbeb' : 'transparent',
                            transition: 'background-color 0.2s',
                            boxSizing: 'border-box'
                          }}
                          onMouseEnter={(e) => { if (selectedForAssign) e.currentTarget.style.backgroundColor = '#fef3c7'; }}
                          onMouseLeave={(e) => { if (selectedForAssign) e.currentTarget.style.backgroundColor = '#fffbeb'; }}
                        >
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
            
            {/* תחתית הלוח */}
            <div style={{ backgroundColor: '#f2dbb8', borderTop: '2px solid #888', padding: '10px', fontWeight: 'bold', color: '#333', fontSize: '13px' }}>
              משימות עיקריות והערות:
            </div>
            <div style={{ padding: '12px', backgroundColor: '#fff' }}>
              <textarea 
                style={{ width: '100%', height: '60px', padding: '8px', fontSize: '13px', color: '#444', border: '1px solid #ddd', borderRadius: '6px', resize: 'none', backgroundColor: '#fafafa', boxSizing: 'border-box' }}
                placeholder="ניתן להוסיף כאן טקסט חופשי או נקודות חשובות לטיול..."
              />
            </div>
          </div>

          {/* מפת המסלול - החזרנו אותה והיא מתעדכנת דינמית לפי השיבוצים בלוח השעות */}
          <div style={{ marginTop: '25px', textAlign: 'right' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: '#333', marginBottom: '10px' }}>מפת המסלול המשובץ</h3>
            <MapView attractions={itinerary} />
          </div>

        </div>
      </div>

    </div>
  );
}