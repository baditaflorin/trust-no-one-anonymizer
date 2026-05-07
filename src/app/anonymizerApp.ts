import {
  Camera,
  Check,
  Copy,
  Github,
  Heart,
  Radio,
  Reply,
  Shield,
  Sparkles,
  Square,
  createIcons,
} from 'lucide';
import { resolveBuildInfo } from '../shared/buildInfo';
import { errorMessage } from '../shared/result';
import { AvatarRenderer } from '../features/anonymizer/avatar/avatarRenderer';
import { AvatarEnhancer } from '../features/anonymizer/enhancement/avatarEnhancer';
import { MediaPipeFaceTracker } from '../features/anonymizer/face/mediapipeFaceTracker';
import { neutralExpression } from '../features/anonymizer/face/expression';
import type { FaceExpression } from '../features/anonymizer/face/expression';
import {
  combineProcessedStream,
  requestRawMedia,
  stopStream,
} from '../features/anonymizer/media/mediaCapture';
import { loadSettings, saveSettings } from '../features/anonymizer/settings/settings';
import type { AppSettings } from '../features/anonymizer/settings/settings';
import { VoiceProcessor } from '../features/anonymizer/audio/voiceProcessor';
import { ManualWebRtcSession } from '../features/anonymizer/webrtc/manualWebRtc';
import { renderAppShell } from './renderApp';

type StatusKind = 'idle' | 'active' | 'warn' | 'error';

interface StatusItem {
  label: string;
  kind: StatusKind;
  detail: string;
}

export class AnonymizerApp {
  private settings: AppSettings = loadSettings();
  private avatarRenderer: AvatarRenderer | null = null;
  private enhancer = new AvatarEnhancer();
  private faceTracker: MediaPipeFaceTracker | null = null;
  private rawStream: MediaStream | null = null;
  private processedStream: MediaStream | null = null;
  private voiceProcessor: VoiceProcessor | null = null;
  private animationFrame = 0;
  private lastExpression: FaceExpression = neutralExpression;
  private statusItems = new Map<string, StatusItem>();
  private readonly webrtc = new ManualWebRtcSession({
    onRemoteStream: (stream) => {
      this.remoteVideo.srcObject = stream;
      this.remoteVideo.classList.add('visible');
      this.setStatus('webrtc', 'active', 'WebRTC', 'remote stream connected');
    },
    onState: (state) =>
      this.setStatus('webrtc', state.includes('failed') ? 'error' : 'idle', 'WebRTC', state),
  });

  private root!: HTMLElement;
  private canvas!: HTMLCanvasElement;
  private rawVideo!: HTMLVideoElement;
  private remoteVideo!: HTMLVideoElement;
  private startButton!: HTMLButtonElement;
  private stopButton!: HTMLButtonElement;
  private enhanceButton!: HTMLButtonElement;
  private createOfferButton!: HTMLButtonElement;
  private createAnswerButton!: HTMLButtonElement;
  private acceptAnswerButton!: HTMLButtonElement;
  private copySignalButton!: HTMLButtonElement;
  private statusList!: HTMLElement;
  private toast!: HTMLElement;
  private avatarSeed!: HTMLInputElement;
  private timbreShift!: HTMLInputElement;
  private rnnoiseEnabled!: HTMLInputElement;
  private enhancementEnabled!: HTMLInputElement;
  private usePublicStun!: HTMLInputElement;
  private voiceMeter!: HTMLMeterElement;
  private localSignal!: HTMLTextAreaElement;
  private remoteSignal!: HTMLTextAreaElement;
  private enhancementFigure!: HTMLElement;
  private enhancementImage!: HTMLImageElement;
  private enhancementCaption!: HTMLElement;
  private buildInfo!: HTMLElement;
  private repoLink!: HTMLAnchorElement;
  private paypalLink!: HTMLAnchorElement;

  mount(root: HTMLElement): void {
    root.innerHTML = renderAppShell();
    this.root = root;
    this.bindElements();
    this.populateSettings();
    this.bindEvents();
    createIcons({
      icons: { Camera, Check, Copy, Github, Heart, Radio, Reply, Shield, Sparkles, Square },
    });
    this.avatarRenderer = new AvatarRenderer(this.canvas, this.settings.avatarSeed);
    this.avatarRenderer.render(neutralExpression);
    this.buildInfo.textContent = `Version ${__APP_VERSION__} · Commit ${__APP_COMMIT__}`;
    this.setStatus('media', 'idle', 'Media', 'waiting');
    this.setStatus('face', 'idle', 'MediaPipe', 'lazy');
    this.setStatus('audio', 'idle', 'Audio', 'waiting');
    this.setStatus('enhancement', 'idle', 'ESRGAN', 'lazy');
    this.setStatus('webrtc', 'idle', 'WebRTC', 'manual');
    void this.loadBuildInfo();
  }

