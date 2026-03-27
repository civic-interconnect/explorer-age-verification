"""io/load_candidates.py: Load candidates from CSV."""

import csv
from pathlib import Path

from explorer_age_verification.domain.candidates import ExampleCandidate
from explorer_age_verification.utils.logging_utils import get_logger

logger = get_logger(__name__)


def load_candidates(csv_path: Path) -> list[ExampleCandidate]:
    """Load candidates from a CSV file."""
    logger.info(f"Loading candidates from: {csv_path}")
    candidates: list[ExampleCandidate] = []

    with csv_path.open("r", encoding="utf-8", newline="") as file:
        reader = csv.DictReader(file)
        for row in reader:
            candidates.append(
                ExampleCandidate(
                    candidate_id=row["candidate_id"].strip(),
                    candidate_name=row["candidate_name"].strip(),
                    assurance_level=row["assurance_level"].strip(),
                    privacy_exposure=row["privacy_exposure"].strip(),
                    data_retention=row["data_retention"].strip(),
                    centralization=row["centralization"].strip(),
                    user_burden=row["user_burden"].strip(),
                    reusability=row["reusability"].strip(),
                    notes=row["notes"].strip(),
                )
            )

    logger.info(f"Loaded {len(candidates)} candidates.")
    return candidates
