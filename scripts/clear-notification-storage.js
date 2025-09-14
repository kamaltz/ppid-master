console.log('🧹 Clearing notification localStorage...');

// Clear notification history
localStorage.removeItem('notificationHistory');

// Trigger notification refresh
window.dispatchEvent(new Event('notification-refresh'));
localStorage.setItem('notification-refresh', Date.now().toString());

console.log('✅ Notification storage cleared and refresh triggered');
console.log('🔄 Please refresh the page to see updated notifications');