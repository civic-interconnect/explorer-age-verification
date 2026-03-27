"""domain/candidates.py: Domain models for candidates and admissibility results."""

from dataclasses import dataclass, field


@dataclass(frozen=True)
class ExampleCandidate:
    """A candidate with simplified first-slice inputs."""

    candidate_id: str
    candidate_name: str
    assurance_level: str
    privacy_exposure: str
    data_retention: str
    centralization: str
    user_burden: str
    reusability: str
    notes: str = ""


@dataclass(frozen=True)
class EvaluationIssue:
    """A single pass/fail finding for a candidate."""

    criterion: str
    passed: bool
    message: str


@dataclass(frozen=True)
class EvaluationResult:
    """Structured evaluation result for a candidate."""

    candidate: ExampleCandidate
    passed: bool
    issues: tuple[EvaluationIssue, ...] = field(default_factory=tuple)

    @property
    def failed_issues(self) -> tuple[EvaluationIssue, ...]:
        """Return only failed issues."""
        return tuple(issue for issue in self.issues if not issue.passed)
