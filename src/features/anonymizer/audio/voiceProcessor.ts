import { clamp } from '../../../shared/clamp';
import { errorMessage } from '../../../shared/result';
import { RnnoiseProcessor } from './rnnoiseProcessor';
import type { RnnoiseMetrics } from './rnnoiseProcessor';

export interface VoiceProcessorOptions {
  timbreShift: number;
  rnnoiseEnabled: boolean;
}

export interface VoiceProcessorStatus {
  rnnoiseActive: boolean;
  rnnoiseDetail: string;
  sampleRate: number;
  latencyMs: number;
}

export class VoiceProcessor {
  readonly outputStream: MediaStream;

  private readonly context: AudioContext;
  private readonly source: MediaStreamAudioSourceNode;
  private readonly highpass: BiquadFilterNode;
  private readonly lowpass: BiquadFilterNode;
  private readonly formantOne: BiquadFilterNode;
  private readonly formantTwo: BiquadFilterNode;
  private readonly shaper: WaveShaperNode;
  private readonly compressor: DynamicsCompressorNode;
  private readonly destination: MediaStreamAudioDestinationNode;
  private rnnoise: RnnoiseProcessor | null = null;
  private status: VoiceProcessorStatus;

  private constructor(
    context: AudioContext,
    source: MediaStreamAudioSourceNode,
    destination: MediaStreamAudioDestinationNode,
    highpass: BiquadFilterNode,
    lowpass: BiquadFilterNode,
    formantOne: BiquadFilterNode,
    formantTwo: BiquadFilterNode,
    shaper: WaveShaperNode,
    compressor: DynamicsCompressorNode,
    rnnoise: RnnoiseProcessor | null,
    status: VoiceProcessorStatus,
  ) {
    this.context = context;
    this.source = source;
    this.destination = destination;
    this.highpass = highpass;
    this.lowpass = lowpass;
    this.formantOne = formantOne;
    this.formantTwo = formantTwo;
    this.shaper = shaper;
    this.compressor = compressor;
    this.rnnoise = rnnoise;
    this.outputStream = destination.stream;
    this.status = status;
  }

  static async create(
    inputStream: MediaStream,
    options: VoiceProcessorOptions,
  ): Promise<VoiceProcessor> {
    const context = new AudioContext({ sampleRate: 48_000, latencyHint: 'interactive' });
    await context.resume();

    const source = context.createMediaStreamSource(inputStream);
    const destination = context.createMediaStreamDestination();
    const highpass = context.createBiquadFilter();
    const lowpass = context.createBiquadFilter();
    const formantOne = context.createBiquadFilter();
    const formantTwo = context.createBiquadFilter();
    const shaper = context.createWaveShaper();
    const compressor = context.createDynamicsCompressor();

    highpass.type = 'highpass';
    highpass.frequency.value = 90;
    lowpass.type = 'lowpass';
    lowpass.frequency.value = 7600;
    formantOne.type = 'peaking';
    formantOne.Q.value = 0.8;
    formantTwo.type = 'peaking';
    formantTwo.Q.value = 0.9;
    compressor.threshold.value = -22;
    compressor.knee.value = 18;
    compressor.ratio.value = 4;
    compressor.attack.value = 0.006;
    compressor.release.value = 0.12;

    let rnnoise: RnnoiseProcessor | null = null;
    let rnnoiseDetail = 'disabled';
    let entryNode: AudioNode = source;

    if (options.rnnoiseEnabled) {
      try {
        const { createRNNWasmModuleSync } = await import('@jitsi/rnnoise-wasm');
        rnnoise = new RnnoiseProcessor(createRNNWasmModuleSync(), context);
        source.connect(rnnoise.node);
        entryNode = rnnoise.node;
        rnnoiseDetail = 'active';
      } catch (error) {
        rnnoiseDetail = `fallback: ${errorMessage(error)}`;
      }
    }

    entryNode.connect(highpass);
    highpass.connect(formantOne);
    formantOne.connect(formantTwo);
    formantTwo.connect(lowpass);
    lowpass.connect(shaper);
    shaper.connect(compressor);
    compressor.connect(destination);

    const processor = new VoiceProcessor(
      context,
      source,
      destination,
      highpass,
      lowpass,
      formantOne,
      formantTwo,
      shaper,
      compressor,
      rnnoise,
      {
        rnnoiseActive: rnnoise !== null,
        rnnoiseDetail,
        sampleRate: context.sampleRate,
        latencyMs: Math.round(context.baseLatency * 1000),
      },
    );

    processor.updateTimbre(options.timbreShift);
    return processor;
  }

  updateTimbre(timbreShift: number): void {
    const shift = clamp(timbreShift, -100, 100) / 100;
    this.formantOne.frequency.value = 560 + shift * 220;
    this.formantOne.gain.value = 6 + Math.abs(shift) * 8;
    this.formantTwo.frequency.value = 1480 + shift * 520;
    this.formantTwo.gain.value = shift > 0 ? -5 : 5;
    this.lowpass.frequency.value = 6800 - Math.abs(shift) * 1600;
    this.highpass.frequency.value = 85 + Math.abs(shift) * 45;
    this.shaper.curve = createTimbreCurve(0.12 + Math.abs(shift) * 0.2);
  }

  getStatus(): VoiceProcessorStatus {
    return this.status;
  }

  getRnnoiseMetrics(): RnnoiseMetrics | null {
    return this.rnnoise?.metrics() ?? null;
  }

  async dispose(): Promise<void> {
    this.source.disconnect();
    this.highpass.disconnect();
    this.lowpass.disconnect();
    this.formantOne.disconnect();
    this.formantTwo.disconnect();
    this.shaper.disconnect();
    this.compressor.disconnect();
    this.destination.disconnect();
    this.rnnoise?.dispose();
    await this.context.close();
  }
}

function createTimbreCurve(amount: number): Float32Array<ArrayBuffer> {
  const samples = 2048;
  const curve = new Float32Array(new ArrayBuffer(samples * Float32Array.BYTES_PER_ELEMENT));
  for (let index = 0; index < samples; index += 1) {
    const x = (index * 2) / samples - 1;
    curve[index] = ((1 + amount) * x) / (1 + amount * Math.abs(x));
  }
  return curve as Float32Array<ArrayBuffer>;
}
