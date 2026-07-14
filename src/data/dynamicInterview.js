const stopWords = new Set(["a", "an", "the", "and", "or", "to", "of", "in", "for", "with", "i", "we", "it", "that", "this", "is", "was", "are", "be", "my"]);

const synonymGroups = [
  ["test", "testing", "tests", "validate", "validation", "verify"],
  ["example", "project", "experience", "worked", "built"],
  ["result", "outcome", "impact", "improved", "learned"],
  ["api", "contract", "endpoint", "backend", "client"],
  ["error", "errors", "failure", "fallback", "edge case"],
];

function normalize(value = "") {
  return value.toLowerCase().replace(/[^a-z0-9 ]/g, " ").split(/\s+/).filter(Boolean);
}

function hasConcept(tokens, concept) {
  const parts = normalize(concept);
  const group = synonymGroups.find((items) => parts.some((part) => items.includes(part)));
  if (group) return group.some((term) => tokens.includes(term));
  const signals = parts.filter((part) => part.length > 3 && !stopWords.has(part));
  return signals.some((part) => tokens.includes(part));
}

export function evaluateDemoAnswer(question, answer) {
  const tokens = normalize(answer);
  const words = tokens.filter((word) => !stopWords.has(word));
  const required = question.answerPlan || [];
  const covered = required.filter((concept) => hasConcept(tokens, concept));
  const hasExample = hasConcept(tokens, "example");
  const hasOutcome = hasConcept(tokens, "result");
  const score = Math.min(96, Math.max(24, 30 + covered.length * 19 + (words.length >= 45 ? 12 : 0) + (hasExample ? 8 : 0) + (hasOutcome ? 8 : 0)));
  const isComplete = words.length >= 28 && covered.length >= Math.min(2, required.length);
  const missed = required.find((concept) => !hasConcept(tokens, concept));
  const followUpQuestion = !isComplete
    ? words.length < 28
      ? "Could you expand on your approach with a concrete example?"
      : `How would you address ${missed || "the key tradeoff"} in practice?`
    : null;

  return {
    score,
    isComplete,
    covered: covered.length,
    total: required.length,
    strengths: [
      covered.length ? `You covered ${covered.length} of ${required.length} key ideas.` : "You started to frame an answer.",
      ...(hasExample ? ["You grounded your answer in an example."] : []),
    ],
    improvements: [
      ...(words.length < 45 ? ["Add a little more detail so the interviewer can follow your reasoning."] : []),
      ...(!hasOutcome ? ["Finish with the result or impact of your approach."] : []),
      ...(missed ? [`Address this missing idea: ${missed}`] : []),
    ].slice(0, 2),
    interviewerMessage: isComplete
      ? "Thank you. You addressed the important points. You can move to the next question."
      : `Good start. ${followUpQuestion}`,
    followUpQuestion,
  };
}
