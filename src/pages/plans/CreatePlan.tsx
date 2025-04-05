import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import { usePlans } from '../../hooks/usePlans';

const CreatePlan: React.FC = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<'draft' | 'active'>('draft');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { createPlan } = usePlans();

  // Debug: Log the token for troubleshooting
  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      try {
        // Decode token without verification (just for debugging)
        const [, base64Payload, ] = token.split('.');
        const payload = JSON.parse(atob(base64Payload));
        console.log('Token payload:', payload);
      } catch (e) {
        console.error('Error decoding token:', e);
      }
    } else {
      console.warn('No token found in localStorage');
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const result = await createPlan.mutateAsync({
        title,
        description,
        status
      });
      
      // Handle different response formats
      let planId;
      
      if (result?.data?.id) {
        // API Response structure
        planId = result.data.id;
      } else if (result?.id) {
        // Direct plan object structure
        planId = result.id;
      }
      
      // Navigate to the new plan if we have an ID, otherwise go to plans list
      if (planId) {
        navigate(`/plans/${planId}`);
      } else {
        navigate('/plans');
      }
    } catch (error: any) {
      console.error('Error creating plan:', error);
      setError(error.message || 'Failed to create plan');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <button
            onClick={() => navigate('/plans')}
            className="flex items-center text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back to Plans
          </button>
          <h1 className="mt-4 text-2xl font-bold text-gray-900 dark:text-white">Create New Plan</h1>
        </div>

        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded dark:bg-red-900 dark:text-red-200 dark:border-red-600">
              {error}
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Plan Title
              </label>
              <input
                type="text"
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                placeholder="Enter a title for your plan"
                required
              />
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Description
              </label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                placeholder="Describe the purpose and goals of this plan"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Status
              </label>
              <div className="mt-2 flex space-x-4">
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    className="form-radio"
                    name="status"
                    value="draft"
                    checked={status === 'draft'}
                    onChange={() => setStatus('draft')}
                  />
                  <span className="ml-2 text-gray-700 dark:text-gray-300">Draft</span>
                </label>
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    className="form-radio"
                    name="status"
                    value="active"
                    checked={status === 'active'}
                    onChange={() => setStatus('active')}
                  />
                  <span className="ml-2 text-gray-700 dark:text-gray-300">Active</span>
                </label>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => navigate('/plans')}
                className="mr-4 px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:hover:bg-gray-600"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={createPlan.isLoading || !title}
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {createPlan.isLoading ? (
                  <>
                    <span className="spinner h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></span>
                    Creating...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Create Plan
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreatePlan;
