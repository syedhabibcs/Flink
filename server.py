from flask import Flask, render_template, request, send_from_directory
from flask_cors import CORS
from werkzeug.utils import secure_filename
import os
import random 

import json
import requests

import threading
import time

app = Flask(__name__)
UPLOAD_DIRECTORY = os.path.abspath(os.path.dirname(__file__)) + "/upload/"
app.config["UPLOAD_FOLDER"] = UPLOAD_DIRECTORY
CORS(app)

class Server:

    savedLinks = {}
    savedFiles = {}
    identifiers = []
    incrementer = 0
    
    @app.route('/',methods = ["GET","POST"])
    def index():
        return str('Test passed, Server is running!')
            
    @app.route("/send/",methods = ["GET","POST"])
    def getInfo():
        if request.method == "POST":
            ident = Server.get_identifier()
            Server.savedLinks[ident] = request.json['sendBox']
        return str(ident)

    @app.route("/receive/", methods=["GET", "POST"])
    def retrieveInfo():
        if request.method == "POST":
            receivedCode = int(request.json['code'])
            if receivedCode in Server.savedLinks:
                receivedMessage = Server.savedLinks[receivedCode]
                Server.identifiers.remove(receivedCode)
                del Server.savedLinks[receivedCode]
            else:
                receivedMessage = 'Sorry no message found for the provided code.'
        return receivedMessage

    @app.route('/upload/', methods = ['POST'])
    def upload_file():
        for k, file in request.files.items():
            ident = Server.get_identifier()
            file.save(UPLOAD_DIRECTORY+secure_filename(str(ident) + file.filename))
            Server.savedFiles[ident] = str(ident) + file.filename
        return str(ident)

    @app.route('/download/<code>')
    def download_file(code, methods = ['GET']):
        code = int(code)
        file = send_from_directory(app.config['UPLOAD_FOLDER'], Server.savedFiles[code])
        Server.identifiers.remove(code)
        del Server.savedFiles[code]
        return file

    def uploaded_files():
        files = []
        for filename in os.listdir(UPLOAD_DIRECTORY):
            path = os.path.join(UPLOAD_DIRECTORY, filename)
            if os.path.isfile(path):
                files.append(filename)
        return files

    def get_identifier():
        while True:
            i = random.randint(0, 9999)
            if i not in Server.identifiers:
                Server.identifiers.append(i)
                return i
        

if __name__ == '__main__':
    server = Server()
    app.run(debug=True, host='0.0.0.0')
