// ==================== LOADER SYSTEM ====================
document.addEventListener('DOMContentLoaded', function() {
  const loader = document.getElementById('loader');
  const progressFill = document.querySelector('.gold-progress-fill');
  
  if (progressFill) {
    let width = 0;
    const interval = setInterval(() => {
      if (width >= 100) {
        clearInterval(interval);
      } else {
        width += 2.5;
        progressFill.style.width = width + '%';
      }
    }, 25);
  }
  
  setTimeout(() => {
    if (loader) {
      loader.classList.add('hide');
      setTimeout(() => {
        loader.style.display = 'none';
      }, 800);
    }
  }, 2200);
});

// ==================== NAVBAR SCROLL EFFECT ====================
const navbar = document.getElementById('navbar');

window.addEventListener('scroll', () => {
  if (window.scrollY > 50) {
    navbar.classList.add('scrolled');
  } else {
    navbar.classList.remove('scrolled');
  }
});

// ==================== BURGER MENU (MOBILE) ====================
const burgerBtn = document.getElementById('burgerBtn');
const mobileMenu = document.getElementById('mobileMenu');

if (burgerBtn && mobileMenu) {
  burgerBtn.addEventListener('click', () => {
    burgerBtn.classList.toggle('active');
    mobileMenu.classList.toggle('active');
    
    if (mobileMenu.classList.contains('active')) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  });
  
  // Close mobile menu when clicking on a link
  mobileMenu.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      burgerBtn.classList.remove('active');
      mobileMenu.classList.remove('active');
      document.body.style.overflow = '';
    });
  });
}

// ==================== SMOOTH SCROLL WITH OFFSET ====================
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function(e) {
    const targetId = this.getAttribute('href');
    if (targetId === "#" || targetId === "") return;
    const target = document.querySelector(targetId);
    if (target) {
      e.preventDefault();
      const offset = 80;
      const elementPosition = target.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;
      
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  });
});

// ==================== SCROLL REVEAL ANIMATION ====================
const revealElements = document.querySelectorAll('.reveal');

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('show');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.15, rootMargin: "0px 0px -30px 0px" });

revealElements.forEach(el => revealObserver.observe(el));

// ==================== WORKS GALLERY SCALE ANIMATION ====================
const workItems = document.querySelectorAll('.work-item');

const workObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('reveal-work');
      workObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.2 });

workItems.forEach(item => workObserver.observe(item));

// ==================== GOOGLE DRIVE CLICK HANDLER ====================
workItems.forEach(item => {
  item.addEventListener('click', (e) => {
    const driveLink = item.getAttribute('data-drive');
    if (driveLink) {
      window.open(driveLink, '_blank');
    }
  });
});

// ==================== PARALLAX EFFECT FOR HERO ====================
const hero = document.querySelector('.hero');
if (hero) {
  window.addEventListener('scroll', () => {
    const scrolled = window.pageYOffset;
    const rate = scrolled * 0.3;
    hero.style.backgroundPositionY = `${rate}px`;
  });
}

// ==================== PROGRAM ITEMS STAGGER ANIMATION ====================
const programItems = document.querySelectorAll('.program-item');
const programObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry, index) => {
    if (entry.isIntersecting) {
      setTimeout(() => {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
      }, index * 100);
      programObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.3 });

programItems.forEach((item) => {
  item.style.opacity = '0';
  item.style.transform = 'translateY(20px)';
  item.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
  programObserver.observe(item);
});

// ==================== DIVISION CARDS STAGGER ====================
const divisionCards = document.querySelectorAll('.division-card');
const divisionObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry, idx) => {
    if (entry.isIntersecting) {
      setTimeout(() => {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
      }, idx * 80);
      divisionObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.2 });

divisionCards.forEach((card) => {
  card.style.opacity = '0';
  card.style.transform = 'translateY(30px)';
  card.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
  divisionObserver.observe(card);
});

// ==================== MEMBER CARDS STAGGER ====================
const memberCards = document.querySelectorAll('.member-card');
const memberObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry, idx) => {
    if (entry.isIntersecting) {
      setTimeout(() => {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'scale(1)';
      }, idx * 100);
      memberObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.2 });

memberCards.forEach((card) => {
  card.style.opacity = '0';
  card.style.transform = 'scale(0.95)';
  card.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
  memberObserver.observe(card);
});

// ==================== BUTTON PRESS EFFECT ====================
const allButtons = document.querySelectorAll('.btn-cinema, .btn-primary, .btn-outline');
allButtons.forEach(btn => {
  btn.addEventListener('mousedown', () => {
    btn.style.transform = 'scale(0.96)';
  });
  btn.addEventListener('mouseup', () => {
    btn.style.transform = 'scale(1.02)';
  });
  btn.addEventListener('mouseleave', () => {
    btn.style.transform = '';
  });
});

// ==================== HOVER GOLD EFFECT FOR PROGRAM ITEMS ====================
programItems.forEach(item => {
  item.addEventListener('mouseenter', () => {
    item.style.paddingLeft = '10px';
  });
  item.addEventListener('mouseleave', () => {
    item.style.paddingLeft = '0';
  });
});

// ==================== PREVENT SCROLL DURING LOADER ====================
document.body.style.overflow = 'hidden';
setTimeout(() => {
  document.body.style.overflow = '';
}, 2400);

// ==================== LAZY LOADING FOR IMAGES (SEO Performance) ====================
const images = document.querySelectorAll('img');
if ('IntersectionObserver' in window) {
  const imageObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target;
        img.loading = 'lazy';
        imageObserver.unobserve(img);
      }
    });
  });
  images.forEach(img => imageObserver.observe(img));
} else {
  images.forEach(img => img.loading = 'lazy');
}

// ==================== TRACK PAGE VIEW FOR ANALYTICS (Optional) ====================
if (typeof gtag !== 'undefined') {
  gtag('config', 'GA_MEASUREMENT_ID', {
    'page_title': document.title,
    'page_location': window.location.href
  });
}

// ==================== ADD STRUCTURED DATA DYNAMICALLY ====================
function addBreadcrumbStructuredData() {
  const script = document.createElement('script');
  script.type = 'application/ld+json';
  script.textContent = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": "https://broadcastingtexar.netlify.app/"
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "Broadcasting",
        "item": "https://broadcastingtexar.netlify.app/#program"
      }
    ]
  });
  document.head.appendChild(script);
}

// Execute after page load
window.addEventListener('load', () => {
  addBreadcrumbStructuredData();
});

// Announcement Banner Handler (tambahkan di script.js)
document.addEventListener('DOMContentLoaded', function() {
    const banner = document.getElementById('securityAnnouncement');
    const closeBtn = document.getElementById('closeAnnouncement');
    
    if (banner && closeBtn) {
        const isClosed = sessionStorage.getItem('announcement_closed');
        if (isClosed === 'true') {
            banner.style.display = 'none';
        }
        
        closeBtn.addEventListener('click', () => {
            banner.classList.add('hide');
            sessionStorage.setItem('announcement_closed', 'true');
            setTimeout(() => {
                banner.style.display = 'none';
            }, 400);
        });
    }
});
