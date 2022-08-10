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
dirJson1 = os.path.join(parentDirectory4,"Fireload","BlenderSimulation","Test_Json","Send.json")

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

#create all Nodes for the compositing
#bpy.context.area.ui_type = 'CompositorNodeTree'
scene = bpy.context.scene
#nodetree = scene.node_tree
#NodeNormalize = nodetree.nodes.new("CompositorNodeNormalize")
#NodeRLayers = nodetree.nodes.new("CompositorNodeRLayers")
#NodeComposite = nodetree.nodes.new("CompositorNodeComposite")
#OutputFile = nodetree.nodes.new("CompositorNodeOutputFile")
#link the right nodes
#nodetree.links.new(NodeRLayers.outputs["Image"], NodeComposite.inputs[0])

#change the output directory of every node
for scene in bpy.data.scenes:
    for node in scene.node_tree.nodes:
        if node.type == 'OUTPUT_FILE':
            node.base_path = dirZBufferImages


bpy.data.scenes["Scene"].render.filepath = dirRenderImages          #change the output directory of the renders images
bpy.data.scenes["Scene"].render.image_settings.file_format = 'PNG'
bpy.data.scenes["Scene"].render.image_settings.color_mode = 'RGBA'
bpy.data.scenes["Scene"].render.image_settings.use_zbuffer = True
bpy.data.scenes["Scene"].render.image_settings.use_preview = False
bpy.context.scene.render.image_settings.compression = 100

#render a video with alpha
#bpy.data.scenes["Scene"].render.image_settings.file_format = 'FFMPEG'  #render mpeg Video
#bpy.context.scene.render.ffmpeg.format = 'QUICKTIME'                   #change container to MPEG4
#bpy.context.scene.render.ffmpeg.codec = 'QTRLE'                        #change video codec to QT 
#bpy.data.scenes["Scene"].render.image_settings.color_mode = 'RGBA'
    

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
    vertex[3].co.z = z-1
    vertex[5].co.z = z-1
    vertex[1].co.z = z-1
    vertex[7].co.z = z-1
    
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
    #bpy.context.object.modifiers["Fluid"].domain_settings.cache_frame_end = EndFrame
    #bpy.context.object.modifiers["Fluid"].domain_settings.use_adaptive_domain = True #SD change with firesize

    vertex.clear()
    bpy.context.object.modifiers["Fluid"].domain_settings.resolution_max = fireResolution
    #bpy.ops.fluid.bake_data()
    bpy.ops.object.mode_set(mode = 'OBJECT')

def set_location(name, x, y, z):
    obj = bpy.context.scene.objects[name]
    obj.location[0]=x 
    obj.location[1]=y
    obj.location[2]=z
    bpy.ops.object.transform_apply(location=True)
    
def set_scale(name, x, y, z):
    obj = bpy.context.scene.objects[name]
    obj.scale = (x, y, z)
    bpy.ops.object.transform_apply(scale=True)
    
def set_rotation(name, x, y, z):
    obj = bpy.context.scene.objects[name]
    #Angle calculation
    x= math.radians(x)
    y= math.radians(y)
    z= math.radians(z)
   
    obj.rotation_euler = (x,y,z)
    bpy.ops.object.transform_apply(rotation=True)
    
# add a burning object
def add_obj(object):

    if object == "Cube":    
        bpy.ops.mesh.primitive_cube_add(enter_editmode=False)

    elif object == "Sphere":
        bpy.ops.mesh.primitive_uv_sphere_add(enter_editmode=False)
       
    elif object == "Suzanne":
        bpy.ops.mesh.primitive_monkey_add(enter_editmode=False)
        
    elif object == "Chair":
        chairPath = os.path.join(parentDirectory4,"Fireload", "BlenderSimulation", "Objects", "chair.gltf")  
        bpy.ops.import_scene.gltf( filepath = chairPath )
        
    bpy.context.object.hide_render = True
    bpy.ops.object.modifier_add(type='FLUID')
    bpy.context.object.modifiers["Fluid"].fluid_type = 'FLOW'
    bpy.context.object.modifiers["Fluid"].flow_settings.flow_type = 'BOTH' 
    bpy.context.object.modifiers["Fluid"].flow_settings.flow_behavior = 'INFLOW'
    bpy.context.object.modifiers["Fluid"].flow_settings.fuel_amount = 0.25  
    #bpy.context.object.modifiers["Fluid"].flow_settings.surface_distance = 0.01     #wert ist zu klein für andere als den Cube mit scale 1,1,1
    bpy.context.object.modifiers["Fluid"].flow_settings.surface_distance = 1   #distance between fire and the burning objekt
    bpy.context.object.modifiers["Fluid"].flow_settings.use_plane_init = True
    bpy.context.object.modifiers["Fluid"].flow_settings.use_initial_velocity = True
    bpy.context.object.modifiers["Fluid"].flow_settings.velocity_coord[2] = 60

    bpy.ops.object.mode_set(mode = 'OBJECT')
    bpy.data.collections['FireEmitters'].objects.link(bpy.context.object)
    #bpy.data.collections['Collection'].objects.unlink(bpy.context.object)


