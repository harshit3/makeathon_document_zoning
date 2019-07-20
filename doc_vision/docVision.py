from PIL import Image
import pytesseract
from pytesseract import Output
import cv2
import os
import shutil
from .misc import Misc
import json
import base64
text_pos = {}


class DocVision:
    # create an empty dictionary to store results of classified OCR results

    def __init__(self):
        pass
    
    @staticmethod
    def read_text(inp_img, name, coord):
        global text_pos
        # print("----------- in read_text ------------")
        x1, y1, x2, y2 = coord
        # process the image for better OCR
        # binary = Misc.pre_processing(inp_img)
        # write the binary image to disk as a temporary file so we can
        # apply OCR to it
        filename = "binary.png"
        cv2.imwrite(filename, inp_img)
        # load the image as a PIL/Pillow image, apply OCR, and then delete
        # the temporary file
        ocr_img = Image.open(filename)
        # while applying OCR, specify language as English for faster performance ,
        # PSM - Page segmentation mode is 6 ,i.e, to consider image as a block of text
        # OEM - recognition engine is 3, i.e, default

        config = '--psm 6 --oem 3'

        d = pytesseract.image_to_data(ocr_img, output_type=Output.DICT)
        n_boxes = len(d['level'])
        for i in range(n_boxes):
            (x, y, w, h) = (d['left'][i], d['top'][i], d['width'][i], d['height'][i])
            cv2.rectangle(inp_img, (x, y), (x + w, y + h), (0, 255, 0), 2)
            t = d['text'][i].lower()
            if t in text_pos["pos"]:
                text_pos["pos"][t] += [[x+x1, y+y1, x2, (y+y1+h)]]
            else:
                text_pos["pos"][t] = [[x+x1, y+y1, x2, (y+y1+h)]]
        cv2.imwrite('ocr.jpg', inp_img)
        # cv2.waitKey(0)
        text = pytesseract.image_to_string(ocr_img, lang='eng', config=config).encode('ascii', 'ignore').decode('ascii')

        # save the results to a file
        f = open("OCR_"+name+".txt", 'w')
        f.write(text)
        f.close()
        os.remove(filename)

    def segmentation(self, filename, page, img):
        global text_pos
        print("----------- in Segmentation ------------")
        img2 = img.copy()
        p = img.copy()
        lines = Misc.find_lines(p)
        sections = Misc.find_sections(lines)
        # rects = Misc.merge_rects(groupedLocs)
        print("Sections :" +str(sections))
        for (x1, y1, x2, y2) in sections:
            # draw the ROI rectangles over the image
            cv2.rectangle(p, (x1, y1), (x2, y2), (0, 255, 0), 2)
        cv2.imwrite("horizotal boxes.jpg", p)
        thresh = Misc.seg_pre_processing(img2)
        groupLocs = Misc.find_roi(thresh)
        # set path for saving the results for each segmentation
        path = "segs"
        try:
            if os.path.isdir(path):
                # remove any existing results
                print("removing folder...")
                shutil.rmtree(path)
            
        except OSError:
            print("Deletion of the directory %s failed" % path)
        else:
            print("Successfully deleted the directory %s" % path)
            try:
                # create the directory
                os.mkdir(path)
            except OSError:
                print("Creation of the directory %s failed" % path)
            else:
                print("Successfully created the directory %s" % path)
                # change working directory to the new path
                os.chdir(path)
                # mergedLocs = Misc.merge_rects(groupLocs)
                # create a copy of the image to draw over it
                # mergedLocs = sections
                img3 = img.copy()
                text_pos = {"meta": {"filename": filename, "page": page}, "pos": {}}
                # text_pos["pos"] = {}
                for pair in zip(sections, sections[1:]):
                    # draw the ROI rectangles over the image
                    x1, y1, x2, y2 = pair[0][0], pair[0][1], pair[1][2], pair[1][3]
                    cv2.rectangle(img3, (x1, y1), (x2, y2), (0, 255, 0), 2)
                    # crop the ROI part and send it for OCR
                    crop_img = img.copy()[y1:y2, x1:x2]
                    crop_name = str(x1)+"_"+str(y1)+"_"+str(x2)+"_"+str(y2)
                    try:
                        # create a new directory for the OCR to save its results
                        os.mkdir(crop_name)
                    except OSError:
                        print("Creation of the directory %s failed" % crop_name)
                        # continue execution to next ROI
                        continue
                    else:
                        print("Successfully created the directory %s" % crop_name)
                        # change working directory to the new path
                        os.chdir(crop_name)
                        # save the cropped image as a file
                        cv2.imwrite(crop_name+".png", crop_img)
                        # perform OCR on the ROI
                        self.read_text(crop_img, crop_name, (x1, y1, x2, y2))
                        # change working directory to parent folder
                        os.chdir("./..")
                # save the positions of texts in a json
                with open('text_pos.json', 'w') as outfile:
                    json.dump(text_pos, outfile)
                # print(text_pos.keys())
                # change working directory to parent folder
                os.chdir("./..")
                # save the final image with ROI rectangles
                cv2.imwrite("segmentation.png", img3)
                print("==========================================================")
                print("number of boxes : "+str(len(sections)))
                print("==========================================================")
    
    @staticmethod
    def search(img, term):
        fp = open("segs/text_pos.json")
        index = json.load(fp)
        pos_coord = index["pos"]
        pos = []
        if term in pos_coord.keys():
            pos = pos_coord[term]
            print("All Co-ordinates: "+str(pos))
            img4 = img.copy()
            cv2.putText(img4, "Search: "+term, (20, 50), cv2.FONT_HERSHEY_SIMPLEX, 3.0, (255, 0, 255))
            pad = 15
            for (x1, y1, x2, y2) in pos:
                cv2.rectangle(img4, (x1-pad, y1-pad), (x2+pad, y2+pad), (255, 0, 0), 5)
            cv2.imwrite("search results.jpg", img4)  # write search result image
            # with open("search results.jpg", "rb") as f2:
            #     stw = (base64.b64encode(f2.read())).decode("utf-8")
        return pos
