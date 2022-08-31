#Authors: Jonas Viel, Maximilian Berghaus
import bpy
import math
context = bpy.context
import bmesh
import json
import os
from pathlib import Path


############################################################################################
#open a JSON in Python 
fileDirectory = os.path.dirname(__file__)               #directory of the Blender file
parentDirectory1 = os.path.dirname(fileDirectory)       #directory --> FireSimulation
parentDirectory2 = os.path.dirname(parentDirectory1)    #directory --> BlenderSimulation
parentDirectory3 = os.path.dirname(parentDirectory2)    #directory --> Fireload
parentDirectory4 = os.path.dirname(parentDirectory2)    #directory --> Folder where the Fireload project is located
#parentDirectory4 = os.path.dirname(parentDirectory3)    #directory --> Folder where the Fireload project is located


dirJson = os.path.join(parentDirectory4,"Fireload","BlenderSimulation","Test_Json","JsonForBlender.json")

with open(dirJson, 'r') as json_file:
#with open('c:\\Users\\MaxBe\\Documents\\UNI\\Fireload\\BlenderSimulation\\Test_Json\\JsonForBlender.json', 'r') as json_file:
    allData = json.load(json_file)
    type = allData['objectType']
    location= allData['location']
    Framerate = allData['frameRate']
    StartFrame = allData['startFrame']
    EndFrame = allData['endFrame']
    resolutionX = allData['resolutionXY']
    resolutionY =allData['resolutionXY']
    SmokeDomain_size = allData['smokeDomainSizeXYZ']
    id = allData['objectId']
    scale = allData['scale']
    rotation = allData['rotation']
    fireResolution = allData['fireResolution']
    forceType = allData['forceType']
    forceId = allData['forceId']
    forceScale = allData['forceScale']
    forceLocation = allData['forceLocation']
    forceRotation = allData['forceRotation']
    material = allData['material']

############################################################################################

#set the resolution of the rendering
bpy.data.scenes["Scene"].render.resolution_x = resolutionX
bpy.data.scenes["Scene"].render.resolution_y = resolutionY

#set the length of the animation
bpy.data.scenes["Scene"].frame_start = StartFrame
bpy.data.scenes["Scene"].frame_end = EndFrame

#Framerate
bpy.context.scene.render.fps = Framerate #Frame Rate must be custom

#Renderformat
#directorys of the folder
#Rednder images
dirRenderImages = os.path.join(parentDirectory4,"Fireload","dist","assets","simulations","")
#zBuffer images
dirZBufferImages = os.path.join(parentDirectory4,"Fireload","dist","assets","simulations","zBuffer","")
#openvdb Path
dirOpenVBD = os.path.join(parentDirectory4,"Fireload","BlenderSimulation","FireSimulation","cache_fluid_90784781","data","")


#change the path for the export
scene = bpy.context.scene
nodetree = scene.node_tree
for scene in bpy.data.scenes:
    for node in scene.node_tree.nodes:
        if node.type == 'OUTPUT_FILE':
            node.base_path = dirZBufferImages


#change render properties
bpy.data.scenes["Scene"].render.filepath = dirRenderImages          #change the output directory of the renders images
bpy.data.scenes["Scene"].render.image_settings.file_format = 'JPEG'
bpy.data.scenes["Scene"].render.image_settings.color_mode = 'RGB'
bpy.data.scenes["Scene"].render.image_settings.use_zbuffer = True
bpy.data.scenes["Scene"].render.image_settings.use_preview = False
bpy.context.scene.render.image_settings.quality = 100


def set_location(name, x, y, z):
    obj = bpy.context.scene.objects[name]
    obj.location[0]=x 
    obj.location[1]=y
    obj.location[2]=z
    
    
#position the cameras like the RGBA scene
cameraDistancePlane = 50*(((SmokeDomain_size*1000)/(-36))+1) /1000
set_location("Camera_ZF", cameraDistancePlane-SmokeDomain_size/2,0,SmokeDomain_size/2)
set_location("Camera_ZL", 0,cameraDistancePlane-SmokeDomain_size/2,SmokeDomain_size/2)
set_location("Camera_ZR", 0,-cameraDistancePlane+SmokeDomain_size/2,SmokeDomain_size/2)
set_location("Camera_ZB", -cameraDistancePlane+SmokeDomain_size/2,0,SmokeDomain_size/2)
bpy.data.cameras["Camera_ZF"].clip_start = -cameraDistancePlane
bpy.data.cameras["Camera_ZL"].clip_start = -cameraDistancePlane
bpy.data.cameras["Camera_ZR"].clip_start = -cameraDistancePlane
bpy.data.cameras["Camera_ZB"].clip_start = -cameraDistancePlane
bpy.data.cameras["Camera_ZF"].clip_end = -cameraDistancePlane + SmokeDomain_size
bpy.data.cameras["Camera_ZL"].clip_end = -cameraDistancePlane + SmokeDomain_size
bpy.data.cameras["Camera_ZR"].clip_end = -cameraDistancePlane + SmokeDomain_size
bpy.data.cameras["Camera_ZB"].clip_end = -cameraDistancePlane + SmokeDomain_size

#starts the render for the RGBA Images
#bpy.ops.render.render(animation=True) 



#create a list with all the cache data of the sim
file = []
for i in range(StartFrame, EndFrame):
    if i < 10:
        file.append({"name":"fluid_data_000"+str(i)+".vdb","name":"fluid_data_000"+str(i)+".vdb"})
    if i >= 10:
        file.append({"name":"fluid_data_00"+str(i)+".vdb","name":"fluid_data_00"+str(i)+".vdb"})
    if i >= 100:
        file.append({"name":"fluid_data_0"+str(i)+".vdb","name":"fluid_data_0"+str(i)+".vdb"})
    else:
        file.append({"name":"fluid_data_"+str(i)+".vdb","name":"fluid_data_"+str(i)+".vdb"})

#add objects and mesh
bpy.ops.mesh.primitive_cube_add(enter_editmode=False, align='WORLD', location=(0, 0, 0), scale=(2, 2, 2))
bpy.ops.mesh.primitive_cube_add(enter_editmode=False, align='WORLD', location=(0, 0, 0.1), scale=(0.1, 0.1, 0.1))
bpy.ops.object.volume_import(filepath="//cache_fluid_90784781/data/", directory=dirOpenVBD, files=file, align='WORLD', location=(0, 0, 0), scale=(1, 1, 1))

#set scene properties
bpy.context.object.data.is_sequence = True
bpy.context.object.data.frame_duration = EndFrame
bpy.context.object.data.frame_start = StartFrame

#change location of the mesh to fit in frame
dimensions = bpy.context.object.dimensions
bpy.context.object.location[0] = -(dimensions.x/2)
bpy.context.object.location[1] = -(dimensions.y/2)
bpy.context.object.location[2] = 0

#change thickness of the volume/ mesh
bpy.context.object.data.display.density = 15




#selcet cube to add modifier
obj = bpy.context.scene.objects["Cube"]
obj.select_set(state=True)
context.view_layer.objects.active = obj

#change modifier properties
bpy.ops.object.modifier_add(type='VOLUME_TO_MESH')
bpy.context.object.modifiers["Volume to Mesh"].object = bpy.data.objects["fluid_data_000"+str(StartFrame)]
bpy.context.object.modifiers["Volume to Mesh"].threshold = 0.005
bpy.context.object.modifiers["Volume to Mesh"].adaptivity = 0
bpy.context.object.modifiers["Volume to Mesh"].use_smooth_shade = True






