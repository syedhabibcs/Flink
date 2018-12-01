from flask import Flask, render_template, request, send_from_directory
from werkzeug.utils import secure_filename
import os

import json
import requests

import threading
import time

app = Flask(__name__)
UPLOAD_DIRECTORY = os.path.abspath(os.path.dirname(__file__)) + "/upload/"
app.config["UPLOAD_FOLDER"] = UPLOAD_DIRECTORY

class Server:

    # This will be set from the user input from the web client
    lux_svalue = 0

    sendBox = {}
    incrementer = 0

    @app.route('/', methods=["GET", "POST"])
    def index():
        return str(13)

    @app.route("/send/", methods=["GET", "POST"])
    def getInfo():
        hashedVal = 0
        if request.method == "POST":
            sendMessage = request.json['sendBox']
            Server.sendBox[str(Server.incrementer)] = sendMessage
            hashedVal = str(Server.incrementer)
            Server.incrementer = Server.incrementer+1
        return hashedVal

    @app.route("/receive/", methods=["GET", "POST"])
    def retrieveInfo():
        if request.method == "POST":
            receivedCode = request.json['code']
            if receivedCode in Server.sendBox:
                receivedMessage = Server.sendBox[receivedCode]
            else:
                receivedMessage = 'Sorry no message found for the provided code.'
        return receivedMessage

    @app.route('/upload/', methods = ['POST'])
    def upload_file():
        file = request.files['']
        file.save(UPLOAD_DIRECTORY+secure_filename(file.filename))
        return 'File uploaded successfully'

    @app.route('/download/<filename>')
    def download_file(filename, methods = ['GET']):
        return send_from_directory(app.config['UPLOAD_FOLDER'],filename)  

    def uploaded_files():
        """List the files in the upload directory."""
        files = []
        for filename in os.listdir(UPLOAD_DIRECTORY):
            path = os.path.join(UPLOAD_DIRECTORY, filename)
            if os.path.isfile(path):
                files.append(filename)
        return files

if __name__ == '__main__':
    server = Server()
    app.run(debug=True, host='0.0.0.0')
