import React, { useState } from 'react';
import { Calculator, DollarSign, TrendingDown } from 'lucide-react';
import { supabase } from '../lib/supabase';

export const FinancingCalculator: React.FC = () => {
  const [procedureCost, setProcedureCost] = useState(5000);
  const [downPayment, setDownPayment] = useState(1000);
  const [termMonths, setTermMonths] = useState(24);
  const [interestRate, setInterestRate] = useState(7.99);
  const [showApplication, setShowApplication] = useState(false);
  const [applicationData, setApplicationData] = useState({
    applicant_name: '',
    applicant_email: '',
    applicant_phone: '',
    procedure_type: 'LASIK',
    credit_score_range: '700-749',
    employment_status: 'employed',
    annual_income: 50000,
  });

  const calculateMonthlyPayment = () => {
    const principal = procedureCost - downPayment;
    const monthlyRate = interestRate / 100 / 12;
    const payment = principal * (monthlyRate * Math.pow(1 + monthlyRate, termMonths)) /
                    (Math.pow(1 + monthlyRate, termMonths) - 1);
    return isNaN(payment) ? 0 : payment;
  };

  const monthlyPayment = calculateMonthlyPayment();
  const totalCost = monthlyPayment * termMonths + downPayment;
  const totalInterest = totalCost - procedureCost;

  const handleSubmitApplication = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const { error } = await supabase
        .from('financing_applications')
        .insert({
          ...applicationData,
          procedure_cost: procedureCost,
          down_payment: downPayment,
          monthly_payment: monthlyPayment,
          term_months: termMonths,
          interest_rate: interestRate,
          application_status: 'pending',
        });

      if (error) throw error;

      alert('Application submitted successfully! We will contact you within 24 hours.');
      setShowApplication(false);
      setApplicationData({
        applicant_name: '',
        applicant_email: '',
        applicant_phone: '',
        procedure_type: 'LASIK',
        credit_score_range: '700-749',
        employment_status: 'employed',
        annual_income: 50000,
      });
    } catch (error) {
      console.error('Failed to submit application:', error);
      alert('Failed to submit application. Please try again.');
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-lg p-8">
        <div className="text-center mb-8">
          <Calculator className="w-12 h-12 text-teal-600 mx-auto mb-4" />
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Financing Calculator</h2>
          <p className="text-gray-600">Calculate your monthly payment options</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Procedure Cost
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="number"
                  value={procedureCost}
                  onChange={(e) => setProcedureCost(Number(e.target.value))}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg"
                  min="1000"
                  max="20000"
                  step="100"
                />
              </div>
              <input
                type="range"
                value={procedureCost}
                onChange={(e) => setProcedureCost(Number(e.target.value))}
                className="w-full mt-2"
                min="1000"
                max="20000"
                step="100"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Down Payment
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="number"
                  value={downPayment}
                  onChange={(e) => setDownPayment(Number(e.target.value))}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg"
                  min="0"
                  max={procedureCost}
                  step="100"
                />
              </div>
              <input
                type="range"
                value={downPayment}
                onChange={(e) => setDownPayment(Number(e.target.value))}
                className="w-full mt-2"
                min="0"
                max={procedureCost}
                step="100"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Loan Term (Months)
              </label>
              <select
                value={termMonths}
                onChange={(e) => setTermMonths(Number(e.target.value))}
                className="w-full border border-gray-300 rounded-lg px-4 py-2"
              >
                <option value={6}>6 months</option>
                <option value={12}>12 months</option>
                <option value={18}>18 months</option>
                <option value={24}>24 months</option>
                <option value={36}>36 months</option>
                <option value={48}>48 months</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Interest Rate (APR)
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={interestRate}
                  onChange={(e) => setInterestRate(Number(e.target.value))}
                  className="w-full pr-8 pl-4 py-2 border border-gray-300 rounded-lg"
                  min="0"
                  max="30"
                  step="0.1"
                />
                <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">%</span>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-gradient-to-br from-teal-500 to-blue-600 rounded-lg p-6 text-white">
              <div className="text-center mb-6">
                <p className="text-sm opacity-90 mb-2">Estimated Monthly Payment</p>
                <p className="text-5xl font-bold">${monthlyPayment.toFixed(2)}</p>
              </div>

              <div className="space-y-3 pt-6 border-t border-white border-opacity-30">
                <div className="flex justify-between items-center">
                  <span className="text-sm opacity-90">Total Amount Financed</span>
                  <span className="font-semibold">${(procedureCost - downPayment).toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm opacity-90">Total Interest</span>
                  <span className="font-semibold">${totalInterest.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm opacity-90">Total Cost</span>
                  <span className="font-semibold">${totalCost.toFixed(2)}</span>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start">
                <TrendingDown className="w-5 h-5 text-blue-600 mt-1 mr-3" />
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">Flexible Financing</h4>
                  <p className="text-sm text-gray-600">
                    We offer various financing options through CareCredit and other providers. Apply today for pre-approval!
                  </p>
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowApplication(true)}
              className="w-full px-6 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 font-semibold"
            >
              Apply for Financing
            </button>
          </div>
        </div>
      </div>

      {showApplication && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
            <h2 className="text-2xl font-bold mb-4">Financing Application</h2>
            <form onSubmit={handleSubmitApplication} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Full Name *</label>
                <input
                  type="text"
                  required
                  value={applicationData.applicant_name}
                  onChange={(e) => setApplicationData({ ...applicationData, applicant_name: e.target.value })}
                  className="w-full border rounded px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Email *</label>
                <input
                  type="email"
                  required
                  value={applicationData.applicant_email}
                  onChange={(e) => setApplicationData({ ...applicationData, applicant_email: e.target.value })}
                  className="w-full border rounded px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Phone *</label>
                <input
                  type="tel"
                  required
                  value={applicationData.applicant_phone}
                  onChange={(e) => setApplicationData({ ...applicationData, applicant_phone: e.target.value })}
                  className="w-full border rounded px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Procedure Type *</label>
                <select
                  value={applicationData.procedure_type}
                  onChange={(e) => setApplicationData({ ...applicationData, procedure_type: e.target.value })}
                  className="w-full border rounded px-3 py-2"
                >
                  <option value="LASIK">LASIK</option>
                  <option value="PRK">PRK</option>
                  <option value="ICL">ICL</option>
                  <option value="Cataract">Cataract Surgery</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Credit Score Range *</label>
                <select
                  value={applicationData.credit_score_range}
                  onChange={(e) => setApplicationData({ ...applicationData, credit_score_range: e.target.value })}
                  className="w-full border rounded px-3 py-2"
                >
                  <option value="300-579">300-579 (Poor)</option>
                  <option value="580-669">580-669 (Fair)</option>
                  <option value="670-739">670-739 (Good)</option>
                  <option value="740-799">740-799 (Very Good)</option>
                  <option value="800-850">800-850 (Excellent)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Employment Status *</label>
                <select
                  value={applicationData.employment_status}
                  onChange={(e) => setApplicationData({ ...applicationData, employment_status: e.target.value })}
                  className="w-full border rounded px-3 py-2"
                >
                  <option value="employed">Employed Full-Time</option>
                  <option value="self-employed">Self-Employed</option>
                  <option value="part-time">Part-Time</option>
                  <option value="retired">Retired</option>
                  <option value="student">Student</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Annual Income *</label>
                <input
                  type="number"
                  required
                  value={applicationData.annual_income}
                  onChange={(e) => setApplicationData({ ...applicationData, annual_income: Number(e.target.value) })}
                  className="w-full border rounded px-3 py-2"
                  min="0"
                  step="1000"
                />
              </div>
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowApplication(false)}
                  className="px-4 py-2 border rounded text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-teal-600 text-white rounded hover:bg-teal-700"
                >
                  Submit Application
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
