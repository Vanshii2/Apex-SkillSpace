/*
   ==========================================================================
   ANTIGRAVITY MOUSE-TRACKING PARTICLES (5D EFFECT)
   High-performance Vanilla JS particle system
   ==========================================================================
*/

export function initParticles() {
    const container = document.getElementById('particle-container');
    if (!container) return;

    const heroSection = container.parentElement;

    // Ensure parent has position relative to contain absolute particles
    const computedStyle = window.getComputedStyle(heroSection);
    if (computedStyle.position === 'static') {
        heroSection.style.position = 'relative';
    }

    // Set container to handle opacity transition
    container.style.transition = 'opacity 0.6s ease';
    container.style.opacity = '0';

    // Configuration
    const numParticles = 200; // Massively increased particle count
    const colors = ['#4285F4', '#b91d1dff', '#F4B400', '#eb45e5ff', '#39fc04ff']; // Blue, Purple, Orange, Pink
    const maxRadius = 400;
    const minRadius = 130;

    const particles = [];

    // State
    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let isMouseActive = false;

    // Track mouse
    heroSection.addEventListener('mousemove', (e) => {
        const rect = heroSection.getBoundingClientRect();
        mouseX = e.clientX - rect.left;
        mouseY = e.clientY - rect.top;

        if (!isMouseActive) {
            isMouseActive = true;
            container.style.opacity = '1';

            // Force particles to start far outside the screen so they fly inwards
            const centerX = heroSection.offsetWidth / 2;
            const centerY = heroSection.offsetHeight / 2;

            particles.forEach(p => {
                const spawnAngle = Math.random() * Math.PI * 2;
                // Spawn way outside the boundaries (e.g., 1500px away)
                const spawnDistance = Math.max(centerX, centerY) + 1000 + Math.random() * 1000;

                p.currentX = centerX + Math.cos(spawnAngle) * spawnDistance;
                p.currentY = centerY + Math.sin(spawnAngle) * spawnDistance;
            });
        }
    }, { passive: true });

    heroSection.addEventListener('mouseleave', () => {
        isMouseActive = false;
        container.style.opacity = '0';
    });

    // Create DOM elements
    const fragment = document.createDocumentFragment();

    for (let i = 0; i < numParticles; i++) {
        const p = document.createElement('div');
        p.className = 'particle';

        // Base height between 1.5px and 3.5px
        const baseSize = Math.random() * 2 + 0.5;
        // Make width slightly longer (2x - 4x height) to form a rounded rectangle
        const width = baseSize * (1.5 + Math.random() * 0.2);

        p.style.width = `${width}px`;
        p.style.height = `${baseSize}px`;

        // Random color for light mode
        const color = colors[Math.floor(Math.random() * colors.length)];
        p.style.setProperty('--light-color', color);

        p.style.left = `0px`;
        p.style.top = `0px`;

        fragment.appendChild(p);

        // Start somewhere in the ring
        const angle = Math.random() * Math.PI * 2;
        const distance = minRadius + Math.pow(Math.random(), 0.5) * (maxRadius - minRadius);

        // Initialize particle object with local wandering properties
        particles.push({
            el: p,
            localX: Math.cos(angle) * distance,
            localY: Math.sin(angle) * distance,
            vx: (Math.random() - 0.5) * 0.5, // Slower free roaming velocity
            vy: (Math.random() - 0.5) * 0.5,
            zPhase: Math.random() * Math.PI * 2, // Phase for 3D scale pulsing
            zSpeed: 0.005 + Math.random() * 0.01, // Slower pulsing
            // Even lower friction for extremely sluggish, ultra-lazy trailing
            friction: 0.002 + Math.random() * 0.008,
            rotation: Math.random() * 360, // Initial static rotation for the pill shape
            currentX: mouseX,
            currentY: mouseY
        });
    }

    container.appendChild(fragment);

    // Animation Loop
    function animate() {
        if (isMouseActive) {
            particles.forEach(p => {
                // 1. Wander freely in local space (4D effect)
                p.localX += p.vx;
                p.localY += p.vy;
                p.zPhase += p.zSpeed;

                // 2. Constrain wandering to the radius (bounce off the walls of the invisible ring)
                const dist = Math.sqrt(p.localX * p.localX + p.localY * p.localY);
                if (dist > maxRadius) {
                    p.localX = (p.localX / dist) * maxRadius;
                    // Deflect velocity inward
                    p.vx += (0 - p.localX) * 0.001;
                    p.vy += (0 - p.localY) * 0.001;
                } else if (dist < minRadius) {
                    p.localX = (p.localX / dist) * minRadius;
                    // Deflect velocity outward
                    p.vx += p.localX * 0.005;
                    p.vy += p.localY * 0.005;
                }

                // Add slight random noise to velocity so they don't get stuck in perfect orbits
                p.vx += (Math.random() - 0.5) * 0.02;
                p.vy += (Math.random() - 0.5) * 0.02;

                // Cap max velocity
                const vMag = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
                if (vMag > 0.5) {
                    p.vx = (p.vx / vMag) * 0.5;
                    p.vy = (p.vy / vMag) * 0.5;
                }

                // 3. Calculate target position in world space based on mouse
                const targetX = mouseX + p.localX;
                const targetY = mouseY + p.localY;

                // 4. Interpolate current position towards target for smooth, EXTREMELY slow trailing
                // The low friction means when the mouse moves fast, the particles lag far behind and slowly catch up.
                p.currentX += (targetX - p.currentX) * p.friction;
                p.currentY += (targetY - p.currentY) * p.friction;

                // 5. Calculate "5D" depth scale based on zPhase
                const scale = 0.6 + (Math.sin(p.zPhase) * 0.4); // Pulses between 0.2 and 1.0
                const opacity = 0.2 + (Math.sin(p.zPhase) * 0.8); // Depth fade

                p.el.style.transform = `translate3d(${p.currentX}px, ${p.currentY}px, 0) scale(${scale}) rotate(${p.rotation}deg)`;
                p.el.style.opacity = Math.max(0.1, Math.min(1, opacity));
            });
        }

        requestAnimationFrame(animate);
    }

    requestAnimationFrame(animate);
}
