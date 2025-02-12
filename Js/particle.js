class MotionParticle {
  constructor(x, y, velocity, container) {
    this.ctx = container.ctx;
    this.x = x;
    this.y = y;
    this.size = Math.random() * 2 + 1;
    this.opacity = 1;
    this.fadeSpeed = Math.random() * 0.01 + 0.005;
    this.dx = (Math.random() - 0.5) * velocity;
    this.dy = (Math.random() - 0.5) * velocity;

    const isYellow = Math.random() > 0.5;
    const brightness = Math.random() * 40 + 60;
    this.color = isYellow
      ? `hsla(50, 100%, ${brightness}%, ${this.opacity})`
      : `hsla(0, 0%, 100%, ${this.opacity})`;
  }

  drawStar(cx, cy, spikes, outerRadius, innerRadius) {
    const ctx = this.ctx;
    let angle = Math.PI / spikes;
    ctx.beginPath();
    for (let i = 0; i < 2 * spikes; i++) {
      const radius = i % 2 === 0 ? outerRadius : innerRadius;
      const x = cx + Math.cos(i * angle) * radius;
      const y = cy + Math.sin(i * angle) * radius;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.fillStyle = this.color;
    ctx.shadowColor = this.color;
    ctx.shadowBlur = 4;
    ctx.fill();
  }

  update() {
    this.x += this.dx;
    this.y += this.dy;
    this.opacity -= this.fadeSpeed;
    this.color = this.color.replace(/[\d.]+\)$/, `${this.opacity})`);
  }

  render() {
    this.drawStar(this.x, this.y, 5, this.size, this.size / 2);
  }

  refresh() {
    this.render();
    this.update();
  }
}

class MotionParticles extends HTMLElement {
  static register(tag = "motion-particles") {
    if ("customElements" in window) customElements.define(tag, this);
  }

  static style = `
    :host {
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      z-index: -1;
      pointer-events: none;
    }
    canvas {
      display: block;
    }
  `;

  constructor() {
    super();
    this.canvas = null;
    this.ctx = null;
    this.particles = [];
  }

  connectedCallback() {
    const canvas = document.createElement("canvas");
    const styleSheet = new CSSStyleSheet();
    this.shadowRootInstance = this.attachShadow({ mode: "open" });
    styleSheet.replaceSync(MotionParticles.style);
    this.shadowRootInstance.adoptedStyleSheets = [styleSheet];
    this.shadowRootInstance.append(canvas);
    this.canvas = this.shadowRootInstance.querySelector("canvas");
    this.ctx = this.canvas.getContext("2d");
    this.resizeCanvas();
    this.setupEvents();
    this.animate();
  }

  createParticles(x, y) {
    for (let i = 0; i < 3; i++) {
      const offsetX = (Math.random() - 0.5) * 15;
      const offsetY = (Math.random() - 0.5) * 15;
      this.particles.push(new MotionParticle(x + offsetX, y + offsetY, Math.random() * 1.5 + 0.5, this));
    }
  }

  setupEvents() {
    window.addEventListener("scroll", () => {
      const x = window.innerWidth / 2;
      const y = window.scrollY + window.innerHeight / 2;
      this.createParticles(x, y);
    });

    window.addEventListener("touchmove", (e) => {
      this.createParticles(e.touches[0].clientX, e.touches[0].clientY);
    });

    window.addEventListener("mousemove", (e) => {
      this.createParticles(e.clientX, e.clientY);
    });

    window.addEventListener("resize", () => this.resizeCanvas());
  }

  updateParticles() {
    for (let i = 0; i < this.particles.length; i++) {
      this.particles[i].refresh();
      if (this.particles[i].opacity <= 0.02) {
        this.particles.splice(i, 1);
        i--;
      }
    }
  }

  resizeCanvas() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  animate() {
    requestAnimationFrame(() => this.animate());
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.updateParticles();
  }
}

MotionParticles.register();