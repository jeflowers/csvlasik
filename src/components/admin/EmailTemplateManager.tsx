import React, { useState, useEffect } from 'react';
import { Mail, CreditCard as Edit, Plus, Trash2, Eye } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  html_body: string;
  text_body: string;
  variables: string[];
  created_at: string;
  updated_at: string;
}

export const EmailTemplateManager: React.FC = () => {
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<EmailTemplate | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    subject: '',
    html_body: '',
    text_body: '',
    variables: '',
  });

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('email_templates')
        .select('*')
        .order('name');

      if (error) throw error;
      setTemplates(data || []);
    } catch (error) {
      console.error('Failed to load templates:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (template: EmailTemplate) => {
    setEditingTemplate(template);
    setFormData({
      name: template.name,
      subject: template.subject,
      html_body: template.html_body,
      text_body: template.text_body,
      variables: template.variables.join(', '),
    });
    setShowModal(true);
  };

  const handleCreate = () => {
    setEditingTemplate(null);
    setFormData({
      name: '',
      subject: '',
      html_body: '',
      text_body: '',
      variables: '',
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const variables = formData.variables
        .split(',')
        .map(v => v.trim())
        .filter(v => v);

      const templateData = {
        name: formData.name,
        subject: formData.subject,
        html_body: formData.html_body,
        text_body: formData.text_body,
        variables,
      };

      if (editingTemplate) {
        const { error } = await supabase
          .from('email_templates')
          .update(templateData)
          .eq('id', editingTemplate.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('email_templates')
          .insert(templateData);

        if (error) throw error;
      }

      setShowModal(false);
      loadTemplates();
    } catch (error) {
      console.error('Failed to save template:', error);
      alert('Failed to save template');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this template?')) return;

    try {
      const { error } = await supabase
        .from('email_templates')
        .delete()
        .eq('id', id);

      if (error) throw error;
      loadTemplates();
    } catch (error) {
      console.error('Failed to delete template:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Email Templates</h1>
        <button
          onClick={handleCreate}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus className="w-4 h-4" />
          <span>New Template</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {templates.map((template) => (
          <div key={template.id} className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow">
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center">
                  <Mail className="w-5 h-5 text-blue-600 mr-2" />
                  <h3 className="font-semibold text-gray-900">{template.name}</h3>
                </div>
              </div>

              <p className="text-sm text-gray-600 mb-4 line-clamp-2">{template.subject}</p>

              {template.variables.length > 0 && (
                <div className="mb-4">
                  <p className="text-xs text-gray-500 mb-2">Variables:</p>
                  <div className="flex flex-wrap gap-1">
                    {template.variables.slice(0, 3).map((variable) => (
                      <span
                        key={variable}
                        className="inline-block px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded"
                      >
                        {variable}
                      </span>
                    ))}
                    {template.variables.length > 3 && (
                      <span className="inline-block px-2 py-1 text-xs text-gray-500">
                        +{template.variables.length - 3}
                      </span>
                    )}
                  </div>
                </div>
              )}

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleEdit(template)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50"
                >
                  <Edit className="w-4 h-4 inline mr-1" />
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(template.id)}
                  className="px-3 py-2 border border-red-300 text-red-600 rounded-lg text-sm hover:bg-red-50"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {templates.length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <Mail className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">No email templates yet. Create your first template!</p>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-xl font-bold mb-4">
                {editingTemplate ? 'Edit Template' : 'New Template'}
              </h2>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Template Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full border rounded px-3 py-2"
                    placeholder="e.g., welcome_email"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Subject Line *</label>
                  <input
                    type="text"
                    required
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    className="w-full border rounded px-3 py-2"
                    placeholder="e.g., Welcome to Atelier Vision"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">HTML Body *</label>
                  <textarea
                    required
                    value={formData.html_body}
                    onChange={(e) => setFormData({ ...formData, html_body: e.target.value })}
                    rows={8}
                    className="w-full border rounded px-3 py-2 font-mono text-sm"
                    placeholder="<html>...</html>"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Plain Text Body *</label>
                  <textarea
                    required
                    value={formData.text_body}
                    onChange={(e) => setFormData({ ...formData, text_body: e.target.value })}
                    rows={6}
                    className="w-full border rounded px-3 py-2"
                    placeholder="Plain text version of the email"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Variables (comma-separated)</label>
                  <input
                    type="text"
                    value={formData.variables}
                    onChange={(e) => setFormData({ ...formData, variables: e.target.value })}
                    className="w-full border rounded px-3 py-2"
                    placeholder="e.g., name, email, confirmationCode"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Use {'{'}variable_name{'}'} in your templates
                  </p>
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 border rounded text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    {editingTemplate ? 'Update' : 'Create'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmailTemplateManager;
