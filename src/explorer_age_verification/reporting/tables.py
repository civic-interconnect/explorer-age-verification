"""reporting/tables.py: Simple text-table reporting for scored results."""

from explorer_age_verification.domain.results import CandidateResult


def format_results(results: list[CandidateResult]) -> str:
    """Format results as a readable plain-text report."""
    lines: list[str] = []

    for r in results:
        lines.append(f"{r.candidate.candidate_id} | {r.candidate.candidate_name}")
        for label, score in r.scores.items():
            lines.append(f"  - {label}: {score:.2f}")
        lines.append("")

    return "\n".join(lines).rstrip()
