// Simple confetti effect on a full-screen canvas
const Confetti = (() => {
  const colors = ["#f97316", "#facc15", "#22c55e", "#38bdf8", "#a855f7", "#fb7185", "#f9a8d4"];
  let canvas, ctx, width, height, particles, active = false, initialized = false;

  function createParticle() {
    const size = Math.random() * 6 + 4;
    return {
      x: Math.random() * (width || window.innerWidth),
      y: -10,
      w: size,
      h: size * (Math.random() * 0.6 + 0.7),
      color: colors[Math.floor(Math.random() * colors.length)],
      speedX: (Math.random() - 0.5) * 2,
      speedY: Math.random() * 3 + 3,
      rotation: Math.random() * Math.PI * 2,
      rotationSpeed: (Math.random() - 0.5) * 0.2,
      life: Math.random() * 60 + 60
    };
  }

  function resize() {
    if (!canvas || !ctx) return;
    const dpr = window.devicePixelRatio || 1;
    width = window.innerWidth;
    height = window.innerHeight;
    
    // Set actual size in memory (scaled for DPR)
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    
    // Scale context to match device pixel ratio
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.scale(dpr, dpr);
    
    // Set display size (CSS pixels)
    canvas.style.width = width + "px";
    canvas.style.height = height + "px";
  }

  function init() {
    if (initialized) return;
    canvas = document.getElementById("confetti-canvas");
    if (!canvas) {
      console.warn("Confetti canvas not found");
      return;
    }
    ctx = canvas.getContext("2d");
    if (!ctx) {
      console.warn("Could not get 2d context");
      return;
    }
    resize();
    particles = [];
    initialized = true;
    
    // Handle window resize
    let resizeTimeout;
    window.addEventListener("resize", () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        resize();
      }, 100);
    });
  }

  function burst(count = 160) {
    // Ensure initialization
    if (!initialized) {
      init();
      if (!ctx) {
        console.warn("Confetti not initialized");
        return;
      }
    }
    
    // Ensure dimensions are set
    if (!width || !height) {
      resize();
    }
    
    // Add particles
    for (let i = 0; i < count; i++) {
      particles.push(createParticle());
    }
    
    // Start animation if not already running
    if (!active) {
      active = true;
      animate();
    }
  }

  function animate() {
    if (!active || !ctx || !width || !height) {
      active = false;
      return;
    }
    
    // Clear canvas (using CSS pixel dimensions, not scaled)
    ctx.clearRect(0, 0, width, height);

    // Update particles
    particles.forEach((p) => {
      p.x += p.speedX;
      p.y += p.speedY;
      p.rotation += p.rotationSpeed;
      p.life -= 1;
    });
    
    // Remove dead particles
    particles = particles.filter((p) => p.life > 0 && p.y < height + 40);

    // Draw particles
    particles.forEach((p) => {
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rotation);
      ctx.fillStyle = p.color;
      ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
      ctx.restore();
    });

    // Continue animation if there are particles
    if (particles.length > 0) {
      requestAnimationFrame(animate);
    } else {
      active = false;
    }
  }

  return {
    init,
    burst
  };
})();

// Smooth scroll for buttons with data-scroll-to
function setupSmoothScroll() {
  document.querySelectorAll("[data-scroll-to]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const target = document.querySelector(btn.getAttribute("data-scroll-to"));
      if (target) {
        target.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    });
  });
}

// Reveal on scroll using IntersectionObserver
function setupRevealOnScroll() {
  const revealEls = document.querySelectorAll(".reveal");
  if (!("IntersectionObserver" in window) || revealEls.length === 0) {
    revealEls.forEach((el) => el.classList.add("in-view"));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("in-view");
          observer.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.18
    }
  );

  revealEls.forEach((el) => observer.observe(el));
}

// Typewriter effect for the letter
function setupTypewriter() {
  const el = document.getElementById("letter-text");
  if (!el) return;
  const raw = el.getAttribute("data-message") || "";
  const text = raw.replace(/^\s+|\s+$/g, "");
  let index = 0;
  let frameId;

  function type() {
    if (index <= text.length) {
      el.textContent = text.slice(0, index);
      index += Math.random() < 0.08 ? 2 : 1;
      const delay = text[index - 1] === "\n" ? 120 : 35 + Math.random() * 60;
      frameId = setTimeout(type, delay);
    }
  }

  function start() {
    clearTimeout(frameId);
    el.textContent = "";
    index = 0;
    type();
  }

  start();

  const replayBtn = document.getElementById("replay-letter");
  if (replayBtn) {
    replayBtn.addEventListener("click", () => {
      start();
      Confetti.burst(80);
    });
  }
}

