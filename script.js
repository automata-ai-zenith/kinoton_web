// Register ScrollTrigger plugin
gsap.registerPlugin(ScrollTrigger, TextPlugin);

// Smooth scroll for better experience
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

// Navigation dots
const updateDots = () => {
    const scrollPosition = window.scrollY;
    const windowHeight = window.innerHeight;
    const currentSection = Math.floor(scrollPosition / windowHeight);
    
    document.querySelectorAll('.dot').forEach((dot, index) => {
        dot.classList.toggle('active', index === currentSection);
    });
};

window.addEventListener('scroll', updateDots);

document.querySelectorAll('.dot').forEach((dot, index) => {
    dot.addEventListener('click', () => {
        const targetSection = index * window.innerHeight;
        window.scrollTo({ top: targetSection, behavior: 'smooth' });
    });
});

// Hero section animations
const heroTimeline = gsap.timeline();

heroTimeline
    .from('.hero-title .word', {
        duration: 1.2,
        opacity: 0,
        scale: 0.3,
        y: 80,
        rotationX: -90,
        transformOrigin: '50% 50% -50',
        ease: 'back.out(1.7)',
        stagger: 0.2
    })
    .from('.hero-subtitle', {
        duration: 0.8,
        opacity: 0,
        y: 30,
        ease: 'power2.out'
    }, '-=0.5')
    .from('.scroll-indicator', {
        duration: 0.8,
        opacity: 0,
        y: 30,
        ease: 'power2.out'
    }, '-=0.3');

// Parallax effect for hero
gsap.to('.hero-content', {
    yPercent: -50,
    opacity: 0,
    ease: 'none',
    scrollTrigger: {
        trigger: '.hero-section',
        start: 'top top',
        end: 'bottom top',
        scrub: 0.5
    }
});

// EXPANDING BOX SECTION - The main feature requested
const expandSection = document.querySelector('.expand-section');
const expandBox = document.querySelector('.expand-box');

ScrollTrigger.create({
    trigger: expandSection,
    start: 'top top',
    end: 'bottom bottom',
    pin: '.expand-container',
    pinSpacing: false,
});

const expandTimeline = gsap.timeline({
    scrollTrigger: {
        trigger: expandSection,
        start: 'top top',
        end: 'bottom top',
        scrub: 1,
        onUpdate: self => {
            // Add particle effects based on progress
            if (self.progress > 0.5 && self.progress < 0.6) {
                animateParticles();
            }
        }
    }
});

expandTimeline
    .to(expandBox, {
        width: '100vw',
        height: '100vh',
        borderRadius: 0,
        duration: 1,
        ease: 'power2.inOut'
    })
    .to('.expand-content h2', {
        fontSize: '4rem',
        duration: 0.5
    }, '-=0.5')
    .to('.expand-content p', {
        opacity: 1,
        fontSize: '1.5rem',
        duration: 0.3
    }, '-=0.3');

// Particle animation function
function animateParticles() {
    const particles = document.querySelectorAll('.particles span');
    particles.forEach((particle, i) => {
        const angle = (i / particles.length) * Math.PI * 2;
        const distance = 200 + Math.random() * 100;
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
            scale: Math.random() * 2 + 1,
            opacity: 0,
            duration: 1.5,
            ease: 'power2.out',
            overwrite: true
        });
    });
}

// Parallax layers animation
document.querySelectorAll('[data-speed]').forEach(element => {
    const speed = parseFloat(element.dataset.speed);
    gsap.to(element, {
        yPercent: -100 * speed,
        ease: 'none',
        scrollTrigger: {
            trigger: '.parallax-section',
            start: 'top bottom',
            end: 'bottom top',
            scrub: 0.5
        }
    });
});

// Floating cards rotation
document.querySelectorAll('.card').forEach(card => {
    const rotation = parseFloat(card.dataset.rotate) || 0;
    
    gsap.fromTo(card, {
        opacity: 0,
        scale: 0.8,
        rotation: -rotation
    }, {
        opacity: 1,
        scale: 1,
        rotation: rotation,
        duration: 1.5,
        ease: 'back.out(1.7)',
        scrollTrigger: {
            trigger: card,
            start: 'top 80%',
            end: 'top 20%',
            scrub: 1,
            toggleActions: 'play reverse play reverse'
        }
    });
});

// Text reveal animation
const splitTextTimeline = gsap.timeline({
    scrollTrigger: {
        trigger: '.text-reveal-section',
        start: 'top 70%',
        end: 'top 20%',
        scrub: 1
    }
});

splitTextTimeline.to('.split-text span', {
    opacity: 1,
    y: 0,
    rotationX: 0,
    stagger: 0.1,
    duration: 0.8,
    ease: 'power2.out'
});

// Stagger list animation
gsap.to('.stagger-item', {
    opacity: 1,
    x: 0,
    duration: 0.8,
    stagger: 0.15,
    ease: 'power3.out',
    scrollTrigger: {
        trigger: '.stagger-list',
        start: 'top 80%',
        toggleActions: 'play none none reverse'
    }
});

// HORIZONTAL SCROLL SECTION
const horizontalSection = document.querySelector('.horizontal-section');
const horizontalContainer = document.querySelector('.horizontal-container');
const panels = gsap.utils.toArray('.panel');

