import { describe, expect, it } from 'vitest';
import { applyHeadPose, expressionFromBlendshapes, neutralExpression } from './expression';

describe('expressionFromBlendshapes', () => {
  it('maps MediaPipe mouth and brow categories into a bounded expression', () => {
    const expression = expressionFromBlendshapes(
      [
        { categoryName: 'jawOpen', score: 0.8 },
        { categoryName: 'mouthSmileLeft', score: 0.6 },
        { categoryName: 'mouthSmileRight', score: 0.4 },
        { categoryName: 'browOuterUpLeft', score: 0.7 },
        { categoryName: 'browOuterUpRight', score: 0.5 },
      ],
      neutralExpression,
    );

    expect(expression.confidence).toBeGreaterThan(0);
    expect(expression.mouthOpen).toBeGreaterThan(neutralExpression.mouthOpen);
    expect(expression.smile).toBeGreaterThan(neutralExpression.smile);
    expect(expression.browRaise).toBeGreaterThan(neutralExpression.browRaise);
  });
});

describe('applyHeadPose', () => {
  it('keeps neutral pose when the matrix is unavailable', () => {
    expect(applyHeadPose(neutralExpression, undefined)).toEqual(neutralExpression);
  });
});
