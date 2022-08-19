import math
import numpy
import numpy as np
import cv2 as cv
import os
import json
from PIL import Image

def startAtlasing():

    fileDirectory = os.path.dirname(__file__)
    parentDirectory1 = os.path.dirname(fileDirectory)
    parentDirectory2 = os.path.dirname(parentDirectory1)

    json_path = os.path.join(parentDirectory2, "BlenderSimulation", "Test_Json", "JsonForBlender.json")
    atlas_rgba_dir = os.path.join(parentDirectory2,"dist","assets","simulations")
    atlas_z_dir = os.path.join(parentDirectory2,"dist","assets","simulations", "zBuffer")

    with open(json_path) as json_file:
        data = json.load(json_file)
        start_frame = data["startFrame"]
        end_frame = data["endFrame"]
        frame_size = data["resolutionXY"]

    atlas_size = 4096
    frames_per_dimension = int(atlas_size/frame_size)
    frames_per_atlas = int(frames_per_dimension * frames_per_dimension)
    number_of_frames = int(end_frame - start_frame + 1)
    number_of_atlases = math.ceil(number_of_frames/frames_per_atlas)

    atlases_rgba = []
    atlases_z = []

    for i in range(number_of_atlases):

        atlases_rgba.append( np.zeros((4096, 4096, 4), dtype=numpy.int8) )
        atlases_z.append(np.zeros( (4096, 4096, 3), dtype=numpy.int8) )

    for n, perspective in enumerate("FRBL"):

        for i in range(number_of_atlases):

            atlas_start_frame = start_frame + i * frames_per_atlas
            atlas_end_frame = (i + 1) * frames_per_atlas

            if i + 1 == number_of_atlases:
                atlas_end_frame = i * frames_per_atlas + ( number_of_frames % frames_per_atlas )

            frame_number = atlas_start_frame

            for y in range(frames_per_dimension):


                for x in range(frames_per_dimension):
                    frame_number = i * frames_per_atlas + y * frames_per_dimension + x + 1

                    if frame_number > end_frame:
                        break

                    zeros = ""
                    if frame_number < 10:
                        zeros = "000"
                    elif frame_number < 100:
                        zeros = "00"
                    elif frame_number < 1000:
                        zeros = "0"

                    frame_rgba_path = os.path.join(atlas_rgba_dir, zeros + str(frame_number) + "_" + perspective + ".png")
                    frame_rgba = cv.imread(frame_rgba_path, cv.IMREAD_UNCHANGED)
                    frame_rgba = cv.cvtColor(frame_rgba, cv.COLOR_BGRA2RGBA)
                    atlases_rgba[i][y * frame_size:(y + 1) * frame_size, x * frame_size:(x + 1) * frame_size] = frame_rgba

                    frame_z_path = os.path.join(atlas_z_dir,"Image" + zeros + str(frame_number) + "_Z" + perspective + ".jpg")
                    frame_z = cv.imread(frame_z_path)
                    atlases_z[i][y * frame_size:(y + 1) * frame_size, x * frame_size:(x + 1) * frame_size] = frame_z

                if frame_number > end_frame:
                    break

            # Todo write images to hard drive with opencv
            # atlases[i][:,:,][4] / 65535
            atlas_rgba_path = os.path.join(atlas_rgba_dir, perspective + "_" + str(atlas_start_frame) + "_" + str(atlas_end_frame) + ".png")
            atlas_z_path = os.path.join(atlas_z_dir, "Z" + perspective + "_" + str(atlas_start_frame) + "_" + str(atlas_end_frame) + ".png")

            atlas_rgba = Image.fromarray( atlases_rgba[i], mode="RGBA" )
            atlas_rgba.save(atlas_rgba_path, compress_level = 1)

            atlas_z = Image.fromarray( atlases_z[i], mode="RGB" )
            atlas_z.save(atlas_z_path, compress_level = 1)

            # cv.imwrite(atlas_path, atlases[i])

if __name__ == "__main__":
    startAtlasing()