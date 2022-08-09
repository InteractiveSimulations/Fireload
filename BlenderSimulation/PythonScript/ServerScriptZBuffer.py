import bpy
import math
context = bpy.context
import bmesh
import json
import os
from pathlib import Path

#Fire properties müssen noch angepasst werden
#Wir brauchen einen extra punkt im json welche objekte entfernt werden sollen 
############################################################################################
#gerade funktioniert es nur ein einzelnes Objekt mit dem json hinzuzufügen 
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
    resolutionX = allData['resolutionX']
    resolutionY =allData['resolutionY']
    SmokeDomain_size = allData['smokeDomainSize']
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

#legt die resolution des renderings fest
bpy.data.scenes["Scene"].render.resolution_x = resolutionX
bpy.data.scenes["Scene"].render.resolution_y = resolutionY

#legt die Länge der Animation fest
bpy.data.scenes["Scene"].frame_start = StartFrame
bpy.data.scenes["Scene"].frame_end = EndFrame

#Framerate
bpy.context.scene.render.fps = Framerate #Frame Rate must be custom

#Renderformat
#directorys of the folder
#Rednder images
#dirRenderImages = os.path.join(parentDirectory4,"Fireload","BlenderSimulation","RenderImages","")
dirRenderImages = os.path.join(parentDirectory4,"Fireload","dist","assets","simulations","")
#zBuffer images
dirZBufferImages = os.path.join(parentDirectory4,"Fireload","dist","assets","simulations","zBuffer","")
#openvdb Path
dirOpenVBD = os.path.join(parentDirectory4,"Fireload","BlenderSimulation","FireSimulation","cache_fluid_90784781","data","")

#create all Nodes for the compositing
#bpy.context.area.ui_type = 'CompositorNodeTree'
scene = bpy.context.scene
nodetree = scene.node_tree
#NodeNormalize = nodetree.nodes.new("CompositorNodeNormalize")
#NodeRLayers = nodetree.nodes.new("CompositorNodeRLayers")
#OutputFile = nodetree.nodes.new("CompositorNodeOutputFile")
#change the output directory of every node
for scene in bpy.data.scenes:
    for node in scene.node_tree.nodes:
        if node.type == 'OUTPUT_FILE':
            node.base_path = dirZBufferImages
#conecte the nodes for the Z Buffer images
#nodetree.links.new(NodeRLayers.outputs["Depth"], NodeNormalize.inputs[0])
#nodetree.links.new(NodeNormalize.outputs[0], OutputFile.inputs[0])


bpy.data.scenes["Scene"].render.filepath = dirRenderImages          #change the output directory of the renders images
bpy.data.scenes["Scene"].render.image_settings.file_format = 'JPEG'
bpy.data.scenes["Scene"].render.image_settings.color_mode = 'RGB'
bpy.data.scenes["Scene"].render.image_settings.use_zbuffer = True
bpy.data.scenes["Scene"].render.image_settings.use_preview = False
#bpy.context.scene.render.image_settings.compression = 100
bpy.context.scene.render.image_settings.quality = 45


def set_location(name, x, y, z):
    obj = bpy.context.scene.objects[name]
    obj.location[0]=x 
    obj.location[1]=y
    obj.location[2]=z
    
    

cameraDistancePlane = 50*(((SmokeDomain_size[2]*1000)/(-36))+1) /1000 
set_location("Camera_ZF", cameraDistancePlane-SmokeDomain_size[0]/2,0,SmokeDomain_size[2]/2)
set_location("Camera_ZL", 0,cameraDistancePlane-SmokeDomain_size[1]/2,SmokeDomain_size[2]/2)
set_location("Camera_ZR", 0,-cameraDistancePlane+SmokeDomain_size[1]/2,SmokeDomain_size[2]/2)
set_location("Camera_ZB", -cameraDistancePlane+SmokeDomain_size[0]/2,0,SmokeDomain_size[2]/2)
bpy.data.cameras["Camera_ZF"].clip_start = -cameraDistancePlane
bpy.data.cameras["Camera_ZL"].clip_start = -cameraDistancePlane
bpy.data.cameras["Camera_ZR"].clip_start = -cameraDistancePlane
bpy.data.cameras["Camera_ZB"].clip_start = -cameraDistancePlane
bpy.data.cameras["Camera_ZF"].clip_end = -cameraDistancePlane + SmokeDomain_size[0]
bpy.data.cameras["Camera_ZL"].clip_end = -cameraDistancePlane + SmokeDomain_size[1]
bpy.data.cameras["Camera_ZR"].clip_end = -cameraDistancePlane + SmokeDomain_size[1]
bpy.data.cameras["Camera_ZB"].clip_end = -cameraDistancePlane + SmokeDomain_size[0]

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


