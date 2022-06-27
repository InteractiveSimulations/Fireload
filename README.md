# Fireløad

The work and development progress of the **fireløad** project can be found in this repository. It is a project that is being actively developed as part of the IA and Web Course of the Technical University of Koeln.

> It is the main goal of this project to create a fire simulation that runs server-side-on Blender and then get sent to the client via a Python server through the use of WebSockets.
> The client will then incorporate the Fire Simulation into the scene he has created.
> Our goal is to be able to perform a simulation at a very low cost while still maintaining a high level of quality for our clients.

The [Contribution Policy](#contribution-policy) should be consulted when contributing to this project

## Getting Started
```bash
    # clone this repo
    git clone https://github.com/InteractiveSimulations/Fireload.git
    # or ssh
    git clone git@github.com:InteractiveSimulations/Fireload.git
```
Then you have to generate the **distribution** folder with webpack.
Please refer to [this](ThreeClient/README.md#generate-distribution-folder)


[Start the server](Server/README.md#instructions)


## Contribution Policy
Please follow this commandments :

1. Make **small commits**.
2. Explain the why, not the what, in your commit message
3. Create a **new branch** for every task / small feature / bug fix
4. Do not commit or push directly to the master branch
5. Do not commit commented-out code

When working on features, it is necessary to work in a subbranch, e.g. :

```bash
    git checkout -b feature-xyz development #create a new feature branch from main
```

The master branch gets merged regularly from the development branch! To update your feature branch when working on bigger features use a **rebase technique** to do so!

```bash
    git checkout development
    git pull
    git checkout feature-xyz
    git rebase development   # merge conflicts may happen. Better do this step in an IDE!
```

When a feature is finished - merge it back into development.

```bash
    git checkout development
    git pull
    git merge feature-xyz   # merge conflicts may happen. Better do this step in an IDE!
```
