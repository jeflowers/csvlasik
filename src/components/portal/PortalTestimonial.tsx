import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Star, Send, CheckCircle2, ArrowLeft } from 'lucide-react';
import { usePatient } from '../../hooks/usePatient';
import { supabase } from '../../lib/supabase';
import { logPatientActivity } from '../../services/patientActivityService';

const PortalTestimonial: React.FC = () => {
  const { user } = usePatient();
  const { t } = useTranslation('patientForms');

  const [name, setName] = useState(
    user?.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : ''
  );
  const [content, setContent] = useState('');
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [procedureType, setProcedureType] = useState('');
  const [procedureDate, setProcedureDate] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const isValid = name.trim().length >= 2 && content.trim().length >= 10 && rating > 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) return;

    setIsSubmitting(true);
    setSubmitError('');

    try {
      const { error } = await supabase.from('testimonials').insert([
        {
          name: name.trim(),
          email: user?.email || null,
          content: content.trim(),
          rating,
          procedure_type: procedureType || null,
          procedure_date: procedureDate || null,
        },
      ]);

      if (error) {
        setSubmitError(t('testimonial.errorGeneric'));
      } else {
        setSubmitSuccess(true);
        logPatientActivity('testimonial_submit', 'Submitted a testimonial', {
          rating,
          procedure_type: procedureType || null,
        });
      }
    } catch {
      setSubmitError(t('testimonial.errorUnexpected'));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitSuccess) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-12 text-center">
          <div className="flex items-center justify-center w-16 h-16 rounded-full bg-teal-100 mx-auto mb-6">
            <CheckCircle2 className="h-8 w-8 text-teal-600" />
          </div>
          <h2 className="text-2xl font-serif text-gray-900 mb-3">{t('testimonial.successTitle')}</h2>
          <p className="text-gray-600 max-w-md mx-auto mb-2">
            {t('testimonial.successDescription')}
          </p>
          <p className="text-sm text-gray-500 mb-8">
            {t('testimonial.successNote')}
          </p>
          <div className="flex items-center justify-center gap-3">
            <Link
              to="/portal"
              className="px-5 py-2.5 text-sm font-medium text-white bg-teal-600 rounded-lg hover:bg-teal-700 transition-colors"
            >
              {t('testimonial.backToDashboard')}
            </Link>
            <Link
              to="/testimonials"
              className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              {t('testimonial.viewTestimonials')}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <Link
          to="/portal"
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-teal-600 transition-colors mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          {t('testimonial.backToDashboard')}
        </Link>
        <h1 className="text-2xl font-serif text-gray-900">{t('testimonial.title')}</h1>
        <p className="text-gray-500 mt-1">{t('testimonial.subtitle')}</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {submitError && (
          <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg text-sm">
            {submitError}
          </div>
        )}

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-6">
          <div>
            <label htmlFor="testimonial-name" className="block text-sm font-semibold text-gray-700 mb-2">
              {t('testimonial.name')} <span className="text-red-600">*</span>
            </label>
            <input
              type="text"
              id="testimonial-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              placeholder={t('testimonial.namePlaceholder')}
            />
            <p className="mt-1 text-xs text-gray-500">{t('testimonial.nameNote')}</p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              {t('testimonial.rating')} <span className="text-red-600">*</span>
            </label>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="p-1 transition-transform hover:scale-110"
                  aria-label={`Rate ${star} star${star > 1 ? 's' : ''}`}
                >
                  <Star
                    className={`h-7 w-7 transition-colors ${
                      star <= (hoverRating || rating)
                        ? 'text-amber-400 fill-amber-400'
                        : 'text-gray-300'
                    }`}
                  />
                </button>
              ))}
              {rating > 0 && (
                <span className="ml-2 text-sm text-gray-600">
                  {t('testimonial.ratingOf', { rating })}
                </span>
              )}
            </div>
          </div>

          <div>
            <label htmlFor="testimonial-content" className="block text-sm font-semibold text-gray-700 mb-2">
              {t('testimonial.experience')} <span className="text-red-600">*</span>
            </label>
            <textarea
              id="testimonial-content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={5}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent resize-none"
              placeholder={t('testimonial.experiencePlaceholder')}
            />
            <p className="mt-1 text-xs text-gray-500">
              {t('testimonial.minChars')} {content.length > 0 && t('testimonial.charCount', { count: content.length })}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="procedure-type" className="block text-sm font-semibold text-gray-700 mb-2">
                {t('testimonial.procedureType')}
              </label>
              <select
                id="procedure-type"
                value={procedureType}
                onChange={(e) => setProcedureType(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent bg-white"
              >
                <option value="">{t('testimonial.selectProcedure')}</option>
                <option value="LASIK">LASIK</option>
                <option value="PRK">PRK</option>
                <option value="ICL">ICL</option>
                <option value="Consultation">{t('dashboard.bookConsultation', { defaultValue: 'Consultation' })}</option>
                <option value="Other">{t('testimonial.other', { defaultValue: 'Other' })}</option>
              </select>
            </div>

            <div>
              <label htmlFor="procedure-date" className="block text-sm font-semibold text-gray-700 mb-2">
                {t('testimonial.procedureDate')}
              </label>
              <input
                type="date"
                id="procedure-date"
                value={procedureDate}
                onChange={(e) => setProcedureDate(e.target.value)}
                max={new Date().toISOString().split('T')[0]}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <p className="text-sm text-amber-800">{t('testimonial.reviewNotice')}</p>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting || !isValid}
            className="inline-flex items-center gap-2 bg-teal-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-teal-700 transition-all duration-200 disabled:bg-gray-300 disabled:cursor-not-allowed shadow-sm hover:shadow-md disabled:shadow-none"
          >
            {isSubmitting ? (
              t('testimonial.submitting')
            ) : (
              <>
                <Send className="h-4 w-4" />
                {t('testimonial.submitTestimonial')}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default PortalTestimonial;
