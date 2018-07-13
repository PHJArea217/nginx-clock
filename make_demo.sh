#!/bin/sh

mkdir -p demo
sed '/@!!erase me if demo!!/d' index.html > demo/index.html
