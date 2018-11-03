#!/bin/sh

mkdir -p public
sed '/@!!erase me if demo!!/d' index.html > public/index.html
cp *.js public/

javac IERSBulletinReader.java && java IERSBulletinReader > public/iers-bulcd.json
javac DST.java && java DST > public/dst.js