#!/bin/bash

packages=(
		babel-core
		babel-loader 
		babel-preset-es2015 
		webpack
		webpack-dev-server
		css-loader
		jquery
		node-sass
		sass-loader	
		style-loader
		jshint-loader
		jshint
		
	)

ToDoPackages=(
		jquery.urianchor
	)
to_uninstall_packages=(
		
	)
for package in "${ToDoPackages[@]}"
do
	npm install --save-dev $package
done

for package in "${to_uninstall_packages[@]}"
do
	npm uninstall --save-dev $package
done