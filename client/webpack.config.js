const path = require('path');
const webpack = require('webpack');

module.exports = {
	mode: 'development',
	module: {
		rules: [
			{
				test: /\.js$/,
				exclude: /node_modules/,
				use: {
					loader: 'babel-loader',
					options: {
						presets: [
							['@babel/preset-env', {
								targets: '> 1%, not dead',
								shippedProposals: true,
							}],
						],
						plugins: [
							'@babel/plugin-proposal-class-properties',
							'@babel/plugin-proposal-nullish-coalescing-operator',
							'@babel/plugin-proposal-optional-chaining',
						],
					},
				},
			},
		],
	},
	plugins: [
		new webpack.HotModuleReplacementPlugin(),
	],
	devtool: 'source-map',
	devServer: {
		contentBase: path.join(__dirname, 'dist'),
		hot: true,
		progress: true,
		port: 8081,
	},
};

