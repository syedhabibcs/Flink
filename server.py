from flask import Flask, render_template, request
import json
import requests

import threading
import time

app = Flask(__name__)

class Server:

    # This will be set from the user input from the web client
    lux_svalue = 0

    sendBox = {}
    incrementer = 0
    

    @app.route('/',methods = ["GET","POST"])
    def index():
        return str(13)
            
    @app.route("/send/",methods = ["GET","POST"])
    def getInfo():
        hashedVal = 0
        if request.method == "POST":
            sendMessage = request.json['sendBox']
            Server.sendBox[str(Server.incrementer)] = sendMessage
            hashedVal = str(Server.incrementer)
            Server.incrementer = Server.incrementer+1
        return hashedVal

    @app.route("/receive/",methods = ["GET","POST"])
    def retrieveInfo():
        if request.method == "POST":
            receivedCode = request.json['code']
            if receivedCode in Server.sendBox:
                receivedMessage = Server.sendBox[receivedCode]
            else:
                receivedMessage = 'Sorry no message found for the provided code.'
        return receivedMessage

if __name__ == '__main__':
    server = Server()
    app.run(debug=True, host='0.0.0.0')

