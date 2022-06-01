import os
from pathlib import Path
print('test')
fileDirectory = os.path.dirname(__file__)
parentDirectory1 = os.path.dirname(fileDirectory)
parentDirectory2 = os.path.dirname(parentDirectory1)
parentDirectory3 = os.path.dirname(parentDirectory2)
parentDirectory4 = os.path.dirname(parentDirectory3)
path = '/Fireload/BlenderSimulation/Test_Json/JsonForBlender.json'
path1 = '/Users/max/Documents/Medientechnologie/Sommersemester_2022/IA_WEB/Fireload/BlenderSimulation/Test_Json/JsonForBlender.json'
abspath = os.path.abspath("pathTest.py")
filename = os.path.join(fileDirectory, path)
relative_path = os.path.relpath(path1, parentDirectory4)
pathtest = str(parentDirectory4 + path) 
#print(fileDirectory)
print(filename)
#print(str(parentDirectory4 + path))
#print(relative_path)
#print(abspath)

home = Path.home()
#print(home)

if pathtest == path1:
    print('yes')
else:
    print('no')