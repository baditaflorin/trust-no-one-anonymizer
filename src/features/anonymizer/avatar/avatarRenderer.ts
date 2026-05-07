import { clamp, lerp } from '../../../shared/clamp';
import type { FaceExpression } from '../face/expression';
import { neutralExpression, smoothExpression } from '../face/expression';
import { createAvatarStyle } from './seededAvatar';
import type { AvatarStyle } from './seededAvatar';

export interface AvatarMetrics {
  fps: number;
  frameCount: number;
}

export class AvatarRenderer {
  private style: AvatarStyle;
  private expression: FaceExpression = neutralExpression;
  private lastFrameAt = 0;
  private frameCount = 0;
  private fps = 0;
  private fpsWindowStart = performance.now();

  constructor(
    private readonly canvas: HTMLCanvasElement,
    seed: string,
  ) {
    this.style = createAvatarStyle(seed);
  }

  setSeed(seed: string): void {
    this.style = createAvatarStyle(seed);
  }

  render(nextExpression: FaceExpression, timestamp = performance.now()): AvatarMetrics {
    const context = this.canvas.getContext('2d');
    if (!context) throw new Error('2D canvas is not available.');

    this.resizeCanvas();
    this.expression = smoothExpression(this.expression, nextExpression, 0.42);
    this.draw(context, timestamp);
    this.updateFps(timestamp);
    return { fps: this.fps, frameCount: this.frameCount };
  }

  private resizeCanvas(): void {
    const width = this.canvas.clientWidth || 1280;
    const height = this.canvas.clientHeight || 720;
    const ratio = window.devicePixelRatio || 1;
    const nextWidth = Math.max(640, Math.round(width * ratio));
    const nextHeight = Math.max(360, Math.round(height * ratio));

    if (this.canvas.width !== nextWidth || this.canvas.height !== nextHeight) {
      this.canvas.width = nextWidth;
      this.canvas.height = nextHeight;
    }
  }

  private draw(context: CanvasRenderingContext2D, timestamp: number): void {
    const { width, height } = this.canvas;
    const unit = Math.min(width, height);
    const centerX = width / 2 + this.expression.headYaw * unit * 0.08;
    const centerY = height * 0.52 + this.expression.headPitch * unit * 0.08;
    const roll = this.expression.headRoll * 0.7;

    context.clearRect(0, 0, width, height);
    this.drawBackdrop(context, width, height, timestamp);
    context.save();
    context.translate(centerX, centerY);
    context.rotate(roll);
    this.drawBody(context, unit);
    this.drawHead(context, unit);
    this.drawHair(context, unit);
    this.drawFace(context, unit);
    context.restore();
    this.drawPrivacyFrame(context, width, height);
  }

  private drawBackdrop(
    context: CanvasRenderingContext2D,
    width: number,
    height: number,
    timestamp: number,
  ): void {
    const gradient = context.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, '#0f1820');
    gradient.addColorStop(0.45, '#183241');
    gradient.addColorStop(1, '#15251e');
    context.fillStyle = gradient;
    context.fillRect(0, 0, width, height);

