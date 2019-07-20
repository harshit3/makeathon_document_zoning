import cv2
import numpy as np


class Misc:
    def __init__(self):
        pass

    @staticmethod
    def rect_distance(rect1, rect2):
        # print("----------- in rect_dist ------------")
        (x1a, y1a, x1b, y1b) = rect1
        (x2a, y2a, x2b, y2b) = rect2
        left = x2b < x1a
        right = x1b < x2a
        bottom = y2b < y1a
        top = y1b < y2a

        if top and left:
            return sqrt((x1a - x2b) ** 2 + (y1b - y2a) ** 2)
        elif left and bottom:
            return sqrt((x1a - x2b) ** 2 + (y1a - y2b) ** 2)
        elif bottom and right:
            return sqrt((x1b - x2a) ** 2 + (y1a - y2b) ** 2)
        elif right and top:
            return sqrt((x1b - x2a) ** 2 + (y1b - y2a) ** 2)
        elif left:
            return x1a - x2b
        elif right:
            return x2a - x1b
        elif bottom:
            return y1a - y2b
        elif top:
            return y2a - y1b
        else:  # rectangles intersect
            return 0.0

    @staticmethod
    def merge_rects(groupLocs):
        # print("----------- in merge_rects ------------")

        # merge nearby rectangles, as they probably are a single block with
        # multiple contours, i.e, words.
        # loop over all the rectangles
        for i, (x1a, y1a, x1b, y1b) in enumerate(groupLocs):
            # for each rectangle find the distance to each other rectangle
            for j, (x2a, y2a, x2b, y2b) in enumerate(groupLocs):
                # ignore self-comparision
                if i == j:
                    continue
                # print("---------- "+str(i)+", "+str(j)+" -----------")
                # calculate the shortest euclidean distance between 2 rectangles
                dist = int(Misc.rect_distance((x1a, y1a, x1b, y1b), (x2a, y2a, x2b, y2b)))
                # merge them if they are close
                if dist < 20:
                    # make a new rectangle bounding both the rectangles by
                    # setting the extreme ends of both rectangles as its coordinates
                    _x1 = min(x1a, x2a)
                    _y1 = min(y1a, y2a)
                    _x2 = max(x1b, x2b)
                    _y2 = max(y1b, y2b)
                    # replace the one of the old rectangle with the new bounding rectangle
                    # and delete the other one
                    groupLocs[i] = [_x1, _y1, _x2, _y2]
                    del groupLocs[j]
                    # recursively calling the method again as there is a new rectangle
                    return Misc.merge_rects(groupLocs)
        # finally return once there is no more changes/merges.
        return groupLocs

    @staticmethod
    def sort_contours(cnts, method="left-to-right"):
        # initialize the reverse flag and sort index
        rev_flag = False
        i = 0

        # handle if we need to sort in reverse
        if method == "right-to-left" or method == "bottom-to-top":
            rev_flag = True

        # handle if we are sorting against the y-coordinate rather than
        # the x-coordinate of the bounding box
        if method == "top-to-bottom" or method == "bottom-to-top":
            i = 1

        # construct the list of bounding boxes and sort them from top to
        # bottom
        boundingBoxes = [cv2.boundingRect(c) for c in cnts]
        # b[1] = boundingBoxes, key for sorting is b[1][i]
        # where b[1][0] = x-coordinate(horizontal sort)
        # if rev_flag is False - LTR sort, else it's RTL
        # where b[1][1] = y-coordinate(vertical sort)
        # if rev_flag is False - TTB sort, else it's BTT

        (cnts, boundingBoxes) = zip(*sorted(zip(cnts, boundingBoxes),
            key=lambda b:b[1][i], reverse=rev_flag))

        # return the list of sorted contours and bounding boxes
        return (cnts, boundingBoxes)

    @staticmethod
    def pre_processing(inp_img):
        # print("----------- in pre-processing ------------")

        # Apply blur to smooth out the edges
        # blur = cv2.medianBlur(inp_img, 3)
        # Apply dilation and erosion to remove some noise
        # kernel = np.ones((1, 1), np.uint8)
        # erode = cv2.erode(inp_img, kernel, iterations=1)
        # dilate = cv2.dilate(erode, kernel, iterations=1)
        # binarize the image for better OCR performance
        binary = cv2.threshold(inp_img, 0, 255, cv2.THRESH_BINARY | cv2.THRESH_OTSU)[1]

        # creating a gallery to show steps of pre-processing
        # gallery1 = np.hstack((inp_img, erode))
        # gallery2 = np.hstack((dilate, binary))
        # gallery = np.vstack((gallery1, gallery2))
        # cv2.imwrite("pre_processing_steps.png", gallery)
        return binary

    @staticmethod
    def seg_pre_processing(img):
        # print("----------- in seg_pre_processing ------------")
        h, w = img.shape[:2]
        # (thresh, img_bin) = cv2.threshold(img, 0, 255, cv2.THRESH_BINARY | cv2.THRESH_OTSU)  # Thresholding the image
        # img_bin = 255 - img_bin  # Invert the image
        # cv2.imwrite("binary.jpg", img_bin)
        # kernel_length = np.array(img_bin).shape[1] // 40
        # hori_kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (kernel_length, 1))
        # img_temp2 = cv2.erode(img_bin, hori_kernel, iterations=3)
        # horizontal_lines_img = cv2.dilate(img_temp2, hori_kernel, iterations=3)
        # cv2.imwrite("horizontal_lines.jpg", horizontal_lines_img)

        # smoothen the image to remove noise
        blur = cv2.medianBlur(img, 3)
        # blur = cv2.GaussianBlur(img, (5, 5), 0)
        # initialize a rectangular kernel (wider than it is tall)
        rectKernel = cv2.getStructuringElement(cv2.MORPH_RECT, (25, 12))
        # apply a blackhat morphological operator to find dark regions
        # against a light background (i.e., the routing and account numbers)

        blackhat = cv2.morphologyEx(blur, cv2.MORPH_BLACKHAT, rectKernel)
        # compute the Scharr gradient of the blackhat image, then scale
        # the rest back into the range [0, 255]
        gradX = cv2.Sobel(blackhat, ddepth=cv2.CV_32F, dx=1, dy=0,
                          ksize=-1)
        gradX = np.absolute(gradX)
        (minVal, maxVal) = (np.min(gradX), np.max(gradX))
        gradX = (255 * ((gradX - minVal) / (maxVal - minVal)))
        gradX = gradX.astype("uint8")
        # apply a closing operation using the rectangular kernel to help
        # close gaps in between routing and account digits, then apply
        # Otsu's thresholding method to binarize the image
        gradX = cv2.morphologyEx(gradX, cv2.MORPH_CLOSE, rectKernel)
        thresh = cv2.threshold(gradX, 0, 255,
                               cv2.THRESH_BINARY | cv2.THRESH_OTSU)[1]

        # creating a gallery to show steps of pre-processing
        gallery1 = np.hstack((img, blackhat))
        gallery2 = np.hstack((gradX, thresh))
        gallery = np.vstack((gallery1, gallery2))
        f = 2
        gallery = cv2.resize(gallery, (w//f, h//f))
        cv2.imwrite("seg_PP_steps.png", gallery)

        return thresh

    @staticmethod
    def find_roi(img, padding=12):
        print("----------- in find_roi ------------")
        i_h, i_w = img.shape  # assumes color image
        # find contours in the binarized image, then initialize the
        # list of group locations
        groupCnts = cv2.findContours(img, cv2.RETR_EXTERNAL,
                                     cv2.CHAIN_APPROX_SIMPLE)[0]
        groupLocs = []
        # loop over the group contours
        for (i, c) in enumerate(groupCnts):
            # compute the bounding box of the contour
            (x, y, w, h) = cv2.boundingRect(c)
            # only accept the contour region as a grouping of characters if
            # the ROI is sufficiently large
            if i_w*0.05 < w < i_w*0.5 and i_h*0.03 < h < i_h*0.4:
                groupLocs.append((x, y, w, h))
                # get convex hull
        #         hull = cv2.convexHull(c)
        #         cv2.drawContours(real, [hull], -1, (0, 0, 255), 1)
        # cv2.imwrite("convex hull.png",real)
        # exit()
        # sort the locations from left-to-right
        groupLocs = sorted(groupLocs, key=lambda x: x[0])
        # change from (x,y,w,h) to (x1,y1,x2,y2) rectangle repr format
        groupLocs = [[x, y, x+w, y+h] for (x, y, w, h) in groupLocs]
        # padding in pixels around each ROI
        # apply the padding on all 4 sides for all ROI rectangles
        groupLocs = [[x1 - padding, y1 - padding, x2 + padding, y2 + padding] for (x1, y1, x2, y2) in groupLocs]
        return groupLocs

    @staticmethod
    def find_sections(img):
        print("----------- in find_sections ------------")
        i_h, i_w = img.shape  # assumes color image
        # find contours in the binarized image, then initialize the
        # list of group locations
        groupCnts = cv2.findContours(img, cv2.RETR_EXTERNAL,
                                     cv2.CHAIN_APPROX_SIMPLE)[0]
        groupLocs = []
        # loop over the group contours
        for (i, c) in enumerate(groupCnts):
            # compute the bounding box of the contour
            (x, y, w, h) = cv2.boundingRect(c)
            # only accept the contour region as a grouping of characters if
            # the ROI is sufficiently large
            if i_w * 0.2 < w < i_w and i_h * 0.01 < h < i_h * 0.15:
                # if i_w*0.05 < w < i_w*0.5 and i_h*0.03 < h < i_h*0.4:
                # groupLocs.append((x, y, w, h))
                groupLocs.append(c)
                # get convex hull
        #         hull = cv2.convexHull(c)
        #         cv2.drawContours(real, [hull], -1, (0, 0, 255), 1)
        # cv2.imwrite("convex hull.png",real)
        # exit()
        # sort the locations from left-to-right
        groupLocs, boxes = Misc.sort_contours(groupLocs, method="top-to-bottom")
        # change from (x,y,w,h) to (x1,y1,x2,y2) rectangle repr format
        boxes = [[x, y, x + w, y + h] for (x, y, w, h) in boxes]
        return boxes

    @staticmethod
    def find_lines(img):
        # gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        (thresh, img_bin) = cv2.threshold(img, 0, 255, cv2.THRESH_BINARY | cv2.THRESH_OTSU)  # Thresholding the image
        img_bin = 255 - img_bin  # Invert the image
        
        # Defining a kernel length
        kernel_length = np.array(img).shape[1] // 40
        # A horizontal kernel of (kernel_length X 1), which will help to detect all the horizontal line from the image.
        hori_kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (kernel_length, 1))
        # Morphological operation to detect horizontal lines from an image
        img_temp2 = cv2.erode(img_bin, hori_kernel, iterations=1)
        horizontal_lines_img = cv2.dilate(img_temp2, hori_kernel, iterations=1)
        cv2.imwrite("horizontal_lines.jpg", horizontal_lines_img)
        return horizontal_lines_img

