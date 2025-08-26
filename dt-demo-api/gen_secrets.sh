#!/usr/bin/env bash

# cd to this script's directory
cd "$(dirname "$0")"

# Create secrets directory if it doesn't exist
mkdir -p ./secrets

# Prompt to overwrite existing secrets
if [ -f ./secrets/jwt_secret.key ] || [ -f ./secrets/admin_password.key ]; then
  read -p "Secrets already exist. Overwrite? (y/n): " overwrite
  if [ "${overwrite,,}" != "y" ]; then
    echo "Aborting secret generation."
    exit 1
  fi
fi

# Generate JWT secret, 24 bytes = 32 base64 characters
openssl rand -base64 24 | tr -d '\n' > ./secrets/jwt_secret.key

# Generate admin password, 24 bytes = 32 base64 characters
openssl rand -base64 24 | tr -d '\n' > ./secrets/admin_password.key

echo "Secrets generated successfully."
