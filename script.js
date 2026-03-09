// ===========================
// STATE
// ===========================
let currentSlide    = 0;
let declineCount    = 0;
const MAX_DECLINES  = 5;
let declining       = false; // prevent double clicks during animation
let muted           = true;

const slides   = document.querySelectorAll('.slide');
const dots     = document.querySelectorAll('.dot');
const btnNext  = document.getElementById('btnNext');
const bgMusic  = document.getElementById('bgMusic');
const muteBtn  = document.getElementById('muteBtn');

// ===========================
// FLOATING HEARTS BACKGROUND
// ===========================
const emojis = ['💕','💗','💖','💓','❤️','🩷','💝','✨'];

function createFloatingHeart() {
  const bg   = document.getElementById('heartsBg');
  const el   = document.createElement('div');
  el.className = 'heart-float';
  el.textContent = emojis[Math.floor(Math.random() * emojis.length)];
  el.style.left     = Math.random() * 100 + 'vw';
  el.style.fontSize = (1 + Math.random() * 1.5) + 'rem';
  const dur  = 6 + Math.random() * 8;
  el.style.animationDuration = dur + 's';
  el.style.animationDelay   = Math.random() * dur + 's';
  bg.appendChild(el);
  setTimeout(() => el.remove(), (dur + 3) * 1000);
}

// Spawn hearts every 800ms
setInterval(createFloatingHeart, 800);

// ===========================
// RISING HEARTS inside slides
// ===========================
function spawnRisingHeart(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;
  const h   = document.createElement('div');
  h.className = 'rise-heart';
  h.textContent = emojis[Math.floor(Math.random() * emojis.length)];
  h.style.left = Math.random() * 100 + '%';
  const dur = 3 + Math.random() * 3;
  h.style.animationDuration = dur + 's';
  h.style.animationDelay   = Math.random() * 1 + 's';
  container.appendChild(h);
  setTimeout(() => h.remove(), (dur + 2) * 1000);
}

// Rising hearts per slide
const riseContainers = ['risingHeartsS1','risingHeartsS2','risingHeartsS3','risingHeartsS4','risingHeartsS5'];
setInterval(() => {
  const cid = riseContainers[currentSlide];
  if (cid) spawnRisingHeart(cid);
}, 1200);

// ===========================
// SLIDE NAVIGATION
// ===========================
function goSlide(index) {
  if (index < 0 || index >= slides.length) return;

  slides[currentSlide].classList.remove('active');
  dots[currentSlide].classList.remove('active');

  currentSlide = index;

  slides[currentSlide].classList.add('active');
  dots[currentSlide].classList.add('active');

  // Show/hide next button
  if (currentSlide === 0) {
    btnNext.classList.remove('visible');
  } else if (currentSlide === slides.length - 1) {
    btnNext.classList.remove('visible'); // last slide has own buttons
  } else {
    setTimeout(() => btnNext.classList.add('visible'), 500);
  }

  // Slide-specific effects
  onSlideEnter(currentSlide);
}

function nextSlide() {
  if (currentSlide < slides.length - 1) {
    goSlide(currentSlide + 1);
  }
}

function onSlideEnter(index) {
  if (index === 2) {
    // Screen shake
    const s3 = document.getElementById('slide-3');
    s3.classList.remove('shake-anim');
    void s3.offsetWidth; // reflow trick
    s3.classList.add('shake-anim');
    setTimeout(() => s3.classList.remove('shake-anim'), 600);
  }

  if (index === 3) {
    // Zoom in elements
    const emoji = document.getElementById('searchEmoji');
    const text  = document.getElementById('slide4Text');
    emoji.classList.remove('zoom-text');
    text.classList.remove('zoom-text');
    void emoji.offsetWidth;
    emoji.classList.add('zoom-text');
    text.classList.add('zoom-text');
  }

  if (index === 4) {
    // Final confetti burst
    launchConfetti();
  }
}

// ===========================
// SLIDE 1: ACCEPT / DECLINE
// ===========================
function handleAccept() {
  // Confetti explosion!
  launchConfetti();
  launchConfetti();

  const yayText = document.getElementById('responseYay');
  yayText.classList.add('show');

  // Hide btn group
  document.getElementById('btnGroup').style.display = 'none';

  // Auto-advance to slide 2 after 3 seconds
  setTimeout(() => {
    yayText.classList.remove('show');
    goSlide(1);
  }, 3000);

  // Play music on interaction
  tryPlayMusic();
}

