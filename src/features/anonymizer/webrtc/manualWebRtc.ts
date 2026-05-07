import { errorMessage } from '../../../shared/result';

export interface ManualSignal {
  type: RTCSdpType;
  sdp: string;
}

export interface WebRtcSessionEvents {
  onRemoteStream: (stream: MediaStream) => void;
  onState: (state: string) => void;
}

export class ManualWebRtcSession {
  private peer: RTCPeerConnection | null = null;

  constructor(private readonly events: WebRtcSessionEvents) {}

  async createOffer(localStream: MediaStream, usePublicStun: boolean): Promise<string> {
    const peer = this.createPeer(usePublicStun);
    localStream.getTracks().forEach((track) => peer.addTrack(track, localStream));
    const offer = await peer.createOffer({
      offerToReceiveAudio: true,
      offerToReceiveVideo: true,
    });
    await peer.setLocalDescription(offer);
    await waitForIceGathering(peer);
    return encodeSignal(peer.localDescription);
  }

  async acceptOfferAndCreateAnswer(
    offerText: string,
    localStream: MediaStream,
    usePublicStun: boolean,
  ): Promise<string> {
    const peer = this.createPeer(usePublicStun);
    localStream.getTracks().forEach((track) => peer.addTrack(track, localStream));
    await peer.setRemoteDescription(decodeSignal(offerText));
    const answer = await peer.createAnswer();
    await peer.setLocalDescription(answer);
    await waitForIceGathering(peer);
    return encodeSignal(peer.localDescription);
  }

  async acceptAnswer(answerText: string): Promise<void> {
    if (!this.peer) throw new Error('Create an offer before accepting an answer.');
    await this.peer.setRemoteDescription(decodeSignal(answerText));
  }

  close(): void {
    this.peer?.close();
    this.peer = null;
    this.events.onState('closed');
  }

  private createPeer(usePublicStun: boolean): RTCPeerConnection {
    this.close();
    this.peer = new RTCPeerConnection({
      iceServers: usePublicStun ? [{ urls: 'stun:stun.l.google.com:19302' }] : [],
    });
    this.peer.ontrack = (event) => {
      const [stream] = event.streams;
      if (stream) this.events.onRemoteStream(stream);
    };
    this.peer.onconnectionstatechange = () => {
      this.events.onState(this.peer?.connectionState ?? 'closed');
    };
    this.peer.oniceconnectionstatechange = () => {
      this.events.onState(`ice ${this.peer?.iceConnectionState ?? 'closed'}`);
    };
    return this.peer;
  }
}

export function encodeSignal(
  description: RTCSessionDescription | RTCSessionDescriptionInit | null,
): string {
  if (!description?.type || !description.sdp) {
    throw new Error('WebRTC description is missing.');
  }
  return JSON.stringify(
    { type: description.type, sdp: description.sdp } satisfies ManualSignal,
    null,
    2,
  );
}

export function decodeSignal(text: string): RTCSessionDescriptionInit {
  try {
    const parsed = JSON.parse(text.trim()) as Partial<ManualSignal>;
    if ((parsed.type === 'offer' || parsed.type === 'answer') && parsed.sdp) {
      return { type: parsed.type, sdp: parsed.sdp };
    }
  } catch (error) {
    throw new Error(`Signal text must be JSON copied from this app: ${errorMessage(error)}`);
  }

  throw new Error('Signal JSON must include type and sdp.');
}

async function waitForIceGathering(peer: RTCPeerConnection): Promise<void> {
  if (peer.iceGatheringState === 'complete') return;

  await new Promise<void>((resolve) => {
    const timeout = window.setTimeout(resolve, 2500);
    peer.addEventListener('icegatheringstatechange', () => {
      if (peer.iceGatheringState === 'complete') {
        window.clearTimeout(timeout);
        resolve();
      }
    });
  });
}
