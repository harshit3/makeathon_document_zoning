from flask import Flask
import json
from flask import request
import base64
import os
from flask_cors import CORS
from .interceptor import Interceptor

app = Flask(__name__)
CORS(app)
# global variables
count = 0
root_folder = ""
base_folder = ""


@app.route('/highlight/<term>', methods=['GET'])
def highlight(term):
    global base_folder
    return Interceptor.doc_search(base_folder, term.lower())


@app.route('/ack', methods=['GET'])
def ack():
    global base_folder
    Interceptor.vision(base_folder)
    return "Success"


@app.route('/', methods=['POST'])
def stringToImage():
    global count, root_folder, base_folder
    count += 1
    if count == 1:
        root_folder = os.getcwd()
    elif count > 1:
        os.chdir(root_folder)
    print("Converting PDF to Image...")
    data = request.get_json()
    base64_string = data["base64_string"]
    filename = data["fileName"]
    content = base64.b64decode(base64_string)
    fp = open("inp/"+filename, "wb")
    fp.write(content)
    fp.close()
    # filename = "05132019%DEVICE_DATE_MMDDYYYY%05132019_1-2.pdf"
    j = Interceptor.convert("inp/"+filename)
    if "Error message" not in j.keys():
        base_folder = j["base_folder"]
        del j['base_folder']
        print("DONE.")
    return json.dumps(j)


@app.route('/getpage', methods=['POST'])
def getpage():
    print("getting page...")
    data = request.get_json()
    page = data["page"]
    filename = os.path.splitext(data["fileName"])[0]
    path = root_folder + "/" + "img/" + filename + "/page" + str(page)
    response = Interceptor.getPage(path)
    return json.dumps(response)