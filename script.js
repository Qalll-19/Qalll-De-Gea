// Space Canvas, Typewriter, Counter, and Interactive Behaviors

document.addEventListener('DOMContentLoaded', () => {
  initSpaceCanvas();
  initTypewriter();
  initCounters();
  initNavInteraction();
  initCustomCursor();
});

/* =========================================================
   1. CANVAS STARFIELD WITH PARALLAX & SHOOTING STARS
========================================================= */
function initSpaceCanvas() {
  const canvas = document.getElementById('spaceCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let width = (canvas.width = window.innerWidth);
  let height = (canvas.height = window.innerHeight);

  window.addEventListener('resize', () => {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
    initStars();
  });

  // Mouse Parallax
  let mouseX = width / 2;
  let mouseY = height / 2;
  let targetX = mouseX;
  let targetY = mouseY;

  window.addEventListener('mousemove', (e) => {
    targetX = e.clientX;
    targetY = e.clientY;
  });

  // Stars Definition
  const starCount = Math.floor((width * height) / 3800);
  let stars = [];

  function initStars() {
    stars = [];
    for (let i = 0; i < starCount; i++) {
      stars.push({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: Math.random() * 1.5 + 0.3,
        alpha: Math.random() * 0.8 + 0.2,
        twinkleSpeed: Math.random() * 0.02 + 0.005,
        twinkleDir: Math.random() > 0.5 ? 1 : -1,
        layer: Math.random() * 3 + 1, // Depth layer for parallax
        color: getRandomStarColor(),
      });
    }
  }

  function getRandomStarColor() {
    const colors = [
      '#ffffff',
      '#e0f2fe',
      '#bae6fd',
      '#7dd3fc',
      '#38bdf8',
      '#c084fc',
      '#fae8ff',
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  }

  // Shooting Stars (Meteors)
  let shootingStars = [];
  function createShootingStar() {
    if (shootingStars.length < 2 && Math.random() < 0.015) {
      shootingStars.push({
        x: Math.random() * width * 0.8,
        y: Math.random() * (height * 0.4),
        len: Math.random() * 90 + 50,
        speed: Math.random() * 9 + 6,
        size: Math.random() * 1.8 + 1,
        angle: (Math.PI / 4) + (Math.random() * 0.2 - 0.1),
        opacity: 1,
      });
    }
  }

  initStars();

  // Animation Loop
  function animate() {
    ctx.clearRect(0, 0, width, height);

    // Smooth mouse interpolation
    mouseX += (targetX - mouseX) * 0.05;
    mouseY += (targetY - mouseY) * 0.05;

    const offsetX = (mouseX - width / 2) * 0.02;
    const offsetY = (mouseY - height / 2) * 0.02;

    // Draw & update stars
    for (let star of stars) {
      star.alpha += star.twinkleSpeed * star.twinkleDir;
      if (star.alpha >= 0.95) star.twinkleDir = -1;
      if (star.alpha <= 0.15) star.twinkleDir = 1;

      const px = star.x - offsetX * star.layer;
      const py = star.y - offsetY * star.layer;

      ctx.beginPath();
      ctx.arc(px, py, star.radius, 0, Math.PI * 2);
      ctx.fillStyle = star.color;
      ctx.globalAlpha = Math.max(0, Math.min(1, star.alpha));
      ctx.shadowBlur = star.radius > 1.2 ? 6 : 0;
      ctx.shadowColor = star.color;
      ctx.fill();
    }

    ctx.shadowBlur = 0;
    ctx.globalAlpha = 1;

    // Draw Shooting Stars
    createShootingStar();
    for (let i = shootingStars.length - 1; i >= 0; i--) {
      const s = shootingStars[i];
      const tailX = s.x - Math.cos(s.angle) * s.len;
      const tailY = s.y - Math.sin(s.angle) * s.len;

      const gradient = ctx.createLinearGradient(tailX, tailY, s.x, s.y);
      gradient.addColorStop(0, 'rgba(56, 189, 248, 0)');
      gradient.addColorStop(0.7, 'rgba(56, 189, 248, 0.4)');
      gradient.addColorStop(1, 'rgba(255, 255, 255, 1)');

      ctx.beginPath();
      ctx.moveTo(tailX, tailY);
      ctx.lineTo(s.x, s.y);
      ctx.strokeStyle = gradient;
      ctx.lineWidth = s.size;
      ctx.lineCap = 'round';
      ctx.stroke();

      // Update position
      s.x += Math.cos(s.angle) * s.speed;
      s.y += Math.sin(s.angle) * s.speed;
      s.opacity -= 0.015;

      if (s.x > width + 100 || s.y > height + 100 || s.opacity <= 0) {
        shootingStars.splice(i, 1);
      }
    }

    requestAnimationFrame(animate);
  }

  animate();
}

/* =========================================================
   2. TYPEWRITER EFFECT
========================================================= */
function initTypewriter() {
  const el = document.getElementById('typewriter');
  if (!el) return;

  const roles = [
    'Mahasiswa S1 Ilmu Hukum UNESA',
    'Badminton Athlete & Player',
    'Paskibraka Kab. Madiun 2023',
    'Passionate Gamer',
    'Cosmic Explorer'
  ];

  let roleIndex = 0;
  let charIndex = 0;
  let isDeleting = false;
  let typingSpeed = 100;

  function type() {
    const currentRole = roles[roleIndex];

    if (isDeleting) {
      el.textContent = currentRole.substring(0, charIndex - 1);
      charIndex--;
      typingSpeed = 50;
    } else {
      el.textContent = currentRole.substring(0, charIndex + 1);
      charIndex++;
      typingSpeed = 110;
    }

    if (!isDeleting && charIndex === currentRole.length) {
      // Pause at full word
      typingSpeed = 2000;
      isDeleting = true;
    } else if (isDeleting && charIndex === 0) {
      isDeleting = false;
      roleIndex = (roleIndex + 1) % roles.length;
      typingSpeed = 400;
    }

    setTimeout(type, typingSpeed);
  }

  type();
}

/* =========================================================
   3. ANIMATED NUMBER COUNTERS (INTERSECTION OBSERVER)
========================================================= */
function initCounters() {
  const counters = document.querySelectorAll('.counter');
  if (!counters.length) return;

  let hasAnimated = false;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && !hasAnimated) {
          hasAnimated = true;
          counters.forEach((counter) => {
            const target = +counter.getAttribute('data-target');
            const duration = 1800; // ms
            const stepTime = 20;
            const totalSteps = duration / stepTime;
            const increment = target / totalSteps;
            let current = 0;

            const timer = setInterval(() => {
              current += increment;
              if (current >= target) {
                counter.innerText = target;
                clearInterval(timer);
              } else {
                counter.innerText = Math.floor(current);
              }
            }, stepTime);
          });
        }
      });
    },
    { threshold: 0.3 }
  );

  const statsSection = document.querySelector('.stat-card');
  if (statsSection) {
    observer.observe(statsSection);
  }
}

