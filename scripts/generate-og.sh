#!/bin/bash

# Ensure we're in the project root
if [ ! -f "public/fav.png" ]; then
  echo "Error: public/fav.png not found. Please upload fav.png to the public/ directory."
  exit 1
fi

echo "Generating public/og-image.png (1200x630, solid black background, centered icon)..."
convert -size 1200x630 xc:black public/og-image.png
composite -gravity center public/fav.png public/og-image.png public/og-image.png

echo "Done! The Open Graph image has been generated."
