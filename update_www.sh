#!/bin/sh

cp -r www/* ../darksydephil_web
cd ../darksydephil_web
git add .
git commit -m "update"
git push
