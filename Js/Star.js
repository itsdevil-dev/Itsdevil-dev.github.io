class ClickStar {
  constructor(dispersion, velocity, container) {
    const { ctx, cursor } = container;
    this.ctx = ctx;
    this.x = cursor.x;
    this.y = cursor.y;
    this.size = Math.random() * 3 + 2;
    this.shrinkRate = 0.02;
    this.velocity = velocity * 0.1;
    this.dispersion = dispersion * this.velocity;
    this.dx = (Math.random() - 0.5) * this.dispersion;
    this.dy = (Math.random() - 0.5) * this.dispersion;

    const brightness = Math.random() * 50 + 50;
    this.color = `hsl(50, 100%, ${brightness}%)`;
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
    ctx.shadowBlur = 8;
    ctx.fill();
  }

  update() {
    this.x += this.dx * this.size;
    this.y += this.dy * this.size;
    this.size -= this.shrinkRate;
  }

  render() {
    this.drawStar(this.x, this.y, 5, this.size, this.size / 2);
  }

  refresh() {
    this.render();
    this.update();
  }
}

class ClickStarsAnimation extends HTMLElement {
  static register(tag = "click-stars-animation") {
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
    this.cursor = { x: 0, y: 0 };
    this.frameRate = 60;
    this.frameDuration = 1000 / this.frameRate;
    this.prevTime = performance.now();
  }

  connectedCallback() {
    const canvas = document.createElement("canvas");
    const styleSheet = new CSSStyleSheet();
    this.shadowRootInstance = this.attachShadow({ mode: "open" });
    styleSheet.replaceSync(ClickStarsAnimation.style);
    this.shadowRootInstance.adoptedStyleSheets = [styleSheet];
    this.shadowRootInstance.append(canvas);
    this.canvas = this.shadowRootInstance.querySelector("canvas");
    this.ctx = this.canvas.getContext("2d");
    this.resizeCanvas();
    this.setupEvents();
    this.animate();
  }

  createParticles(event, { quantity, velocity, dispersion }) {
    this.updateCursor(event);
    for (let i = 0; i < quantity; i++) {
      this.particles.push(new ClickStar(dispersion, velocity, this));
    }
  }

  updateCursor(event) {
    const rect = this.canvas.getBoundingClientRect();
    this.cursor.x = event.clientX - rect.left;
    this.cursor.y = event.clientY - rect.top;
  }

  setupEvents() {
    window.addEventListener("click", (event) => {
      this.createParticles(event, {
        quantity: 80,
        velocity: Math.random() * 2 + 1,
        dispersion: Math.random() * 50 + 50,
      });
    });

    window.addEventListener("resize", () => this.resizeCanvas());
  }

  updateParticles() {
    for (let i = 0; i < this.particles.length; i++) {
      this.particles[i].refresh();
      if (this.particles[i].size <= 0.1) {
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

    const now = performance.now();
    if (now - this.prevTime < this.frameDuration) return;
    this.prevTime = now;

    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.updateParticles();
  }
}

ClickStarsAnimation.register();