// Hearts mini-interactions
function setupHearts() {
  const hearts = document.querySelectorAll(".heart");
  const messageEl = document.getElementById("heart-message");
  if (hearts.length === 0 || !messageEl) return;

  const messages = {
    1: "Wish #1: May your days feel a little lighter and your heart a little softer with every sunrise.",
    2: "Wish #2: May you always find reasons to laugh — loudly, freely, unapologetically.",
    3: "Wish #3: May you never forget how deeply you are loved, exactly as you are."
  };

  let nextExpectedHeart = 1;

  hearts.forEach((heart) => {
    heart.addEventListener("click", () => {
      const key = parseInt(heart.getAttribute("data-heart"));
      const isActive = heart.classList.contains("active");

      // Prevent clicking if it's not the next expected heart
      if (!isActive && key !== nextExpectedHeart) {
        return; // Can't click out of order
      }

      // Toggle the heart
      if (isActive) {
        // Allow toggling off only if it's the last active heart
        const activeHearts = Array.from(hearts).filter(h => h.classList.contains("active"));
        const lastActive = activeHearts[activeHearts.length - 1];
        if (heart === lastActive) {
          heart.classList.remove("active");
          nextExpectedHeart = key;
          
          // Update message based on remaining active hearts
          const activeCount = document.querySelectorAll(".heart.active").length;
          if (activeCount === 0) {
            messageEl.textContent = "Tap the hearts to unlock tiny wishes.";
          } else if (activeCount === 1) {
            messageEl.textContent = messages[1];
          } else if (activeCount === 2) {
            messageEl.textContent = "Two wishes down. One more to go… what will it be?";
          }
        }
      } else {
        // Toggle on - only if it's the next expected heart
        if (key === nextExpectedHeart) {
          heart.classList.add("active");
          nextExpectedHeart = key + 1;

          const activeCount = document.querySelectorAll(".heart.active").length;
          if (activeCount === 1) {
            messageEl.textContent = messages[1];
          } else if (activeCount === 2) {
            messageEl.textContent = "Two wishes down. One more to go… what will it be?";
          } else if (activeCount >= 3) {
            messageEl.textContent = "Every wish is already on its way to you. 🌟";
            Confetti.burst(120);
          }
        }
      }
    });
  });
}

// Cake and candles interaction
function setupCake() {
  const cake = document.getElementById("cake");
  const button = document.getElementById("blow-candles");
  const flames = document.querySelectorAll(".flame");
  const wishIcon = document.getElementById("wish-page-icon");
  if (!cake || !button || flames.length === 0) return;

  let blown = false;

  function blow() {
    if (blown) {
      // Relight
      flames.forEach((f) => {
        f.classList.remove("blown-out");
        f.style.opacity = "1";
        f.style.height = "22px";
        f.style.width = "14px";
      });
      button.textContent = "Blow the candles ✨";
      blown = false;
      if (wishIcon) wishIcon.classList.remove("winked");
    } else {
      // Blow out
      flames.forEach((f) => {
        f.classList.add("blown-out");
        f.style.opacity = "0";
        f.style.height = "0";
        f.style.width = "0";
      });
      button.textContent = "You did it 🎂 (tap to relight)";
      blown = true;
      if (wishIcon) wishIcon.classList.add("winked");
      Confetti.burst(200);
      cake.classList.add("cake-pop");
      setTimeout(() => cake.classList.remove("cake-pop"), 480);
    }
  }

  cake.addEventListener("click", blow);
  button.addEventListener("click", blow);
}

// Secret letter easter egg – click all hero letters
function setupSecretLetters() {
  // Always set up the secret page confetti button when present (e.g. on secret.html)
  const secretConfettiBtn = document.getElementById("secret-confetti");
  if (secretConfettiBtn) {
    secretConfettiBtn.addEventListener("click", () => {
      Confetti.init();
      Confetti.burst(260);
    });
  }

  const letters = document.querySelectorAll(".hero-title .letter");
  if (letters.length === 0) return;

  const found = new Set();

  function checkComplete() {
    if (found.size === letters.length) {
      Confetti.burst(260);
      setTimeout(() => {
        window.location.href = "secret.html";
      }, 600);
    }
  }

  letters.forEach((letter) => {
    letter.addEventListener("click", () => {
      const key = letter.getAttribute("data-secret");
      if (!key) return;
      if (!found.has(key)) {
        found.add(key);
        letter.style.color = "var(--accent-gold)";
        letter.style.textShadow = "0 0 20px rgba(250, 204, 21, 0.9)";
        letter.style.transform = "translateY(-3px) rotate(-3deg) scale(1.12)";
        setTimeout(() => {
          letter.style.transform = "";
        }, 380);
        Confetti.burst(30);
        checkComplete();
      }
    });
  });
}

