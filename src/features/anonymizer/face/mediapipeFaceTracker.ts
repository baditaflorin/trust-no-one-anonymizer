import { applyHeadPose, expressionFromBlendshapes, neutralExpression } from './expression';
import type { BlendshapeCategory, FaceExpression } from './expression';

const wasmBase = 'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.35/wasm';
const modelUrl =
  'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/latest/face_landmarker.task';

interface FaceLandmarkerLike {
  detectForVideo(video: HTMLVideoElement, timestampMs: number): FaceLandmarkerResult;
  close(): void;
}

interface FaceLandmarkerResult {
  faceBlendshapes?: Array<{ categories: BlendshapeCategory[] }>;
  facialTransformationMatrixes?: Array<{ data: number[] }>;
}

export class MediaPipeFaceTracker {
  private expression: FaceExpression = neutralExpression;

  private constructor(private readonly landmarker: FaceLandmarkerLike) {}

  static async create(): Promise<MediaPipeFaceTracker> {
    const vision = await import('@mediapipe/tasks-vision');
    const filesetResolver = await vision.FilesetResolver.forVisionTasks(wasmBase);
    const landmarker = (await vision.FaceLandmarker.createFromOptions(filesetResolver, {
      baseOptions: {
        modelAssetPath: modelUrl,
        delegate: 'GPU',
      },
      runningMode: 'VIDEO',
      outputFaceBlendshapes: true,
      outputFacialTransformationMatrixes: true,
      numFaces: 1,
    })) as FaceLandmarkerLike;

    return new MediaPipeFaceTracker(landmarker);
  }

  estimate(video: HTMLVideoElement, timestampMs: number): FaceExpression {
    const result = this.landmarker.detectForVideo(video, timestampMs);
    const categories = result.faceBlendshapes?.[0]?.categories ?? [];
    const matrix = result.facialTransformationMatrixes?.[0]?.data;
    this.expression = applyHeadPose(expressionFromBlendshapes(categories, this.expression), matrix);
    return this.expression;
  }

  close(): void {
    this.landmarker.close();
  }
}
