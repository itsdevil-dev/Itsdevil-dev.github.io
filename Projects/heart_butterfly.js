class ClickParticle {
  constructor(type, dispersion, velocity, container) {
    const { graphicsContext, cursor } = container;
    this.graphicsContext = graphicsContext;
    this.x = cursor.x;
    this.y = cursor.y;
    this.type = type;

    if (type === "heart") {
      this.dimension = Math.random() * 4 + 2;
      this.shrinkRate = 0.02;
      this.velocity = velocity * 0.1;
      this.dispersion = dispersion * this.velocity;
      this.dispersionX = (Math.random() - 0.5) * this.dispersion;
      this.dispersionY = (Math.random() - 0.5) * this.dispersion;
      this.color = `hsl(${Math.random() * 60 + 300}, 100%, 60%)`; // Pinkish-red
    } else if (type === "butterfly") {
      this.dimension = Math.random() * 8 + 5; // Different sizes
      this.shrinkRate = 0.01;
      this.dispersionX = (Math.random() - 0.5) * 2;
      this.dispersionY = (Math.random() - 0.5) * 1.5;
      this.opacity = 1;
    }
  }

  drawHeart() {
    const ctx = this.graphicsContext;
    const { x, y, dimension, color } = this;
    ctx.beginPath();
    ctx.fillStyle = color;
    ctx.shadowColor = color;
    ctx.shadowBlur = 8;

    ctx.moveTo(x, y);
    ctx.bezierCurveTo(x - dimension, y - dimension, x - dimension * 2, y + dimension, x, y + dimension * 2);
    ctx.bezierCurveTo(x + dimension * 2, y + dimension, x + dimension, y - dimension, x, y);
    ctx.fill();
  }

  drawButterfly() {
    const ctx = this.graphicsContext;
    const { x, y, dimension, opacity } = this;

    ctx.save();
    ctx.globalAlpha = opacity;
    ctx.fillStyle = `hsl(${Math.random() * 60 + 200}, 100%, 70%)`; // Blueish color
    ctx.beginPath();

    ctx.ellipse(x, y, dimension / 2, dimension, Math.PI / 4, 0, 2 * Math.PI); // Wing 1
    ctx.ellipse(x - dimension / 2, y, dimension / 2, dimension, -Math.PI / 4, 0, 2 * Math.PI); // Wing 2

    ctx.fill();
    ctx.restore();
  }

  render() {
    if (this.type === "heart") {
      this.drawHeart();
    } else if (this.type === "butterfly") {
      this.drawButterfly();
    }
  }

  shrink() {
    this.dimension -= this.shrinkRate;
    if (this.type === "butterfly") this.opacity -= 0.01;
  }

  drift() {
    this.x += this.dispersionX * this.dimension;
    this.y += this.dispersionY * this.dimension;
  }

  refresh() {
    this.render();
    this.drift();
    this.shrink();
  }
}

class ClickHeartsButterfliesAnimation extends HTMLElement {
  static register(tag = "click-hearts-butterflies") {
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
    this.cursor = { x: 0, y: 0 };
  }

  connectedCallback() {
    const canvas = document.createElement("canvas");
    const styleSheet = new CSSStyleSheet();

    this.shadowRootInstance = this.attachShadow({ mode: "open" });
    styleSheet.replaceSync(ClickHeartsButterfliesAnimation.style);
    this.shadowRootInstance.adoptedStyleSheets = [styleSheet];
    this.shadowRootInstance.append(canvas);

    this.canvasElement = this.shadowRootInstance.querySelector("canvas");
    this.graphicsContext = this.canvasElement.getContext("2d");
    this.adjustCanvasSize();
    this.initializeEvents();
    requestAnimationFrame(() => this.animateMotion());
  }

  generateParticles(event) {
    this.updateCursorPosition(event);

    for (let i = 0; i < 50; i++) {
      this.particleArray.push(new ClickParticle("heart", 50, 2, this));
    }
    for (let i = 0; i < 10; i++) {
      this.particleArray.push(new ClickParticle("butterfly", 50, 2, this));
    }
  }

  updateCursorPosition(event) {
    const rect = this.canvasElement.getBoundingClientRect();
    this.cursor.x = event.clientX - rect.left;
    this.cursor.y = event.clientY - rect.top;
  }

  initializeEvents() {
    window.addEventListener("click", (event) => this.generateParticles(event));
    window.addEventListener("resize", () => this.adjustCanvasSize());
  }

  manageParticles() {
    for (let i = 0; i < this.particleArray.length; i++) {
      this.particleArray[i].refresh();

      if (this.particleArray[i].dimension <= 0.1 || this.particleArray[i].opacity <= 0) {
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

ClickHeartsButterfliesAnimation.register();