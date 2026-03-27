// docs/explorer/evaluator.js

function interpretScore(score, interpretation) {
  if (score <= Number(interpretation.low_max)) {
    return "low";
  }
  if (score <= Number(interpretation.medium_max)) {
    return "medium";
  }
  return "high";
}

function evaluate(candidate, policy) {
  const scores = {};
  const levels = {};

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
    scores[label] = rounded;
    levels[label] = interpretScore(rounded, policy.interpretation);
  }

  return {
    candidate_id: candidate.candidate_id,
    candidate_name: candidate.candidate_name,
    scores,
    levels,
  };
}