    context.save();
    context.globalAlpha = 0.26;
    context.strokeStyle = this.style.accent;
    context.lineWidth = Math.max(1, width * 0.0015);
    const gap = Math.max(46, width * 0.055);
    const offset = (timestamp * 0.012) % gap;
    for (let x = -gap; x < width + gap; x += gap) {
      context.beginPath();
      context.moveTo(x + offset, 0);
      context.lineTo(x - height * 0.3 + offset, height);
      context.stroke();
    }
    context.restore();
  }

  private drawBody(context: CanvasRenderingContext2D, unit: number): void {
    context.fillStyle = this.style.shirt;
    roundedPath(context, -unit * 0.36, unit * 0.22, unit * 0.72, unit * 0.46, unit * 0.12);
    context.fill();

    context.fillStyle = this.style.accent;
    context.globalAlpha = 0.9;
    roundedPath(context, -unit * 0.1, unit * 0.24, unit * 0.2, unit * 0.16, unit * 0.04);
    context.fill();
    context.globalAlpha = 1;
  }

  private drawHead(context: CanvasRenderingContext2D, unit: number): void {
    context.fillStyle = this.style.skin;
    context.beginPath();
    context.ellipse(
      0,
      -unit * 0.08,
      unit * 0.22 * this.style.faceWidth,
      unit * 0.29 * this.style.faceHeight,
      0,
      0,
      Math.PI * 2,
    );
    context.fill();

    context.strokeStyle = 'rgba(16, 24, 32, 0.35)';
    context.lineWidth = unit * 0.012;
    context.stroke();
  }

  private drawHair(context: CanvasRenderingContext2D, unit: number): void {
    context.fillStyle = this.style.hair;
    context.beginPath();
    context.ellipse(0, -unit * 0.22, unit * 0.24, unit * 0.17, 0, Math.PI, Math.PI * 2);
    context.lineTo(unit * 0.22, -unit * 0.08);
    context.quadraticCurveTo(unit * 0.07, -unit * 0.18, -unit * 0.22, -unit * 0.08);
    context.closePath();
    context.fill();

    context.fillStyle = this.style.hair;
    for (let index = -3; index <= 3; index += 1) {
      const x = index * unit * 0.055;
      context.beginPath();
      context.ellipse(
        x,
        -unit * (0.22 + this.style.hairline * 0.12),
        unit * 0.055,
        unit * 0.09,
        index * 0.18,
        0,
        Math.PI * 2,
      );
      context.fill();
    }
  }

  private drawFace(context: CanvasRenderingContext2D, unit: number): void {
    const expression = this.expression;
    const eyeY =
      -unit * 0.1 - expression.browRaise * unit * 0.015 + expression.browDown * unit * 0.012;
    const eyeOffsetX = unit * 0.09;
    const blinkLeft = clamp(expression.eyeBlinkLeft, 0, 0.95);
    const blinkRight = clamp(expression.eyeBlinkRight, 0, 0.95);

    this.drawEye(context, -eyeOffsetX, eyeY, blinkLeft, unit);
    this.drawEye(context, eyeOffsetX, eyeY, blinkRight, unit);
    this.drawBrows(context, eyeY, unit);
    this.drawNose(context, unit);
    this.drawMouth(context, unit);
  }

  private drawEye(
    context: CanvasRenderingContext2D,
    x: number,
    y: number,
    blink: number,
    unit: number,
  ): void {
    const eyeHeight = unit * lerp(0.038, 0.006, blink);
    context.fillStyle = '#fffaf3';
    context.beginPath();
    context.ellipse(x, y, unit * 0.046, eyeHeight, 0, 0, Math.PI * 2);
    context.fill();

    context.fillStyle = this.style.iris;
    context.beginPath();
    context.arc(x + this.expression.headYaw * unit * 0.025, y, unit * 0.018, 0, Math.PI * 2);
    context.fill();

    context.fillStyle = '#111820';
    context.beginPath();
    context.arc(x + this.expression.headYaw * unit * 0.027, y, unit * 0.009, 0, Math.PI * 2);
    context.fill();
  }

  private drawBrows(context: CanvasRenderingContext2D, eyeY: number, unit: number): void {
    context.strokeStyle = this.style.hair;
    context.lineWidth = unit * 0.014;
    context.lineCap = 'round';
    const lift = this.expression.browRaise * unit * 0.035 - this.expression.browDown * unit * 0.02;

    for (const side of [-1, 1]) {
      context.beginPath();
      context.moveTo(side * unit * 0.055, eyeY - unit * 0.055 - lift);
      context.lineTo(
        side * unit * 0.135,
        eyeY - unit * 0.065 + side * this.expression.headRoll * unit * 0.018 - lift,
      );
      context.stroke();
    }
  }

  private drawNose(context: CanvasRenderingContext2D, unit: number): void {
    context.strokeStyle = 'rgba(74, 44, 34, 0.35)';
    context.lineWidth = unit * 0.01;
    context.lineCap = 'round';
    context.beginPath();
    context.moveTo(unit * 0.006 + this.expression.headYaw * unit * 0.035, -unit * 0.055);
    context.quadraticCurveTo(unit * 0.038, unit * 0.01, unit * 0.004, unit * 0.035);
    context.stroke();
  }

  private drawMouth(context: CanvasRenderingContext2D, unit: number): void {
    const smile = clamp(this.expression.smile, 0, 1);
    const open = clamp(this.expression.mouthOpen, 0, 1);
    const width = unit * lerp(0.1, 0.18, smile);
    const height = unit * lerp(0.014, 0.09, open);
    const y = unit * 0.095 + this.expression.jawForward * unit * 0.025;

    context.fillStyle = '#5b2228';
    context.beginPath();
    context.ellipse(0, y, width, height, 0, 0, Math.PI * 2);
    context.fill();

    context.strokeStyle = '#251115';
    context.lineWidth = unit * 0.011;
    context.lineCap = 'round';
    context.beginPath();
    context.moveTo(-width * 0.92, y - height * 0.2);
    context.quadraticCurveTo(0, y + smile * unit * 0.052, width * 0.92, y - height * 0.2);
    context.stroke();

    if (open < 0.2) return;
    context.fillStyle = '#f8e7dc';
    context.fillRect(-width * 0.55, y - height * 0.55, width * 1.1, height * 0.22);
  }

  private drawPrivacyFrame(context: CanvasRenderingContext2D, width: number, height: number): void {
    context.save();
    context.strokeStyle = 'rgba(110, 231, 183, 0.38)';
    context.lineWidth = Math.max(2, width * 0.003);
    context.strokeRect(width * 0.018, height * 0.03, width * 0.964, height * 0.94);
    context.fillStyle = 'rgba(15, 24, 32, 0.7)';
    roundedPath(
      context,
      width * 0.03,
      height * 0.055,
      width * 0.23,
      height * 0.055,
      height * 0.014,
    );
    context.fill();
    context.fillStyle = '#dffdf0';
    context.font = `${Math.max(14, width * 0.016)}px Inter, system-ui, sans-serif`;
    context.fillText('processed avatar feed', width * 0.045, height * 0.092);
    context.restore();
  }

  private updateFps(timestamp: number): void {
    this.frameCount += 1;
    this.lastFrameAt = timestamp;
    const elapsed = timestamp - this.fpsWindowStart;
    if (elapsed >= 500) {
      this.fps = Math.round((this.frameCount / elapsed) * 1000);
      this.frameCount = 0;
      this.fpsWindowStart = timestamp;
    }
  }
}

function roundedPath(
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
): void {
  const r = Math.min(radius, width / 2, height / 2);
  context.beginPath();
  context.moveTo(x + r, y);
  context.lineTo(x + width - r, y);
  context.quadraticCurveTo(x + width, y, x + width, y + r);
  context.lineTo(x + width, y + height - r);
  context.quadraticCurveTo(x + width, y + height, x + width - r, y + height);
  context.lineTo(x + r, y + height);
  context.quadraticCurveTo(x, y + height, x, y + height - r);
  context.lineTo(x, y + r);
  context.quadraticCurveTo(x, y, x + r, y);
  context.closePath();
}
