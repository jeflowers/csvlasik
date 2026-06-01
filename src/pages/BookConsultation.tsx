/**
 * Atelier LASIK - Book Consultation Page
 *
 * Main page for patients to complete online forms before their visit.
 * Contains tabbed interface for registration, medical history, insurance, and consent forms.
 *
 * @module pages/BookConsultation
 */

import React from 'react';
import PatientForms from '../components/forms/PatientForms';

const BookConsultation: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <PatientForms />
    </div>
  );
};

export default BookConsultation;
