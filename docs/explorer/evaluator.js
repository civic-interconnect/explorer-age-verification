// docs/explorer/evaluator.js

const LABEL_DIRECTION = {
  minor_protection: "positive",
  privacy_risk: "negative",
  surveillance_risk: "negative",
  implementation_complexity: "negative",
};

function interpretScore(score, interpretation) {
  if (score <= Number(interpretation.low_max)) {
    return "low";
  }
  if (score <= Number(interpretation.medium_max)) {
    return "medium";
  }
  return "high";
}

function getVisualLevel(label, level) {
  const direction = LABEL_DIRECTION[label] || "negative";

  if (direction === "positive") {
    if (level === "low") {
      return "high";
    }
    if (level === "high") {
      return "low";
    }
  }

  return level;
}

function evaluate(candidate, policy) {
  const scores = {};
  const levels = {};
  const visualLevels = {};

  for (const [label, weights] of Object.entries(policy.weights)) {
    let total = 0;

    for (const [dimension, weight] of Object.entries(weights)) {
      const rawValue = candidate[dimension];
      const scale = policy.scales[dimension] || {};
      const numericValue = scale[rawValue];

      if (numericValue === undefined) {
        throw new Error(
          `Unknown scale value for ${dimension}: ${JSON.stringify(rawValue)}`
        );
      }

      total += Number(numericValue) * Number(weight);
    }

    const rounded = Math.round(total * 100) / 100;
    const level = interpretScore(rounded, policy.interpretation);

    scores[label] = rounded;
    levels[label] = level;
    visualLevels[label] = getVisualLevel(label, level);
  }

  return {
    candidate_id: candidate.candidate_id,
    candidate_name: candidate.candidate_name,
    scores,
    levels,
    visualLevels,
  };
}
