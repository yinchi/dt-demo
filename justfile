frontend_list := "frontend"
backend_list := "api auth"

all: uv-packages frontends backends

# Build all frontends using `tsbuild`
frontends:
    #!/usr/bin/env bash

    # Build static files for each frontend
    set -euo pipefail
    for target in {{frontend_list}}; do
        echo
        echo "🛠️  Building frontend: $target"
        echo
        just tsbuild $target
        echo
        echo "✅ Finished building frontend: $target"
        echo
    done

    # Build Docker container for serving the static files
    echo "🛠️  Building Docker container"
    docker buildx bake frontend
    echo "✅ Finished building Docker container"

# Build all backends using `pybuild`
backends:
    #!/usr/bin/env bash
    set -euo pipefail

    # Build the Docker image -- all other backend modules should be mounted into
    # the main API router, thus we only need to build one image.
    docker buildx bake api

#####################
### BUILD TARGETS ###
#####################

# TypeScript (Vite) build target
tsbuild target:
    #!/usr/bin/env bash
    set -euo pipefail

    # Build the static files (dist/) before creating the Docker image
    # This ensures local and containerized builds are consistent
    pushd dt-demo-{{target}} >/dev/null
    echo "1️⃣  Installing dependencies for {{target}}"
    yarn install
    echo "2️⃣  Building static files for {{target}}"
    yarn build
    popd >/dev/null

# Python build target
pybuild target:
    #!/usr/bin/env bash
    set -euo pipefail

    # Build the Docker image
    docker buildx bake {{target}}

# Sync python packages (uv)
uv-packages:
    #!/usr/bin/env bash
    set -euo pipefail
    uv sync --all-packages

##################
### CODE STYLE ###
##################

# Format and lint all frontend code with Prettier and ESLint
prettier:
    #!/usr/bin/env bash
    set -euo pipefail
    for target in {{frontend_list}}; do
        echo
        echo "🛠️ Formatting and linting: $target"
        echo
        pushd dt-demo-${target} >/dev/null
        echo "1️⃣  prettier for ${target}"
        yarn format
        echo "2️⃣  eslint for ${target}"
        yarn lint
        echo
        echo "✅ Finished formatting and linting: $target"
        echo
        popd >/dev/null
    done

# Format and lint all backend code with isort and ruff
ruff:
    #!/usr/bin/env bash
    set -euo pipefail
    for target in {{backend_list}}; do
        echo
        echo "🛠️ Formatting and linting: $target"
        echo
        echo "1️⃣  isort for ${target}"
        isort --settings-path configs/.isort.cfg dt-demo-${target}
        echo "2️⃣  ruff format for ${target}"
        ruff format --config configs/ruff.toml dt-demo-${target}
        echo "3️⃣  ruff check for ${target}"
        ruff check --config configs/ruff.toml --fix dt-demo-${target}
        echo
        echo "✅ Finished formatting and linting: $target"
        echo
    done
