/*!
 * Prettytable's Gruntfile
 * https://github.com/bilxio/jquery-prettytable
 * Copyright 2015 Bill Xiong.
 * Licensed under MIT
 */

module.exports = function(grunt) {
  //配置参数
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    banner: '/*! <%= pkg.name %> - v<%= pkg.version %> - ' +
      '<%= grunt.template.today("yyyy-mm-dd") %>\n' +
      '<%= pkg.homepage ? "* " + pkg.homepage + "\\n" : "" %>' +
      '* Copyright (c) <%= grunt.template.today("yyyy") %> <%= pkg.author.name %>;' +
      ' Licensed <%= _.pluck(pkg.licenses, "type").join(", ") %> */\n',

    clean: {
      dist: [
        'tmp/'
      ]
    },

    concat: {
         options: {
             separator: ';',
             stripBanners: true
         },
         dist: {
             src: [
                 "jquery-prettytable.js"
             ],
             dest: "tmp/jquery-prettytable.js"
         }
     },

     uglify: {
         options: {
         },
         dist: {
             files: {
                 'jquery-prettytable.min.js': 'tmp/jquery-prettytable.js'
             }
         }
     },
     
     cssmin: {
         options: {
             keepSpecialComments: 0
         },
         compress: {
             files: {
                 'jquery-prettytable.min.css': [
                     "jquery-prettytable.css"
                 ]
             }
         }
     }
  });
 
  //载入concat和uglify插件，分别对于合并和压缩
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-cssmin');
 
  //注册任务
  grunt.registerTask('default', ['clean', 'concat', 'uglify', 'cssmin']);
};