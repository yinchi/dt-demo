"""FastAPI router for the authentication endpoints in the Hospital DT demo.

Mounted in the main FastAPI application under `/auth`.
"""

from contextlib import asynccontextmanager
from typing import Annotated, AsyncIterator

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import JSONResponse
from fastapi.security import OAuth2PasswordRequestForm
from pydantic import BaseModel
from sqlmodel import select

from dt_demo_auth import config, db, helpers, models


@asynccontextmanager
async def lifespan(router: APIRouter) -> AsyncIterator[None]:
    """Router lifespan events.

    The function contains a single `yield` statement.  Statements before the `yield` are executed
    when the router starts, and statements after the `yield` are executed when the router
    shuts down.
    """
    print()
    print("=========================================")
    print("CONFIG:")
    print(config.config.model_dump_json(indent=4))
    print("=========================================")
    print()
    await db.init_db()
    yield


router = APIRouter(lifespan=lifespan)


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


@router.post(
    "/token",
    summary="Token",
    description="Obtain a JWT token.",
    responses=examples(
        (
            Message(detail="Not authenticated").model_dump(mode="json"),
            status.HTTP_401_UNAUTHORIZED,
            "application/json",
        )
    ),
)
async def token(form_data: Annotated[OAuth2PasswordRequestForm, Depends()]) -> models.Token:
    """Obtain a JWT token.

    Params:
        form_data(OAuth2PasswordRequestForm): The OAuth2 password request form data.  Must contain
            at least the username and password.

    Returns:
        Token: The JWT token.

    Raises:
        HTTPException: If the username or password is invalid.
    """
    # Call chain (success case):
    # 1. FastAPI endpoint calls this function.
    # 2. This function calls `authenticate_user`.
    # 3. `authenticate_user` queries the database for the user, verifies the password via bcrypt,
    #    and then calls `create_token`.
    # 4. `create_token` creates a dict of claims, converts it to a signed JWT token, and wraps
    #    the token in a Token object.
    return await helpers.authenticate_user(form_data.username, form_data.password)


@router.get(
    "/validate",
    summary="Validate Token",
    description="Validate a JWT token.  The token should be embedded in the HTTP headers "
    "as `Authorization: Bearer <token>`.",
    responses=examples(
        (
            Message(detail="Not authenticated").model_dump(mode="json"),
            status.HTTP_401_UNAUTHORIZED,
            "application/json",
        )
    ),
    response_class=JSONResponse,
    response_model=models.UserInfo,
)
async def validate_token(
    user_info: models.UserInfo = Depends(helpers.get_user_info),
) -> JSONResponse:
    """Validate a JWT token.

    Params:
        token (str): The JWT token to validate.

    Returns:
        UserInfo: Information about the user associated with the token.

    Raises:
        HTTPException: If the token is invalid.
    """
    return JSONResponse(
        content=user_info.model_dump(mode="json"),
        headers={
            "X-User-ID": str(user_info.user_id),
            "X-Scopes": user_info.scopes,
        },
    )


@router.get(
    "/whoami",
    summary="Get username",
    description="Get the username of the currently authenticated user.",
    responses=examples(
        (
            Message(detail="Not authenticated").model_dump(mode="json"),
            status.HTTP_401_UNAUTHORIZED,
            "application/json",
        )
    ),
)
async def whoami(
    user_info: models.UserInfo = Depends(helpers.get_user_info),
) -> models.UserInfoWithName:
    """Get the username of the currently authenticated user.

    Params:
        user_info (UserInfo): Information about the authenticated user.

    Returns:
        Message: A message containing the username.
    """
    uid = user_info.user_id
    async with db.get_session() as session:
        result = await session.execute(select(models.User).where(models.User.id == uid))
        user = result.scalar_one_or_none()
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found",
            )
        return models.UserInfoWithName(
            user_id=user.id,
            username=user.username,
            scopes=user.scopes,
        )
