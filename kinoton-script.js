// Register ScrollTrigger plugin
gsap.registerPlugin(ScrollTrigger, TextPlugin);

// Smooth scroll behavior
ScrollTrigger.normalizeScroll(true);

// Video Lazy Loading with Intersection Observer and Priority
const setupVideoLazyLoading = () => {
  const videos = document.querySelectorAll('.expand-video[data-src]');
  const loadingQueue = [];
  let isLoading = false;

  // Process video loading queue sequentially
  const processLoadingQueue = async () => {
    if (isLoading || loadingQueue.length === 0) return;

    isLoading = true;
    const video = loadingQueue.shift();
    const videoSrc = video.getAttribute('data-src');

    if (videoSrc && !video.hasAttribute('data-loaded')) {
      const source = video.querySelector('source');
      if (source) {
        source.src = videoSrc;

        // For the last video, use lower priority loading
        const videoIndex = Array.from(videos).indexOf(video);
        if (videoIndex === videos.length - 1) {
          // Last video - load with lower priority
          video.setAttribute('preload', 'none');
        } else {
          // Other videos - normal loading
          video.setAttribute('preload', 'metadata');
        }

        video.load();
        video.setAttribute('data-loaded', 'true');
        video.removeAttribute('data-src');

        // Wait a bit before loading next video to avoid bandwidth congestion
        await new Promise((resolve) => setTimeout(resolve, 100));
      }
    }

    isLoading = false;
    processLoadingQueue(); // Process next video in queue
  };

  const videoObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const video = entry.target;

          if (!video.hasAttribute('data-loaded')) {
            // Add to queue instead of loading immediately
            if (!loadingQueue.includes(video)) {
              loadingQueue.push(video);
              processLoadingQueue();
            }
          }

          // Stop observing this video
          observer.unobserve(video);
        }
      });
    },
    {
      // Adjust loading distance based on video position
      rootMargin: '500px 0px',
      threshold: 0.01,
    }
  );

  // Start observing all videos with different strategies
  videos.forEach((video, index) => {
    if (index === videos.length - 1) {
      // For the last video, use a different observer with larger margin
      const lastVideoObserver = new IntersectionObserver(
        (entries, observer) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              const video = entry.target;

              // Delay loading of last video until user is closer
              setTimeout(() => {
                if (
                  !video.hasAttribute('data-loaded') &&
                  !loadingQueue.includes(video)
                ) {
                  loadingQueue.push(video);
                  processLoadingQueue();
                }
              }, 1000); // 1 second delay for last video

              observer.unobserve(video);
            }
          });
        },
        {
          // Last video loads when very close to viewport
          rootMargin: '200px 0px',
          threshold: 0.01,
        }
      );

      lastVideoObserver.observe(video);
    } else {
      // Normal videos use standard observer
      videoObserver.observe(video);
    }
  });
};

// Initialize lazy loading
document.addEventListener('DOMContentLoaded', setupVideoLazyLoading);

// Optimize last video specifically
const optimizeLastVideo = () => {
  const videos = document.querySelectorAll('.expand-video');
  const lastVideo = videos[videos.length - 1];

  if (lastVideo) {
    // Set specific attributes for last video
    lastVideo.setAttribute('preload', 'none');

    // Optional: Request lower quality for last video if needed
    const lastVideoWrapper = lastVideo.closest('.video-expand-wrapper');
    if (lastVideoWrapper) {
      lastVideoWrapper.setAttribute('data-priority', 'low');
    }
  }
};

// Run optimization after DOM is ready
document.addEventListener('DOMContentLoaded', optimizeLastVideo);

// Network-aware video optimization
const optimizeVideoLoading = () => {
  // Check connection type if available
  const connection =
    navigator.connection ||
    navigator.mozConnection ||
    navigator.webkitConnection;

  if (connection) {
    const connectionType = connection.effectiveType;
    const videos = document.querySelectorAll('.expand-video');

    // Adjust video loading strategy based on connection
    if (connectionType === 'slow-2g' || connectionType === '2g') {
      // On slow connections, increase lazy loading distance
      videos.forEach((video) => {
        video.setAttribute('preload', 'none');
      });
    } else if (connectionType === '4g') {
      // On fast connections, preload metadata
      const heroVideo = document.querySelector('.hero-background video');
      if (heroVideo) {
        heroVideo.setAttribute('preload', 'auto');
      }
    }

    // Monitor connection changes
    connection.addEventListener('change', optimizeVideoLoading);
  }
};

