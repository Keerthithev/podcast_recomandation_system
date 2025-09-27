from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase, AsyncIOMotorCollection
from .config import settings

_mongo_client: AsyncIOMotorClient | None = None

async def get_client() -> AsyncIOMotorClient:
	global _mongo_client
	if _mongo_client is None:
		_mongo_client = AsyncIOMotorClient(settings.DATABASE_URL)
	return _mongo_client

async def get_database(db_name: str = "podcast_recommendation") -> AsyncIOMotorDatabase:
	client = await get_client()
	return client.get_database(db_name)

async def get_podcasts_collection() -> AsyncIOMotorCollection:
	db = await get_database()
	return db.get_collection("podcasts")


