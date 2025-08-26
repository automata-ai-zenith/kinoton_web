// Register ScrollTrigger plugin
gsap.registerPlugin(ScrollTrigger, TextPlugin);

// Smooth scroll behavior
ScrollTrigger.normalizeScroll(true);

// Progress bar animation
gsap.to('.progress-bar', {
    width: '100%',
    ease: 'none',
    scrollTrigger: {
        trigger: document.body,
        start: 'top top',
        end: 'bottom bottom',
        scrub: 0.3
    }
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
        dots.forEach(dot => dot.classList.remove('active'));
        if (dots[0]) dots[0].classList.add('active');
        return;
    }
    
    // Video section dots
    videoWrappers.forEach((wrapper, index) => {
        const rect = wrapper.getBoundingClientRect();
        const isInView = rect.top <= windowHeight / 2 && rect.bottom >= windowHeight / 2;
        
        if (isInView && dots[index + 1]) {
            dots.forEach(dot => dot.classList.remove('active'));
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

// Animated Background Parallax Effect
gsap.to('.animated-bg', {
    xPercent: -10,
    ease: 'none',
    scrollTrigger: {
        trigger: document.body,
        start: 'top top',
        end: 'bottom bottom',
        scrub: 1
    }
});

// Hero section animations
const heroTimeline = gsap.timeline();

// Logo fade in animation
heroTimeline
    .from('.hero-logo', {
        duration: 1.2,
        opacity: 0,
        y: -50,
        ease: 'power3.out'
    })
    .from('.hero-description', {
        duration: 1,
        opacity: 0,
        y: 30,
        ease: 'power2.out'
    }, '-=0.8')
    .from('.hero-slogan span', {
        duration: 1.2,
        opacity: 0,
        x: -100,
        ease: 'power3.out',
        stagger: {
            each: 0.2
        }
    }, '-=0.6');

// Parallax effect for hero elements on scroll
gsap.to('.hero-slogan', {
    yPercent: -30,
    opacity: 0,
    ease: 'none',
    scrollTrigger: {
        trigger: '.hero-section',
        start: 'top top',
        end: 'bottom top',
        scrub: 0.5
    }
});

gsap.to('.hero-description', {
    yPercent: -20,
    opacity: 0,
    ease: 'none',
    scrollTrigger: {
        trigger: '.hero-section',
        start: 'top top',
        end: '80% top',
        scrub: 0.3
    }
});

gsap.to('.hero-logo', {
    yPercent: -10,
    ease: 'none',
    scrollTrigger: {
        trigger: '.hero-section',
        start: 'top top',
        end: '50% top',
        scrub: 0.2
    }
});

// EXPANDING VIDEO ANIMATIONS - Core Feature
videoWrappers.forEach((wrapper, index) => {
    const box = wrapper.querySelector('.video-expand-box');
    const video = wrapper.querySelector('.expand-video');
    const content = wrapper.querySelector('.video-expand-content');
    const particles = wrapper.querySelectorAll('.video-particles span');
    const position = wrapper.dataset.position;
    
    // All videos start from center (no horizontal offset)
    gsap.set(box, {
        scale: 0.5,
        x: 0, // Always center
        opacity: 0
    });
    
    // Pin each video wrapper
    ScrollTrigger.create({
        trigger: wrapper,
        start: 'top top',
        end: 'bottom top',
        pin: true,
        pinSpacing: false,
    });
    
    // Expanding animation timeline
    const expandTimeline = gsap.timeline({
        scrollTrigger: {
            trigger: wrapper,
            start: 'top 90%',
            end: 'bottom 10%',
            scrub: 1,
            onUpdate: self => {
                // Trigger particles at 50% progress
                if (self.progress > 0.45 && self.progress < 0.55) {
                    animateVideoParticles(particles);
                }
                
                // Auto-play video when in view
                if (self.progress > 0.2 && self.progress < 0.9) {
                    video.play().catch(e => console.log('Video play failed'));
                } else {
                    video.pause();
                }
            }
        }
    });
    
    // Build timeline based on scroll
    expandTimeline
        .to(box, {
            scale: 1,
            x: 0,
            opacity: 1,
            duration: 0.3,
            ease: 'power2.out'
        })
        .to(box, {
            width: '60vw',
            height: '50vh',
            borderRadius: 0,
            duration: 0.3,
            ease: 'power2.inOut'
        })
        .to(content, {
            opacity: 0,
            duration: 0.2
        }, '-=0.2')
        .to(box, {
            width: '90vw',
            height: '80vh',
            borderRadius: 0,
            duration: 0.3,
            ease: 'power2.inOut'
        })
        .to(box, {
            width: '100vw',
            height: '100vh',
            borderRadius: 0,
            duration: 0.4,
            ease: 'power2.inOut'
        });
});

// Particle animation function for videos
function animateVideoParticles(particles) {
    particles.forEach((particle, i) => {
        const angle = (i / particles.length) * Math.PI * 2;
        const distance = 200 + Math.random() * 150;
        const x = Math.cos(angle) * distance;
        const y = Math.sin(angle) * distance;
        
        gsap.fromTo(particle, {
            left: '50%',
            top: '50%',
            x: 0,
            y: 0,
            scale: 0,
            opacity: 1
        }, {
            x: x,
            y: y,
            scale: Math.random() * 4 + 1,
            opacity: 0,
            duration: 2,
            ease: 'power2.out',
            overwrite: true
        });
    });
}

// Video hover effects
document.querySelectorAll('.video-expand-box').forEach(box => {
    box.addEventListener('mouseenter', () => {
        if (!box.classList.contains('expanded')) {
            gsap.to(box, {
                scale: 1.05,
                duration: 0.3,
                ease: 'power2.out'
            });
        }
    });
    
    box.addEventListener('mouseleave', () => {
        if (!box.classList.contains('expanded')) {
            gsap.to(box, {
                scale: 1,
                duration: 0.3,
                ease: 'power2.out'
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
            const targetPosition = videoWrappers[0].offsetTop - window.innerHeight * 0.2;
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

// Enhanced background animation on mouse move
document.addEventListener('mousemove', (e) => {
    const mouseX = e.clientX / window.innerWidth;
    const mouseY = e.clientY / window.innerHeight;
    
    gsap.to('.animated-bg', {
        x: mouseX * 30 - 15,
        y: mouseY * 20 - 10,
        duration: 1.5,
        ease: 'power2.out'
    });
});

// Performance optimization - Refresh on resize
let resizeTimer;
window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
        ScrollTrigger.refresh();
        updateDots();
    }, 250);
});

// Initialize
gsap.set('body', { visibility: 'visible' });

// Easter egg - Konami code
const konamiCode = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];
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
    const colors = ['#FF6B6B', '#4ECDC4', '#FFD93D', '#f5576c', '#4facfe', '#00f2fe'];
    
    for (let i = 0; i < 100; i++) {
        const confetti = document.createElement('div');
        confetti.style.position = 'fixed';
        confetti.style.width = '10px';
        confetti.style.height = '10px';
        confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
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
            }
        });
    }
}

// Debug mode (development only)
// GSDevTools.create();
// ScrollTrigger.defaults({ markers: true });