// Run optimization on load
optimizeVideoLoading();

// Performance monitoring
const reportVideoPerformance = () => {
  const videos = document.querySelectorAll('video');
  videos.forEach((video, index) => {
    video.addEventListener('loadstart', () => {
      console.time(`Video ${index} load time`);
    });

    video.addEventListener('canplay', () => {
      console.timeEnd(`Video ${index} load time`);
    });
  });
};

// Enable performance monitoring in development
if (window.location.hostname === 'localhost') {
  reportVideoPerformance();
}

// Progress bar animation
gsap.to('.progress-bar', {
  width: '100%',
  ease: 'none',
  scrollTrigger: {
    trigger: document.body,
    start: 'top top',
    end: 'bottom bottom',
    scrub: 0.3,
  },
});

// Navigation dots for video sections
const videoWrappers = gsap.utils.toArray('.video-expand-wrapper');
const dots = document.querySelectorAll('.dot');

// Update dots based on which video is in view
const updateDots = () => {
  const scrollPosition = window.scrollY;
  const windowHeight = window.innerHeight;

  // Hero section dot
  if (scrollPosition < windowHeight) {
    dots.forEach((dot) => dot.classList.remove('active'));
    if (dots[0]) dots[0].classList.add('active');
    return;
  }

  // Video section dots
  videoWrappers.forEach((wrapper, index) => {
    const rect = wrapper.getBoundingClientRect();
    const isInView =
      rect.top <= windowHeight / 2 && rect.bottom >= windowHeight / 2;

    if (isInView && dots[index + 1]) {
      dots.forEach((dot) => dot.classList.remove('active'));
      dots[index + 1].classList.add('active');
    }
  });
};

window.addEventListener('scroll', updateDots);

