import React, { useState, useEffect, useCallback } from 'react';
import { X, Plus, Save, Loader2 } from 'lucide-react';
import { capabilityTagsApi } from '../../services/api';

const SUGGESTED_TAGS = [
  'coding', 'research', 'writing', 'planning', 'debugging',
  'design', 'testing', 'devops', 'documentation', 'analysis',
  'review', 'architecture', 'data', 'security', 'frontend',
  'backend', 'mobile', 'ai', 'automation', 'communication'
];

const CapabilityTags: React.FC = () => {
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dirty, setDirty] = useState(false);

  const loadTags = useCallback(async () => {
    try {
      setLoading(true);
      const response = await capabilityTagsApi.get();
      setTags(response.capability_tags || []);
    } catch { setError('Failed to load tags'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { loadTags(); }, [loadTags]);

  const addTag = (tag: string) => {
    const normalized = tag.toLowerCase().trim();
    if (normalized && !tags.includes(normalized)) {
      setTags(prev => [...prev, normalized]);
      setDirty(true);
    }
    setNewTag('');
  };

  const removeTag = (tag: string) => {
    setTags(prev => prev.filter(t => t !== tag));
    setDirty(true);
  };

  const handleSave = async () => {
    try {
      setSaving(true); setError(null);
      const response = await capabilityTagsApi.update(tags);
      setTags(response.capability_tags);
      setDirty(false);
    } catch { setError('Failed to save'); }
    finally { setSaving(false); }
  };

  const unusedSuggestions = SUGGESTED_TAGS.filter(t => !tags.includes(t));

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-900/80 rounded-lg border border-gray-200/80 dark:border-gray-800/80 p-4">
        <div className="flex items-center gap-2 text-gray-400 text-xs">
          <Loader2 className="w-3 h-3 animate-spin" /> Loading tags...
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-900/80 rounded-lg border border-gray-200/80 dark:border-gray-800/80">
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-gray-800/60">
        <span className="text-xs font-semibold text-gray-900 dark:text-white">Capability Tags</span>
        {dirty && (
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-1 px-2 py-1 text-[11px] font-medium text-white bg-gray-900 dark:bg-gray-100 dark:text-gray-900 rounded-md hover:bg-gray-800 dark:hover:bg-gray-200 disabled:opacity-50 transition-colors"
          >
            {saving ? <Loader2 className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />}
            Save
          </button>
        )}
      </div>

      <div className="p-4 space-y-3">
        {error && (
          <div className="px-3 py-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
            <p className="text-xs text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}

        <p className="text-[11px] text-gray-500 dark:text-gray-400">
          Tags help match tasks to your capabilities.
        </p>

        {/* Current tags */}
        <div className="flex flex-wrap gap-1.5">
          {tags.map(tag => (
            <span key={tag} className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded text-[11px] font-medium">
              {tag}
              <button onClick={() => removeTag(tag)} className="hover:text-blue-900 dark:hover:text-blue-100" aria-label={`Remove ${tag}`}>
                <X className="w-2.5 h-2.5" />
              </button>
            </span>
          ))}
          {tags.length === 0 && (
            <span className="text-[11px] text-gray-400 italic">No tags yet</span>
          )}
        </div>

        {/* Add */}
        <div className="flex gap-1.5">
          <input
            type="text"
            value={newTag}
            onChange={e => setNewTag(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addTag(newTag); } }}
            placeholder="Add tag..."
            className="flex-1 px-3 py-1.5 text-xs bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-800 rounded-md focus:ring-1 focus:ring-blue-500 dark:text-white placeholder-gray-400"
          />
          <button
            onClick={() => addTag(newTag)}
            disabled={!newTag.trim()}
            className="flex items-center gap-1 px-2 py-1.5 text-[11px] text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-40 transition-colors"
          >
            <Plus className="w-3 h-3" /> Add
          </button>
        </div>

        {/* Suggestions */}
        {unusedSuggestions.length > 0 && (
          <div>
            <p className="text-[10px] text-gray-400 mb-1.5">Suggestions</p>
            <div className="flex flex-wrap gap-1">
              {unusedSuggestions.slice(0, 10).map(tag => (
                <button
                  key={tag}
                  onClick={() => addTag(tag)}
                  className="px-1.5 py-0.5 text-[10px] bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 rounded hover:bg-blue-100 dark:hover:bg-blue-900/30 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                >
                  + {tag}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CapabilityTags;
