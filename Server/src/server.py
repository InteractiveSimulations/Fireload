import http.server
import socketserver

"""! @brief Example Python program with Doxygen style comments."""
##
# @mainpage Doxygen Example Project
#
# @section description_main Description
# An example Python program demonstrating how to use Doxygen style comments for
# generating source code documentation with Doxygen.
#
# @section notes_main Notes
# - Add special project notes here that you want to communicate to the user.
#
# Copyright (c) 2022 Dennis Oberst. All rights reserved.
##
# @file server.py
#
# @brief Example Python program with Doxygen style comments.
#
# @section description_doxygen_example Description
# Example Python program with Doxygen style comments.
#
# @section libraries_main Libraries/Modules
# - time standard library (https://docs.python.org/3/library/time.html)
#   - Access to sleep function.
# - sensors module (local)
#   - Access to Sensor and TempSensor classes.
#
# @section notes_doxygen_example Notes
# - Comments are Doxygen compatible.
#
# @section todo_doxygen_example TODO
# - None.
#
# @section author_doxygen_example Author(s)
# - Created by John Woolsey on 05/27/2020.
# - Modified by John Woolsey on 06/11/2020.
#
# Copyright (c) 2020 Woolsey Workshop.  All rights reserved.


PORT = 8000
## Distribution Directory
DIRECTORY = "../../dist"

class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)


with socketserver.TCPServer(("", PORT), Handler) as httpd:
    print("serving at port", PORT)
    httpd.serve_forever()