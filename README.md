# Fireløad

The work and development progress of the **fireløad** project can be found in this repository. It is a project that is being actively developed as part of the IA and Web Course of the Technical University of Koeln.

> It is the main goal of this project to create a fire simulation that runs server-side-on Blender and then get sent to the client via a Python server through the use of WebSockets.
> The client will then incorporate the Fire Simulation into the scene he has created.
> Our goal is to be able to perform a simulation at a very low cost while still maintaining a high level of quality for our clients.

## Getting Started
```bash
    # clone this repo
    git clone https://github.com/InteractiveSimulations/Fireload.git
    # or ssh
    git clone git@github.com:InteractiveSimulations/Fireload.git
```
Then you have to install the dependencies required by npm and then generate the distribution folder: 
```bash
    cd ThreeClient
    npm install
    npm run build
```

To start the server please refer to [this](Server/README.md)
