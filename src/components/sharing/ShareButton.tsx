import React, { useState } from 'react';
import { Share2 } from 'lucide-react';
import ShareModal from './ShareModal';

interface ShareButtonProps {
  planId: string;
  planTitle: string;
  variant?: 'default' | 'icon' | 'compact';
  className?: string;
}

const ShareButton: React.FC<ShareButtonProps> = ({ 
  planId, 
  planTitle, 
  variant = 'default',
  className = ''
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const getButtonContent = () => {
    switch (variant) {
      case 'icon':
        return (
          <button
            onClick={() => setIsModalOpen(true)}
            className={`p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${className}`}
            aria-label="Share plan"
          >
            <Share2 className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>
        );
      case 'compact':
        return (
          <button
            onClick={() => setIsModalOpen(true)}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors ${className}`}
          >
            <Share2 className="w-4 h-4" />
            Share
          </button>
        );
      default:
        return (
          <button
            onClick={() => setIsModalOpen(true)}
            className={`flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors ${className}`}
          >
            <Share2 className="w-4 h-4" />
            Share Plan
          </button>
        );
    }
  };

  return (
    <>
      {getButtonContent()}
      
      {isModalOpen && (
        <ShareModal
          planId={planId}
          planTitle={planTitle}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </>
  );
};

export default ShareButton;