  private bindElements(): void {
    this.canvas = this.required<HTMLCanvasElement>('avatarCanvas');
    this.rawVideo = this.required<HTMLVideoElement>('rawVideo');
    this.remoteVideo = this.required<HTMLVideoElement>('remoteVideo');
    this.startButton = this.required<HTMLButtonElement>('startButton');
    this.stopButton = this.required<HTMLButtonElement>('stopButton');
    this.enhanceButton = this.required<HTMLButtonElement>('enhanceButton');
    this.createOfferButton = this.required<HTMLButtonElement>('createOfferButton');
    this.createAnswerButton = this.required<HTMLButtonElement>('createAnswerButton');
    this.acceptAnswerButton = this.required<HTMLButtonElement>('acceptAnswerButton');
    this.copySignalButton = this.required<HTMLButtonElement>('copySignalButton');
    this.statusList = this.required<HTMLElement>('statusList');
    this.toast = this.required<HTMLElement>('toast');
    this.avatarSeed = this.required<HTMLInputElement>('avatarSeed');
    this.timbreShift = this.required<HTMLInputElement>('timbreShift');
    this.rnnoiseEnabled = this.required<HTMLInputElement>('rnnoiseEnabled');
    this.enhancementEnabled = this.required<HTMLInputElement>('enhancementEnabled');
    this.usePublicStun = this.required<HTMLInputElement>('usePublicStun');
    this.voiceMeter = this.required<HTMLMeterElement>('voiceMeter');
    this.localSignal = this.required<HTMLTextAreaElement>('localSignal');
    this.remoteSignal = this.required<HTMLTextAreaElement>('remoteSignal');
    this.enhancementFigure = this.required<HTMLElement>('enhancementFigure');
    this.enhancementImage = this.required<HTMLImageElement>('enhancementImage');
    this.enhancementCaption = this.required<HTMLElement>('enhancementCaption');
    this.buildInfo = this.required<HTMLElement>('buildInfo');
    this.repoLink = this.required<HTMLAnchorElement>('repoLink');
    this.paypalLink = this.required<HTMLAnchorElement>('paypalLink');
  }

  private populateSettings(): void {
    this.avatarSeed.value = this.settings.avatarSeed;
    this.timbreShift.value = String(this.settings.timbreShift);
    this.rnnoiseEnabled.checked = this.settings.rnnoiseEnabled;
    this.enhancementEnabled.checked = this.settings.enhancementEnabled;
    this.usePublicStun.checked = this.settings.usePublicStun;
  }

  private bindEvents(): void {
    this.startButton.addEventListener('click', () => void this.start());
    this.stopButton.addEventListener('click', () => void this.stop());
    this.avatarSeed.addEventListener('input', () => {
      this.settings.avatarSeed = this.avatarSeed.value.trim() || 'witness-001';
      this.avatarRenderer?.setSeed(this.settings.avatarSeed);
      saveSettings(this.settings);
    });
    this.timbreShift.addEventListener('input', () => {
      this.settings.timbreShift = Number(this.timbreShift.value);
      this.voiceProcessor?.updateTimbre(this.settings.timbreShift);
      saveSettings(this.settings);
    });
    this.rnnoiseEnabled.addEventListener('change', () => {
      this.settings.rnnoiseEnabled = this.rnnoiseEnabled.checked;
      saveSettings(this.settings);
    });
    this.enhancementEnabled.addEventListener('change', () => {
      this.settings.enhancementEnabled = this.enhancementEnabled.checked;
      saveSettings(this.settings);
    });
    this.usePublicStun.addEventListener('change', () => {
      this.settings.usePublicStun = this.usePublicStun.checked;
      saveSettings(this.settings);
    });
    this.enhanceButton.addEventListener('click', () => void this.enhanceSnapshot());
    this.createOfferButton.addEventListener('click', () => void this.createOffer());
    this.createAnswerButton.addEventListener('click', () => void this.createAnswer());
    this.acceptAnswerButton.addEventListener('click', () => void this.acceptAnswer());
    this.copySignalButton.addEventListener('click', () => void this.copyLocalSignal());
  }

