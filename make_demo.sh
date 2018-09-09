#!/bin/sh

mkdir -p public
sed '/@!!erase me if demo!!/d' index.html > public/index.html

javac IERSBulletinReader.java && java IERSBulletinReader > public/iers-bulcd.json
