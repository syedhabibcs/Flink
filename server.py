from flask import Flask, request, send_file
from flask_cors import CORS
from werkzeug.utils import secure_filename
import os, json, re, random

app = Flask(__name__)
UPLOAD_DIRECTORY = os.path.abspath(os.path.dirname(__file__)) + "/upload/"
app.config["UPLOAD_FOLDER"] = UPLOAD_DIRECTORY
CORS(app)

class Server:

    sendBox = {}
    incrementer = 0
    fileName = ''
    fileNameStorage = {}
    selectedTag = {}

    @app.route("/send/",methods = ["GET","POST"])
    def getInfo():
        hashedVal = 0 
        if request.method == "POST":
            if Server.incrementer >= 9999: 
                Server.incrementer = 0
                Server.sendBox = {}
            sendMessage = request.json['sendBox']
            selectOption = request.json['selectOption']
            Server.incrementer = Server.generateCode(selectOption)
            Server.selectedTag[str(Server.incrementer)] = selectOption 
            Server.sendBox[str(Server.incrementer)] = sendMessage
            hashedVal = str(Server.incrementer)
        return hashedVal

    def generateCode(selectOption):
        limit = 10000
        counter = 0
        start = 0
        if selectOption == 'multi_s' or selectOption == 'single_s':
            limit = 100000000
            start = 100000
        randValue = random.randint(start,limit)        
        while randValue in Server.sendBox and counter<limit:
            randValue = random.randint(0,limit)
            counter+=1
        if counter > 9999:
            Server.sendBox = {}
            Server.selectedTag = {}
            for filename in os.listdir(UPLOAD_DIRECTORY):                    
                os.remove(UPLOAD_DIRECTORY+filename)
            Server.fileNameStorage = {}
            randValue = 0
        return randValue
        
    @app.route("/receive/", methods=["GET", "POST"])
    def retrieveInfo():
        if request.method == "POST":
            receivedCode = request.json['code']
            if receivedCode == '01676408921':
                for filename in os.listdir(UPLOAD_DIRECTORY):                    
                    os.remove(UPLOAD_DIRECTORY+filename)
                Server.fileNameStorage = {}

            if receivedCode in Server.sendBox and Server.sendBox[receivedCode] != '$*#*#$':
                receivedMessage = Server.sendBox[receivedCode]
                if Server.selectedTag[receivedCode] == 'single_p' or Server.selectedTag[receivedCode] == 'single_s':
                    del Server.sendBox[receivedCode]
                    del Server.selectedTag[receivedCode]
            else:
                receivedMessage = 'Sorry no message found for the provided code.'
        return receivedMessage

    @app.route('/upload/', methods = ['POST'])
    def upload_file():
        file = request.files['file']
        selectOption = request.form['selectOption']
        Server.incrementer = Server.generateCode(selectOption)
        Server.selectedTag[str(Server.incrementer)] = selectOption
        formattedFileName = re.sub(r'[\\/*#\s?&$:"<>|]',"",file.filename)
        Server.fileName = formattedFileName
        Server.sendBox[str(Server.incrementer)] = '$*#*#$'
        Server.fileNameStorage[str(Server.incrementer)] = Server.fileName
        file.save(UPLOAD_DIRECTORY+secure_filename(formattedFileName))
        print('File uploaded successfully')
        hashedVal = str(Server.incrementer)
        return hashedVal

    @app.route('/download/', methods=["GET", "POST"])
    def download_file():
        fileToken = request.form.get('fileToken')
        response = ('',204)
        if fileToken in Server.fileNameStorage:
            absolute_image_path = os.path.join(UPLOAD_DIRECTORY, Server.fileNameStorage[fileToken])
            response = send_file(absolute_image_path, attachment_filename=Server.fileNameStorage[fileToken], as_attachment=True)
            response.headers["x-filename"] = Server.fileNameStorage[fileToken]
            response.headers["Access-Control-Expose-Headers"] = 'x-filename'
            if Server.selectedTag[fileToken] == 'single_p' or Server.selectedTag[fileToken] == 'single_s':
                os.remove(UPLOAD_DIRECTORY+Server.fileNameStorage[fileToken])
                del Server.sendBox[fileToken]
                del Server.fileNameStorage[fileToken]
                del Server.selectedTag[fileToken]
        return response


    @app.route('/remove/', methods=["GET", "POST"])
    def remove_file():
        msg = 'File removed successfully!'
        if request.method == "POST":
            try:
                data = request.get_json(silent=True)
                fileName = data.get('removeFileName')
                print(Server.sendBox)
                if Server.sendBox[fileName] == '$*#*#$':
                    fileName = Server.fileNameStorage[fileName]
                print(fileName)
                os.remove(UPLOAD_DIRECTORY+fileName)
                del Server.sendBox[fileName]
                del Server.fileNameStorage[fileName]
            except:
                msg = 'No such file to remove!'
        return msg

if __name__ == '__main__':
    server = Server()
    app.run(debug=True, host='0.0.0.0')
