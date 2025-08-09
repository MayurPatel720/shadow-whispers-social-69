// Utility function to extract meaningful error messages from API responses
export const getErrorMessage = (error: any): string => {
  // If it's an axios error with response data
  if (error?.response?.data?.message) {
    return error.response.data.message;
  }
  
  // If it's an axios error with a message
  if (error?.message) {
    return error.message;
  }
  
  // If it's a string
  if (typeof error === 'string') {
    return error;
  }
  
  // Default fallback
  return 'Something went wrong. Please try again.';
};