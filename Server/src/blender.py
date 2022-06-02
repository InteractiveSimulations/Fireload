import subprocess
import os
import json

#Function starts blender and transfers the 'szenario' ('Drehbuch')
def startBlender():



    # blenderPath = '../../Blender Foundation/Blender 2.93'
    blender_path = 'C:/Program Files/Blender Foundation/Blender 3.1'

    dir_name = os.path.dirname(__file__).replace("\\", "/")
    print(dir_name)
    version = dir_name + '/../../BlenderSimulation/FireSimulation/Versionen/Fire_v5.blend'




    # Outputpfad, indem die Bilder gespeichert werden
    images_path = dir_name + '/../../BlenderSimulation/EXR Images/'

    os.chdir(blender_path)

    # script = ServerScript(json)
    # Runs Blender in background and saves images
    subprocess.run(['blender', '-b', version, '-o', images_path, '-a']) #Blenderdatei

if __name__ == "__main__":
    startBlender()