gsap.to(horizontalContainer, {
    x: () => -(horizontalContainer.scrollWidth - window.innerWidth),
    ease: 'none',
    scrollTrigger: {
        trigger: horizontalSection,
        start: 'top top',
        end: () => `+=${horizontalContainer.scrollWidth - window.innerWidth}`,
        scrub: 1,
        pin: true,
        anticipatePin: 1,
        invalidateOnRefresh: true,
        onUpdate: self => {
            // Animate panel icons based on progress
            const currentPanel = Math.floor(self.progress * panels.length);
            panels.forEach((panel, i) => {
                const icon = panel.querySelector('.panel-icon');
                if (icon) {
                    if (i === currentPanel) {
                        gsap.to(icon, {
                            scale: 1.2,
                            rotation: 360,
                            duration: 0.5
                        });
                    } else {
                        gsap.to(icon, {
                            scale: 1,
                            rotation: 0,
                            duration: 0.5
                        });
                    }
                }
            });
        }
    }
});

// 3D Flip cards animation
const flipCards = document.querySelectorAll('.flip-card');

flipCards.forEach(card => {
    const tl = gsap.timeline({
        scrollTrigger: {
            trigger: card,
            start: 'top 70%',
            end: 'top 30%',
            scrub: 1
        }
    });
    
    tl.to(card, {
        rotationY: 180,
        duration: 1,
        ease: 'power2.inOut'
    });
    
    // Add hover effect
    card.addEventListener('mouseenter', () => {
        gsap.to(card, {
            scale: 1.05,
            duration: 0.3,
            ease: 'power2.out'
        });
    });
    
    card.addEventListener('mouseleave', () => {
        gsap.to(card, {
            scale: 1,
            duration: 0.3,
            ease: 'power2.out'
        });
    });
});

// Morphing SVG shape
const morphPath = document.querySelector('.morph-path');
const shapes = [
    'M400,100 C600,100 700,200 700,300 C700,400 600,500 400,500 C200,500 100,400 100,300 C100,200 200,100 400,100',
    'M400,50 L500,150 L550,300 L400,450 L250,300 L300,150 Z',
    'M400,100 Q600,200 500,400 Q400,500 300,400 Q200,300 300,100 Q400,50 400,100',
    'M200,300 C200,150 350,50 500,150 C650,250 650,450 500,450 C350,450 200,350 200,300'
];

let currentShape = 0;

gsap.set(morphPath, { attr: { d: shapes[0] } });

ScrollTrigger.create({
    trigger: '.morph-section',
    start: 'top center',
    end: 'bottom center',
    onUpdate: self => {
        const progress = self.progress;
        const shapeIndex = Math.floor(progress * shapes.length);
        if (shapeIndex !== currentShape && shapeIndex < shapes.length) {
            currentShape = shapeIndex;
            gsap.to(morphPath, {
                attr: { d: shapes[shapeIndex] },
                duration: 1,
                ease: 'power2.inOut'
            });
        }
    }
});

// CTA Section animations
const ctaTimeline = gsap.timeline({
    scrollTrigger: {
        trigger: '.cta-section',
        start: 'top 70%',
        toggleActions: 'play none none reverse'
    }
});

ctaTimeline
    .to('.cta-title .char', {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 0.8,
        stagger: 0.05,
        ease: 'back.out(1.7)'
    })
    .to('.cta-subtitle', {
        opacity: 0.8,
        duration: 0.8,
        ease: 'power2.out'
    }, '-=0.4')
    .to('.cta-button', {
        opacity: 1,
        scale: 1,
        duration: 0.8,
        ease: 'back.out(1.7)'
    }, '-=0.4');

// Restart button functionality
document.querySelector('.cta-button').addEventListener('click', () => {
    // Create confetti effect
    createConfetti();
    
    // Scroll to top after a delay
    setTimeout(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 1000);
});

function createConfetti() {
    const confettiContainer = document.querySelector('.confetti');
    const colors = ['#667eea', '#764ba2', '#f093fb', '#f5576c', '#4facfe', '#00f2fe', '#43e97b', '#38f9d7'];
    
    for (let i = 0; i < 100; i++) {
        const confettiPiece = document.createElement('div');
        confettiPiece.style.position = 'absolute';
        confettiPiece.style.width = '10px';
        confettiPiece.style.height = '10px';
        confettiPiece.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        confettiPiece.style.left = Math.random() * 100 + '%';
        confettiPiece.style.top = '100%';
        confettiContainer.appendChild(confettiPiece);
        
        gsap.to(confettiPiece, {
            y: -(window.innerHeight + 100),
            x: (Math.random() - 0.5) * 200,
            rotation: Math.random() * 720,
            duration: Math.random() * 2 + 1,
            ease: 'power1.out',
            onComplete: () => {
                confettiPiece.remove();
            }
        });
    }
}

// Smooth snap scrolling for sections
ScrollTrigger.create({
    snap: {
        snapTo: 1 / 7, // 8 sections
        duration: { min: 0.5, max: 1 },
        delay: 0.1,
        ease: 'power1.inOut'
    }
});

// Refresh ScrollTrigger on resize
window.addEventListener('resize', () => {
    ScrollTrigger.refresh();
});

// Performance monitoring
ScrollTrigger.addEventListener('refresh', () => {
    console.log('ScrollTrigger refreshed');
});

// Batch animation for performance
ScrollTrigger.batch('.fade-in', {
    onEnter: batch => gsap.to(batch, {
        opacity: 1,
        y: 0,
        stagger: 0.15,
        overwrite: true
    }),
    onLeave: batch => gsap.to(batch, {
        opacity: 0,
        y: -100,
        stagger: 0.15,
        overwrite: true
    }),
    onEnterBack: batch => gsap.to(batch, {
        opacity: 1,
        y: 0,
        stagger: 0.15,
        overwrite: true
    }),
    onLeaveBack: batch => gsap.to(batch, {
        opacity: 0,
        y: 100,
        stagger: 0.15,
        overwrite: true
    })
});

// Initialize
gsap.set('body', { visibility: 'visible' });

// Debug mode (uncomment for development)
// GSDevTools.create();
// ScrollTrigger.defaults({ markers: true });