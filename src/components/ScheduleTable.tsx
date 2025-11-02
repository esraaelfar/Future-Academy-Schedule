import React, { useMemo } from 'react';
import type { Booking, Room } from '../types';
import { DAYS, STATUS } from '../constants';

interface ScheduleTableProps {
  bookings: Booking[];
  rooms: Room[];
  onDeleteBooking: (id: string) => void;
  onEditBooking: (id: string) => void;
}

const START_HOUR = 9;
const END_HOUR = 22; 

const ScheduleTable: React.FC<ScheduleTableProps> = ({ bookings, rooms, onDeleteBooking, onEditBooking }) => {
  const timeSlots = useMemo(() => {
    const slots = [];
    for (let i = START_HOUR; i < END_HOUR; i++) {
      slots.push(`${i.toString().padStart(2, '0')}:00`);
      slots.push(`${i.toString().padStart(2, '0')}:30`);
    }
    slots.push(`${END_HOUR.toString().padStart(2, '0')}:00`);
    return slots;
  }, []);

  const scheduleGrid = useMemo(() => {
    const grid: { [day: string]: { [time: string]: { [roomId: string]: { booking: Booking; duration: number } | null } } } = {};

    DAYS.forEach(day => {
      grid[day] = {};
      timeSlots.forEach(time => {
        grid[day][time] = {};
        rooms.forEach(room => {
          grid[day][time][room.id] = null;
        });
      });
    });

    bookings.forEach(booking => {
      const [fromHour, fromMinute] = booking.timeFrom.split(':').map(Number);
      const [toHour, toMinute] = booking.timeTo.split(':').map(Number);
      
      const startMinutes = fromHour * 60 + fromMinute;
      const endMinutes = toHour * 60 + toMinute;

      if (endMinutes <= startMinutes) return;

      const durationInMinutes = endMinutes - startMinutes;
      const durationInSlots = Math.ceil(durationInMinutes / 30);

      const startTimeSlot = `${fromHour.toString().padStart(2, '0')}:${fromMinute.toString().padStart(2, '0')}`;
      const startIndex = timeSlots.indexOf(startTimeSlot);

      if (durationInSlots > 0 && startIndex !== -1) {
        grid[booking.day][startTimeSlot][booking.roomId] = { booking, duration: durationInSlots };
        
        for (let i = 1; i < durationInSlots; i++) {
          const nextSlotIndex = startIndex + i;
          if (nextSlotIndex < timeSlots.length) {
             const nextTimeSlot = timeSlots[nextSlotIndex];
             if(grid[booking.day]?.[nextTimeSlot]) {
                grid[booking.day][nextTimeSlot][booking.roomId] = {} as any;
             }
          }
        }
      }
    });

    return grid;
  }, [bookings, rooms, timeSlots]);

  if (bookings.length === 0) {
    return (
      <div className="text-center py-10 px-4 bg-gray-800 rounded-lg">
        <p className="text-gray-400">There are no bookings yet.</p>
        <p className="text-gray-500 text-sm mt-1">Add the first booking using the form.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {DAYS.map(day => (
        <div key={day}>
          <h4 className="text-lg font-bold text-gray-300 mb-3 bg-gray-800/50 p-2 rounded-md">{day}</h4>
          <div className="flex gap-6 mt-3 text-sm text-gray-300">
            <div className="flex items-center gap-2">
              <span className="w-4 h-4 rounded bg-sky-900/50 border-l-4 border-sky-500"></span>
              <span>Regular Class</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-4 h-4 rounded bg-red-900/40 border-l-4 border-red-500"></span>
              <span>Extra Class</span>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full border border-gray-700">
              <thead className="bg-gray-900">
                <tr>
                  <th className="w-28 px-2 py-2 text-left border-r border-gray-700 text-xs font-medium text-gray-400 uppercase">Time</th>
                  {rooms.map(room => (
                    <th key={room.id} className="px-2 py-2 text-center border-r border-gray-700 text-xs font-medium text-gray-400 uppercase">{room.name}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {timeSlots.map(time => {
                  const [hourStr, minuteStr] = time.split(':');
                  const hour24 = parseInt(hourStr, 10);
                  const hour12 = hour24 % 12 === 0 ? 12 : hour24 % 12;
                  const period = hour24 >= 12 ? 'PM' : 'AM';
                  
                  return (
                    <tr key={time} className="h-12">
                      <td className="px-2 py-0 align-top border-r border-gray-700 bg-gray-900 text-xs text-gray-400 font-semibold">{`${hour12}:${minuteStr} ${period}`}</td>
                      {rooms.map(room => {
                        const cellData = scheduleGrid[day]?.[time]?.[room.id];
                        if (cellData === null) {
                          return <td key={room.id} className="border-r border-gray-700"></td>;
                        }
                        if (cellData && cellData.booking) {
                          return (
                              <td
                                key={room.id}
                                rowSpan={cellData.duration}
                                className={`border-r border-gray-700 p-2 align-top ${
                                  cellData.booking.status === STATUS[1]
                                    ? 'bg-red-900/40 border-l-4 border-red-500'   // Extra
                                    : 'bg-sky-900/50 border-l-4 border-sky-500'  // Regular
                                }`}
                              >
                              <div className="h-full flex flex-col justify-between">
                                <div className="space-y-1">
                                  <p className="font-semibold text-sm text-sky-200">{cellData.booking.groupName}</p>
                                  <p className="text-xs text-sky-300">{cellData.booking.instructorName}</p>
                                  <div className="flex items-center gap-1.5 text-xs text-gray-300 pt-1">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                                    </svg>
                                    <span>{cellData.booking.studentsCount} students</span>
                                  </div>
                                </div>
                                <div className="mt-2 self-end flex flex-col items-end gap-y-1 sm:flex-row sm:gap-y-0 sm:gap-x-1">
                                  <button onClick={() => onEditBooking(cellData.booking.id)} className="flex items-center gap-1 text-xs bg-white/10 hover:bg-white/20 text-sky-300 px-2 py-0.5 rounded transition-colors">
                                     <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor"><path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" /><path fillRule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clipRule="evenodd" /></svg>
                                  </button>
                                  <button onClick={() => onDeleteBooking(cellData.booking.id)} className="flex items-center gap-1 text-xs bg-white/10 hover:bg-white/20 text-red-400 px-2 py-0.5 rounded transition-colors">
                                     <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm4 0a1 1 0 012 0v6a1 1 0 11-2 0V8z" clipRule="evenodd" /></svg>
                                  </button>
                                </div>
                              </div>
                            </td>
                          );
                        }
                        return null;
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ScheduleTable;