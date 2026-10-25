import sys
from pymongo import MongoClient
import mongomock
from backend.config import Config

_db_instance = None
_is_mock = False

def get_db():
    global _db_instance, _is_mock
    if _db_instance is not None:
        return _db_instance

    uri = Config.MONGODB_URI
    db_name = Config.DATABASE_NAME

    try:
        # Try real MongoDB connection with short timeout to detect availability
        client = MongoClient(uri, serverSelectionTimeoutMS=2000)
        client.admin.command('ping')
        _db_instance = client[db_name]
        _is_mock = False
        print(f" Successfully connected to real MongoDB at {uri} (Database: '{db_name}')")
    except Exception as e:
        print(f" Real MongoDB server not available ({e}). Falling back to MongoMock in-memory database.")
        client = mongomock.MongoClient()
        _db_instance = client[db_name]
        _is_mock = True

    return _db_instance

def is_mock_db():
    global _is_mock
    return _is_mock
