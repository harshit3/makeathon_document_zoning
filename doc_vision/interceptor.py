import json
import os
import shutil
import base64
import cv2
from .docVision import DocVision
from pdf2image import convert_from_path


class Interceptor:
    def __init__(self):
        pass

    @staticmethod
    def convert(file_path):
        # file_path = raw_input("Enter the path to the form document: ")
        ext = os.path.splitext(file_path)[1]   # get file extention
        filename = os.path.splitext(os.path.basename(file_path))[0]  # get only file name not entire path
        ext = ext[1:].lower()
        if ext == "pdf":
            pages = convert_from_path(file_path, 500)
            page_count = len(pages)
            if not os.path.isdir("img"):
                # shutil.rmtree("img")
                os.mkdir("img")
            os.chdir("img")
            if os.path.isdir(filename):
                shutil.rmtree(filename)
            os.mkdir(filename)
            os.chdir(filename)  # inside base folder of file
            base_folder = os.getcwd()
            for i, page in enumerate(pages, 1):
                p = 'page' + str(i)
                os.mkdir(p)
                os.chdir(p)  # inside page folder
                fname = p + '.jpg'
                page.save(fname, 'JPEG')
                # load the example image and convert it to grayscale
                image = cv2.imread(fname)
                # save height and width of the image as global variables
                h, w, _ = image.shape  # assumes color image
                f = 2  # factor

                n_h = h // f  # integer division
                n_w = w // f
                pdf2img = cv2.resize(image, (n_w, n_h))
                cv2.imwrite("resized.jpg", pdf2img)
                # return {"width": str(w // f), "height": str(h // f), "base_folder": base_folder}
                os.chdir("..")  # in base folder of file
            with open("page1/resized.jpg", "rb") as f2:
                stw = (base64.b64encode(f2.read())).decode("utf-8")
            # os.chdir("../..")  # in doc_vision
            return {"base64_string": stw, "page_count": page_count, "page": 1, "width": n_w, "height": n_h, "base_folder": base_folder}
            # return {"page_count": page_count, "page": 1, "width": n_w, "height": n_h, "base_folder": base_folder}
        else:
            return {"Error message": "File is not a PDF!"}

    @staticmethod
    def vision(path):
        print("current File: "+os.path.basename(path))
        for page in sorted(os.listdir(path)):
            os.chdir(path+"/"+page)
            print("\tCurrent page: "+page)
            resized = cv2.imread("resized.jpg")
            gray = cv2.cvtColor(resized, cv2.COLOR_BGR2GRAY)
            DocVision().segmentation(os.path.basename(path), page, gray)
            print("Doc Vision: DONE")
            # Interceptor.doc_vision(gray)
        os.chdir("..")  # in base folder of file

    # @staticmethod
    # def doc_vision(img):


    @staticmethod
    def doc_search(path, term):
        print("Search Query: "+term)
        print("Current Path: "+path)
        results = {"meta": {"filename": os.path.basename(path), "term": term}, "coords": []}
        for page in sorted(os.listdir(path)):
            os.chdir(path+"/"+page)
            print("\tCurrent page: "+page)
            resized = cv2.imread("resized.jpg")
            results["coords"] += [{page[4:]: DocVision.search(resized, term)}]
        return json.dumps(results)

    @staticmethod
    def getPage(path):
        if os.path.isdir(path):
            with open(path + "/resized.jpg", "rb") as fp:
                image = cv2.imread(path+"/resized.jpg")
                h, w, _ = image.shape  # assumes color image
                stw = (base64.b64encode(fp.read())).decode("utf-8")
                return {"base64_string": stw, "width": w, "height": h}
        else:
            return {"Error message": "Wrong filename or page number!"}