bpy.ops.mesh.primitive_cube_add(enter_editmode=False, align='WORLD', location=(0, 0, 1), scale=(1, 1, 1))
 
bpy.ops.object.volume_import(filepath="//cache_fluid_90784781/data/", directory=dirOpenVBD, files=file, align='WORLD', location=(0, 0, 0), scale=(1, 1, 1))
bpy.context.object.data.is_sequence = True
bpy.context.object.data.frame_duration = EndFrame
bpy.context.object.data.frame_start = StartFrame
dimensions = bpy.context.object.dimensions
bpy.context.object.location[0] = -(dimensions.x/2)
bpy.context.object.location[1] = -(dimensions.y/2)
bpy.context.object.location[2] = -1


#bpy.ops.object.volume_import(filepath="//cache_fluid_90784781/data/", directory="/Users/max/Documents/Medientechnologie/Sommersemester_2022/IA_WEB/Fireload/BlenderSimulation/FireSimulation/cache_fluid_90784781/data/", files=[{"name":"fluid_data_0001.vdb", "name":"fluid_data_0001.vdb"}, {"name":"fluid_data_0001 2.vdb", "name":"fluid_data_0001 2.vdb"}, {"name":"fluid_data_0002.vdb", "name":"fluid_data_0002.vdb"}, {"name":"fluid_data_0003.vdb", "name":"fluid_data_0003.vdb"}, {"name":"fluid_data_0004.vdb", "name":"fluid_data_0004.vdb"}, {"name":"fluid_data_0005.vdb", "name":"fluid_data_0005.vdb"}, {"name":"fluid_data_0006.vdb", "name":"fluid_data_0006.vdb"}, {"name":"fluid_data_0007.vdb", "name":"fluid_data_0007.vdb"}, {"name":"fluid_data_0008.vdb", "name":"fluid_data_0008.vdb"}, {"name":"fluid_data_0009.vdb", "name":"fluid_data_0009.vdb"}], align='WORLD', location=(0, 0, 0), scale=(1, 1, 1))
#bpy.ops.mesh.primitive_cube_add(enter_editmode=False, align='WORLD', location=(0, 0, 1), scale=(1, 1, 1))

obj = bpy.context.scene.objects["Cube"]
obj.select_set(state=True)
context.view_layer.objects.active = obj

bpy.ops.object.modifier_add(type='VOLUME_TO_MESH')
bpy.context.object.modifiers["Volume to Mesh"].object = bpy.data.objects["fluid_data_000"+str(StartFrame)]
bpy.context.object.modifiers["Volume to Mesh"].threshold = 0.483
bpy.context.object.modifiers["Volume to Mesh"].adaptivity = 1

#bpy.context.area.ui_type = 'TEXT_EDITOR'

#start render
#bpy.ops.render.render(animation=True) 



#Aufgaben
#Client muss prüfen ob die Skalierung so ist wie in Blender (wichtig: gltfs skalieren komisch)
#shfitscale 
#Client kann wind hinzufügen 
#Wie schickt uns der Client die gltfs, wo liegen sie?
#Feuer soll sich ausbreiten 
#Objekt brennt mit der zeit immer stärker 
# -abhängig vom Material ändert sich der Verlauf der Feuerentwicklung
# -wie bekommen wir das material vom client? (Json oder aus dem Objekt) 
# -welche Materialen sollen zur Auswahl stehen? 
# -soll eine eigene lichtquelle sein