// Konami code easter egg
function setupKonamiCode() {
  const sequence = ["ArrowUp", "ArrowUp", "ArrowDown", "ArrowDown", "ArrowLeft", "ArrowRight", "ArrowLeft", "ArrowRight", "b", "a"];
  let buffer = [];

  window.addEventListener("keydown", (e) => {
    buffer.push(e.key);
    if (buffer.length > sequence.length) {
      buffer.shift();
    }
    if (sequence.every((key, idx) => buffer[idx]?.toLowerCase() === key.toLowerCase())) {
      Confetti.burst(260);
      setTimeout(() => {
        window.location.href = "secret.html";
      }, 500);
    }
  });
}

// Confetti button on hero
function setupConfettiButton() {
  const btn = document.getElementById("confetti-trigger");
  if (!btn) {
    console.log("Confetti button not found");
    return;
  }
  
  // Ensure confetti is initialized
  Confetti.init();
  
  function triggerConfetti(e) {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    console.log("Confetti button clicked!");
    Confetti.burst(200);
  }
  
  btn.addEventListener("click", triggerConfetti);
  btn.addEventListener("touchend", triggerConfetti);
  
  // Also make sure button is clickable
  btn.style.cursor = "pointer";
  btn.style.pointerEvents = "auto";
}

// Winking icon: use two-image crossfade, or fallback to squint if icon-wink.jpg is missing
function setupWinkingIcon() {
  const container = document.getElementById("winking-icon");
  if (!container) return;
  const winkImg = container.querySelector(".winking-icon-wink");
  if (!winkImg) return;

  winkImg.addEventListener("error", () => {
    container.classList.add("single-image");
  });
  if (winkImg.complete && !winkImg.naturalWidth) {
    container.classList.add("single-image");
  }
}

// Ambient music: toggle in nav; when in iframe, control parent (shell) audio so it doesn't restart on nav
const AMBIENT_STORAGE_KEY = "birthday-ambient-playing";
const AMBIENT_MESSAGE_TYPE = "birthday-ambient";

function setupAmbientMusic() {
  const btn = document.getElementById("music-toggle");
  if (!btn) return;

  const iconEl = btn.querySelector(".music-icon");

  function updateIcon(playing) {
    if (iconEl) iconEl.textContent = playing ? "🔊" : "🎵";
    btn.title = playing ? "Pause ambient music" : "Play ambient music";
    btn.setAttribute("aria-label", playing ? "Pause ambient music" : "Play ambient music");
  }

  // When inside the shell's iframe: tell parent to toggle; parent will post back the new state
  if (window !== window.top) {
    window.addEventListener("message", (e) => {
      if (e.data && e.data.type === AMBIENT_MESSAGE_TYPE && typeof e.data.playing === "boolean") {
        updateIcon(e.data.playing);
      }
    });
    btn.addEventListener("click", () => {
      window.parent.postMessage({ type: AMBIENT_MESSAGE_TYPE, action: "toggle" }, "*");
    });
    // Ask parent for current state so the button shows the right icon
    window.parent.postMessage({ type: AMBIENT_MESSAGE_TYPE, action: "getState" }, "*");
    updateIcon(false);
    return;
  }

  // When page is opened directly (not in iframe): use this page's audio
  const audio = document.getElementById("ambient-audio");
  if (!audio) return;

  audio.volume = 0.4;
  audio.addEventListener("play", () => updateIcon(true));
  audio.addEventListener("pause", () => updateIcon(false));

  btn.addEventListener("click", () => {
    if (audio.paused) {
      audio.play().catch(() => {});
      try { localStorage.setItem(AMBIENT_STORAGE_KEY, "1"); } catch (e) {}
      updateIcon(true);
    } else {
      audio.pause();
      try { localStorage.removeItem(AMBIENT_STORAGE_KEY); } catch (e) {}
      updateIcon(false);
    }
  });

  try {
    if (localStorage.getItem(AMBIENT_STORAGE_KEY) === "1") {
      audio.play().catch(() => {});
      updateIcon(true);
    } else {
      updateIcon(false);
    }
  } catch (e) {
    updateIcon(false);
  }
}

// When a content page is opened in the top window, redirect to shell so audio never reloads
function redirectToShellIfNeeded() {
  if (window === window.top && typeof window.location !== "undefined") {
    var path = window.location.pathname || "";
    var page = path.split("/").pop() || "";
    if (page && page !== "index.html" && page.endsWith(".html")) {
      window.location.replace("index.html?page=" + encodeURIComponent(page));
      return true;
    }
  }
  return false;
}

// Small entrance confetti on first load
function initialEntrance() {
  setTimeout(() => {
    Confetti.burst(180);
  }, 800);
}

document.addEventListener("DOMContentLoaded", () => {
  if (redirectToShellIfNeeded()) return;
  Confetti.init();
  setupSmoothScroll();
  setupRevealOnScroll();
  setupTypewriter();
  setupHearts();
  setupCake();
  setupSecretLetters();
  setupKonamiCode();
  setupConfettiButton();
  setupWinkingIcon();
  setupAmbientMusic();
  initialEntrance();
});

window.addEventListener("load", () => {
  Confetti.init();
});

