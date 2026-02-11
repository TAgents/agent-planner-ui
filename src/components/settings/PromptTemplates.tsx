import React, { useState, useEffect, useCallback } from 'react';
import { FileText, Plus, Edit3, Trash2, Save, X, Loader2, Code2 } from 'lucide-react';
import { promptApi, PromptTemplate } from '../../services/api';

const TEMPLATE_TYPES = [
  { value: 'plan', label: 'Plan' },
  { value: 'task', label: 'Task' },
  { value: 'review', label: 'Review' },
  { value: 'summary', label: 'Summary' },
  { value: 'custom', label: 'Custom' },
];

const PromptTemplates: React.FC = () => {
  const [templates, setTemplates] = useState<PromptTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [formData, setFormData] = useState<{ name: string; template: string; description: string; type: 'plan' | 'task' | 'review' | 'summary' | 'custom' }>({ name: '', template: '', description: '', type: 'custom' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadTemplates = useCallback(async () => {
    try {
      setLoading(true);
      const data = await promptApi.list();
      setTemplates(data || []);
    } catch (err) {
      setError('Failed to load prompt templates');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTemplates();
  }, [loadTemplates]);

  const handleCreate = async () => {
    if (!formData.name || !formData.template) return;
    try {
      setSaving(true);
      await promptApi.create(formData);
      setShowCreate(false);
      setFormData({ name: '', template: '', description: '', type: 'custom' });
      loadTemplates();
    } catch (err) {
      setError('Failed to create template');
    } finally {
      setSaving(false);
    }
  };

  const handleUpdate = async (id: string) => {
    try {
      setSaving(true);
      await promptApi.update(id, formData);
      setEditingId(null);
      loadTemplates();
    } catch (err) {
      setError('Failed to update template');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this prompt template?')) return;
    try {
      await promptApi.delete(id);
      loadTemplates();
    } catch (err) {
      setError('Failed to delete template');
    }
  };

  const startEdit = (template: PromptTemplate) => {
    setEditingId(template.id);
    setFormData({
      name: template.name,
      template: template.template,
      description: template.description || '',
      type: template.type,
    });
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center gap-2 text-gray-500">
          <Loader2 className="w-4 h-4 animate-spin" />
          Loading prompt templates...
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Code2 className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Prompt Templates</h3>
        </div>
        <button
          onClick={() => { setShowCreate(true); setFormData({ name: '', template: '', description: '', type: 'custom' }); }}
          className="flex items-center gap-1 px-3 py-1.5 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
        >
          <Plus className="w-4 h-4" /> New
        </button>
      </div>

      <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
        Configure custom prompts for how OpenClaw agents interact with your plans. Use {'{{variables}}'} in templates.
      </p>

      {error && (
        <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm rounded-lg">
          {error}
          <button onClick={() => setError(null)} className="ml-2 underline">Dismiss</button>
        </div>
      )}

      {/* Create Form */}
      {showCreate && (
        <TemplateForm
          formData={formData}
          onChange={setFormData}
          onSave={handleCreate}
          onCancel={() => setShowCreate(false)}
          saving={saving}
          title="New Template"
        />
      )}

      {/* Templates List */}
      {templates.length === 0 && !showCreate ? (
        <p className="text-sm text-gray-400 italic py-4">No prompt templates yet. Create one to get started.</p>
      ) : (
        <div className="space-y-3 mt-4">
          {templates.map(template => (
            <div key={template.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
              {editingId === template.id ? (
                <TemplateForm
                  formData={formData}
                  onChange={setFormData}
                  onSave={() => handleUpdate(template.id)}
                  onCancel={() => setEditingId(null)}
                  saving={saving}
                  title="Edit Template"
                />
              ) : (
                <>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-gray-500" />
                      <span className="font-medium text-gray-900 dark:text-white">{template.name}</span>
                      <span className="px-2 py-0.5 text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded">
                        {template.type}
                      </span>
                    </div>
                    <div className="flex gap-1">
                      <button onClick={() => startEdit(template)} className="p-1 text-gray-400 hover:text-blue-500">
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDelete(template.id)} className="p-1 text-gray-400 hover:text-red-500">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  {template.description && (
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">{template.description}</p>
                  )}
                  <pre className="text-xs bg-gray-50 dark:bg-gray-900 p-3 rounded-lg text-gray-700 dark:text-gray-300 overflow-x-auto whitespace-pre-wrap">
                    {template.template}
                  </pre>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const TemplateForm: React.FC<{
  formData: { name: string; template: string; description: string; type: string };
  onChange: (data: any) => void;
  onSave: () => void;
  onCancel: () => void;
  saving: boolean;
  title: string;
}> = ({ formData, onChange, onSave, onCancel, saving, title }) => (
  <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 space-y-3">
    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">{title}</h4>
    <div className="grid grid-cols-2 gap-3">
      <input
        type="text"
        value={formData.name}
        onChange={e => onChange({ ...formData, name: e.target.value })}
        placeholder="Template name"
        className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
      />
      <select
        value={formData.type}
        onChange={e => onChange({ ...formData, type: e.target.value })}
        className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
      >
        {TEMPLATE_TYPES.map(t => (
          <option key={t.value} value={t.value}>{t.label}</option>
        ))}
      </select>
    </div>
    <input
      type="text"
      value={formData.description}
      onChange={e => onChange({ ...formData, description: e.target.value })}
      placeholder="Description (optional)"
      className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
    />
    <textarea
      value={formData.template}
      onChange={e => onChange({ ...formData, template: e.target.value })}
      placeholder="Enter your prompt template... Use {{plan_title}}, {{task_title}}, etc."
      rows={5}
      className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-mono resize-y"
    />
    <div className="flex justify-end gap-2">
      <button onClick={onCancel} className="px-3 py-1.5 text-xs text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600 rounded">
        Cancel
      </button>
      <button
        onClick={onSave}
        disabled={!formData.name || !formData.template || saving}
        className="flex items-center gap-1 px-3 py-1.5 text-xs bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:opacity-50"
      >
        {saving ? <Loader2 className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />}
        Save
      </button>
    </div>
  </div>
);

export default PromptTemplates;
