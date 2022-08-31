#!/usr/bin/env python3
import os
import sys
import subprocess
import time
import atexit

# @author Dennis Oberst
# This scripts should make it more convenient to run everything :)


print("-----------WELCOME TO FIRELØAD-----------")
all_processes = []
b_regenerate = False
if len(sys.argv) == 2:
    b_regenerate = sys.argv[1] == "-r"

if not os.path.exists("ThreeClient/node_modules"):
    print("Installing node dependencies!")
    os.chdir("ThreeClient/")
    os.system("npm install")
    os.chdir("../")

if not os.path.exists("./dist") or b_regenerate:
    print("generating dist folder!")
    os.chdir("ThreeClient/")
    os.system("npm run build")
    os.chdir("../")


os.chdir("Server/src")
print("starting the server as background proc!")
all_processes.append(subprocess.Popen(["python", "server.py"]))
print( "SERVER PID: " + str(all_processes[0].pid))

def cleanup():
    timeout_sec = 5
    for p in all_processes:
        p.kill()
    print('cleaned up!')
atexit.register(cleanup)

time.sleep(0.5)
print("starting the websocket")
p2 = subprocess.run("python websocket.py", shell=True)