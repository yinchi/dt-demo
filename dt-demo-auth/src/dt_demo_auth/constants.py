"""Shared constants for the authentication module."""

# Error messages in accordance with RFC 6750 Section 3.1 (must include an `error` code)
INVALID_CREDENTIALS = 'error="invalid_token", error_description="Invalid credentials"'
INVALID_TOKEN = 'error="invalid_token", error_description="The token is invalid or expired"'
