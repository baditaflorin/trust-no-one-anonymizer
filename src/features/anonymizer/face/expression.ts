import { clamp, lerp } from '../../../shared/clamp';

export interface FaceExpression {
  confidence: number;
  smile: number;
  mouthOpen: number;
  jawForward: number;
  eyeBlinkLeft: number;
  eyeBlinkRight: number;
  browRaise: number;
  browDown: number;
  headYaw: number;
  headPitch: number;
  headRoll: number;
}

export const neutralExpression: FaceExpression = {
  confidence: 0,
  smile: 0.08,
  mouthOpen: 0.03,
  jawForward: 0,
  eyeBlinkLeft: 0,
  eyeBlinkRight: 0,
  browRaise: 0.2,
  browDown: 0,
  headYaw: 0,
  headPitch: 0,
  headRoll: 0,
};

export interface BlendshapeCategory {
  categoryName: string;
  score: number;
}

export function expressionFromBlendshapes(
  categories: BlendshapeCategory[],
  previous: FaceExpression = neutralExpression,
): FaceExpression {
  const scores = new Map(categories.map((category) => [category.categoryName, category.score]));
  const value = (name: string): number => clamp(scores.get(name) ?? 0, 0, 1);
  const avg = (left: string, right: string): number => (value(left) + value(right)) / 2;

  const raw: FaceExpression = {
    confidence: categories.length > 0 ? 1 : 0,
    smile: avg('mouthSmileLeft', 'mouthSmileRight'),
    mouthOpen: Math.max(value('jawOpen'), value('mouthFunnel'), value('mouthPucker') * 0.65),
    jawForward: value('jawForward'),
    eyeBlinkLeft: value('eyeBlinkLeft'),
    eyeBlinkRight: value('eyeBlinkRight'),
    browRaise: avg('browOuterUpLeft', 'browOuterUpRight'),
    browDown: avg('browDownLeft', 'browDownRight'),
    headYaw: previous.headYaw,
    headPitch: previous.headPitch,
    headRoll: previous.headRoll,
  };

  return smoothExpression(previous, raw, 0.34);
}

export function smoothExpression(
  previous: FaceExpression,
  next: FaceExpression,
  amount: number,
): FaceExpression {
  return {
    confidence: lerp(previous.confidence, next.confidence, amount),
    smile: lerp(previous.smile, next.smile, amount),
    mouthOpen: lerp(previous.mouthOpen, next.mouthOpen, amount),
    jawForward: lerp(previous.jawForward, next.jawForward, amount),
    eyeBlinkLeft: lerp(previous.eyeBlinkLeft, next.eyeBlinkLeft, amount),
    eyeBlinkRight: lerp(previous.eyeBlinkRight, next.eyeBlinkRight, amount),
    browRaise: lerp(previous.browRaise, next.browRaise, amount),
    browDown: lerp(previous.browDown, next.browDown, amount),
    headYaw: lerp(previous.headYaw, next.headYaw, amount),
    headPitch: lerp(previous.headPitch, next.headPitch, amount),
    headRoll: lerp(previous.headRoll, next.headRoll, amount),
  };
}

export function applyHeadPose(
  expression: FaceExpression,
  matrix: readonly number[] | undefined,
): FaceExpression {
  if (!matrix || matrix.length < 16) return expression;

  const yaw = Math.atan2(matrix[8] ?? 0, matrix[10] ?? 1);
  const pitch = Math.asin(clamp(-(matrix[9] ?? 0), -1, 1));
  const roll = Math.atan2(matrix[1] ?? 0, matrix[5] ?? 1);

  return {
    ...expression,
    headYaw: clamp(yaw, -0.55, 0.55),
    headPitch: clamp(pitch, -0.45, 0.45),
    headRoll: clamp(roll, -0.45, 0.45),
  };
}
