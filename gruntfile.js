module.exports = function(grunt) {
	require('load-grunt-tasks')(grunt);

	var srcPath = './src',
		distPath = './dist';

	grunt.initConfig({
		srcPath: srcPath,

		distPath: distPath,

		copy: {
			dev: {
				files: [{ src: 'node_modules/angular/angular.js', dest: 'src/libs/angular/angular.js' }]
			},
			dist: {
				files: [
					{ src: srcPath + '/css/ng-wig.css', dest: distPath + '/css/ng-wig.css' },
					{
						expand: true,
						cwd: srcPath + '/javascript/app/',
						src: [
							'align.ngWig.js',
							'plugins/clear-styles.ngWig.js',
							'plugins/forecolor.ngWig.js',
							'plugins/formats.ngWig.js'
						],
						dest: distPath
					}
				]
			}
		},
		babel: {
			options: {
				sourceMap: true,
				presets: ['es2015']
			},
			dist: {
				files: {
					'dist/ng-wig.js': [distPath + '/ng-wig.js']
				}
			},
			plugins: {
				files: [
					{
						expand: true,
						cwd: distPath + '/plugins/',
						src: ['*.js'],
						dest: distPath + '/plugins'
					}
				]
			}
		},
		uglify: {
			build: {
				files: {
					'dist/ng-wig.min.js': [distPath + '/ng-wig.js']
				}
			},
			plugins: {
				files: [
					{
						expand: true,
						cwd: distPath + '/plugins/',
						src: ['align.ngWig.js', 'clear-styles.ngWig.js', 'forecolor.ngWig.js', 'formats.ngWig.js'],
						dest: distPath + '/plugins',
						ext: ['.ngWig.min.js']
					}
				]
			}
		},
		cssmin: {
			build: {
				files: {
					'dist/css/ng-wig.min.css': [distPath + '/css/ng-wig.css']
				}
			}
		},
		clean: {
			libs: ['src/libs/**/*'],
			npm: ['node_modules'],
			target: ['dist/**']
		},
		html2js: {
			options: {
				base: srcPath + '/javascript/app/',
				module: 'ngwig-app-templates'
			},
			main: {
				src: [srcPath + '/javascript/app/ng-wig/views/*.html'],
				dest: srcPath + '/javascript/app/templates.js'
			}
		},
		watch: {
			templates: {
				files: ['src/javascript/app/**/views/**/*.html'],
				tasks: ['html2js']
			}
		},
		bump: {
			options: {
				files: ['package.json', 'dist/ng-wig.js', 'src/javascript/app/ng-wig/ng-wig.js'],
				commitFiles: ['package.json', 'dist/**', 'src/javascript/app/ng-wig/ng-wig.js'],
				createTag: true,
				tagName: 'v%VERSION%',
				tagMessage: 'Version %VERSION%',
				push: false
			}
		},
		karma: {
			unit: {
				configFile: 'karma.conf.js',
				autoWatch: false,
				singleRun: true
			},
			continuous: {
				configFile: 'karma.conf.js'
			}
		}
	});

	grunt.registerTask('default', ['start']);
	grunt.registerTask('start', ['html2js', 'watch']);
	grunt.registerTask('install', ['clean:libs', 'copy:dev', 'clean:npm', 'html2js']);
	grunt.registerTask('build', ['html2js', 'copy:dist', 'babel', 'uglify', 'cssmin', 'bump:patch']);
	grunt.registerTask('devBuild', ['html2js', 'copy:dist', 'babel', 'uglify', 'cssmin']);
	grunt.registerTask('upversion', ['bump:minor']);
	//grunt.registerTask('upversion', ['bump:major']);
};
