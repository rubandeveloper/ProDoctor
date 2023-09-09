import os
import time
from bottle import run, route, request, response, static_file, get
from bottle import Bottle
import bottle
import json
import sys
from os import path
import datetime
from dotenv import load_dotenv
import logging
from io import BytesIO
from logging.handlers import RotatingFileHandler

from Database.MongoConnection import MongoDB
from Predictor.BrainTumor import BrainTumor
from Predictor.SkinDisease import SkinDisease
from Predictor.HeartDisease import HeartDisease

load_dotenv()

""" DB and bottle server Initializing"""
app = Bottle()

brainTumor = BrainTumor()
skinDisease = SkinDisease()
heartDisease = HeartDisease()

""" Enabling cross origin reqeusts """


def enable_cors(fn):
    def _enable_cors(*args, **kwargs):
        response.headers["Access-Control-Allow-Origin"] = "*"
        response.headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, OPTIONS"
        response.headers[
            "Access-Control-Allow-Headers"
        ] = "Origin, Accept, Content-Type, X-Requested-With, X-CSRF-Token"

        if bottle.request.method != "OPTIONS":
            return fn(*args, **kwargs)

    return _enable_cors



@route("/api/check-brain_tumor", method=["POST"])
@enable_cors
def deleteSolution():
    try:
        upload = request.files.get('file')
    except Exception as e:
        return {
            "success": False,
            "message": "Invalid input data, please make sure of your input json structure",
        }
    
    if upload == None:
        return {
            "success": False,
            "message": "Invalid input data, please make sure of your input json structure",
        }
    
    filename = upload.filename
    content_type = upload.content_type
    file = upload.file
    file_data = upload.file.read()
   

    image_file = BytesIO(file_data )

    predict_result = brainTumor.predict(image_file)

    return {
        "success": True,
        "Message": "Scan predicted successfully",
        "data": predict_result
    }

@route("/api/check-skin_diseases", method=["POST"])
@enable_cors
def deleteSolution():
    try:
        upload = request.files.get('file')
    except Exception as e:
        return {
            "success": False,
            "message": "Invalid input data, please make sure of your input json structure",
        }
    
    if upload == None:
        return {
            "success": False,
            "message": "Invalid input data, please make sure of your input json structure",
        }
    
    filename = upload.filename
    content_type = upload.content_type
    file = upload.file
    file_data = upload.file.read()
   

    image_file = BytesIO(file_data )

    predict_result = skinDisease.predict(image_file)

    return {
        "success": True,
        "Message": "Scan predicted successfully",
        "data": predict_result
    }

@route("/api/check-ecg_heart_diseases", method=["POST"])
@enable_cors
def deleteSolution():
    try:
        upload = request.files.get('file')
    except Exception as e:
        return {
            "success": False,
            "message": "Invalid input data, please make sure of your input json structure",
        }
    
    if upload == None:
        return {
            "success": False,
            "message": "Invalid input data, please make sure of your input json structure",
        }
    
    filename = upload.filename
    content_type = upload.content_type
    file = upload.file
    file_data = upload.file.read()

    image_file = BytesIO(file_data )

    predict_result = heartDisease.predict(image_file)

    return {
        "success": True,
        "Message": "Scan predicted successfully",
        "data": predict_result
    }


if __name__ == "__main__":
    # MongoDB.initialize()

    run(host=os.getenv("host"), port=os.getenv("port"))
