class MotionParticle {
  constructor(x, y, velocity, container) {
    this.graphicsContext = container.graphicsContext;
    this.x = x;
    this.y = y;
    this.dimension = Math.random() * 2 + 1; 
    this.opacity = 1;
    this.fadeRate = Math.random() * 0.01 + 0.005;
    this.driftX = (Math.random() - 0.5) * velocity; 
    this.driftY = (Math.random() - 0.5) * velocity;

    
    const isYellow = Math.random() > 0.5;
    const brightness = Math.random() * 40 + 60;
    this.shade = isYellow
      ? `hsla(50, 100%, ${brightness}%, ${this.opacity})`
      : `hsla(0, 0%, 100%, ${this.opacity})`;
  }

  drawStar(cx, cy, spikes, outerRadius, innerRadius) {
    const ctx = this.graphicsContext;
    let angle = Math.PI / spikes;
    ctx.beginPath();
    for (let i = 0; i < 2 * spikes; i++) {
      const r = i % 2 === 0 ? outerRadius : innerRadius;
      const x = cx + Math.cos(i * angle) * r;
      const y = cy + Math.sin(i * angle) * r;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.fillStyle = this.shade;
    ctx.shadowColor = this.shade;
    ctx.shadowBlur = 4;
    ctx.fill();
  }

  move() {
    this.x += this.driftX;
    this.y += this.driftY;
    this.opacity -= this.fadeRate; 
    this.shade = this.shade.replace(/[\d\.]+\)$/, `${this.opacity})`);
  }

  render() {
    this.drawStar(this.x, this.y, 5, this.dimension, this.dimension / 2);
  }

  refresh() {
    this.render();
    this.move();
  }
}

class MotionParticles extends HTMLElement {
  static register(tag = "motion-particles") {
    if ("customElements" in window) {
      customElements.define(tag, this);
    }
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
    this.canvasElement;
    this.graphicsContext;
    this.particleArray = [];
  }

  connectedCallback() {
    const canvas = document.createElement("canvas");
    const styleSheet = new CSSStyleSheet();

    this.shadowRootInstance = this.attachShadow({ mode: "open" });

    styleSheet.replaceSync(MotionParticles.style);
    this.shadowRootInstance.adoptedStyleSheets = [styleSheet];

    this.shadowRootInstance.append(canvas);

    this.canvasElement = this.shadowRootInstance.querySelector("canvas");
    this.graphicsContext = this.canvasElement.getContext("2d");
    this.adjustCanvasSize();
    this.initializeEvents();
    this.animateMotion();
  }

  generateParticles(x, y) {
    for (let i = 0; i < 3; i++) { // Small number of stars
      const offsetX = (Math.random() - 0.5) * 15; // Random small spread
      const offsetY = (Math.random() - 0.5) * 15;
      this.particleArray.push(new MotionParticle(x + offsetX, y + offsetY, Math.random() * 1.5 + 0.5, this));
    }
  }

  initializeEvents() {
    window.addEventListener("scroll", () => {
      const x = window.innerWidth / 2; 
      const y = window.scrollY + window.innerHeight / 2;
      this.generateParticles(x, y);
    });

    window.addEventListener("touchmove", (event) => {
      const touch = event.touches[0];
      this.generateParticles(touch.clientX, touch.clientY);
    });

    window.addEventListener("mousemove", (event) => {
      this.generateParticles(event.clientX, event.clientY);
    });

    window.addEventListener("resize", () => this.adjustCanvasSize());
  }

  manageParticles() {
    for (let i = 0; i < this.particleArray.length; i++) {
      this.particleArray[i].refresh();

      if (this.particleArray[i].opacity <= 0.02) { 
        this.particleArray.splice(i, 1);
        i--;
      }
    }
  }

  adjustCanvasSize() {
    this.canvasElement.width = window.innerWidth;
    this.canvasElement.height = window.innerHeight;
  }

  animateMotion() {
    requestAnimationFrame(() => this.animateMotion());
    this.graphicsContext.clearRect(0, 0, this.canvasElement.width, this.canvasElement.height);
    this.manageParticles();
  }
}

MotionParticles.register();