  private async loadBuildInfo(): Promise<void> {
    const info = await resolveBuildInfo();
    this.buildInfo.textContent = `Version ${info.version} · Commit ${info.publishedCommit}`;
    this.buildInfo.title = `Compiled commit ${info.compiledCommit}`;
    this.repoLink.href = info.repoUrl;
    this.paypalLink.href = info.paypalUrl;
  }

  private async start(): Promise<void> {
    if (!navigator.mediaDevices?.getUserMedia) {
      this.fail('Media devices are unavailable in this browser.');
      return;
    }

    this.startButton.disabled = true;
    this.setStatus('media', 'idle', 'Media', 'requesting permission');

    try {
      this.rawStream = await requestRawMedia();
      this.rawVideo.srcObject = this.rawStream;
      await this.rawVideo.play();
      this.setStatus('media', 'active', 'Media', 'camera and mic active');

      this.voiceProcessor = await VoiceProcessor.create(this.rawStream, {
        timbreShift: this.settings.timbreShift,
        rnnoiseEnabled: this.settings.rnnoiseEnabled,
      });
      const audioStatus = this.voiceProcessor.getStatus();
      this.setStatus(
        'audio',
        'active',
        'Audio',
        `${audioStatus.sampleRate} Hz · ${audioStatus.latencyMs} ms · RNNoise ${audioStatus.rnnoiseDetail}`,
      );

      this.processedStream = combineProcessedStream(this.canvas, this.voiceProcessor.outputStream);
      this.enableCallControls(true);

      this.stopButton.disabled = false;
      this.enhanceButton.disabled = false;
      this.setStatus('face', 'idle', 'MediaPipe', 'loading');
      void this.loadFaceTracker();
      this.loop();
    } catch (error) {
      this.fail(`Start failed: ${errorMessage(error)}`);
      await this.stop();
    }
  }

  private async loadFaceTracker(): Promise<void> {
    try {
      this.faceTracker = await MediaPipeFaceTracker.create();
      this.setStatus('face', 'active', 'MediaPipe', 'face blendshapes active');
    } catch (error) {
      this.setStatus('face', 'warn', 'MediaPipe', `fallback avatar motion: ${errorMessage(error)}`);
    }
  }

  private loop(): void {
    const tick = (timestamp: number): void => {
      if (!this.rawStream || !this.avatarRenderer) return;

      try {
        if (this.faceTracker && this.rawVideo.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) {
          this.lastExpression = this.faceTracker.estimate(this.rawVideo, timestamp);
        } else {
          this.lastExpression = this.idleExpression(timestamp);
        }

        const metrics = this.avatarRenderer.render(this.lastExpression, timestamp);
        const rnnoiseMetrics = this.voiceProcessor?.getRnnoiseMetrics();
        this.voiceMeter.value = rnnoiseMetrics ? rnnoiseMetrics.vad : this.lastExpression.mouthOpen;
        if (metrics.fps > 0) {
          this.setStatus('render', 'active', 'Render', `${metrics.fps} FPS`);
        }
      } catch (error) {
        this.setStatus('render', 'error', 'Render', errorMessage(error));
      }

      this.animationFrame = window.requestAnimationFrame(tick);
    };

    this.animationFrame = window.requestAnimationFrame(tick);
  }

  private idleExpression(timestamp: number): FaceExpression {
    const pulse = Math.sin(timestamp / 420);
    return {
      ...neutralExpression,
      confidence: 0.25,
      browRaise: 0.18 + Math.max(0, pulse) * 0.08,
      mouthOpen: 0.035 + Math.max(0, Math.sin(timestamp / 270)) * 0.03,
      headYaw: Math.sin(timestamp / 1400) * 0.06,
      headRoll: Math.sin(timestamp / 2100) * 0.04,
    };
  }

