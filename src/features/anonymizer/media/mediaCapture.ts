export async function requestRawMedia(): Promise<MediaStream> {
  return navigator.mediaDevices.getUserMedia({
    video: {
      width: { ideal: 1280 },
      height: { ideal: 720 },
      frameRate: { ideal: 30, max: 60 },
      facingMode: 'user',
    },
    audio: {
      channelCount: { ideal: 1 },
      sampleRate: { ideal: 48_000 },
      echoCancellation: false,
      noiseSuppression: false,
      autoGainControl: false,
    },
  });
}

export function stopStream(stream: MediaStream | null): void {
  stream?.getTracks().forEach((track) => track.stop());
}

export function combineProcessedStream(
  videoCanvas: HTMLCanvasElement,
  audioStream: MediaStream,
): MediaStream {
  const canvasStream = videoCanvas.captureStream(30);
  const tracks = [...canvasStream.getVideoTracks(), ...audioStream.getAudioTracks()];
  return new MediaStream(tracks);
}
