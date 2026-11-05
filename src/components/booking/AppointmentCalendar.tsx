import React, { useState, useEffect } from 'react';
import { Calendar, Clock, MapPin, ChevronLeft, ChevronRight, CheckCircle, LogOut } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { usePatient } from '../../hooks/usePatient';
import { BookingAuthGate } from './BookingAuthGate';
import { useTranslation } from 'react-i18next';

interface TimeSlot {
  id: string;
  slot_date: string;
  slot_time: string;
  duration_minutes: number;
  appointment_type: string;
  location: string;
  is_available: boolean;
}

interface BookingFormData {
  patient_name: string;
  patient_email: string;
  patient_phone: string;
  procedure_type: string;
  insurance_provider: string;
  notes: string;
}

export const AppointmentCalendar: React.FC = () => {
  const { t, i18n } = useTranslation();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'calendar' | 'slots' | 'form' | 'confirmation'>('calendar');
  const [confirmationCode, setConfirmationCode] = useState('');
  const [formData, setFormData] = useState<BookingFormData>({
    patient_name: '',
    patient_email: '',
    patient_phone: '',
    procedure_type: 'LASIK',
    insurance_provider: '',
    notes: '',
  });
  const {
    user,
    loading: authLoading,
    error: authError,
    login,
    register,
    logout,
    pendingConfirmationEmail,
    resendConfirmation,
    clearPendingConfirmation,
  } = usePatient();
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    const fullName = [user.firstName, user.lastName].filter(Boolean).join(' ');
    setFormData((prev) => ({
      ...prev,
      patient_name: prev.patient_name || fullName,
      patient_email: prev.patient_email || user.email,
    }));
  }, [user]);

  const loadSlotsForDate = async (date: Date) => {
    try {
      setLoading(true);
      const dateStr = date.toISOString().split('T')[0];

      const { data, error } = await supabase
        .from('appointment_slots')
        .select('*')
        .eq('slot_date', dateStr)
        .eq('is_available', true)
        .order('slot_time');

      if (error) throw error;
      setAvailableSlots(data || []);
    } catch (error) {
      console.error('Failed to load slots:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDateSelect = async (date: Date) => {
    setSelectedDate(date);
    await loadSlotsForDate(date);
    setStep('slots');
  };

  const handleSlotSelect = (slot: TimeSlot) => {
    setSelectedSlot(slot);
    setStep('form');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSlot) return;
    setSubmitError(null);

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('appointment_bookings')
        .insert({
          slot_id: selectedSlot.id,
          patient_name: formData.patient_name,
          patient_email: formData.patient_email,
          patient_phone: formData.patient_phone,
          procedure_type: formData.procedure_type,
          insurance_provider: formData.insurance_provider,
          notes: formData.notes,
          status: 'pending',
          booking_source: 'website',
        })
        .select('confirmation_code')
        .maybeSingle();

      if (error) throw error;
      if (!data) throw new Error('Booking was not saved');

      setConfirmationCode(data.confirmation_code);
      setStep('confirmation');
    } catch (error) {
      console.error('Failed to book appointment:', error);
      setSubmitError('We could not book this appointment. The time may no longer be available. Please try again or pick another time.');
    } finally {
      setLoading(false);
    }
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days: (Date | null)[] = [];

    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }

    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }

    return days;
  };

  const changeMonth = (increment: number) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + increment);
    setCurrentDate(newDate);
  };

  const isDateSelectable = (date: Date | null) => {
    if (!date) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date >= today;
  };

  const formatTime = (timeString: string) => {
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const days = getDaysInMonth(currentDate);

  if (authLoading) {
    return (
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg p-8 flex justify-center">
        <div className="w-8 h-8 border-4 border-teal-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <BookingAuthGate
        login={login}
        register={register}
        error={authError}
        pendingConfirmationEmail={pendingConfirmationEmail}
        resendConfirmation={resendConfirmation}
        clearPendingConfirmation={clearPendingConfirmation}
      />
    );
  }

  if (step === 'confirmation') {
    return (
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg p-8">
        <div className="text-center">
          <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Appointment Confirmed!</h2>
          <p className="text-gray-600 mb-6">
            Your appointment has been successfully booked. You will receive a confirmation email shortly.
          </p>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
            <p className="text-sm text-gray-600 mb-2">Confirmation Code</p>
            <p className="text-3xl font-bold text-blue-600 tracking-wider">{confirmationCode}</p>
          </div>

          {selectedSlot && (
            <div className="text-start space-y-3 mb-6">
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-gray-400" />
                <span className="text-gray-900">{selectedSlot.slot_date}</span>
              </div>
              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-gray-400" />
                <span className="text-gray-900">{formatTime(selectedSlot.slot_time)}</span>
              </div>
              <div className="flex items-center gap-3">
                <MapPin className="w-5 h-5 text-gray-400" />
                <span className="text-gray-900">{selectedSlot.location}</span>
              </div>
            </div>
          )}

          <button
            onClick={() => window.location.href = '/'}
            className="px-6 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700"
          >
            Return to Home
          </button>
        </div>
      </div>
    );
  }

  if (step === 'form') {
    return (
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg p-8">
        <div className="flex items-center justify-between gap-4 mb-6 px-4 py-3 bg-teal-50 border border-teal-100 rounded-lg text-sm">
          <span className="text-teal-900 truncate">Signed in as {user.email}</span>
          <button
            type="button"
            onClick={logout}
            className="flex items-center gap-1 text-teal-700 hover:text-teal-900 shrink-0"
          >
            <LogOut className="w-4 h-4" />
            Sign out
          </button>
        </div>
        <div className="mb-6">
          <button
            onClick={() => setStep('slots')}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
          >
            <ChevronLeft className="w-5 h-5 me-1 rtl:rotate-180" />
            Back to time slots
          </button>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Complete Your Booking</h2>
          {selectedSlot && (
            <p className="text-gray-600">
              {selectedSlot.slot_date} at {formatTime(selectedSlot.slot_time)}
            </p>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Full Name *
            </label>
            <input
              type="text"
              required
              value={formData.patient_name}
              onChange={(e) => setFormData({ ...formData, patient_name: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-4 py-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email Address *
            </label>
            <input
              type="email"
              required
              value={formData.patient_email}
              onChange={(e) => setFormData({ ...formData, patient_email: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-4 py-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Phone Number *
            </label>
            <input
              type="tel"
              required
              value={formData.patient_phone}
              onChange={(e) => setFormData({ ...formData, patient_phone: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-4 py-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Procedure Type *
            </label>
            <select
              required
              value={formData.procedure_type}
              onChange={(e) => setFormData({ ...formData, procedure_type: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-4 py-2"
            >
              <option value="LASIK">LASIK</option>
              <option value="PRK">PRK</option>
              <option value="ICL">ICL</option>
              <option value="Cataract">Cataract Surgery</option>
              <option value="Consultation">General Consultation</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Insurance Provider (Optional)
            </label>
            <input
              type="text"
              value={formData.insurance_provider}
              onChange={(e) => setFormData({ ...formData, insurance_provider: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-4 py-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Additional Notes (Optional)
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={4}
              className="w-full border border-gray-300 rounded-lg px-4 py-2"
            />
          </div>

          {submitError && (
            <div role="alert" className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">
              {submitError}
            </div>
          )}

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setStep('slots')}
              className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:opacity-50"
            >
              {loading ? 'Booking...' : 'Confirm Booking'}
            </button>
          </div>
        </form>
      </div>
    );
  }

  if (step === 'slots') {
    return (
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-8">
        <div className="mb-6">
          <button
            onClick={() => setStep('calendar')}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
          >
            <ChevronLeft className="w-5 h-5 me-1 rtl:rotate-180" />
            Back to calendar
          </button>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Available Time Slots</h2>
          <p className="text-gray-600">
            {selectedDate?.toLocaleDateString(i18n.language, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
          </div>
        ) : availableSlots.length === 0 ? (
          <div className="text-center py-12">
            <Clock className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No available slots for this date. Please select another date.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {availableSlots.map((slot) => (
              <button
                key={slot.id}
                onClick={() => handleSlotSelect(slot)}
                className="p-4 border-2 border-gray-200 rounded-lg hover:border-teal-600 hover:bg-teal-50 transition-colors"
              >
                <div className="flex items-center justify-center mb-2">
                  <Clock className="w-5 h-5 text-teal-600 me-2" />
                  <span className="font-semibold text-gray-900">
                    {formatTime(slot.slot_time)}
                  </span>
                </div>
                <div className="text-sm text-gray-600">{slot.appointment_type}</div>
                <div className="text-xs text-gray-500 mt-1">{slot.location}</div>
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Select an Appointment Date</h2>

      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <button
            onClick={() => changeMonth(-1)}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <ChevronLeft className="w-6 h-6 rtl:rotate-180" />
          </button>
          <h3 className="text-xl font-semibold">
            {currentDate.toLocaleDateString(i18n.language, { month: 'long', year: 'numeric' })}
          </h3>
          <button
            onClick={() => changeMonth(1)}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <ChevronRight className="w-6 h-6 rtl:rotate-180" />
          </button>
        </div>

        <div className="grid grid-cols-7 gap-2">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
            <div key={day} className="text-center text-sm font-medium text-gray-600 py-2">
              {day}
            </div>
          ))}
          {days.map((date, index) => (
            <button
              key={index}
              onClick={() => date && isDateSelectable(date) && handleDateSelect(date)}
              disabled={!date || !isDateSelectable(date)}
              className={`
                aspect-square rounded-lg flex items-center justify-center text-sm
                ${!date ? 'invisible' : ''}
                ${isDateSelectable(date)
                  ? 'hover:bg-teal-100 cursor-pointer border-2 border-gray-200 hover:border-teal-600'
                  : 'text-gray-300 cursor-not-allowed'
                }
              `}
            >
              {date?.getDate()}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
