# Fireløad

The work and development progress of the fireload project can be found in this repository. It is a project that is being actively developed as part of the IA and Web Course of the Technical University of Koeln.

> It is the main goal of this project to create a fire simulation that runs server-side-on Blender and then get sent to the client via a Python server through the use of WebSockets.
> The client will then incorporate the Fire Simulation into the scene he has created.
> Our goal is to be able to perform a simulation at a very low cost while still maintaining a high level of quality for our clients.

The [Contribution Policy](#contribution-policy) should be consulted when contributing to this project

## Contribution Policy

When working on features, it is necessary to work in a subbranch, e.g. :

```bash
    git checkout -b <your-dev-branch>
```

Merge a feature into main when it has been implemented and tested

```bash
    git checkout main #switch to main branch
    git merge <your-dev-branch> #or consult the docs if unclear
```
