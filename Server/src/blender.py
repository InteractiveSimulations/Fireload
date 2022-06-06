import subprocess
import os
import json

#Function starts blender and transfers the 'szenario' ('Drehbuch')
def startBlender():

    # blenderPath = '../../Blender Foundation/Blender 2.93'
    blender_path = 'C:/Program Files/Blender Foundation/Blender 2.93'

    dir_name = os.path.dirname(__file__).replace("\\", "/")     #current work directory
    parent_directory1 = os.path.dirname(dir_name)               #Server directory
    parent_directory2 = os.path.dirname(parent_directory1)      #Fireload directory

    #Joined path, path of the fireSim version
    version = os.path.join(parent_directory2, "BlenderSimulation", "FireSimulation", "Fire_v7.blend").replace("\\", "/")
    #version = dir_name + '/../../BlenderSimulation/FireSimulation/Fire_v7.blend'

    #Path of the ServerScript
    script = os.path.join(parent_directory2, "BlenderSimulation", "PythonScript", "ServerScript.py")

    # Outputpfad, where the images are stored
    #images_path = dir_name + '/../../BlenderSimulation/RenderImages/'
    images_path = parent_directory2 + '/BlenderSimulation/RenderImages/'

    os.chdir(blender_path)

    # script = ServerScript(json)
    # Runs Blender in background and saves images
    #'blender', '-b', version, '--python', script, -o', images_path, '-a'
    subprocess.run(['blender', '-b', version, '--python', script, '-a']) #Blenderdatei

if __name__ == "__main__":
    startBlender()