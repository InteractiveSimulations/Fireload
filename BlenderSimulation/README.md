# BlenderSimulation

This is the Server-Side of the **fireløad** project.

## Instructions

When you change the "ServerscriptRGBA" or "ServerscriptZBuffer"
in blender and save it you have to change scripts to use them on the server.
as you can see here:

###"ServerscriptRGBA"
how it came from blender:
line 18: #parentDirectory4 = os.path.dirname(parentDirectory2)    
line 19: parentDirectory4 = os.path.dirname(parentDirectory3)    

how you have to change it:
line 18: parentDirectory4 = os.path.dirname(parentDirectory2)    
line 19: #parentDirectory4 = os.path.dirname(parentDirectory3) 


###"ServerscriptZBuffer"
how it came from blender:
line 18: #parentDirectory4 = os.path.dirname(parentDirectory2)    
line 19: parentDirectory4 = os.path.dirname(parentDirectory3)   

how you have to change it:
line 18: parentDirectory4 = os.path.dirname(parentDirectory2)    
line 19: #parentDirectory4 = os.path.dirname(parentDirectory3)    
