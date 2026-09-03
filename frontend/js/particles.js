/* ==========================================================================
   FUTUREPREDICT AI - BACKGROUND PARTICLE CANVAS NETWORK
   ========================================================================== */

(function () {
  const canvas = document.getElementById('particles-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let particles = [];
  let width, height;
  const particleCount = window.innerWidth < 768 ? 35 : 75;
  const maxDistance = 140;

  let mouse = {
    x: null,
    y: null,
    radius: 120
  };

  window.addEventListener('mousemove', function (e) {
    mouse.x = e.x;
    mouse.y = e.y;
  });

  window.addEventListener('mouseout', function () {
    mouse.x = null;
    mouse.y = null;
  });

  function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  }

  window.addEventListener('resize', () => {
    resize();
    initParticles();
  });

  class Particle {
    constructor() {
      this.x = Math.random() * width;
      this.y = Math.random() * height;
      this.size = Math.random() * 2 + 1;
      this.speedX = (Math.random() - 0.5) * 0.6;
      this.speedY = (Math.random() - 0.5) * 0.6;
      this.color = Math.random() > 0.4 ? 'rgba(99, 102, 241, ' : 'rgba(6, 182, 212, ';
      this.baseAlpha = Math.random() * 0.5 + 0.2;
    }

    update() {
      this.x += this.speedX;
      this.y += this.speedY;

      if (this.x > width) this.x = 0;
      else if (this.x < 0) this.x = width;

      if (this.y > height) this.y = 0;
      else if (this.y < 0) this.y = height;

      // Mouse interaction
      if (mouse.x != null && mouse.y != null) {
        let dx = mouse.x - this.x;
        let dy = mouse.y - this.y;
        let distance = Math.sqrt(dx * dx + dy * dy);
        if (distance < mouse.radius) {
          let force = (mouse.radius - distance) / mouse.radius;
          let directionX = dx / distance;
          let directionY = dy / distance;
          this.x -= directionX * force * 1.5;
          this.y -= directionY * force * 1.5;
        }
      }
    }

    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fillStyle = this.color + this.baseAlpha + ')';
      ctx.fill();
    }
  }

  function initParticles() {
    particles = [];
    for (let i = 0; i < particleCount; i++) {
      particles.push(new Particle());
    }
  }

  function connectParticles() {
    for (let a = 0; a < particles.length; a++) {
      for (let b = a + 1; b < particles.length; b++) {
        let dx = particles[a].x - particles[b].x;
        let dy = particles[a].y - particles[b].y;
        let distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < maxDistance) {
          let opacity = (1 - distance / maxDistance) * 0.25;
          ctx.beginPath();
          ctx.strokeStyle = `rgba(99, 102, 241, ${opacity})`;
          ctx.lineWidth = 1;
          ctx.moveTo(particles[a].x, particles[a].y);
          ctx.lineTo(particles[b].x, particles[b].y);
          ctx.stroke();
        }
      }
    }
  }

  function animate() {
    ctx.clearRect(0, 0, width, height);
    for (let i = 0; i < particles.length; i++) {
      particles[i].update();
      particles[i].draw();
    }
    connectParticles();
    requestAnimationFrame(animate);
  }

  resize();
  initParticles();
  animate();
})();
