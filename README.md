# Hospital DT demo

## Prerequisites

- `just` for script management (see the `justfile`)
- Docker
- `uv` for Python project management
- `isort` and `ruff` for Python formatting
- `node` and `yarn` for Typescript project management

## Project structure

### API modules with FastAPI

Services are **mounted** into the main API (`dt-demo-api.app.app`) as `fastapi.APIRouter` instances:
```py
import dt_demo_auth as auth

app = FastAPI()
# ...
app.include_router(auth.router.router, prefix="/auth", tags=["auth"])
```
**Option 1: router is a workspace package**

- We use a `uv` workspace to organize the Python packages
- To add a package to the workspace, use `uv init`
    - This should add the package to the `[tool.uv.workspace]` block in the root `pyproject.toml`, if not; add it manually
- To make the package a dependency of the API package:
  ```bash
  uv add --package dt-demo-api <dt-demo-other-package>
  ```

**Option 2: router package is hosted on Git**

To add the dependency to the API package:
```bash
uv add --package dt-demo-api git+https://github.com/<user>/<repo>
```

To upgrade the dependency when the Git source changes:
```bash
uv sync --all-packages -P git+https://github.com/<user>/<repo>
```

**Option 3: router package is hosted on PyPI**

Just use
```bash
uv add --package dt-demo-api <mypackage>
```

> [!NOTE]
> Regardless or whether we implement our API routers within this Git repo or externally, they still must be mounted into the main FastAPI application in the `dt-demo-api` package.

#### Upgrading all packages
```bash
uv sync --all-packages -U
```

### Vite-based frontend

We use Vite to build static a static HTML+CSS+JS website for our frontend (`yarn build`).  This gets outputted to `dist/`.

- Pages to include in the build are listed in `vite.config.ts`
- Each page gets its own directory in `src/`
- Vite will match the directory structure of `dt-demo-frontend` when outputting HTML files in the static build. To flatten the HTML strucutre, we use `flatten-html.sh`, which is automatically invoked during `yarn build` (see `package.json`).  This moves all HTML files in `dist/src/` to the top level of `dist/` and then removes `dist/src`.

Using `homepage/` as an example:

- `index.html` contains:
  ```ts
  <script type="module" src="./homepageApp.tsx"></script>
  ```
- `homepageApp.tsx` contains a `<Home />` component
- The `<Home />` component is imported via
  ```ts
  import Home from "./Home.tsx";
  ```

#### Packaging options
This setup gives us several options for importing a React component package:

1. Single package
2. Multiple packages in a Yarn workspace
   -  [Yarn workspace documentation](https://yarnpkg.com/features/workspaces)
   -  [Tutorial](https://earthly.dev/blog/yarn-vite-monorepo/)
3. `yarn add <package>@github:<user>/<repo>`
4. `yarn add <package>` (to fetch from the `npm` registry)

However, only one package will be the main package for running Vite, and all HTML and page-level `.tsx` files (e.g. `homepageApp.tsx`) must reside in the main package.

> [!NOTE]
> Options 2-4 have not yet been tested.  Additional steps may be required to ensure the imported package is available as a `.js` file in the build output.

## Why we restrict ourselves to a single frontend instance

If we have separate Docker containers for each frontend service, then we must deploy all services in a **single Compose stack** just to test the new service, as all services must be behind the same reverse proxy (e.g. Traefik) for cookies to work.  Wrapping all frontend services into a single static server simplifies this deployment.

> [!NOTE]
> In the future, we can attempt to:
> - Set up Single-Sign-On (SSO) with [Keycloak](https://www.keycloak.org/), allowing services on different hosts to share login information.
> - Set up a Docker Compose stack with self-discovery and routing setup of test containers via Traefik.  Use [Compose Watch](https://docs.docker.com/compose/how-tos/file-watch/) to sync the container with the source code.  This way, both production and development containers share a hostname via the Traefik reverse proxy.
>     - Make sure development versions of services are accessible to **developer accounts only**.

## Developer setup

1. Clone the repository
2. `just all` to build all the Docker images
   - This will also create/sync the local `uv` virtual environment and build the frontend locally in `dt-demo-frontend/dist/`
3. `docker compose up -d`

Additionally, `just ruff` and `just prettier` will format and lint all Python and Typescript packages, respectively (packages must be listed manually in the `justfile`).
