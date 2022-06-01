import os
from pathlib import Path
print('test')
fileDirectory = os.path.dirname(__file__)
parentDirectory1 = os.path.dirname(fileDirectory)
parentDirectory2 = os.path.dirname(parentDirectory1)
parentDirectory3 = os.path.dirname(parentDirectory2)
parentDirectory4 = os.path.dirname(parentDirectory3)
path = '\Fireload\BlenderSimulation\Test_Json\JsonForBlender.json'

filename = os.path.join(path, parentDirectory4,"test")
filename = os.path.join(parentDirectory4,"Fireload","BlenderSimulation","Test_Json","JsonForBlender.json")




#print(fileDirectory)
print(filename)
#print(pathtest)
#print(relative_path)
#print(abspath)

home = Path.home()

#print(home)

#if pathtest == path:
    #print('yes')
#else:
    #print('no')