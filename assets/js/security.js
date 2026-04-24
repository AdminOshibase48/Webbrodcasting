// ==================== SECURITY UTILITIES ====================

// Sanitasi HTML (cegah XSS)
function sanitizeHTML(str) {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
    .replace(/\\/g, '&#92;')
    .replace(/\//g, '&#47;');
}

// Sanitasi URL
function sanitizeURL(url) {
  if (!url) return '#';
  const allowedDomains = [
    'drive.google.com',
    'placehold.co',
    'supabase.co',
    'google.com',
    'youtube.com',
    'youtu.be',
    'instagram.com'
  ];
  
  try {
    const urlObj = new URL(url);
    if (!allowedDomains.some(domain => urlObj.hostname.includes(domain))) {
      console.warn('Domain tidak diizinkan:', urlObj.hostname);
      return '#';
    }
    return url;
  } catch (e) {
    return '#';
  }
}

// Validasi Email
function isValidEmail(email) {
  const re = /^[^\s@]+@([^\s@.,]+\.)+[^\s@.,]{2,}$/;
  return re.test(email);
}

// Rate Limiting (cegah spam request)
const rateLimit = {
  storage: {},
  
  check(identifier, limit = 10, windowMs = 60000) {
    const now = Date.now();
    const windowStart = now - windowMs;
    
    if (!this.storage[identifier]) {
      this.storage[identifier] = [];
    }
    
    // Filter request dalam window waktu
    this.storage[identifier] = this.storage[identifier].filter(timestamp => timestamp > windowStart);
    
    if (this.storage[identifier].length >= limit) {
      return false;
    }
    
    this.storage[identifier].push(now);
    return true;
  },
  
  clear(identifier) {
    delete this.storage[identifier];
  }
};

// Detect common hacking attempts
function detectHackAttempt(input) {
  const patterns = [
    /<script/i,
    /javascript:/i,
    /onload=/i,
    /onerror=/i,
    /onclick=/i,
    /alert\(/i,
    /eval\(/i,
    /document\./i,
    /window\./i,
    /-->/i,
    /<!\[CDATA\[/i,
    /&#/i,
    /\\x/i,
    /\\u/i,
    /UNION\s+SELECT/i,
    /DROP\s+TABLE/i,
    /DELETE\s+FROM/i,
    /INSERT\s+INTO/i,
    /OR\s+1=1/i
  ];
  
  if (!input) return false;
  const lowerInput = input.toLowerCase();
  
  for (const pattern of patterns) {
    if (pattern.test(lowerInput)) {
      console.warn('Potential hack attempt detected:', pattern);
      return true;
    }
  }
  return false;
}

// Secure Fetch with timeout
async function secureFetch(url, options = {}) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000);
  
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
        ...options.headers
      }
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      console.error('Request timeout');
    }
    throw error;
  }
}

// Generate CSRF Token
function generateCSRFToken() {
  const token = crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2);
  sessionStorage.setItem('csrf_token', token);
  return token;
}

function verifyCSRFToken(token) {
  const stored = sessionStorage.getItem('csrf_token');
  return stored && stored === token;
}

// Content Security Policy (CSP) meta tag
function addCSPHeader() {
  const meta = document.createElement('meta');
  meta.httpEquiv = 'Content-Security-Policy';
  meta.content = `
    default-src 'self';
    script-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net https://placehold.co https://*.supabase.co;
    style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
    font-src 'self' https://fonts.gstatic.com https://cdnjs.cloudflare.com;
    img-src 'self' data: https: https://placehold.co https://*.supabase.co;
    connect-src 'self' https://*.supabase.co;
    frame-src https://drive.google.com;
    base-uri 'self';
    form-action 'self';
  `.replace(/\s+/g, ' ').trim();
  document.head.appendChild(meta);
}

// Export functions for global use
window.Secure = {
  sanitizeHTML,
  sanitizeURL,
  isValidEmail,
  rateLimit,
  detectHackAttempt,
  secureFetch,
  generateCSRFToken,
  verifyCSRFToken,
  addCSPHeader
};

// Auto-add CSP header
addCSPHeader();

// Block right-click (opsional, untuk mencegah inspect element mudah)
document.addEventListener('contextmenu', (e) => {
  // Hanya block di production, biarkan untuk development
  if (window.location.hostname !== 'localhost' && !window.location.hostname.includes('127.0.0.1')) {
    e.preventDefault();
    return false;
  }
});

// Block common keyboard shortcuts for dev tools (opsional)
document.addEventListener('keydown', (e) => {
  // Block F12, Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+U
  if (window.location.hostname !== 'localhost' && !window.location.hostname.includes('127.0.0.1')) {
    if (e.key === 'F12' || 
        (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'J')) ||
        (e.ctrlKey && e.key === 'U')) {
      e.preventDefault();
      return false;
    }
  }
});
