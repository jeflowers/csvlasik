import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Calendar, CheckCircle, ArrowRight } from 'lucide-react';
import type { ProcedureType, LocationType } from '../../types/appointments';
import { appointmentRequestService } from '../../services/appointmentRequestService';

const AppointmentRequestForm: React.FC = () => {
  const { t } = useTranslation(['contact', 'forms']);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    procedure_type: 'consultation' as ProcedureType,
    location: 'los_angeles' as LocationType,
    preferred_time_1: '',
    preferred_time_2: '',
    preferred_time_3: '',
    notes: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const { error } = await appointmentRequestService.createRequest(formData);
      if (error) throw error;
      setSubmitSuccess(true);
    } catch (error) {
      console.error('Error submitting:', error);
      setSubmitError('Failed to submit request. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center chopard-hero py-16">
        <div className="max-w-2xl mx-auto px-4">
          <div className="chopard-card rounded-2xl p-12 text-center">
            <CheckCircle className="w-20 h-20 chopard-text-accent mx-auto mb-6" />
            <h1 className="text-3xl font-serif chopard-text-primary mb-4">Request Submitted!</h1>
            <p className="text-lg chopard-text-secondary mb-6">
              Thank you! Our team will review your preferred times and contact you within 24 hours.
            </p>
            <a href="/" className="chopard-button px-8 py-3 rounded-lg">Return Home</a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen chopard-hero py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-serif chopard-text-primary mb-4">Schedule Your Consultation</h1>
          <p className="text-xl chopard-text-secondary">Tell us your preferred times</p>
        </div>

        <form onSubmit={handleSubmit} className="chopard-card rounded-2xl p-8 space-y-6">
          {submitError && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-800">{submitError}</div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm chopard-text-primary mb-2">First Name *</label>
              <input
                type="text"
                required
                value={formData.first_name}
                onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                className="w-full px-4 py-3 border chopard-border rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm chopard-text-primary mb-2">Last Name *</label>
              <input
                type="text"
                required
                value={formData.last_name}
                onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                className="w-full px-4 py-3 border chopard-border rounded-lg"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm chopard-text-primary mb-2">Email *</label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-4 py-3 border chopard-border rounded-lg"
            />
          </div>

          <div>
            <label className="block text-sm chopard-text-primary mb-2">Phone *</label>
            <input
              type="tel"
              required
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full px-4 py-3 border chopard-border rounded-lg"
            />
          </div>

          <div>
            <label className="block text-sm chopard-text-primary mb-2">Procedure Type *</label>
            <select
              value={formData.procedure_type}
              onChange={(e) => setFormData({ ...formData, procedure_type: e.target.value as ProcedureType })}
              className="w-full px-4 py-3 border chopard-border rounded-lg"
            >
              <option value="consultation">Initial Consultation</option>
              <option value="lasik">LASIK</option>
              <option value="prk">PRK</option>
              <option value="icl">ICL</option>
              <option value="smile">SMILE</option>
            </select>
          </div>

          <div>
            <label className="block text-sm chopard-text-primary mb-2">Location *</label>
            <select
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value as LocationType })}
              className="w-full px-4 py-3 border chopard-border rounded-lg"
            >
              <option value="los_angeles">Los Angeles / Lakewood</option>
              <option value="guam">Guam</option>
            </select>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-serif chopard-text-primary flex items-center">
              <Calendar className="h-5 w-5 mr-2" />
              Select 3 Preferred Times
            </h3>

            <div>
              <label className="block text-sm chopard-text-primary mb-2">First Preferred Time *</label>
              <input
                type="datetime-local"
                required
                value={formData.preferred_time_1}
                onChange={(e) => setFormData({ ...formData, preferred_time_1: e.target.value })}
                className="w-full px-4 py-3 border chopard-border rounded-lg"
              />
            </div>

            <div>
              <label className="block text-sm chopard-text-primary mb-2">Second Preferred Time *</label>
              <input
                type="datetime-local"
                required
                value={formData.preferred_time_2}
                onChange={(e) => setFormData({ ...formData, preferred_time_2: e.target.value })}
                className="w-full px-4 py-3 border chopard-border rounded-lg"
              />
            </div>

            <div>
              <label className="block text-sm chopard-text-primary mb-2">Third Preferred Time *</label>
              <input
                type="datetime-local"
                required
                value={formData.preferred_time_3}
                onChange={(e) => setFormData({ ...formData, preferred_time_3: e.target.value })}
                className="w-full px-4 py-3 border chopard-border rounded-lg"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm chopard-text-primary mb-2">Additional Notes</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={4}
              className="w-full px-4 py-3 border chopard-border rounded-lg"
              placeholder="Any questions or special requirements?"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full chopard-button px-8 py-4 rounded-lg flex items-center justify-center disabled:opacity-50"
          >
            {isSubmitting ? 'Submitting...' : 'Submit Request'}
            <ArrowRight className="ml-2 h-5 w-5" />
          </button>

          <p className="text-sm chopard-text-secondary text-center">
            We'll review your preferred times and contact you within 24 hours.
          </p>
        </form>
      </div>
    </div>
  );
};

export default AppointmentRequestForm;
