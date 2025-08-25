import React, { useState } from 'react';
import { Link, Copy, Check, RefreshCw, Calendar, Shield, Globe } from 'lucide-react';

interface ShareLinkGeneratorProps {
  planId: string;
}

const ShareLinkGenerator: React.FC<ShareLinkGeneratorProps> = ({ planId }) => {
  const [copied, setCopied] = useState(false);
  const [linkType, setLinkType] = useState<'view' | 'edit'>('view');
  const [expiry, setExpiry] = useState<'never' | '24h' | '7d' | '30d'>('never');
  const [isGenerating, setIsGenerating] = useState(false);
  const [shareLink, setShareLink] = useState('');

  const generateLink = () => {
    setIsGenerating(true);
    
    // Simulate API call to generate share link
    setTimeout(() => {
      const baseUrl = window.location.origin;
      const token = Math.random().toString(36).substring(2, 15);
      const link = `${baseUrl}/plans/shared/${planId}?token=${token}&access=${linkType}`;
      setShareLink(link);
      setIsGenerating(false);
    }, 1000);
  };

  const copyToClipboard = async () => {
    if (!shareLink) return;
    
    try {
      await navigator.clipboard.writeText(shareLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const getExpiryLabel = (value: string) => {
    const labels: Record<string, string> = {
      'never': 'Never expires',
      '24h': 'Expires in 24 hours',
      '7d': 'Expires in 7 days',
      '30d': 'Expires in 30 days'
    };
    return labels[value] || value;
  };

  return (
    <div className="space-y-6">
      {/* Link Type Selection */}
      <div>
        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
          Link permissions
        </h3>
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => setLinkType('view')}
            className={`p-4 rounded-lg border-2 transition-all ${
              linkType === 'view'
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
            }`}
          >
            <Globe className="w-5 h-5 mb-2 text-blue-600 dark:text-blue-400" />
            <p className="font-medium text-gray-900 dark:text-white">View only</p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Anyone with the link can view
            </p>
          </button>
          
          <button
            onClick={() => setLinkType('edit')}
            className={`p-4 rounded-lg border-2 transition-all ${
              linkType === 'edit'
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
            }`}
          >
            <Shield className="w-5 h-5 mb-2 text-yellow-600 dark:text-yellow-400" />
            <p className="font-medium text-gray-900 dark:text-white">Can edit</p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Anyone with the link can edit
            </p>
          </button>
        </div>
      </div>

      {/* Expiry Selection */}
      <div>
        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
          Link expiration
        </h3>
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-gray-400" />
          <select
            value={expiry}
            onChange={(e) => setExpiry(e.target.value as typeof expiry)}
            className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
          >
            <option value="never">Never expires</option>
            <option value="24h">Expires in 24 hours</option>
            <option value="7d">Expires in 7 days</option>
            <option value="30d">Expires in 30 days</option>
          </select>
        </div>
      </div>

      {/* Generate Link Button */}
      {!shareLink ? (
        <button
          onClick={generateLink}
          disabled={isGenerating}
          className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2 font-medium"
        >
          {isGenerating ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              Generating link...
            </>
          ) : (
            <>
              <Link className="w-4 h-4" />
              Generate shareable link
            </>
          )}
        </button>
      ) : (
        <div className="space-y-3">
          {/* Generated Link Display */}
          <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Share link ({linkType === 'view' ? 'View only' : 'Can edit'})
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {getExpiryLabel(expiry)}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={shareLink}
                readOnly
                className="flex-1 px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-mono text-gray-700 dark:text-gray-300"
              />
              <button
                onClick={copyToClipboard}
                className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors flex items-center gap-2"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 text-green-600" />
                    <span className="text-green-600">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={() => {
                setShareLink('');
                setLinkType('view');
                setExpiry('never');
              }}
              className="flex-1 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Generate new link
            </button>
            <button className="flex-1 px-4 py-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors">
              Revoke link
            </button>
          </div>
        </div>
      )}

      {/* Security Note */}
      <div className="p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
        <p className="text-sm text-amber-800 dark:text-amber-200">
          <strong>Note:</strong> Anyone with this link can access the plan according to the permissions you set. 
          Be careful who you share it with.
        </p>
      </div>
    </div>
  );
};

export default ShareLinkGenerator;
