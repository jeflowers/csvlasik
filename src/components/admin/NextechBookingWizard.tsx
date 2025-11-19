import React, { useState, useEffect } from 'react';
import {
  X,
  Calendar,
  Clock,
  MapPin,
  User,
  ChevronRight,
  ChevronLeft,
  CheckCircle,
  AlertCircle,
  Loader
} from 'lucide-react';
import type { ConsultationRequest } from '../../types/Consultation';
import type {
  NextechProvider,
  NextechLocation,
  NextechAppointmentType,
  NextechAvailabilitySlot
} from '../../types/Nextech';
import { nextechService } from '../../services/nextech/nextechService';

interface NextechBookingWizardProps {
  request: ConsultationRequest;
  onClose: () => void;
  onComplete: () => void;
}

type WizardStep = 'provider' | 'datetime' | 'confirm';

export const NextechBookingWizard: React.FC<NextechBookingWizardProps> = ({
  request,
  onClose,
  onComplete
}) => {
  const [currentStep, setCurrentStep] = useState<WizardStep>('provider');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Data
  const [providers, setProviders] = useState<NextechProvider[]>([]);
  const [locations, setLocations] = useState<NextechLocation[]>([]);
  const [appointmentTypes, setAppointmentTypes] = useState<NextechAppointmentType[]>([]);
  const [availableSlots, setAvailableSlots] = useState<NextechAvailabilitySlot[]>([]);

  // Selections
  const [selectedProvider, setSelectedProvider] = useState<NextechProvider | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<NextechLocation | null>(null);
  const [selectedAppointmentType, setSelectedAppointmentType] = useState<NextechAppointmentType | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<NextechAvailabilitySlot | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    if (selectedProvider && selectedLocation && selectedDate) {
      loadAvailability();
    }
  }, [selectedProvider, selectedLocation, selectedDate]);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [providersData, locationsData, typesData] = await Promise.all([
        nextechService.getProviders(),
        nextechService.getLocations(),
        nextechService.getAppointmentTypes()
      ]);

      setProviders(providersData);
      setLocations(locationsData);
      setAppointmentTypes(typesData);

      // Auto-select first available options
      if (providersData.length > 0) setSelectedProvider(providersData[0]);
      if (locationsData.length > 0) setSelectedLocation(locationsData[0]);
      if (typesData.length > 0) {
        // Try to find consultation type
        const consultType = typesData.find(t =>
          t.name.toLowerCase().includes('consult')
        );
        setSelectedAppointmentType(consultType || typesData[0]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const loadAvailability = async () => {
    if (!selectedProvider || !selectedLocation) return;

    try {
      setLoading(true);
      const slots = await nextechService.getAvailability({
        providerId: selectedProvider.id,
        locationId: selectedLocation.id,
        appointmentTypeId: selectedAppointmentType?.id,
        date: selectedDate,
        durationMinutes: selectedAppointmentType?.duration || 30
      });
      setAvailableSlots(slots);
    } catch (err) {
      console.error('Failed to load availability:', err);
      setAvailableSlots([]);
    } finally {
      setLoading(false);
    }
  };

  const handleNext = () => {
    if (currentStep === 'provider' && selectedProvider && selectedLocation) {
      setCurrentStep('datetime');
    } else if (currentStep === 'datetime' && selectedSlot) {
      setCurrentStep('confirm');
    }
  };

  const handleBack = () => {
    if (currentStep === 'datetime') {
      setCurrentStep('provider');
    } else if (currentStep === 'confirm') {
      setCurrentStep('datetime');
    }
  };

  const handleConfirm = async () => {
    if (!selectedProvider || !selectedLocation || !selectedSlot || !selectedAppointmentType) {
      setError('Please complete all required selections');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Create or find patient in Nextech
      const patient = await nextechService.findOrCreatePatient({
        firstName: request.patient_name.split(' ')[0],
        lastName: request.patient_name.split(' ').slice(1).join(' ') || 'Unknown',
        email: request.email,
        phone: request.phone || '',
        dateOfBirth: request.date_of_birth
      });

      // Create appointment
      const appointment = await nextechService.createAppointment({
        patientId: patient.id,
        providerId: selectedProvider.id,
        locationId: selectedLocation.id,
        appointmentTypeId: selectedAppointmentType.id,
        startTime: selectedSlot.startTime,
        endTime: selectedSlot.endTime,
        notes: `Consultation request for ${request.procedure_type}. Language: ${request.preferred_language || 'English'}`
      });

      // Update consultation request
      await nextechService.linkConsultationToAppointment(
        request.id,
        patient.id,
        appointment.id
      );

      onComplete();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create appointment');
    } finally {
      setLoading(false);
    }
  };

  const getNextDays = (count: number) => {
    const dates = [];
    const today = new Date();
    for (let i = 0; i < count; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() + i);
      dates.push(date);
    }
    return dates;
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatTime = (datetime: string) => {
    return new Date(datetime).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-bold mb-2">Schedule with Nextech</h2>
              <p className="text-blue-100">
                Patient: {request.patient_name} • {request.procedure_type}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:bg-blue-800 rounded-lg p-2"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Progress Steps */}
          <div className="mt-6 flex items-center justify-center space-x-4">
            {(['provider', 'datetime', 'confirm'] as WizardStep[]).map((step, index) => (
              <React.Fragment key={step}>
                <div className="flex items-center">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${
                      currentStep === step
                        ? 'bg-white text-blue-600'
                        : index < ['provider', 'datetime', 'confirm'].indexOf(currentStep)
                        ? 'bg-blue-400 text-white'
                        : 'bg-blue-800 text-blue-300'
                    }`}
                  >
                    {index + 1}
                  </div>
                  <span
                    className={`ml-2 text-sm font-medium ${
                      currentStep === step ? 'text-white' : 'text-blue-200'
                    }`}
                  >
                    {step === 'provider' && 'Provider & Location'}
                    {step === 'datetime' && 'Date & Time'}
                    {step === 'confirm' && 'Confirm'}
                  </span>
                </div>
                {index < 2 && (
                  <ChevronRight className="w-5 h-5 text-blue-300" />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mx-6 mt-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-red-800">Error</p>
              <p className="text-sm text-red-700 mt-1">{error}</p>
            </div>
          </div>
        )}

        {/* Content */}
        <div className="p-6 overflow-y-auto" style={{ maxHeight: 'calc(90vh - 280px)' }}>
          {/* Step 1: Provider & Location */}
          {currentStep === 'provider' && (
            <div className="space-y-6">
              {/* Provider Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  <User className="w-4 h-4 inline mr-2" />
                  Select Provider
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {providers.map((provider) => (
                    <button
                      key={provider.id}
                      onClick={() => setSelectedProvider(provider)}
                      className={`p-4 rounded-lg border-2 text-left transition-all ${
                        selectedProvider?.id === provider.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="font-medium text-gray-900">{provider.name}</div>
                      {provider.specialty && (
                        <div className="text-sm text-gray-500 mt-1">{provider.specialty}</div>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Location Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  <MapPin className="w-4 h-4 inline mr-2" />
                  Select Location
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {locations.map((location) => (
                    <button
                      key={location.id}
                      onClick={() => setSelectedLocation(location)}
                      className={`p-4 rounded-lg border-2 text-left transition-all ${
                        selectedLocation?.id === location.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="font-medium text-gray-900">{location.name}</div>
                      {location.address && (
                        <div className="text-sm text-gray-500 mt-1">{location.address}</div>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Appointment Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Appointment Type
                </label>
                <select
                  value={selectedAppointmentType?.id || ''}
                  onChange={(e) => {
                    const type = appointmentTypes.find(t => t.id === e.target.value);
                    setSelectedAppointmentType(type || null);
                  }}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {appointmentTypes.map((type) => (
                    <option key={type.id} value={type.id}>
                      {type.name} ({type.duration} min)
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* Step 2: Date & Time */}
          {currentStep === 'datetime' && (
            <div className="space-y-6">
              {/* Date Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  <Calendar className="w-4 h-4 inline mr-2" />
                  Select Date
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {getNextDays(14).map((date) => {
                    const dateStr = date.toISOString().split('T')[0];
                    return (
                      <button
                        key={dateStr}
                        onClick={() => setSelectedDate(dateStr)}
                        className={`p-3 rounded-lg border-2 text-center transition-all ${
                          selectedDate === dateStr
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="text-sm font-medium text-gray-900">
                          {formatDate(date)}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Time Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  <Clock className="w-4 h-4 inline mr-2" />
                  Available Times
                </label>
                {loading ? (
                  <div className="flex justify-center items-center h-40">
                    <Loader className="w-8 h-8 text-blue-600 animate-spin" />
                  </div>
                ) : availableSlots.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    No available times for this date
                  </div>
                ) : (
                  <div className="grid grid-cols-3 md:grid-cols-5 gap-2">
                    {availableSlots.map((slot, index) => (
                      <button
                        key={index}
                        onClick={() => setSelectedSlot(slot)}
                        className={`px-3 py-2 rounded-lg border-2 text-sm font-medium transition-all ${
                          selectedSlot?.startTime === slot.startTime
                            ? 'border-blue-500 bg-blue-50 text-blue-700'
                            : 'border-gray-200 hover:border-gray-300 text-gray-700'
                        }`}
                      >
                        {formatTime(slot.startTime)}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Step 3: Confirmation */}
          {currentStep === 'confirm' && (
            <div className="space-y-6">
              <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                  <h3 className="text-lg font-semibold text-gray-900">
                    Ready to Schedule
                  </h3>
                </div>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Patient:</span>
                    <span className="font-medium text-gray-900">{request.patient_name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Provider:</span>
                    <span className="font-medium text-gray-900">{selectedProvider?.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Location:</span>
                    <span className="font-medium text-gray-900">{selectedLocation?.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Type:</span>
                    <span className="font-medium text-gray-900">{selectedAppointmentType?.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Date:</span>
                    <span className="font-medium text-gray-900">
                      {selectedSlot && formatDate(new Date(selectedSlot.startTime))}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Time:</span>
                    <span className="font-medium text-gray-900">
                      {selectedSlot && `${formatTime(selectedSlot.startTime)} - ${formatTime(selectedSlot.endTime)}`}
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                  <strong>Note:</strong> This will create an appointment in Nextech and link it to this consultation request.
                  The patient will receive confirmation via their preferred contact method.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="border-t border-gray-200 p-6 bg-gray-50">
          <div className="flex justify-between">
            <button
              onClick={currentStep === 'provider' ? onClose : handleBack}
              className="px-6 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              {currentStep === 'provider' ? 'Cancel' : 'Back'}
            </button>
            <button
              onClick={currentStep === 'confirm' ? handleConfirm : handleNext}
              disabled={
                loading ||
                (currentStep === 'provider' && (!selectedProvider || !selectedLocation)) ||
                (currentStep === 'datetime' && !selectedSlot)
              }
              className="px-6 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              {loading && <Loader className="w-4 h-4 animate-spin" />}
              <span>
                {currentStep === 'confirm' ? 'Confirm Appointment' : 'Next'}
              </span>
              {!loading && currentStep !== 'confirm' && <ChevronRight className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