function handleDecline() {
  if (declining) return; // debounce during jump animation

  if (declineCount >= MAX_DECLINES) return; // should be hidden by now

  declineCount++;
  declining = true;

  const btn = document.getElementById('btnDecline');

  if (declineCount < MAX_DECLINES) {
    // Make button position: fixed and jump to random location
    if (btn.style.position !== 'fixed') {
      btn.classList.add('jumping');
    }

    // Calculate safe random position (keep inside viewport)
    const bw = btn.offsetWidth  || 120;
    const bh = btn.offsetHeight ||  48;
    const padding = 30;                 // Jarak aman dari pinggir (px)
    const maxX = window.innerWidth  - bw - padding;
    const maxY = window.innerHeight - bh - padding;
    const minX = padding;
    const minY = padding;
    const safeMaxX = Math.min(maxX, window.innerWidth * 0.7);
    const safeMaxY = Math.min(maxY, window.innerHeight * 0.7);
    const newX = minX + Math.floor(Math.random() * (safeMaxX - minX));
    const newY = minY + Math.floor(Math.random() * (safeMaxY - minY));

    btn.style.left = newX + 'px';
    btn.style.top  = newY + 'px';

    setTimeout(() => { declining = false; }, 450);

  } else {
    // 5th click → button disappears!
    btn.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
    btn.style.opacity    = '0';
    btn.style.transform  = 'scale(0) rotate(180deg)';

    setTimeout(() => {
      btn.style.display = 'none';

      // Show shy text
      document.getElementById('responseShy').classList.add('show');

      // Make accept button glow bigger
      const acceptBtn = document.getElementById('btnAccept');
      acceptBtn.classList.add('glow-mode');

      declining = false;
    }, 500);
  }
}

// ===========================
// CONFETTI
// ===========================
function launchConfetti() {
  if (typeof confetti !== 'undefined') {
    confetti({
      particleCount: 140,
      spread: 80,
      startVelocity: 45,
      origin: { x: 0.5, y: 0.6 },
      colors: ['#ff6fa8','#ff9ec4','#c084fc','#f9a8d4','#fde68a','#ffffff'],
      shapes: ['circle','square'],
      scalar: 1.1,
    });
    // Second burst from sides
    setTimeout(() => {
      confetti({ particleCount: 60, angle: 60,  spread: 55, origin: { x: 0, y: 0.6 }, colors: ['#ff6fa8','#c084fc','#fde68a'] });
      confetti({ particleCount: 60, angle: 120, spread: 55, origin: { x: 1, y: 0.6 }, colors: ['#ff6fa8','#c084fc','#fde68a'] });
    }, 250);
  }
}

// ===========================
// MUSIC
// ===========================
bgMusic.muted  = true;
bgMusic.volume = 0.35;

function tryPlayMusic() {
  bgMusic.play().catch(() => {});
}

// Try autoplay on first user gesture
document.addEventListener('click', () => {
  if (bgMusic.paused) bgMusic.play().catch(() => {});
}, { once: true });

muteBtn.addEventListener('click', () => {
  muted = !muted;
  bgMusic.muted = muted;
  muteBtn.textContent = muted ? '🔇' : '🔊';
  if (!bgMusic.paused === false && !muted) bgMusic.play().catch(() => {});
});

// ===========================
// SLIDE 5: SHARE & RESTART
// ===========================
function shareCard() {
  // NOMOR WA KAMU (format internasional, +62 buat Indo)
  const myNumber = '6281234567890';  // ← UBAH INI JADI NOMOR KAMU!
  
  const url = window.location.href;
  const message = encodeURIComponent(
    `💕 Kartu cinta spesial dari ${currentSlide === 0 ? 'dia' : 'pacarku'}! 😍\n\n` +
    `Buka link ini yuk: ${url}\n` +
    `Love you! ❤️`
  );
  
  // LANGSUNG BUKA WA KE NOMOR KAMU
  const waUrl = `https://wa.me/qr/XHZXJVYHGMTBK1?text=${message}`;
  
  // Copy link ke clipboard + buka WA
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(url).then(() => {
      showToast('📋 Link disalin! → WA terbuka');
    }).catch(() => {});
  }
  
  window.open(waUrl, '_blank');
}


function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 2800);
}

function restartCard() {
  // Reset slide 1 state
  declineCount = 0;
  declining    = false;

  const btn = document.getElementById('btnDecline');
  btn.style.display   = '';
  btn.style.opacity   = '';
  btn.style.transform = '';
  btn.style.position  = '';
  btn.style.left      = '';
  btn.style.top       = '';
  btn.classList.remove('jumping');

  document.getElementById('btnAccept').classList.remove('glow-mode');
  document.getElementById('btnGroup').style.display = '';
  document.getElementById('responseYay').classList.remove('show');
  document.getElementById('responseShy').classList.remove('show');

  goSlide(0);
}

// ===========================
// KEYBOARD NAV (bonus)
// ===========================
document.addEventListener('keydown', (e) => {
  if (e.key === 'ArrowRight' && currentSlide > 0) nextSlide();
});

// ===========================
// INIT
// ===========================
goSlide(0);
tryPlayMusic();