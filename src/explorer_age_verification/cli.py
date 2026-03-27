"""cli.py: Command-line entry point.

Run:

    uv run python -m explorer_age_verification.cli --candidates path/to/candidates.csv --policy path/to/policy.toml

Examples:

    uv run python -m explorer_age_verification.cli --candidates data/raw/candidates.csv --policy data/raw/policy.toml

    uv run python -m explorer_age_verification.cli --candidates data/raw/candidates.csv --policy data/raw/policy.toml --output-json docs/data/results.json
"""

import argparse
import json
from pathlib import Path
from typing import Any

from explorer_age_verification.config import log_project_paths
from explorer_age_verification.evaluation.evaluator import evaluate_candidate
from explorer_age_verification.io.load_candidates import load_candidates
from explorer_age_verification.io.load_policy import load_policy
from explorer_age_verification.utils.logging_utils import (
    get_logger,
    log_header,
    log_path,
)

logger = get_logger(__name__)


def build_parser() -> argparse.ArgumentParser:
    """Build the CLI parser."""
    parser = argparse.ArgumentParser(
        description="Explore candidates under a configurable policy."
    )
    parser.add_argument(
        "--candidates",
        type=Path,
        required=True,
        help="Path to candidates.csv",
    )
    parser.add_argument(
        "--policy",
        type=Path,
        required=True,
        help="Path to policy.toml",
    )
    parser.add_argument(
        "--output-json",
        type=Path,
        metavar="PATH",
        required=False,
        help="Write results as JSON",
    )
    return parser


def results_to_dict(results: list[Any]) -> dict[str, Any]:
    """Serialize results to a JSON-compatible dict."""
    candidates: list[dict[str, Any]] = []

    for result in results:
        candidates.append(
            {
                "candidate_id": result.candidate.candidate_id,
                "candidate_name": result.candidate.candidate_name,
                "scores": result.scores,
            }
        )

    return {
        "summary": {
            "total": len(results),
        },
        "candidates": candidates,
    }


def main() -> None:
    """Run the CLI."""
    parser = build_parser()
    args = parser.parse_args()

    log_project_paths()
    log_header("Explorer Run")

    logger.info("Starting exploration run.")
    log_path("Candidates", args.candidates)
    log_path("Policy", args.policy)

    candidates = load_candidates(args.candidates)
    policy = load_policy(args.policy)

    log_header("Evaluate Candidates")
    results = [evaluate_candidate(candidate, policy) for candidate in candidates]

    logger.info("Exploration complete. Evaluated %d candidates.", len(results))

    for result in results:
        logger.info(
            "%s: %s",
            result.candidate.candidate_name,
            result.scores,
        )

    if args.output_json:
        args.output_json.parent.mkdir(parents=True, exist_ok=True)
        args.output_json.write_text(
            json.dumps(results_to_dict(results), indent=2),
            encoding="utf-8",
        )
        log_path("Output file", args.output_json)


if __name__ == "__main__":
    main()
