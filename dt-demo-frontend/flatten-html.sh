#!/bin/sh

# Find files in ./dist/src and move them into ./dist, checking for filename clashes
find ./dist/src -type f | while read -r srcfile; do
  filename=$(basename "$srcfile")
  dest="./dist/$filename"
  if [ -e "$dest" ]; then
    echo "Warning: $dest already exists. Skipping $srcfile."
  else
    echo "$srcfile -> $dest"
    mv "$srcfile" "$dest"
  fi
done

# Delete the now-empty src directory
rm -r ./dist/src
