#!/bin/sh

mkdir -p public
sed '/@!!erase me if demo!!/d;s/^<!-- \[LAST UPDATE TIME] -->$/Last updated: '"$(date -u +'%F %T') (UTC)/g" index.html > public/index.html
cp favicon.ico *.js public/

javac IERSBulletinReader.java && java IERSBulletinReader > public/iers-bulcd.json
javac DST.java && java DST > public/dst.js
