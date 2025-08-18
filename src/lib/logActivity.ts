// Enhanced logging utility
export const logActivity = async (logData: {
  action: string;
  level: string;
  message: string;
  user_id?: string;
  user_role?: string;
  user_email?: string;
  ip_address?: string;
  user_agent?: string;
  resource_id?: string;
  resource_type?: string;
  details?: Record<string, unknown>;
}) => {
  try {
    // Get client IP if not provided
    if (!logData.ip_address && typeof window === 'undefined') {
      // Server-side: try to get from headers
      logData.ip_address = '127.0.0.1';
    }

    // Get user agent if not provided
    if (!logData.user_agent && typeof window !== 'undefined') {
      logData.user_agent = navigator.userAgent;
    }

    const enrichedLogData = {
      ...logData,
      timestamp: new Date().toISOString(),
      user_agent: logData.user_agent || 'Unknown',
      ip_address: logData.ip_address || '127.0.0.1'
    };

    console.log('Logging activity:', enrichedLogData);

    const response = await fetch('/api/logs/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(enrichedLogData)
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Failed to log activity:', response.status, errorText);
    } else {
      console.log('Activity logged successfully');
    }
  } catch (error) {
    console.error('Error logging activity:', error);
  }
};

// Helper function to log user actions
export const logUserAction = async (action: string, message: string, details?: Record<string, unknown>) => {
  // Get user info from localStorage if available
  let userInfo = {};
  if (typeof window !== 'undefined') {
    try {
      const userData = localStorage.getItem('user_data');
      const userRole = localStorage.getItem('user_role');
      if (userData) {
        const user = JSON.parse(userData);
        userInfo = {
          user_id: user.userId || user.id,
          user_email: user.email,
          user_role: userRole || user.role
        };
      }
    } catch {
      console.warn('Could not parse user data for logging');
    }
  }

  await logActivity({
    action,
    level: 'INFO',
    message,
    details,
    ...userInfo
  });
};

// Helper function to log errors
export const logError = async (action: string, error: Error | string, details?: Record<string, unknown>) => {
  await logActivity({
    action,
    level: 'ERROR',
    message: typeof error === 'string' ? error : error.message,
    details: {
      ...details,
      error: typeof error === 'string' ? error : {
        message: error.message,
        stack: error.stack
      }
    }
  });
};