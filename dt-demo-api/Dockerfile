FROM ghcr.io/astral-sh/uv:python3.13-trixie-slim AS builder

ENV UV_COMPILE_BYTECODE=1 UV_LINK_MODE=copy UV_PYTHON_DOWNLOADS=0

WORKDIR /app

# Copy metadata files for workspace and current project
COPY pyproject.toml uv.lock README.md ./
COPY dt-demo-api/pyproject.toml ./dt-demo-api/
COPY dt-demo-api/README.md ./dt-demo-api/

# Fully copy dt-demo-auth dependency, including source
COPY dt-demo-auth/pyproject.toml ./dt-demo-auth/
COPY dt-demo-auth/README.md ./dt-demo-auth/
COPY dt-demo-auth/src ./dt-demo-auth/src

# Install dependencies (--no-install-project)
RUN --mount=type=cache,target=/root/.cache/uv \
    uv sync --no-install-project --frozen --no-dev \
    --package dt-demo-api

# Copy the source files for the current project
COPY dt-demo-api/src ./dt-demo-api/src

# Install the current project
RUN --mount=type=cache,target=/root/.cache/uv \
    uv sync --frozen --no-dev \
    --package dt-demo-api

##############################################################

FROM python:3.13-slim-trixie AS runtime
COPY --from=builder --chown=app:app /app /app
ENV PATH="/app/.venv/bin:$PATH"

# Install wget for healthchecks
RUN apt update && apt install -y wget

# Run the FastAPI application by default
ENTRYPOINT [ "fastapi", "run", "/app/dt-demo-auth/src/dt_demo_auth/"]

EXPOSE 8000

LABEL org.opencontainers.image.authors="Yin-Chi Chan"
LABEL org.opencontainers.image.source="https://github.com/yinchi/dt-demo"
LABEL org.opencontainers.image.title="dt-demo-api"
LABEL org.opencontainers.image.description="API server for the hospital digital twin demo"
LABEL org.opencontainers.image.base.name="python:3.13-slim-trixie"