// Click to scroll to sections
dots.forEach((dot, index) => {
  dot.addEventListener('click', () => {
    if (index === 0) {
      // Scroll to hero
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (videoWrappers[index - 1]) {
      // Scroll to specific video
      const targetVideo = videoWrappers[index - 1];
      const targetPosition = targetVideo.offsetTop - window.innerHeight * 0.2;
      window.scrollTo({ top: targetPosition, behavior: 'smooth' });
    }
  });
});

// Hero section animations
const heroTimeline = gsap.timeline();

// Logo fade in animation
heroTimeline
  .from('.hero-logo', {
    duration: 1.2,
    opacity: 0,
    y: -50,
    ease: 'power3.out',
  })
  .from(
    '.hero-tagline',
    {
      duration: 1,
      opacity: 0,
      y: 20,
      ease: 'power2.out',
    },
    '-=0.8'
  )
  .from(
    '.hero-description',
    {
      duration: 1,
      opacity: 0,
      y: 30,
      ease: 'power2.out',
    },
    '-=0.8'
  )
  .from(
    '.hero-slogan span',
    {
      duration: 1.2,
      opacity: 0,
      x: -100,
      ease: 'power3.out',
      stagger: {
        each: 0.2,
      },
    },
    '-=0.6'
  );

// Parallax effect for hero elements on scroll
gsap.to('.hero-slogan', {
  yPercent: -30,
  opacity: 0,
  ease: 'none',
  scrollTrigger: {
    trigger: '.hero-section',
    start: 'top top',
    end: 'bottom top',
    scrub: 0.5,
  },
});

// Hero tagline - slight parallax, stays visible
gsap.to('.hero-tagline', {
  yPercent: -8,
  ease: 'none',
  scrollTrigger: {
    trigger: '.hero-section',
    start: 'top top',
    end: '80% top',
    scrub: 0.3,
  },
});

// Hero description - no fade out, only slight parallax
gsap.to('.hero-description', {
  yPercent: -10,
  ease: 'none',
  scrollTrigger: {
    trigger: '.hero-section',
    start: 'top top',
    end: '80% top',
    scrub: 0.3,
  },
});

gsap.to('.hero-logo', {
  yPercent: -10,
  ease: 'none',
  scrollTrigger: {
    trigger: '.hero-section',
    start: 'top top',
    end: '50% top',
    scrub: 0.2,
  },
});

// EXPANDING VIDEO ANIMATIONS - Core Feature
// Dynamic responsive detection using matchMedia
const mobileBreakpoint = window.matchMedia('(max-width: 768px)');
let isMobile = mobileBreakpoint.matches;
let videoScrollTriggers = []; // Store ScrollTrigger instances for cleanup

// Track currently playing video
let currentlyPlayingVideo = null;

// Function to initialize video animations
function initVideoAnimations() {
  // Clear existing ScrollTriggers for videos
  videoScrollTriggers.forEach((trigger) => trigger.kill());
  videoScrollTriggers = [];

  // Re-evaluate mobile state
  isMobile = mobileBreakpoint.matches;

  videoWrappers.forEach((wrapper, index) => {
    const box = wrapper.querySelector('.video-expand-box');
    const video = wrapper.querySelector('.expand-video');
    const content = wrapper.querySelector('.video-expand-content');
    const title = wrapper.querySelector('.video-title');
    const particles = wrapper.querySelectorAll('.video-particles span');
    const soundToggle = wrapper.querySelector('.video-sound-toggle');
    const position = wrapper.dataset.position;

    // Mobile: fixed size, Desktop: animated scaling
    if (isMobile) {
      gsap.set(box, {
        width: '100vw',
        height: 'auto',
        scale: 1,
        opacity: 1,
      });
      if (title) {
        gsap.set(title, {
          opacity: 1,
        });
      }
    } else {
      // All videos start from center (no horizontal offset)
      gsap.set(box, {
        scale: 0.5,
        x: 0,
        opacity: 0,
        width: '200px',
        height: '150px',
      });
      if (title) {
        gsap.set(title, {
          opacity: 1,
        });
      }
    }

    // Sound toggle functionality
    if (soundToggle && !soundToggle.hasAttribute('data-initialized')) {
      soundToggle.setAttribute('data-initialized', 'true');
      soundToggle.addEventListener('click', (e) => {
        e.stopPropagation();
        if (video.muted) {
          video.muted = false;
          soundToggle.classList.add('unmuted');
        } else {
          video.muted = true;
          soundToggle.classList.remove('unmuted');
        }
      });
    }

    // Pin each video wrapper
    const pinTrigger = ScrollTrigger.create({
      trigger: wrapper,
      start: 'top top',
      end: 'bottom top',
      pin: true,
      pinSpacing: false,
    });
    videoScrollTriggers.push(pinTrigger);

    // Expanding animation timeline
    const expandTimeline = gsap.timeline({
      scrollTrigger: {
        trigger: wrapper,
        start: 'top 90%',
        end: 'bottom 10%',
        scrub: 1,
        onUpdate: (self) => {
          // Trigger particles at 50% progress
          if (self.progress > 0.45 && self.progress < 0.55) {
            animateVideoParticles(particles);
          }

          // Add fullscreen class when video reaches fullscreen
          if (self.progress > 0.85) {
            box.classList.add('video-fullscreen');
            gsap.set(box, { scale: 1 });
          } else {
            box.classList.remove('video-fullscreen');
          }

          // Auto-play video when in view and loaded
          if (self.progress > 0.2) {
            if (video.hasAttribute('data-loaded') || video.readyState >= 2) {
              if (currentlyPlayingVideo && currentlyPlayingVideo !== video) {
                currentlyPlayingVideo.pause();
              }
              video.play().catch((e) => {});
              currentlyPlayingVideo = video;
            } else {
              video.addEventListener(
                'loadeddata',
                function () {
                  if (self.progress > 0.2) {
                    if (
                      currentlyPlayingVideo &&
                      currentlyPlayingVideo !== video
                    ) {
                      currentlyPlayingVideo.pause();
                    }
                    video.play().catch((e) => {});
                    currentlyPlayingVideo = video;
                  }
                },
                { once: true }
              );
            }
          }
        },
        onEnterBack: () => {
          if (video.hasAttribute('data-loaded') || video.readyState >= 2) {
            if (currentlyPlayingVideo && currentlyPlayingVideo !== video) {
              currentlyPlayingVideo.pause();
            }
            video.play().catch((e) => {});
            currentlyPlayingVideo = video;
          }
        },
        onLeaveBack: () => {
          if (index === 0 && currentlyPlayingVideo === video) {
            video.pause();
            currentlyPlayingVideo = null;
          }
        },
        onLeave: () => {
          // For the last video, check actual visibility before pausing
          if (
            index === videoWrappers.length - 1 &&
            currentlyPlayingVideo === video
          ) {
            const rect = video.getBoundingClientRect();
            // Only pause if video is completely out of view
            if (rect.bottom < 0 || rect.top > window.innerHeight) {
              video.pause();
              currentlyPlayingVideo = null;
            }
          }
        },
      },
    });

    videoScrollTriggers.push(expandTimeline.scrollTrigger);

    // Add Intersection Observer for last video to handle visibility-based playback
    if (index === videoWrappers.length - 1) {
      const lastVideoObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) {
              // Video is out of view - pause it
              if (currentlyPlayingVideo === video) {
                video.pause();
                currentlyPlayingVideo = null;
              }
            } else {
              // Video is in view - play it if ScrollTrigger progress allows
              const scrollTrigger = expandTimeline.scrollTrigger;
              if (scrollTrigger && scrollTrigger.progress > 0.2) {
                if (video.hasAttribute('data-loaded') || video.readyState >= 2) {
                  if (currentlyPlayingVideo && currentlyPlayingVideo !== video) {
                    currentlyPlayingVideo.pause();
                  }
                  video.play().catch((e) => {});
                  currentlyPlayingVideo = video;
                }
              }
            }
          });
        },
        {
          threshold: 0.1, // Trigger when 10% of video is visible
          rootMargin: '0px',
        }
      );

      lastVideoObserver.observe(video);
    }

    // Build timeline based on scroll - Skip for mobile
    if (!isMobile) {
      expandTimeline
        .to(box, {
          scale: 1,
          x: 0,
          opacity: 1,
          duration: 0.3,
          ease: 'power2.out',
        })
        .to(box, {
          width: '60vw',
          height: '50vh',
          borderRadius: 0,
          duration: 0.3,
          ease: 'power2.inOut',
        })
        .to(box, {
          width: '90vw',
          height: '80vh',
          borderRadius: 0,
          duration: 0.3,
          ease: 'power2.inOut',
        })
        .to(
          content,
          {
            opacity: 0,
            duration: 0.2,
          },
          '-=0.1'
        )
        .to(box, {
          width: '100vw',
          height: '100vh',
          borderRadius: 0,
          duration: 0.4,
          ease: 'power2.inOut',
        });
    }
  });
}

