"""The FastAPI application for dt-demo-auth."""

import logging

from fastapi import FastAPI, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import PlainTextResponse
from pydantic import BaseModel

import dt_demo_auth as auth

# region Logging
#
SILENT_ENDPOINTS = {"/api/health"}


class LogFilter(logging.Filter):
    """Filter out log messages from silent endpoints."""

    def filter(self, record: logging.LogRecord) -> bool:
        """Returns False if the record should not be logged, True otherwise."""
        if hasattr(record, "args") and len(record.args) > 2:
            path = record.args[2]
            return path not in SILENT_ENDPOINTS
        return True


logging.getLogger("uvicorn.access").addFilter(LogFilter())

# endregion


# region FastAPI setup
#
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class Message(BaseModel):
    """Message model.

    Contains a single `detail` field, matching the return type when `HTTPException` is raised.
    However, we use this for "HTTP 200 OK" responses as well.
    """

    detail: str


def plaintext_example(value: str, status_code: int = status.HTTP_200_OK) -> dict[int, dict]:
    """Generate the response schema with `value` as the example for a plaintext response."""
    return {status_code: {"content": {"text/plain": {"example": value}}}}


def examples(*tuples: tuple[str, int, str]) -> dict[int, dict]:
    """Generate the response schema with examples for multiple status codes."""
    return {
        status_code: {"content": {_type: {"example": value}}}
        for value, status_code, _type in tuples
    }


# endregion


# region FastAPI endpoints
#
@app.get(
    "/",
    response_model=Message,
    responses=examples(
        (Message(detail="Hello, World!").model_dump_json(), status.HTTP_200_OK, "application/json"),
    ),
)
async def root() -> Message:
    """Root endpoint."""
    return Message(detail="Hello, World!")


@app.get(
    "/health",
    summary="Health Check",
    response_class=PlainTextResponse,
    responses=plaintext_example("OK"),
)
async def health() -> str:
    """Health check endpoint."""
    return "OK"


# endregion

# region Mounts
#
app.include_router(auth.router.router, prefix="/auth", tags=["auth"])

# endregion
