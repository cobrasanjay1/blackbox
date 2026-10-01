// SERVER-SIDE ONLY — never import this in client components
// This file contains the correct answers for all challenges

export const ANSWERS: Record<string, string> = {
  "the-message": "mirror",
  "the-archive": "index",
  "the-source": "static",
  "the-signal": "unlock",
  "the-parameter": "node",
  "the-memory": "anchor",
  "the-script": "vault",
  "the-image": "cipher",
  "the-cipher": "signal",
  "the-cookie": "ember",
  "the-key": "mis-u-na",
};

export function validateAnswer(
  challengeId: string,
  userAnswer: string
): boolean {
  const correct = ANSWERS[challengeId];
  if (!correct) return false;
  return correct.toLowerCase().trim() === userAnswer.toLowerCase().trim();
}