// Initialize animations on load
initVideoAnimations();

// Particle animation function for videos
function animateVideoParticles(particles) {
  particles.forEach((particle, i) => {
    const angle = (i / particles.length) * Math.PI * 2;
    const distance = 200 + Math.random() * 150;
    const x = Math.cos(angle) * distance;
    const y = Math.sin(angle) * distance;

    gsap.fromTo(
      particle,
      {
        left: '50%',
        top: '50%',
        x: 0,
        y: 0,
        scale: 0,
        opacity: 1,
      },
      {
        x: x,
        y: y,
        scale: Math.random() * 4 + 1,
        opacity: 0,
        duration: 2,
        ease: 'power2.out',
        overwrite: true,
      }
    );
  });
}

// Video hover effects
document.querySelectorAll('.video-expand-box').forEach((box) => {
  box.addEventListener('mouseenter', () => {
    if (
      !box.classList.contains('expanded') &&
      !box.classList.contains('video-fullscreen')
    ) {
      gsap.to(box, {
        scale: 1.05,
        duration: 0.3,
        ease: 'power2.out',
      });
    }
  });

  box.addEventListener('mouseleave', () => {
    if (
      !box.classList.contains('expanded') &&
      !box.classList.contains('video-fullscreen')
    ) {
      gsap.to(box, {
        scale: 1,
        duration: 0.3,
        ease: 'power2.out',
      });
    }
  });
});

// CTA Buttons interactions
const ctaPrimary = document.querySelector('.cta-primary');
const ctaSecondary = document.querySelector('.cta-secondary');

if (ctaPrimary) {
  ctaPrimary.addEventListener('click', () => {
    // Scroll to first video
    if (videoWrappers[0]) {
      const targetPosition =
        videoWrappers[0].offsetTop - window.innerHeight * 0.2;
      window.scrollTo({ top: targetPosition, behavior: 'smooth' });
    }
  });
}

