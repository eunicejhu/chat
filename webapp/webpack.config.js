let debug = process.env.NODE_ENV !== "production";
let webpack = require('webpack');
module.exports = {
	entry: './public/src/spa.js',
	output: {
		filename: './public/dist/bundle.js'
	},
	module: {
		preLoaders: [
			{
				test: /\.js$/,
				exclude: /node_modules/,
				loaders: ['jshint-loader']
			}
		],
		loaders: [
			{
				test: /\.js$/,
				exclude: /node_modules/,
				loaders: ["babel-loader"]
			},
			{
                test: /\.(css|scss)$/,
                loaders: ['style', 'css', 'sass']
            }

		]
	} ,
	jshint: {
		varstmt: true,
		unused: true,
		esversion: 6,
		browser: true
	},
	// eslint: {
	// 	configFile: './.eslintrc.json'
	// },
	devServer: {
		inline: true,
		port: 3001
	},
	plugins: [
		// new webpack.optimize.DebugPlugin(),
		// new webpack.optimize.OccurenceOrderPlugin(),
		// new webpack.optimize.UglifyJsPlugin({mangle: false, sourcemap: false}),
		new webpack.ProvidePlugin({
			'jQuery': 'jquery',
			'$': 'jquery',
		})
	]
}