import React, { useState, useEffect } from 'react';
import type { Booking } from './types';
import { ROOMS, DAYS } from './constants';
import BookingForm from './components/BookingForm';
import ScheduleTable from './components/ScheduleTable';

const App: React.FC = () => {
    const [bookings, setBookings] = useState<Booking[]>(() => {
        try {
            const savedBookings = localStorage.getItem('bookings');
            if (savedBookings) {
                return JSON.parse(savedBookings);
            }
        } catch (error) {
            console.error("Failed to parse bookings from localStorage", error);
        }
        return [
            { id: '1', groupName: 'Arduino Code', instructorName: 'Eng. Esraa', day: 'Saturday', timeFrom: '10:00', timeTo: '12:00', roomId: 'A', studentsCount: 8, status: 'Regular' },
            { id: '2', groupName: 'Web', instructorName: 'Eng. Sarah Mohamed', day: 'Sunday', timeFrom: '10:00', timeTo: '12:00', roomId: 'B', studentsCount: 10, status: 'Extra' },
            { id: '3', groupName: 'Spike', instructorName: 'Eng. Fatima Hassan', day: 'Monday', timeFrom: '11:00', timeTo: '13:00', roomId: 'C', studentsCount: 9, status: 'Regular' },
            { id: '4', groupName: 'Arduino Block', instructorName: 'Eng. Khalid Youssef', day: 'Thursday', timeFrom: '12:30', timeTo: '14:00', roomId: 'D', studentsCount: 10, status: 'Regular' },
        ];
    });

    const [editingBooking, setEditingBooking] = useState<Booking | null>(null);

    useEffect(() => {
        localStorage.setItem('bookings', JSON.stringify(bookings));
    }, [bookings]);

    useEffect(() => {
        localStorage.setItem('bookings', JSON.stringify(bookings));
        console.log("📅 Current bookings:", bookings);
        }, [bookings]);

    const overlaps = (fromA: string, toA: string, fromB: string, toB: string): boolean => {
        return fromA < toB && toA > fromB;
    };

    const handleAddBooking = (newBookingData: Omit<Booking, 'id'>) => {
        const timeClash = bookings.some(b => 
            b.roomId === newBookingData.roomId && 
            b.day === newBookingData.day && 
            overlaps(b.timeFrom, b.timeTo, newBookingData.timeFrom, newBookingData.timeTo)
        );

        if (timeClash) {
            return { success: false, message: 'Time conflict! Another booking exists in the same room at the same time.' };
        }

        const newBooking = { ...newBookingData, id: Date.now().toString() };
        setBookings(prev => [...prev, newBooking].sort((a,b) => DAYS.indexOf(a.day) - DAYS.indexOf(b.day) || a.timeFrom.localeCompare(b.timeFrom)));
        return { success: true, message: 'Booking added successfully!' };
    };
    
    const handleUpdateBooking = (updatedBooking: Booking) => {
        const timeClash = bookings.some(b => 
            b.id !== updatedBooking.id &&
            b.roomId === updatedBooking.roomId && 
            b.day === updatedBooking.day && 
            overlaps(b.timeFrom, b.timeTo, updatedBooking.timeFrom, updatedBooking.timeTo)
        );
        
        if (timeClash) {
            return { success: false, message: 'Time conflict! Another booking exists in the same room at the same time.' };
        }

        setBookings(prev => prev.map(b => b.id === updatedBooking.id ? updatedBooking : b).sort((a,b) => DAYS.indexOf(a.day) - DAYS.indexOf(b.day) || a.timeFrom.localeCompare(b.timeFrom)));
        setEditingBooking(null);
        return { success: true, message: 'Booking updated successfully!' };
    };

    const handleDeleteBooking = (id: string) => {
        if (window.confirm('Are you sure you want to delete this booking?')) {
            setBookings(prev => prev.filter(b => b.id !== id));
        }
    };

    const handleEditBooking = (id: string) => {
        const bookingToEdit = bookings.find(b => b.id === id);
        if(bookingToEdit) {
            setEditingBooking(bookingToEdit);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };
    
    const clearEditing = () => setEditingBooking(null);

  return (
    <div className="container mx-auto p-4 md:p-8">
      <header className="text-center mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-100">Academy Room Booking System</h1>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <aside className="lg:col-span-4">
            <div className="bg-gray-800 p-6 rounded-lg shadow-lg sticky top-8 ring-1 ring-white/10">
                <BookingForm 
                    onAddBooking={handleAddBooking}
                    onUpdateBooking={handleUpdateBooking}
                    editingBooking={editingBooking}
                    clearEditing={clearEditing}
                />
            </div>
        </aside>

        <main className="lg:col-span-8 space-y-8">
          <section className="bg-gray-800 p-6 rounded-lg shadow-lg ring-1 ring-white/10">
            <h3 className="text-xl font-bold text-gray-100 mb-4">Weekly Schedule</h3>
            <ScheduleTable 
                bookings={bookings} 
                rooms={ROOMS} 
                onDeleteBooking={handleDeleteBooking}
                onEditBooking={handleEditBooking}
            />
          </section>
        </main>
      </div>
    </div>
  );
};

export default App;