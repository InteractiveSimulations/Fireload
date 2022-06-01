import subprocess
import os
import json

#Function starts blender and transfers the 'szenario' ('Drehbuch')
def startBlender():

    #blenderPath = '../../Blender Foundation/Blender 2.93'
    blenderPath = 'C:/Program Files/Blender Foundation/Blender 2.93'
    file_ = '../../BlenderSimulation/FireSimulation/Versionen/Fire_v4.blend'
    file = 'C:/Users/natas/Documents/Studium/TH/6_Semester/IA_WEB_Projekt/Fire_v5.blend'

    #Outputpfad, indem die Bilder gespeichert werden
    imagesPath = 'C:/Users/natas/Documents/Studium/TH/6_Semester/IA_WEB_Projekt/Project/EXRImages/'

    os.chdir(blenderPath)

    #script = ServerScript(json)
    #Runs Blender in background and saves images
    subprocess.run(['blender', '-b', file, '-o', imagesPath, '-a']) #Blenderdatei

if __name__ == "__main__":
    startBlender()