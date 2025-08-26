"""Main entry point for the dt-demo-auth module."""

import pathlib
import sys

from fastapi import cli


def main() -> None:
    """Launch the FastAPI application.

    This ensures that `uv run --package dt-demo-auth main <args>` is the same as
    `uv run --package dt-demo-auth fastapi dev app.py <args>`.
    """
    app_path = (pathlib.Path(__file__).parent / "app.py").resolve()

    # Overwrite sys.argv to run the FastAPI application
    sys.argv = f"fastapi dev {app_path}".split() + sys.argv[1:]
    cli.main()
