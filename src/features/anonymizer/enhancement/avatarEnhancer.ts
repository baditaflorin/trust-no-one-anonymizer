import { errorMessage } from '../../../shared/result';

export interface EnhancementSnapshot {
  dataUrl: string;
  generatedAt: Date;
  detail: string;
}

interface UpscalerLike {
  ready: Promise<void>;
  upscale(input: HTMLCanvasElement, options?: Record<string, unknown>): Promise<string>;
  dispose?: () => Promise<void> | void;
}

export class AvatarEnhancer {
  private upscaler: UpscalerLike | null = null;

  async enhance(canvas: HTMLCanvasElement): Promise<EnhancementSnapshot> {
    const upscaler = await this.load();
    const source = document.createElement('canvas');
    source.width = 240;
    source.height = 135;
    const context = source.getContext('2d');
    if (!context) throw new Error('Canvas context is unavailable.');

    context.drawImage(canvas, 0, 0, source.width, source.height);
    const dataUrl = await upscaler.upscale(source, {
      output: 'base64',
      patchSize: 64,
      padding: 4,
    });

    return {
      dataUrl,
      generatedAt: new Date(),
      detail: 'ESRGAN slim 2x browser super-resolution',
    };
  }

  async dispose(): Promise<void> {
    await this.upscaler?.dispose?.();
    this.upscaler = null;
  }

  private async load(): Promise<UpscalerLike> {
    if (this.upscaler) return this.upscaler;

    try {
      const [{ default: Upscaler }, { default: model }] = await Promise.all([
        import('upscaler'),
        import('@upscalerjs/esrgan-slim/2x'),
        import('@tensorflow/tfjs'),
      ]);
      this.upscaler = new Upscaler({ model }) as UpscalerLike;
      await this.upscaler.ready;
      return this.upscaler;
    } catch (error) {
      throw new Error(`Avatar enhancement failed to initialize: ${errorMessage(error)}`);
    }
  }
}
