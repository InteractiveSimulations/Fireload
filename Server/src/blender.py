import subprocess
import os


# Funktion startet Blender und übergibt das Drehbuch
def startBlender():
    blenderPath = 'C:/Program Files/Blender Foundation/Blender 2.93'
    file = 'C:/Users/natas/Documents/Studium/TH/6_Semester/IA_WEB_Projekt/TestDateiBlender/TestBlender.blend'

    #subprocess.run(['blender', '-b', '-P', file])
    #subprocess.run(['blender', r'C:\Users\natas\Documents\Studium\TH\6_Semester\IA_WEB_Projekt\TestDateiBlender\TestBlender.blend'])
    #subprocess.run(['blender', file], shell = True)
    #subprocess.run(['C:/Program Files/Blender Foundation/Blender 2.93'])
    #subprocess.run(['blender'])

    os.chdir(blenderPath)

    process = subprocess.Popen(['dir'], stdout=subprocess.PIPE, stderr=subprocess.PIPE)
    stdout, stderr = process.communicate()
    print(stdout)

    subprocess.run(['blender', file])

if __name__ == "__main__":
    print("test")
    startBlender()