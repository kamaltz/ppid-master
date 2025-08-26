// Force favicon update script - run in browser console
(function() {
  console.log('🔄 Forcing favicon update...');
  
  // Remove all existing favicon links
  document.querySelectorAll('link[rel*="icon"]').forEach(link => link.remove());
  
  // Clear all caches
  if ('caches' in window) {
    caches.keys().then(names => names.forEach(name => caches.delete(name)));
  }
  
  // Add new favicon with aggressive cache busting
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(7);
  
  const favicon = document.createElement('link');
  favicon.rel = 'icon';
  favicon.type = 'image/x-icon';
  favicon.href = `/favicon.ico?v=${timestamp}&r=${random}&force=true`;
  document.head.appendChild(favicon);
  
  // Force page reload after 2 seconds
  setTimeout(() => {
    console.log('🔄 Reloading page...');
    window.location.reload(true);
  }, 2000);
  
  console.log('✅ Favicon update initiated');
})();