/* =========================================================
   4. NAVBAR ACTIVE HIGHLIGHT & MOBILE MENU
========================================================= */
function initNavInteraction() {
  // Mobile menu toggle
  const mobileMenuBtn = document.getElementById('mobileMenuBtn');
  const mobileMenu = document.getElementById('mobileMenu');

  if (mobileMenuBtn && mobileMenu) {
    mobileMenuBtn.addEventListener('click', () => {
      mobileMenu.classList.toggle('hidden');
    });

    document.querySelectorAll('.mobile-nav-link').forEach((link) => {
      link.addEventListener('click', () => {
        mobileMenu.classList.add('hidden');
      });
    });
  }

  // Active section indicator on scroll
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-link');

  window.addEventListener('scroll', () => {
    let currentId = '';
    const scrollY = window.pageYOffset;

    sections.forEach((section) => {
      const sectionTop = section.offsetTop - 180;
      const sectionHeight = section.offsetHeight;
      if (scrollY >= sectionTop && scrollY < sectionTop + sectionHeight) {
        currentId = section.getAttribute('id');
      }
    });

    navLinks.forEach((link) => {
      link.classList.remove('active');
      if (link.getAttribute('href') === `#${currentId}`) {
        link.classList.add('active');
      }
    });
  });
}

/* =========================================================
   5. COSMIC CURSOR FOLLOWER
========================================================= */
function initCustomCursor() {
  const dot = document.getElementById('cursorDot');
  const ring = document.getElementById('cursorRing');
  if (!dot || !ring) return;

  // Non-aktifkan pada perangkat sentuh (touchscreen/mobile)
  if (window.matchMedia('(pointer: coarse)').matches) return;

  let mouseX = -100;
  let mouseY = -100;
  let ringX = -100;
  let ringY = -100;
  let isVisible = false;

  window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;

    if (!isVisible) {
      isVisible = true;
      dot.style.opacity = '1';
      ring.style.opacity = '1';
    }

    // Gerakan titik tengah secara instan mengikuti posisi kursor
    dot.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0) translate(-50%, -50%)`;
  });

  window.addEventListener('mouseleave', () => {
    isVisible = false;
    dot.style.opacity = '0';
    ring.style.opacity = '0';
  });

  window.addEventListener('mouseenter', () => {
    isVisible = true;
    dot.style.opacity = '1';
    ring.style.opacity = '1';
  });

  // Animasi lingkaran luar mengikuti dengan efek kelembaman halus (Lerp)
  function renderCursor() {
    ringX += (mouseX - ringX) * 0.18;
    ringY += (mouseY - ringY) * 0.18;

    ring.style.transform = `translate3d(${ringX}px, ${ringY}px, 0) translate(-50%, -50%)`;
    requestAnimationFrame(renderCursor);
  }
  requestAnimationFrame(renderCursor);

  // Deteksi hover pada elemen interaktif
  const interactiveSelector = 'a, button, input, .stat-card, .skill-card, .social-icon, [role="button"]';

  document.addEventListener('mouseover', (e) => {
    if (e.target.closest(interactiveSelector)) {
      ring.classList.add('cursor-hover');
      dot.classList.add('cursor-hover');
    }
  });

  document.addEventListener('mouseout', (e) => {
    if (e.target.closest(interactiveSelector)) {
      ring.classList.remove('cursor-hover');
      dot.classList.remove('cursor-hover');
    }
  });

  document.addEventListener('mousedown', () => {
    ring.classList.add('cursor-active');
  });

  document.addEventListener('mouseup', () => {
    ring.classList.remove('cursor-active');
  });
}
