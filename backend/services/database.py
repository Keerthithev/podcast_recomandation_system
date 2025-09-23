from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase
from config import settings
import logging

logger = logging.getLogger(__name__)

class Database:
    client: AsyncIOMotorClient = None
    database: AsyncIOMotorDatabase = None

db = Database()

async def get_database() -> AsyncIOMotorDatabase:
    if db.database is None:
        await connect_to_mongo()
    return db.database

async def connect_to_mongo():
    """Create database connection"""
    try:
        db.client = AsyncIOMotorClient(settings.database_url)
        db.database = db.client[settings.database_url.split("/")[-1].split("?")[0]]
        
        # Test the connection
        await db.client.admin.command('ping')
        logger.info("Successfully connected to MongoDB")
        
        # Create indexes
        await create_indexes()
        
    except Exception as e:
        logger.error(f"Error connecting to MongoDB: {e}")
        raise

async def close_mongo_connection():
    """Close database connection"""
    if db.client:
        db.client.close()
        logger.info("Disconnected from MongoDB")

async def create_indexes():
    """Create database indexes for better performance"""
    try:
        # User collection indexes
        await db.database.users.create_index("email", unique=True)
        await db.database.users.create_index("username", unique=True)
        
        # Podcast collection indexes
        await db.database.podcasts.create_index("title")
        await db.database.podcasts.create_index("category")
        await db.database.podcasts.create_index("tags")
        await db.database.podcasts.create_index("spotify_id", unique=True, sparse=True)
        await db.database.podcasts.create_index([("embedding", "2dsphere")])
        
        # Episode collection indexes
        await db.database.episodes.create_index("podcast_id")
        await db.database.episodes.create_index("publish_date")
        
        # Recommendation collection indexes
        await db.database.recommendations.create_index("user_id")
        await db.database.recommendations.create_index("created_at")
        
        logger.info("Database indexes created successfully")
        
    except Exception as e:
        logger.error(f"Error creating indexes: {e}")