if (ctaSecondary) {
  ctaSecondary.addEventListener('click', () => {
    // Scroll to media section
    const mediaSection = document.querySelector('.media-section');
    if (mediaSection) {
      mediaSection.scrollIntoView({ behavior: 'smooth' });
    }
  });
}

// Performance optimization - Refresh on resize with breakpoint detection
let resizeTimer;
let previousMobileState = isMobile;

window.addEventListener('resize', () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(() => {
    const currentMobileState = mobileBreakpoint.matches;

    // If breakpoint crossed, rebuild animations
    if (currentMobileState !== previousMobileState) {
      console.log(
        `Breakpoint crossed: ${previousMobileState ? 'mobile' : 'desktop'} → ${
          currentMobileState ? 'mobile' : 'desktop'
        }`
      );
      previousMobileState = currentMobileState;
      initVideoAnimations();
    }

    ScrollTrigger.refresh();
    updateDots();
  }, 250);
});

// Listen for breakpoint changes using matchMedia
mobileBreakpoint.addEventListener('change', (e) => {
  if (e.matches !== previousMobileState) {
    console.log(
      `MediaQuery change: ${previousMobileState ? 'mobile' : 'desktop'} → ${
        e.matches ? 'mobile' : 'desktop'
      }`
    );
    previousMobileState = e.matches;
    initVideoAnimations();
    ScrollTrigger.refresh();
  }
});

// Initialize
gsap.set('body', { visibility: 'visible' });

// To Top Button Functionality
const toTopBtn = document.querySelector('.to-top-btn');

// Show/hide button based on scroll position
const toggleToTopBtn = () => {
  const scrollPosition = window.scrollY;
  const windowHeight = window.innerHeight;

  if (scrollPosition > windowHeight * 0.5) {
    toTopBtn.classList.add('visible');
  } else {
    toTopBtn.classList.remove('visible');
  }
};

// Smooth scroll to top
const scrollToTop = () => {
  window.scrollTo({
    top: 0,
    behavior: 'smooth',
  });
};

// Add event listeners
if (toTopBtn) {
  // Click event for scrolling to top
  toTopBtn.addEventListener('click', scrollToTop);

  // Keyboard accessibility
  toTopBtn.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      scrollToTop();
    }
  });
}

// Add scroll event listener for button visibility
window.addEventListener('scroll', () => {
  toggleToTopBtn();
});

// Initial check for button visibility
toggleToTopBtn();

// Easter egg - Konami code
const konamiCode = [
  'ArrowUp',
  'ArrowUp',
  'ArrowDown',
  'ArrowDown',
  'ArrowLeft',
  'ArrowRight',
  'ArrowLeft',
  'ArrowRight',
  'b',
  'a',
];
let konamiIndex = 0;

document.addEventListener('keydown', (e) => {
  if (e.key === konamiCode[konamiIndex]) {
    konamiIndex++;
    if (konamiIndex === konamiCode.length) {
      createConfetti();
      konamiIndex = 0;
    }
  } else {
    konamiIndex = 0;
  }
});

function createConfetti() {
  const colors = [
    '#FF6B6B',
    '#4ECDC4',
    '#FFD93D',
    '#f5576c',
    '#4facfe',
    '#00f2fe',
  ];

  for (let i = 0; i < 100; i++) {
    const confetti = document.createElement('div');
    confetti.style.position = 'fixed';
    confetti.style.width = '10px';
    confetti.style.height = '10px';
    confetti.style.backgroundColor =
      colors[Math.floor(Math.random() * colors.length)];
    confetti.style.left = Math.random() * 100 + '%';
    confetti.style.top = '-10px';
    confetti.style.borderRadius = '50%';
    confetti.style.pointerEvents = 'none';
    confetti.style.zIndex = '10000';
    document.body.appendChild(confetti);

    gsap.to(confetti, {
      y: window.innerHeight + 100,
      x: (Math.random() - 0.5) * 200,
      rotation: Math.random() * 720,
      duration: Math.random() * 2 + 1,
      ease: 'power1.out',
      onComplete: () => {
        confetti.remove();
      },
    });
  }
}

// Debug mode (development only)
// GSDevTools.create();
// ScrollTrigger.defaults({ markers: true });
