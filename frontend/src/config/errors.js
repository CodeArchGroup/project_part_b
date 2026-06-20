export const handleApiError = (error, defaultMessage = 'An unexpected error occurred.') => {
  if (error?.status === 401) return 'Unauthorised - please log in again.';
  if (error?.status === 403) return 'Permission denied.';
  if (error?.status === 500) return 'Server error - try again later.';
  if (error?.message) return error.message;
  return defaultMessage;
};

export const parseApiResponse = async (response) => {
  const data = await response.json();
  if (!response.ok || data.success === false) {
    const error = new Error(data.message || 'Request failed.');
    error.status = response.status;
    throw error;
  }
  return data;
};
