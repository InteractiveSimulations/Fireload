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
# parentDirectory4 = os.path.dirname(parentDirectory3)    #directory --> Folder where the Fireload project is located

dirJson = os.path.join(parentDirectory3,"Fireload","BlenderSimulation","Test_Json","JsonForBlender.json")

with open(dirJson, 'r') as json_file:
#with open('c:\\Users\\MaxBe\\Documents\\UNI\\Fireload\\BlenderSimulation\\Test_Json\\JsonForBlender.json', 'r') as json_file:
    allData = json.load(json_file)
    type = allData['Type']
    location= allData['location']
    Framerate = allData['Framerate']
    StartFrame = allData['StartFrame']
    EndFrame = allData['EndFrame']
    resolutionX = allData['resolution_x']
    resolutionY =allData['resolution_y']
    SmokeDomain_size = allData['SmokeDomain_size']
    id = allData['id']
    scale = allData['scale']
    rotation = allData['rotation']

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
dirRenderImages = os.path.join(parentDirectory3,"Fireload","BlenderSimulation","RenderImages","")
#zBuffer images
dirZBufferImages = os.path.join(parentDirectory3,"Fireload","BlenderSimulation","RenderImages","zBuffer","")
#change the dutput directory of every node
for scene in bpy.data.scenes:
    for node in scene.node_tree.nodes:
        if node.type == 'OUTPUT_FILE':
            node.base_path = dirZBufferImages


bpy.data.scenes["Scene"].render.filepath = dirRenderImages          #change the output directory of the renders images
#bpy.data.scenes["Scene"].render.image_settings.file_format = 'PNG'
#bpy.data.scenes["Scene"].render.image_settings.color_mode = 'RGBA'
bpy.data.scenes["Scene"].render.image_settings.use_zbuffer = True
bpy.data.scenes["Scene"].render.image_settings.use_preview = False

bpy.data.scenes["Scene"].render.image_settings.file_format = 'FFMPEG'  #render mpeg Video
bpy.context.scene.render.ffmpeg.format = 'QUICKTIME'                   #change container to MPEG4
bpy.context.scene.render.ffmpeg.codec = 'QTRLE'                        #change video codec to QT 
bpy.data.scenes["Scene"].render.image_settings.color_mode = 'RGBA'
#feuer schön 
#codec verbessern 
#sind die videos wirklich pngs?

    


#Change the Size of an SmokeDomain
def set_size_SD(name, x, y, z): #läuft nur wenn die SmokeDomain ausgewählt ist

    obj = bpy.context.scene.objects[name]
    me = obj.data
    
    #choose the SmpokeDomain as the activ objejct
    obj.select_set(state=True)
    context.view_layer.objects.active = obj
    
    bpy.ops.object.mode_set(mode = 'EDIT')

    bm = bmesh.from_edit_mesh(me)
    bm.faces.active = None
    
    vertex = []
    for v in bm.verts:
        vertex.append(v)
    #Höhe z 
    vertex[3].co.z = z
    vertex[5].co.z = z
    vertex[1].co.z = z
    vertex[7].co.z = z
    
    #Breite x
    vertex[0].co.x = -x/2
    vertex[1].co.x = -x/2
    vertex[2].co.x = -x/2
    vertex[3].co.x = -x/2
    
    vertex[4].co.x = x/2
    vertex[5].co.x = x/2
    vertex[6].co.x = x/2
    vertex[7].co.x = x/2
    
    #Tiefe y
    vertex[0].co.y = -y/2
    vertex[1].co.y = -y/2
    vertex[4].co.y = -y/2
    vertex[5].co.y = -y/2
    
    vertex[2].co.y = y/2
    vertex[3].co.y = y/2
    vertex[6].co.y = y/2
    vertex[7].co.y = y/2
    
    bmesh.update_edit_mesh(me, loop_triangles=True)

    vertex.clear()
    bpy.ops.object.mode_set(mode = 'OBJECT')

def set_location(name, x, y, z):
    obj = bpy.context.scene.objects[name]
    obj.location[0]=x 
    obj.location[1]=y
    obj.location[2]=z
    
    
def set_scale(name, x, y, z):
    obj = bpy.context.scene.objects[name]
    obj.scale = (x, y, z)
    
def set_rotation(name, x, y, z):
    obj = bpy.context.scene.objects[name]
    #Angle calculation
    x= math.radians(x)
    y= math.radians(y)
    z= math.radians(z)
   
    obj.rotation_euler = (x,y,z)

# add a burning object
def add_obj(object):

    if object == "Cube":    
        bpy.ops.mesh.primitive_cube_add(enter_editmode=False)

    elif object == "Sphere":
        bpy.ops.mesh.primitive_uv_sphere_add(enter_editmode=False)
       
    elif object == "Suzanne":
        bpy.ops.mesh.primitive_monkey_add(enter_editmode=False)
        
    bpy.ops.object.modifier_add(type='FLUID')
    bpy.context.object.modifiers["Fluid"].fluid_type = 'FLOW'
    bpy.context.object.modifiers["Fluid"].flow_settings.flow_behavior = 'INFLOW'
    bpy.context.object.modifiers["Fluid"].flow_settings.flow_type = 'BOTH'
    bpy.context.object.modifiers["Fluid"].flow_settings.fuel_amount = 1.4  
    bpy.context.object.modifiers["Fluid"].flow_settings.surface_distance = 0.01
    bpy.context.object.modifiers["Fluid"].flow_settings.use_plane_init = True

    bpy.ops.object.mode_set(mode = 'OBJECT')
    bpy.data.collections['FireEmitters'].objects.link(bpy.context.object)
    bpy.data.collections['Collection'].objects.unlink(bpy.context.object)

def del_obj(object):        #deletes a Object by name(Stirng)
    objs = bpy.data.objects
    objs.remove(objs[object], do_unlink=True)
    
def del_all_objects():      #delete all objects in the FireEmitters Collection
    for obj in bpy.data.collections['FireEmitters'].objects:
        bpy.data.objects.remove(obj)

        

set_size_SD("SmokeDomain", SmokeDomain_size[0], SmokeDomain_size[1], SmokeDomain_size[2])
del_all_objects() 
add_obj(type)
set_scale(type, scale[0], scale[1], scale[2])
set_location(type, location[0], location[1], location[2])
set_rotation(type, rotation[0], rotation[1], rotation[2])
set_location("Camera", 22,-22,11)
set_location("ZBufferCamera", 22,-22,11)
set_rotation("Camera", 87, 0, 45)
set_rotation("ZBufferCamera", 87, 0, 45) 

#Wenn das Script läuft immer in einem EXTRA Ordner speichern!!!

#refresh the cache (so every Objects is burning)
bpy.data.objects["SmokeDomain"].select_set(True)
bpy.data.objects["SmokeDomain"].modifiers["Fluid"].domain_settings.cache_type = 'ALL'
bpy.data.objects["SmokeDomain"].modifiers["Fluid"].domain_settings.cache_type = 'REPLAY'
bpy.data.objects["SmokeDomain"].select_set(False)






#Smoke Domain:
#Resolution Divisions change the resolution of the fire 