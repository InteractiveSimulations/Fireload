#!/usr/bin/zsh
# written by Dennis Oberst
# navigate to the folder where to compress the texture maps and let this tool do its work!

for f in *.png **/*.png
do
  basisu -ktx2 -y_flip "$f"
done