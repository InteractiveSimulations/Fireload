import math
import subprocess

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

    blender_json_path = os.path.join(parentDirectory2, "BlenderSimulation", "Test_Json", "JsonForBlender.json")
    send_json_path = os.path.join(parentDirectory2, "BlenderSimulation", "Test_Json", "Send.json")
    atlas_rgba_dir = os.path.join(parentDirectory2,"dist","assets","simulations")
    atlas_z_dir = os.path.join(parentDirectory2,"dist","assets","simulations", "zBuffer")

    with open(blender_json_path, "r") as json_file:
        data = json.load(json_file)
        compression = data["compression"]
        start_frame = data["startFrame"]
        end_frame = data["endFrame"]
        frame_size = data["resolutionXY"]

    send_data = []
    with open(send_json_path, "r") as json_file:
        send_data = json.load(json_file)
        send_data["atlasFilenames"] = []
        send_data["atlasFilenames"].append([ [], [], [], [] ])
        send_data["atlasFilenames"].append([ [], [], [], [] ])

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
            atlas_end_frame = start_frame + (i + 1) * frames_per_atlas - 1

            if i + 1 == number_of_atlases and number_of_frames % frames_per_atlas != 0:
                atlas_end_frame = atlas_start_frame + ( number_of_frames % frames_per_atlas ) - 1

            frame_number = atlas_start_frame

            for row in range(frames_per_dimension):

                for col in range(frames_per_dimension):

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
                    atlases_rgba[i][row * frame_size:(row + 1) * frame_size, col * frame_size:(col + 1) * frame_size] = frame_rgba

                    frame_z_path = os.path.join(atlas_z_dir, "Image" + zeros + str(frame_number) + "_Z" + perspective + ".jpg")
                    frame_z = cv.imread(frame_z_path)
                    atlases_z[i][row * frame_size:(row + 1) * frame_size, col * frame_size:(col + 1) * frame_size] = frame_z

                    frame_number += 1

                if frame_number > end_frame:
                    break

            atlas_rgba_filename = perspective + "_" + str(atlas_start_frame) + "_" + str(atlas_end_frame)
            atlas_z_filename = "Z" + perspective + "_" + str(atlas_start_frame) + "_" + str(atlas_end_frame)

            atlas_rgba_path = os.path.join(atlas_rgba_dir, atlas_rgba_filename + ".png")
            atlas_z_path = os.path.join(atlas_z_dir, atlas_z_filename + ".png")

            atlas_rgba = Image.fromarray( atlases_rgba[i], mode="RGBA" )
            atlas_rgba.save(atlas_rgba_path, compress_level = 1)

            atlas_z = Image.fromarray( atlases_z[i], mode="RGB" )
            atlas_z.save(atlas_z_path, compress_level = 1)

            if compression:

                subprocess.run(["basisu", "-ktx2", "-y_flip", atlas_rgba_path, '-output_path', atlas_rgba_dir])
                subprocess.run(["basisu", "-ktx2", "-y_flip", atlas_z_path, '-output_path', atlas_z_dir])

                send_data["atlasFilenames"][0][n].append(atlas_rgba_filename + ".ktx2")
                send_data["atlasFilenames"][1][n].append(atlas_z_filename + ".ktx2")

            else:
                send_data["atlasFilenames"][0][n].append(atlas_rgba_filename + ".png")
                send_data["atlasFilenames"][1][n].append(atlas_z_filename + ".png")

            with open(send_json_path, "w") as json_file:
                json.dump(send_data, json_file, indent=4, sort_keys=True)


if __name__ == "__main__":
    startAtlasing()