group "all" {
  targets = [
    "api",
    "frontend"
  ]
}

variable "IMAGE_PREFIX" {
  default = "ghcr.io/yinchi/"
}

# Backends share a uv workspace, thus we build from the workspace root

target "api" {
  context = "."
  dockerfile = "dt-demo-api/Dockerfile"
  tags = ["${IMAGE_PREFIX}dt-demo-api:latest"]
}

# Frontends are self-contained, thus we build from the specific frontend's directory

target "frontend" {
  context = "./dt-demo-frontend"
  dockerfile = "Dockerfile"
  tags = ["${IMAGE_PREFIX}dt-demo-frontend:latest"]
  args = {
    # Build args, used to build static files from Vite project (`yarn build`)
    # Do NOT include trailing slashes
    "VITE_BACKEND_URL" = "http://localhost/api"
  }
}
