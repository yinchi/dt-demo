"""Input, database, and/or output models for the authentication module.

We use Pydantic and SQLModel for data validation and serialization/deserialization.
"""

from typing import Literal
from uuid import UUID

from jwt_pydantic import JWTPydantic
from pydantic import BaseModel
from sqlmodel import Field as SqlField
from sqlmodel import SQLModel
from uuid6 import uuid7


class User(SQLModel, table=True):
    """User model.

    Attributes:
        id (UUID): The unique identifier for the user (UUID v7).
        username (str): The unique username for the user.
        hashed_password (str): The hashed password for the user, using bcrypt.
        scopes (str): The scopes assigned to the user (comma delimited).
    """

    id: UUID = SqlField(
        default_factory=uuid7,
        primary_key=True,
        title="User ID",
        description="The unique identifier for the user (UUID v7).",
    )
    username: str = SqlField(
        index=True, unique=True, title="Username", description="The unique username for the user."
    )
    hashed_password: str = SqlField(
        title="Hashed Password", description="The hashed password for the user, using bcrypt."
    )
    scopes: str = SqlField(
        title="Scopes",
        description="The scopes assigned to the user.  Comma delimited.  Note that the `admin` "
        "scope grants unrestricted access to all resources.",
    )


class UserInfo(BaseModel):
    """Validation response model."""

    user_id: UUID
    scopes: str


class UserInfoWithName(UserInfo):
    """Validation response model with username."""

    username: str


class Token(BaseModel):
    """Access token response in accordance with RFC 6749 Section 4.1.4."""

    access_token: str
    token_type: Literal["bearer"]


class MyJWT(JWTPydantic):
    """Custom JWT class.

    Attributes:
        iss (str): The issuer of the token.
        sub (str): The subject (user ID) of the token.  UUID, as a string.
        iat (int): The "issued at" timestamp of the token (UNIX timestamp).
        exp (int): The "expiration" timestamp of the token (UNIX timestamp).
        scopes (str): The scopes assigned to the token (comma delimited).
    """

    iss: str
    sub: str
    iat: int
    exp: int
    scopes: str
