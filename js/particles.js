/*
   APEX SKILLSPACE - PARTICLES SYSTEM
   Floating ambient dust particles in the background
*/

export function initParticles() {
    const particlesBg = document.getElementById('particles-bg');
    if (!particlesBg) return;

    // Create 30 floating particles
    for (let i = 0; i < 30; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        
        // Random position
        const x = Math.random() * 100;
        const y = Math.random() * 100;
        const size = Math.random() * 3 + 1;
        const duration = Math.random() * 20 + 15;
        const delay = Math.random() * 5;
        
        particle.style.left = x + '%';
        particle.style.top = y + '%';
        particle.style.width = size + 'px';
        particle.style.height = size + 'px';
        particle.style.animation = `float ${duration}s linear ${delay}s infinite`;
        
        particlesBg.appendChild(particle);
    }
    
    // Add floating animation styles
    if (!document.getElementById('particle-styles')) {
        const style = document.createElement('style');
        style.id = 'particle-styles';
        style.textContent = `
            @keyframes float {
                0% {
                    opacity: 0;
                    transform: translateY(0) translateX(0);
                }
                10% {
                    opacity: 1;
                }
                90% {
                    opacity: 1;
                }
                100% {
                    opacity: 0;
                    transform: translateY(-100vh) translateX(100px);
                }
            }
        `;
        document.head.appendChild(style);
    }
}
