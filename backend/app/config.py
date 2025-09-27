import os

class Settings:
	DATABASE_URL: str = os.getenv("DATABASE_URL", "mongodb+srv://KeerthiDev:9AkQP1TaAYasb09H@keerthidev.stiw0.mongodb.net/podcast_recommendation?retryWrites=true&w=majority")
	LISTEN_NOTES_API_KEY: str | None = os.getenv("LISTEN_NOTES_API_KEY")
	SPOTIFY_CLIENT_ID: str = os.getenv("SPOTIFY_CLIENT_ID", "82713377103d4540823ab7eeef098bfa")
	SPOTIFY_CLIENT_SECRET: str = os.getenv("SPOTIFY_CLIENT_SECRET", "bd434fc651ea4b57b6cd204da21050e3")
	JWT_SECRET: str = os.getenv("JWT_SECRET", "dev-secret-change-me")
	JWT_EXPIRE_MINUTES: int = int(os.getenv("JWT_EXPIRE_MINUTES", "60"))

settings = Settings()
