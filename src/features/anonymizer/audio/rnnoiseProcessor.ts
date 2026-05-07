import type { RnnoiseWasmModule } from '@jitsi/rnnoise-wasm';

const frameSize = 480;
const bytesPerFloat = 4;

export interface RnnoiseMetrics {
  vad: number;
  framesProcessed: number;
}

export class RnnoiseProcessor {
  readonly node: ScriptProcessorNode;

  private readonly state: number;
  private readonly inputPointer: number;
  private readonly outputPointer: number;
  private readonly inputQueue: number[] = [];
  private readonly outputQueue: number[] = [];
  private framesProcessed = 0;
  private vad = 0;

  constructor(
    private readonly module: RnnoiseWasmModule,
    context: AudioContext,
  ) {
    this.state = module._rnnoise_create();
    this.inputPointer = module._malloc(frameSize * bytesPerFloat);
    this.outputPointer = module._malloc(frameSize * bytesPerFloat);
    this.node = context.createScriptProcessor(2048, 1, 1);
    this.node.onaudioprocess = (event) => this.process(event);
  }

  metrics(): RnnoiseMetrics {
    return {
      vad: this.vad,
      framesProcessed: this.framesProcessed,
    };
  }

  dispose(): void {
    this.node.disconnect();
    this.node.onaudioprocess = null;
    this.module._rnnoise_destroy(this.state);
    this.module._free(this.inputPointer);
    this.module._free(this.outputPointer);
  }

  private process(event: AudioProcessingEvent): void {
    const input = event.inputBuffer.getChannelData(0);
    const output = event.outputBuffer.getChannelData(0);

    for (const sample of input) {
      this.inputQueue.push(sample);
    }

    while (this.inputQueue.length >= frameSize) {
      const frame = this.inputQueue.splice(0, frameSize);
      this.processFrame(frame);
    }

    for (let index = 0; index < output.length; index += 1) {
      output[index] = this.outputQueue.length > 0 ? (this.outputQueue.shift() ?? 0) : 0;
    }
  }

  private processFrame(frame: number[]): void {
    const heapOffset = this.inputPointer / bytesPerFloat;
    const inputHeap = this.module.HEAPF32.subarray(heapOffset, heapOffset + frameSize);

    for (let index = 0; index < frameSize; index += 1) {
      inputHeap[index] = (frame[index] ?? 0) * 32768;
    }

    const vad = this.module._rnnoise_process_frame(
      this.state,
      this.outputPointer,
      this.inputPointer,
    );
    const outputHeap = this.module.HEAPF32.subarray(
      this.outputPointer / bytesPerFloat,
      this.outputPointer / bytesPerFloat + frameSize,
    );

    for (let index = 0; index < frameSize; index += 1) {
      this.outputQueue.push(Math.max(-1, Math.min(1, (outputHeap[index] ?? 0) / 32768)));
    }

    this.framesProcessed += 1;
    this.vad = this.vad * 0.92 + vad * 0.08;
  }
}
