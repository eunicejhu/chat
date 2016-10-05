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
		jquery.urianchor
		jquery.event.gevent
		taffydb #jquery database plugin
	)

ToDoPackages=(
		jquery.event.ue
	)
to_uninstall_packages=(
		jquery-touch-events
	)
for package in "${ToDoPackages[@]}"
do
	npm install --save-dev $package
done

for package in "${to_uninstall_packages[@]}"
do
	npm uninstall --save-dev $package
done