def del_obj(object):                                            #deletes a Object by name(Stirng)
    objs = bpy.data.objects
    objs.remove(objs[object], do_unlink=True)
    
def del_all_objects():      
    for obj in bpy.data.collections['FireEmitters'].objects:    #delete all objects in the FireEmitters Collection
        bpy.data.objects.remove(obj)
    for obj in bpy.data.collections['Forces'].objects:          #delete all objects in the Forces Collection
        bpy.data.objects.remove(obj)

def add_wind(pos,rot,sca):
    bpy.ops.mesh.primitive_circle_add(enter_editmode=False)
    
    bpy.data.collections['Forces'].objects.link(bpy.context.object)
    bpy.data.collections['Collection'].objects.unlink(bpy.context.object)
    bpy.context.object.location = pos
    bpy.context.object.scale = sca      #with z scale you change the strength of the wind
    x= math.radians(rot[0])
    y= math.radians(rot[1])
    z= math.radians(rot[2])
    bpy.context.object.rotation_euler = (x,y,z)
    bpy.context.object.hide_render = True
    
    #change the physics of the circle
    bpy.ops.object.forcefield_toggle()
    bpy.context.object.field.type = 'WIND'
    bpy.context.object.field.shape = 'POINT'
    bpy.context.object.field.strength = 1

def fire_evolve(material):
    #change the fuel in the burning object
    for obj in bpy.data.collections['FireEmitters'].objects:
        bpy.context.scene.frame_set(1)
        obj.modifiers["Fluid"].flow_settings.fuel_amount = 0.0
        obj.modifiers["Fluid"].flow_settings.volume_density = 0
        obj.modifiers["Fluid"].flow_settings.surface_distance = 0.5 
        obj.keyframe_insert(data_path = 'modifiers["Fluid"].flow_settings.surface_distance', frame = 1)
        obj.keyframe_insert(data_path = 'modifiers["Fluid"].flow_settings.fuel_amount', frame = 1)
        obj.keyframe_insert(data_path = 'modifiers["Fluid"].flow_settings.volume_density', frame = 1)
        
        bpy.data.collections['Collection'].objects["SmokeDomain"].modifiers["Fluid"].domain_settings.dissolve_speed = 2
        bpy.data.collections['Collection'].objects["SmokeDomain"].keyframe_insert(data_path = 'modifiers["Fluid"].domain_settings.dissolve_speed', frame = 1)

        if material == "wood":
            bpy.context.scene.frame_set(120)
            obj.modifiers["Fluid"].flow_settings.surface_distance = 1 
            obj.keyframe_insert(data_path = 'modifiers["Fluid"].flow_settings.surface_distance', frame = 100)

            bpy.context.scene.frame_set(200)
            obj.modifiers["Fluid"].flow_settings.fuel_amount = 0.25
            obj.modifiers["Fluid"].flow_settings.volume_density = 0.1
            #obj.modifiers["Fluid"].flow_settings.surface_distance = 1
            #obj.keyframe_insert(data_path = 'modifiers["Fluid"].flow_settings.surface_distance', frame = 200)
            obj.keyframe_insert(data_path = 'modifiers["Fluid"].flow_settings.fuel_amount', frame = 200)
            obj.keyframe_insert(data_path = 'modifiers["Fluid"].flow_settings.volume_density', frame = 200)

            bpy.data.collections['Collection'].objects["SmokeDomain"].modifiers["Fluid"].domain_settings.dissolve_speed = 7
            bpy.data.collections['Collection'].objects["SmokeDomain"].keyframe_insert(data_path = 'modifiers["Fluid"].domain_settings.dissolve_speed', frame = 200)
        
