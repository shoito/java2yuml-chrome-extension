module.exports = (grunt) ->
	"use strict"
	
	#
	# Grunt configuration:
	#
	# https://github.com/cowboy/grunt/blob/master/docs/getting_started.md
	#
	grunt.initConfig
		pkg: "<json:package.json>"
		
		# Project configuration
		# ---------------------
		
		# specify an alternate install location for Bower
		bower:
			dir: "app/components"

		
		# Coffee to JS compilation
		coffee:
			compile:
				files:
					"temp/scripts/*.js": "app/scripts/**/*.coffee"

				options:
					basePath: "app/scripts"

			tests:
				src: "test/coffee/**/*.coffee"
				dest: "test/spec/*.js"
		
		coffeelint:
			app: ["app/scripts/coffee/**/*.coffee"]
			tests: ["tests/coffee/**/*.coffee"]

		coffeelintOptions:
			"no_trailing_whitespace":
				"level": "error"
			"max_line_length":
				"level": "ignore"
			"indentation":
				"value": 4
				"level": "error"
			"line_endings":
				"value": "unix"
				"level": "error"
		
		# compile .scss/.sass to .css using Compass
		compass:
			dist: {}

		less:
			development:
				files:
					"temp/styles/*.css": "app/styles/**/*.less"

				options:
					basePath: "app/styles"

			production:
				files:
					"temp/styles/*.css": "app/styles/**/*.less"

				options:
					basePath: "app/styles"
					yuicompress: true

		# headless testing through PhantomJS
		mocha:
			all: ["test/**/*.html"]
		
		# default watch configuration
		watch:
			template:
				files: ["app/**/*.tmpl"]
				tasks: ["template"]

			coffee:
				files: "app/scripts/**/*.coffee"
				tasks: ["coffee", "concat"]

			less:
				files: ["app/styles/**/*.less"]
				tasks: ["less:development", "css"]

			# reload:
			# 	files: ["app/*.html", "app/styles/**/*.css", "app/scripts/**/*.js", "app/images/**/*"]
			# 	tasks: "reload"
		
		# Build configuration
		# -------------------
		
		# the staging directory used during the process
		staging: "temp"
		
		# final build output
		output: "dist"
		mkdirs:
			staging: "app/"

		
		# Below, all paths are relative to the staging directory, which is a copy
		# of the app/ directory. Any .gitignore, .ignore and .buildignore file
		# that might appear in the app/ tree are used to ignore these values
		# during the copy process.
		
		# concat css/**/*.css files, inline @import, output a single minified css
		css:
			"app/styles/main.css": ["temp/styles/**/*.css"]

		
		# renames JS/CSS to prepend a hash of their contents for easier
		# versioning
		rev:
			js: "scripts/**/*.js"
			css: "styles/**/*.css"
			img: "images/**"

		# While Yeoman handles concat/min when using
		# usemin blocks, you can still use them manually
		concat:
			src:
				src: [
					"temp/scripts/coffee/japarser.js"
					"temp/scripts/coffee/src.js"
				]
				dest: "app/scripts/src.js"
			javadoc:
				src: [
					"temp/scripts/coffee/japarser.js"
					"temp/scripts/coffee/javadoc.js"
				]
				dest: "app/scripts/javadoc.js"
			background:
				src: [
					"temp/scripts/coffee/background.js"
				]
				dest: "app/scripts/background.js"
			option:
				src: [
					"temp/scripts/coffee/option.js"
				]
				dest: "app/scripts/option.js"

		# usemin handler should point to the file containing
		# the usemin blocks to be parsed
		"usemin-handler":
			html: "index.html"

		
		# update references in HTML/CSS to revved files
		usemin:
			html: ["**/*.html"]
			css: ["**/*.css"]

		
		# HTML minification
		html:
			files: ["**/*.html"]

		
		# Optimizes JPGs and PNGs (with jpegtran & optipng)
		img:
			dist: "<config:rev.img>"

		
		# rjs configuration. You don't necessarily need to specify the typical
		# `path` configuration, the rjs task will parse these values from your
		# main module, using http://requirejs.org/docs/optimization.html#mainConfigFile
		#
		# name / out / mainConfig file should be used. You can let it blank if
		# you're using usemin-handler to parse rjs config from markup (default
		# setup)
		rjs:
			
			# no minification, is done by the min task
			optimize: "none"
			baseUrl: "./scripts"
			wrap: true

	grunt.loadNpmTasks "grunt-contrib-less"
	grunt.loadNpmTasks "grunt-coffeelint"

	# Alias the `test` task to run the `mocha` task instead
	grunt.registerTask "test", "mocha"