  private async stop(): Promise<void> {
    window.cancelAnimationFrame(this.animationFrame);
    this.webrtc.close();
    this.faceTracker?.close();
    this.faceTracker = null;
    await this.voiceProcessor?.dispose();
    this.voiceProcessor = null;
    stopStream(this.rawStream);
    stopStream(this.processedStream);
    this.rawStream = null;
    this.processedStream = null;
    this.rawVideo.srcObject = null;
    this.remoteVideo.srcObject = null;
    this.remoteVideo.classList.remove('visible');
    this.startButton.disabled = false;
    this.stopButton.disabled = true;
    this.enhanceButton.disabled = true;
    this.enableCallControls(false);
    this.setStatus('media', 'idle', 'Media', 'stopped');
    this.setStatus('audio', 'idle', 'Audio', 'stopped');
    this.setStatus('face', 'idle', 'MediaPipe', 'lazy');
  }

  private async enhanceSnapshot(): Promise<void> {
    if (!this.settings.enhancementEnabled) {
      this.showToast('Enable ESRGAN snapshot enhancement first.');
      return;
    }

    this.enhanceButton.disabled = true;
    this.setStatus('enhancement', 'idle', 'ESRGAN', 'loading model');
    try {
      const snapshot = await this.enhancer.enhance(this.canvas);
      this.enhancementImage.src = snapshot.dataUrl;
      this.enhancementCaption.textContent = `${snapshot.detail} · ${snapshot.generatedAt.toLocaleTimeString()}`;
      this.enhancementFigure.classList.remove('hidden');
      this.setStatus('enhancement', 'active', 'ESRGAN', 'snapshot ready');
    } catch (error) {
      this.setStatus('enhancement', 'error', 'ESRGAN', errorMessage(error));
    } finally {
      this.enhanceButton.disabled = this.processedStream === null;
    }
  }

  private async createOffer(): Promise<void> {
    if (!this.processedStream) return;
    try {
      this.localSignal.value = await this.webrtc.createOffer(
        this.processedStream,
        this.settings.usePublicStun,
      );
      this.copySignalButton.disabled = false;
      this.setStatus('webrtc', 'idle', 'WebRTC', 'offer ready');
    } catch (error) {
      this.setStatus('webrtc', 'error', 'WebRTC', errorMessage(error));
    }
  }

  private async createAnswer(): Promise<void> {
    if (!this.processedStream) return;
    try {
      this.localSignal.value = await this.webrtc.acceptOfferAndCreateAnswer(
        this.remoteSignal.value,
        this.processedStream,
        this.settings.usePublicStun,
      );
      this.copySignalButton.disabled = false;
      this.setStatus('webrtc', 'idle', 'WebRTC', 'answer ready');
    } catch (error) {
      this.setStatus('webrtc', 'error', 'WebRTC', errorMessage(error));
    }
  }

  private async acceptAnswer(): Promise<void> {
    try {
      await this.webrtc.acceptAnswer(this.remoteSignal.value);
      this.setStatus('webrtc', 'active', 'WebRTC', 'answer accepted');
    } catch (error) {
      this.setStatus('webrtc', 'error', 'WebRTC', errorMessage(error));
    }
  }

  private async copyLocalSignal(): Promise<void> {
    await navigator.clipboard.writeText(this.localSignal.value);
    this.showToast('Local signal copied.');
  }

  private enableCallControls(enabled: boolean): void {
    this.createOfferButton.disabled = !enabled;
    this.createAnswerButton.disabled = !enabled;
    this.acceptAnswerButton.disabled = !enabled;
    this.copySignalButton.disabled = !enabled || this.localSignal.value.length === 0;
  }

  private setStatus(key: string, kind: StatusKind, label: string, detail: string): void {
    this.statusItems.set(key, { kind, label, detail });
    const nodes = [...this.statusItems.values()].map((item) => {
      const row = document.createElement('div');
      row.className = `status-item ${item.kind}`;
      const labelNode = document.createElement('span');
      labelNode.textContent = item.label;
      const detailNode = document.createElement('strong');
      detailNode.textContent = item.detail;
      row.append(labelNode, detailNode);
      return row;
    });
    this.statusList.replaceChildren(...nodes);
  }

  private fail(message: string): void {
    this.setStatus('app', 'error', 'App', message);
    this.showToast(message);
  }

  private showToast(message: string): void {
    this.toast.textContent = message;
    this.toast.classList.remove('hidden');
    window.setTimeout(() => this.toast.classList.add('hidden'), 3200);
  }

  private required<T extends HTMLElement>(id: string): T {
    const element = this.root.querySelector<T>(`#${id}`);
    if (!element) throw new Error(`Missing element #${id}`);
    return element;
  }
}
