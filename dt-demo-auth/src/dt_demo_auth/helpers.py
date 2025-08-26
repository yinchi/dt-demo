"""Helper functions for the authentication module."""

from time import time
from uuid import UUID

import bcrypt
import jose
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlmodel import select

from dt_demo_auth.config import config
from dt_demo_auth.constants import INVALID_CREDENTIALS, INVALID_TOKEN
from dt_demo_auth.db import get_session
from dt_demo_auth.models import MyJWT, Token, User, UserInfo

OAUTH2_SCHEME = OAuth2PasswordBearer(tokenUrl="token")


async def authenticate_user(username: str, password: str):
    """Authenticate a user and return a JWT token.

    Params:
        username (str): The username of the user.
        password (str): The password of the user.

    Returns:
        Token: The JWT token.

    Raises:
        HTTPException: If the username or password is invalid.
    """
    async with get_session() as session:
        query = select(User).where(User.username == username)
        user = (await session.execute(query)).scalar_one_or_none()
        if not user:  # User not found
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid username or password",
                headers={"WWW-Authenticate": f"Bearer {INVALID_CREDENTIALS}"},
            )

        # User found, check password
        user = User.model_validate(user)
        password_bytes = password.encode("utf-8")
        check_bytes = user.hashed_password.encode("utf-8")
        if not bcrypt.checkpw(password_bytes, check_bytes):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid username or password",
                headers={"WWW-Authenticate": f"Bearer {INVALID_CREDENTIALS}"},
            )

        # Password matches, create and return JWT token
        return create_token(user.id, scopes=user.scopes)


def create_token(user_id: UUID, scopes: str):
    """Create a JWT token.

    Params:
        user_id (UUID): The unique identifier for the user.
        scopes (str): The scopes assigned to the token (comma delimited).

    Returns:
        Token: The JWT token.
    """
    iat = int(time())
    exp = iat + config.jwt_expiration_delta

    jwt_claims = {
        "iss": config.jwt_issuer,
        "sub": user_id.hex,
        "iat": iat,
        "exp": exp,
        "scopes": scopes,
    }
    jwt_token = MyJWT.new_token(claims=jwt_claims, key=config.jwt_secret)
    return Token(access_token=jwt_token, token_type="bearer")


async def get_user_info(token: str | None = Depends(OAUTH2_SCHEME)) -> UserInfo:
    """Validate a JWT token.

    Params:
        token (str): The JWT token to validate.

    Returns:
        UserInfo: Information about the user associated with the token.

    Raises:
        HTTPException: If the token is invalid.
    """
    # According to RFC 6750 Section 3.1, if the token is missing, do NOT include the `error` code
    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User is not authenticated",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Verify the token
    try:
        payload = MyJWT(token, key=config.jwt_secret)
    except jose.ExpiredSignatureError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User session has expired",
            headers={"WWW-Authenticate": f"Bearer {INVALID_TOKEN}"},
        ) from e
    except jose.JOSEError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid login token",
            headers={"WWW-Authenticate": f"Bearer {INVALID_TOKEN}"},
        ) from e

    # TODO: set up Redis blacklist
    # This allows tokens to be revoked, as we check the cache for token validity
    # Revoke tokens on logout or permission revocation
    # Do not revoke for password change or permission grant (takes effect on next login)

    # Token is valid, return user ID and scopes
    # Attach validated information to response headers; this allows endpoint
    # to be used as a ForwardAuth middleware
    return UserInfo(user_id=UUID(hex=payload.sub), scopes=payload.scopes)
