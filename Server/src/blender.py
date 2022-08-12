import subprocess
import os
import json

#Function starts blender and transfers the 'szenario' ('Drehbuch')
def startBlender():

    dir_name = os.path.dirname(__file__).replace("\\", "/")     # current work directory
    parent_directory1 = os.path.dirname(dir_name)               # Server directory
    parent_directory2 = os.path.dirname(parent_directory1)      # Fireload directory

    print(parent_directory2)

    # Joined path of the fireSim version
    version_rgba = os.path.join(parent_directory2, "BlenderSimulation", "FireSimulation", "Fire_v10.blend").replace("\\", "/")

    # Joind parth of the zBuffer Frames
    version_z = os.path.join(parent_directory2, "BlenderSimulation", "FireSimulation", "Fire_ZBuffer_v10.blend").replace("\\", "/")

    # Path of the ServerScriptRGBA
    script_rgba = os.path.join(parent_directory2, "BlenderSimulation", "PythonScript", "ServerScriptRGBA.py").replace("\\", "/")

    # Path of the ServerScriptZBuffer
    script_z = os.path.join(parent_directory2, "BlenderSimulation", "PythonScript", "ServerScriptZBuffer.py")

    # Runs Blender in background and saves images
    #'blender', '-b', version, '--python', script, -o', images_path, '-a'

    # RGBA Frames Rendering
    #subprocess.run(['blender', '-b', versionRGBA, '--python', scriptRGBA])
    subprocess.run(['blender', '-b', version_rgba, '--python', script_rgba, '-a'])

    # ZBuffer Frames Rendering
    subprocess.run(['blender', '-b', version_z, '--python', script_z, '-a'])

if __name__ == "__main__":
    startBlender()