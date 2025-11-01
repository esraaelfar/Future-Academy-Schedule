import React, { useState, useEffect } from 'react';
import type { Booking } from '../types';
import { DAYS, ROOMS } from '../constants';

interface BookingFormProps {
  onAddBooking: (booking: Omit<Booking, 'id'>) => { success: boolean; message: string };
  onUpdateBooking: (booking: Booking) => { success: boolean; message: string };
  editingBooking: Booking | null;
  clearEditing: () => void;
}

const initialFormState = {
  groupName: '',
  instructorName: '',
  day: DAYS[0],
  timeFrom: '09:00',
  timeTo: '11:00',
  roomId: ROOMS[0].id,
  studentsCount: 10,
};

const BookingForm: React.FC<BookingFormProps> = ({ onAddBooking, onUpdateBooking, editingBooking, clearEditing }) => {
  const [formData, setFormData] = useState(initialFormState);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    if (editingBooking) {
      setFormData({
        groupName: editingBooking.groupName,
        instructorName: editingBooking.instructorName,
        day: editingBooking.day,
        timeFrom: editingBooking.timeFrom,
        timeTo: editingBooking.timeTo,
        roomId: editingBooking.roomId,
        studentsCount: editingBooking.studentsCount,
      });
      setMessage(null);
    } else {
      setFormData(initialFormState);
    }
  }, [editingBooking]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: name === 'studentsCount' ? parseInt(value, 10) : value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    if (!formData.groupName || !formData.instructorName || !formData.timeFrom || !formData.timeTo) {
      setMessage({ text: 'Please fill in all required fields.', type: 'error' });
      return;
    }
    if (formData.timeFrom >= formData.timeTo) {
      setMessage({ text: 'Start time must be before end time.', type: 'error' });
      return;
    }

    let result;
    if (editingBooking) {
      result = onUpdateBooking({ ...editingBooking, ...formData });
    } else {
      result = onAddBooking(formData);
    }
    
    if (result.success) {
        setMessage({ text: result.message, type: 'success' });
        if (!editingBooking) {
          setFormData(initialFormState);
        } else {
          clearEditing();
        }
    } else {
        setMessage({ text: result.message, type: 'error' });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h3 className="text-xl font-bold text-gray-100">{editingBooking ? 'Edit Booking' : 'Add a New Booking'}</h3>
      <div>
        <label htmlFor="groupName" className="block text-sm font-medium text-gray-400 mb-1">Group Name</label>
        <input type="text" id="groupName" name="groupName" value={formData.groupName} onChange={handleChange} required className="w-full px-3 py-2 bg-gray-700 border border-gray-600 text-gray-200 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500" />
      </div>
      
      <div>
        <label htmlFor="instructorName" className="block text-sm font-medium text-gray-400 mb-1">Instructor Name</label>
        <input type="text" id="instructorName" name="instructorName" value={formData.instructorName} onChange={handleChange} required className="w-full px-3 py-2 bg-gray-700 border border-gray-600 text-gray-200 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="day" className="block text-sm font-medium text-gray-400 mb-1">Day</label>
          <select id="day" name="day" value={formData.day} onChange={handleChange} className="w-full px-3 py-2 bg-gray-700 border border-gray-600 text-gray-200 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500">
            {DAYS.map(day => <option key={day} value={day}>{day}</option>)}
          </select>
        </div>
        <div>
            <label htmlFor="roomSelect" className="block text-sm font-medium text-gray-400 mb-1">Room</label>
            <select id="roomSelect" name="roomId" value={formData.roomId} onChange={handleChange} className="w-full px-3 py-2 bg-gray-700 border border-gray-600 text-gray-200 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500">
                {ROOMS.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
            </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="timeFrom" className="block text-sm font-medium text-gray-400 mb-1">From</label>
          <input type="time" id="timeFrom" name="timeFrom" value={formData.timeFrom} onChange={handleChange} required className="w-full px-3 py-2 bg-gray-700 border border-gray-600 text-gray-200 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500" />
        </div>
        <div>
          <label htmlFor="timeTo" className="block text-sm font-medium text-gray-400 mb-1">To</label>
          <input type="time" id="timeTo" name="timeTo" value={formData.timeTo} onChange={handleChange} required className="w-full px-3 py-2 bg-gray-700 border border-gray-600 text-gray-200 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500" />
        </div>
      </div>
      
      <div>
        <label htmlFor="studentsCount" className="block text-sm font-medium text-gray-400 mb-1">Number of Students</label>
        <input type="number" id="studentsCount" name="studentsCount" value={formData.studentsCount} onChange={handleChange} min="1" required className="w-full px-3 py-2 bg-gray-700 border border-gray-600 text-gray-200 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500" />
      </div>

      <div className="flex items-center gap-4">
        <button type="submit" className="bg-blue-600 text-white font-semibold px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-blue-500 transition-colors duration-200">
            {editingBooking ? 'Save Changes' : 'Add Booking'}
        </button>
        {editingBooking && (
            <button type="button" onClick={clearEditing} className="bg-gray-600 text-gray-200 font-semibold px-4 py-2 rounded-md hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-gray-400 transition-colors duration-200">
                Cancel Edit
            </button>
        )}
      </div>
      
      {message && (
        <div className={`p-3 rounded-md text-sm ${message.type === 'success' ? 'bg-green-900/50 text-green-300' : 'bg-red-900/50 text-red-300'}`}>
          {message.text}
        </div>
      )}
    </form>
  );
};

export default BookingForm;