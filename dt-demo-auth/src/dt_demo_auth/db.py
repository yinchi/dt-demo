"""Database setup for the authentication module."""

from contextlib import asynccontextmanager
from typing import AsyncGenerator

import bcrypt
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from sqlmodel import SQLModel, select

from dt_demo_auth.config import config
from dt_demo_auth.models import User

engine = create_async_engine(config.db_url, echo=True)
async_session = async_sessionmaker(engine, expire_on_commit=False, class_=AsyncSession)


@asynccontextmanager
async def get_session() -> AsyncGenerator[AsyncSession, None]:
    """Get a new database session."""
    async with async_session() as session:
        yield session


async def init_db() -> None:
    """Initialize the database."""
    # Create the database schema
    async with engine.begin() as conn:
        print("Connecting to database:", conn.engine.url)
        await conn.run_sync(SQLModel.metadata.create_all, checkfirst=True)

    # Create the admin user if it doesn't exist
    async with get_session() as session:
        query = select(User).where(User.username == "admin")
        admin = (await session.execute(query)).scalar_one_or_none()
        if not admin:
            hash = bcrypt.hashpw(config.admin_password, bcrypt.gensalt()).decode("utf-8")
            admin = User(username="admin", hashed_password=hash, scopes="admin")
            session.add(admin)
            await session.commit()
        print("Admin user:")
        print(admin.model_dump_json(indent=4))
