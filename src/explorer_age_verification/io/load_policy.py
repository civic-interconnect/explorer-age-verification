"""io/load_policy.py: Load policy from TOML."""

import tomllib
from pathlib import Path

from explorer_age_verification.policy.example import ExamplePolicy
from explorer_age_verification.utils.logging_utils import get_logger

logger = get_logger(__name__)


def load_policy(path: Path) -> ExamplePolicy:
    logger.info(f"Loading policy from: {path}")

    with path.open("rb") as f:
        data = tomllib.load(f)

    return ExamplePolicy.from_dict(data)
