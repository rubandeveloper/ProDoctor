import pymongo
from dotenv import load_dotenv
load_dotenv()
import os
class MongoDB(object):
    

    
    @staticmethod
    def initialize():
        mongo_username = os.getenv('username')
        mongo_password = os.getenv('password')
        if not mongo_username or not mongo_password:
            MongoDB.URI = "mongodb://localhost:27017"

        else:
            MongoDB.URI = f"mongodb://{mongo_username}:{mongo_password}@localhost:27017/?authSource=admin"
        print(MongoDB.URI)
        client = pymongo.MongoClient(MongoDB.URI)
        MongoDB.DATABASE = client["RigSchedule"]
        print('Connecting MongoDB')

    @staticmethod
    def find(collection, query, fieldDescription = None):
        return MongoDB.DATABASE[collection].find(query, fieldDescription)

    @staticmethod
    def find_array(collection, query, project):
        return MongoDB.DATABASE[collection].find_one(query, project)

    @staticmethod
    def insertOne(collection, data):
        return MongoDB.DATABASE[collection].insert_one(data)
    
    @staticmethod
    def insertMany(collection, data):
        return MongoDB.DATABASE[collection].insert_many(data) 

    @staticmethod
    def findAndProject(collection, query, project, skip = 0, limit = 0):
        return MongoDB.DATABASE[collection].find(query, project).skip(skip).limit(limit)

    @staticmethod
    def deleteOne(collection, query):
        return MongoDB.DATABASE[collection].delete_one(query)
    
    @staticmethod
    def updateOne(collection, filter, data):
        return MongoDB.DATABASE[collection].update_one(filter, data)