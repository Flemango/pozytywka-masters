// src/pages/Reservations.js
import React from 'react';
import AdminCalendar from '../../components/admin/AdminCalendar';

// const sampleReservations = [
//   { date: '2024-08-01', time: '10:00 AM', name: 'John Doe', email: 'john@example.com' },
//   { date: '2024-08-01', time: '11:00 AM', name: 'Jane Smith', email: 'jane@example.com' },
//   { date: '2024-08-02', time: '02:00 PM', name: 'Bob Brown', email: 'bob@example.com' },
//   // Add more sample data as needed
// ];

function Reservations() {
  return (
    <div>
      <AdminCalendar />
    </div>
  );
}

export default Reservations;
