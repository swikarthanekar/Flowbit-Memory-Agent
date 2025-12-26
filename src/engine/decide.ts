    export function decideAction(
  baseConfidence: number,
  proposedCorrections: string[]
) {
  let requiresHumanReview = true;
  let confidenceScore = baseConfidence;

  if (proposedCorrections.length > 0 && baseConfidence >= 0.8) {
    requiresHumanReview = false;
    confidenceScore += 0.1;
  }

  return {
    requiresHumanReview,
    confidenceScore: Math.min(1, confidenceScore)
  };
}