#set_size_SD("SmokeDomain", SmokeDomain_size[0], SmokeDomain_size[1], SmokeDomain_size[2])
del_all_objects() 
add_obj(type)
set_scale(type, scale[0], scale[1], scale[2])
set_location(type, location[0], location[1], location[2])
set_rotation(type, rotation[0], rotation[1], rotation[2])

cameraDistancePlane = 50*(((SmokeDomain_size[2]*1000)/(-36))+1) /1000 
print(cameraDistancePlane)
set_location("Camera_F", cameraDistancePlane-SmokeDomain_size[0]/2 ,0,SmokeDomain_size[2]/2)
set_location("Camera_L", 0,cameraDistancePlane-SmokeDomain_size[1]/2,SmokeDomain_size[2]/2)
set_location("Camera_R", 0,-cameraDistancePlane+SmokeDomain_size[1]/2,SmokeDomain_size[2]/2)
set_location("Camera_B", -cameraDistancePlane+SmokeDomain_size[0]/2,0,SmokeDomain_size[2]/2)
set_location("Camera_ZF", cameraDistancePlane-SmokeDomain_size[0]/2,0,SmokeDomain_size[2]/2)
set_location("Camera_ZL", 0,cameraDistancePlane-SmokeDomain_size[1]/2,SmokeDomain_size[2]/2)
set_location("Camera_ZR", 0,-cameraDistancePlane+SmokeDomain_size[1]/2,SmokeDomain_size[2]/2)
set_location("Camera_ZB", -cameraDistancePlane+SmokeDomain_size[0]/2,0,SmokeDomain_size[2]/2)

#get the view and projection matrix
def modelViewMatrix(letter):
    modelViewMatrix = bpy.context.scene.objects["Camera_"+letter].matrix_world
    #print(modelViewMatrix)
    return modelViewMatrix

def projectionMatrix(letter):
    projectionMatrix = bpy.context.scene.objects["Camera_"+letter].calc_matrix_camera(
        depsgraph=bpy.context.evaluated_depsgraph_get(),
        x=bpy.context.scene.render.resolution_x,        
        y=bpy.context.scene.render.resolution_y,        
        scale_x=bpy.context.scene.render.pixel_aspect_x,        
        scale_y=bpy.context.scene.render.pixel_aspect_y
        )
    return projectionMatrix


# START creating json for matrix transfer

cameraName = 'FRBL'
filename = dirJson1

data = {
    'modelViewMats':  [],
    'projectionMats': []
}

for p, letter in enumerate(cameraName):
    data['modelViewMats'].append([])
    data['projectionMats'].append([])
    for i in range(4):
        for j in range(4):
            data['modelViewMats'][p].append( modelViewMatrix(letter)[i][j] )
            data['projectionMats'][p].append( projectionMatrix(letter)[i][j] )

with open(filename, "w") as file:
    json.dump(data, file, indent=4, sort_keys=True)

# END creating json for matrix transfer


if forceId > 0:
    add_wind(forceLocation,forceRotation,forceScale)

fire_evolve(material)

#Wenn das Script läuft immer in einem EXTRA Ordner speichern!!!

#refresh the cache (so every Objects is burning)
#bpy.data.objects["SmokeDomain"].select_set(True)
#bpy.data.objects["SmokeDomain"].modifiers["Fluid"].domain_settings.cache_type = 'ALL'
#bpy.data.objects["SmokeDomain"].modifiers["Fluid"].domain_settings.cache_type = 'REPLAY'
#bpy.data.objects["SmokeDomain"].select_set(False)

set_size_SD("SmokeDomain", SmokeDomain_size[0], SmokeDomain_size[1], SmokeDomain_size[2])
#bpy.ops.screen.animation_play()

#currentFrame = bpy.data.scenes[0].frame_current
#print(currentFrame)

#baking the scene
bpy.ops.nla.bake(frame_start=StartFrame, frame_end=EndFrame, bake_types={'OBJECT'})

#while currentFrame < 120:
#    currentFrame = bpy.data.scenes[0].frame_current
#    print(currentFrame)
    #bpy.ops.screen.animation_play()
    
#starts the render for the RGBA Images
#bpy.ops.render.render(animation=True) 

#bpy.context.area.ui_type = 'TEXT_EDITOR'



