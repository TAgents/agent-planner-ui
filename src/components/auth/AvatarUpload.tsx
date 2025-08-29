import React, { useState, useRef } from 'react';
import { Camera, Upload, X, User, Check } from 'lucide-react';
import api from '../../services/api';

interface AvatarUploadProps {
  currentAvatar?: string;
  onAvatarChange: (avatarUrl: string) => void;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  userName?: string;
}

const AvatarUpload: React.FC<AvatarUploadProps> = ({ 
  currentAvatar, 
  onAvatarChange, 
  size = 'lg',
  className = '',
  userName = ''
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const sizeClasses = {
    sm: 'w-16 h-16',
    md: 'w-24 h-24',
    lg: 'w-32 h-32',
    xl: 'w-40 h-40'
  };

  const iconSizes = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16'
  };

  const buttonIconSizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
    xl: 'w-7 h-7'
  };

  // Get initials from user name for fallback avatar
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const handleFileSelect = async (file: File | null) => {
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file (PNG, JPG, or GIF)');
      setTimeout(() => setError(null), 5000);
      return;
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      setError('Image size must be less than 5MB');
      setTimeout(() => setError(null), 5000);
      return;
    }

    setError(null);
    setSuccess(false);

    // Upload file
    setIsUploading(true);
    try {
      const response = await api.upload.uploadAvatar(file);
      onAvatarChange(response.avatar_url);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (error: any) {
      console.error('Failed to upload avatar:', error);
      setError(error.message || 'Failed to upload avatar');
      setTimeout(() => setError(null), 5000);
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;
    handleFileSelect(file);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleRemoveAvatar = async () => {
    if (window.confirm('Are you sure you want to remove your avatar?')) {
      setIsUploading(true);
      try {
        await api.upload.deleteAvatar();
        onAvatarChange('');
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      } catch (error: any) {
        console.error('Failed to remove avatar:', error);
        setError(error.message || 'Failed to remove avatar');
        setTimeout(() => setError(null), 5000);
      } finally {
        setIsUploading(false);
      }
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className={`${className}`}>
      <div className="flex flex-col items-center">
        {/* Avatar Display */}
        <div 
          className="relative group"
          onMouseEnter={() => setIsHovering(true)}
          onMouseLeave={() => setIsHovering(false)}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <div className={`
            ${sizeClasses[size]} 
            rounded-full overflow-hidden 
            bg-gradient-to-br from-blue-100 to-blue-200 dark:from-gray-700 dark:to-gray-800 
            flex items-center justify-center 
            border-4 border-white dark:border-gray-700 
            shadow-xl
            transition-all duration-200
            ${dragActive ? 'scale-105 border-blue-500' : ''}
            ${isHovering && !isUploading ? 'scale-105' : ''}
          `}>
            {currentAvatar ? (
              <img
                src={currentAvatar}
                alt="Avatar"
                className="w-full h-full object-cover"
              />
            ) : userName ? (
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {getInitials(userName)}
              </div>
            ) : (
              <User className={`${iconSizes[size]} text-blue-400 dark:text-gray-500`} />
            )}
            
            {/* Upload Overlay */}
            {(isHovering || dragActive) && !isUploading && (
              <div className="absolute inset-0 bg-black bg-opacity-60 flex flex-col items-center justify-center cursor-pointer transition-opacity"
                onClick={triggerFileInput}>
                <Camera className={`${buttonIconSizes[size]} text-white mb-1`} />
                <span className="text-white text-xs font-medium">
                  {currentAvatar ? 'Change' : 'Upload'}
                </span>
              </div>
            )}
            
            {/* Loading Overlay */}
            {isUploading && (
              <div className="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
              </div>
            )}

            {/* Success Overlay */}
            {success && !isUploading && (
              <div className="absolute inset-0 bg-green-600 bg-opacity-90 flex items-center justify-center">
                <Check className="w-8 h-8 text-white" />
              </div>
            )}
          </div>

          {/* Floating Camera Button */}
          {!isHovering && !isUploading && (
            <button
              onClick={triggerFileInput}
              className="absolute bottom-0 right-0 bg-blue-600 hover:bg-blue-700 text-white rounded-full p-2 shadow-lg transition-all duration-200 hover:scale-110"
              title="Upload new avatar"
            >
              <Camera className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Hidden File Input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileInputChange}
          className="hidden"
          disabled={isUploading}
        />

        {/* Action Buttons */}
        <div className="mt-6 flex items-center gap-3">
          <button
            onClick={triggerFileInput}
            disabled={isUploading}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg transition-colors shadow-md hover:shadow-lg"
          >
            <Upload className="w-4 h-4" />
            <span className="font-medium">Upload Avatar</span>
          </button>
          
          {currentAvatar && (
            <button
              onClick={handleRemoveAvatar}
              disabled={isUploading}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 hover:border-red-300 dark:hover:border-red-600 text-gray-700 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400 rounded-lg transition-colors"
            >
              <X className="w-4 h-4" />
              <span className="font-medium">Remove</span>
            </button>
          )}
        </div>

        {/* Helper Text */}
        <p className="mt-3 text-xs text-gray-500 dark:text-gray-400 text-center">
          PNG, JPG or GIF up to 5MB
          <br />
          Drag and drop or click to upload
        </p>

        {/* Error Message */}
        {error && (
          <div className="mt-3 px-4 py-2 bg-red-100 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-sm text-red-600 dark:text-red-400">
              {error}
            </p>
          </div>
        )}

        {/* Success Message */}
        {success && !isUploading && (
          <div className="mt-3 px-4 py-2 bg-green-100 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-lg">
            <p className="text-sm text-green-600 dark:text-green-400">
              Avatar updated successfully!
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AvatarUpload;
