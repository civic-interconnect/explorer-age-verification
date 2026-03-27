"""domain/results.py: Result models for candidate evaluation."""

from dataclasses import dataclass

from explorer_age_verification.domain.candidates import ExampleCandidate


@dataclass(frozen=True)
class CandidateResult:
    """Structured evaluation result for a candidate."""

    candidate: ExampleCandidate
    scores: dict[str, float]
