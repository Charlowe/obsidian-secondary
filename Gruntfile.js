const sass = require('sass');

module.exports = function(grunt) {
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),

        /* 1. Get OBSIDIAN_PATH from .env file */
        env: {
            vault : {
                src: ".env"
            }
        },

        /* 2. Compile Sass to CSS (Unminified for dev, Minified for dist) */
        sass: {
        	options: {
        		implementation: sass,
        		sourceMap: true
        	},
            unminified: { 
                options: {
                    style: 'expanded'
                },
                files: {
                    'src/css/main.css': 'src/scss/index.scss'
                }
            },
            minified: {
                options: {
                    style: 'compressed'
                },
                files: {
                    'src/css/main.min.css': 'src/scss/index.scss'
                }
            }
        },

        /* 3. Concatenate CSS files
            (Primary.css = Readable for debugging)
            (theme.css = Minified for final Obsidian use)  */
        concat_css: {
            unminified: {
                files: {
                    'Primary.css': [
                        'src/css/readme.css',
                        'src/css/fonts/*.css',
                        'src/css/main.css', /* Fixed: Now grabs the readable version */
                        'src/css/style-settings.css'
                    ]
                }
            },
            dist: {
                files: {
                    'theme.css': [
                        'src/css/readme.css',
                        'src/css/fonts/*.css',
                        'src/css/main.min.css',
                        'src/css/style-settings.css'
                    ]
                }
            }
        },

        /* 4. Copy final minified CSS to your dev vault
            Uses templating (<%= ... %>) so it waits for the .env to load first */
        copy: {
            hot_reload: {
                expand: true,
                src: 'theme.css',
                dest: process.env.HOME + '<%= OBSIDIAN_PATH %>', 
                rename: function(dest, src) {
                    return dest + 'theme.css';
                }
            }
        },

        /* 5. Watch for changes and run tasks in a logical order */
        watch: {
            css: {
                files: ['src/**/*.scss', 'src/**/*.css'],
                tasks: [
                    'env:vault', 
                    'loadenv', 
                    'sass:unminified', 
                    'sass:minified', 
                    'concat_css', 
                    'copy:hot_reload' /* Fixed: Removed cssmin and duplicate copy */
                ]
            }
        }
    });

    /* Load the Gruntfile plugins  */
    grunt.loadNpmTasks('grunt-env');
    grunt.loadNpmTasks('grunt-sass');
    grunt.loadNpmTasks('grunt-concat-css');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-watch');

    /* Bridges the gap between the .env file and Grunt's configuration */
    grunt.registerTask('loadenv', 'Load obsidian dev vault path...', function() {
        grunt.config('OBSIDIAN_PATH', process.env.OBSIDIAN_PATH);
    });

    /* Default command triggered when you just type `grunt` in terminal */
    grunt.registerTask('default', ['env:vault', 'loadenv', 'watch']);
};
