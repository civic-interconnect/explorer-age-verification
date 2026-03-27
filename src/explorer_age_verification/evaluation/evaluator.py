"""evaluation/evaluator.py: Evaluate candidates against policy."""

from explorer_age_verification.domain.candidates import ExampleCandidate
from explorer_age_verification.domain.results import CandidateResult
from explorer_age_verification.policy.example import ExamplePolicy


def evaluate_candidate(
    candidate: ExampleCandidate,
    policy: ExamplePolicy,
) -> CandidateResult:
    scores: dict[str, float] = {}

    # Compute weighted scores per label
    for label, weights in policy.weights.items():
        total = 0.0

        for dimension, weight in weights.items():
            value = getattr(candidate, dimension)
            numeric = policy.scales[dimension][value]
            total += numeric * weight

        scores[label] = round(total, 3)

    return CandidateResult(
        candidate=candidate,
        scores=scores,
    )
