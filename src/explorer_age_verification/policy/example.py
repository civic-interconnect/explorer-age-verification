"""policy/example.py: Example policy configuration."""

from dataclasses import dataclass
from typing import Any


@dataclass(frozen=True)
class ExamplePolicy:
    """Policy configuration for explorer models."""

    scales: dict[str, dict[str, int]]
    weights: dict[str, dict[str, float]]
    interpretation: dict[str, float]
    patterns: list[dict[str, Any]]
    rules: list[dict[str, Any]]

    @classmethod
    def from_dict(cls, data: dict) -> "ExamplePolicy":
        return cls(
            scales=data["scales"],
            weights=data["weights"],
            interpretation=data["interpretation"],
            patterns=data.get("patterns", []),
            rules=data.get("rules", []),
        )
