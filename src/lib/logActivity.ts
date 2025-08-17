// Simple logging utility
export const logActivity = async (logData: {
  action: string;
  level: string;
  message: string;
  user_id?: string;
  user_role?: string;
  user_email?: string;
  ip_address?: string;
  details?: any;
}) => {
  try {
    const response = await fetch('/api/logs/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(logData)
    });
    
    if (!response.ok) {
      console.error('Failed to log activity:', response.statusText);
    }
  } catch (error) {
    console.error('Error logging activity:', error);
  }
};