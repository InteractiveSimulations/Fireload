# Fireløad

The work and development progress of the **fireløad** project can be found in this repository. It is a project that is being actively developed as part of the IA and Web Course of the Technical University of Koeln.

> It is the main goal of this project to create a fire simulation that runs server-side-on Blender and then get sent to the client via a Python server through the use of WebSockets.
> The client will then incorporate the Fire Simulation into the scene he has created.
> Our goal is to be able to perform a simulation at a very low cost while still maintaining a high level of quality for our clients.

## Getting Started
```bash
    # clone this repo
    git clone --recursive https://github.com/InteractiveSimulations/Fireload.git
    # or ssh
    git clone --recursive git@github.com:InteractiveSimulations/Fireload.git
```

### Prerequisite
- [Python >= 3.8](https://www.python.org/)
- [Blender](https://www.blender.org/)

Make sure that blender and python is on your `$PATH` variable.

### Dependencies
1. Install basis universal
```bash
cd third-party/basis_universal
mkdir build; cd build
cmake -DSSE=ON ..
cmake --build .
cmake --install . #this maybe needs root permission
```
2. Make sure `basisu` is on your path variable

Install the python dependencies :
```python
pip install opencv-python Pillow websockets
```

### Running

Then just run the main script:
```bash
python3 fireload.py
python3 fireload.py -r # regenerates the distribution folder!
```