var gulp    			= require('gulp');
var sass				= require('gulp-sass');
var postcss 			= require('gulp-postcss');
var autoprefixer		= require('autoprefixer');
var cssnext 			= require('cssnext');
var autoprefixer 		= require('autoprefixer');
var color_rgba_fallback = require('postcss-color-rgba-fallback');
var opacity 			= require('postcss-opacity');
var pseudoelements 		= require('postcss-pseudoelements');
var vmin 				= require('postcss-vmin');
var pixrem 				= require('pixrem');
var will_change 		= require('postcss-will-change');
var atImport 			= require('postcss-import');
var mqpacker 			= require('css-mqpacker');
var cssnano 			= require('cssnano');

gulp.task('css', function() {
	var processors = [
		will_change,//通过添加backface-visibility，来出发GPU加速，进而达到为不支持will-change的浏览器获得更好的渲染性能
	    autoprefixer,
	    color_rgba_fallback,
	    opacity,
	    pseudoelements,
	    vmin,
	    pixrem,
	    atImport,
	    mqpacker,
	    cssnano
	];
	return gulp.src('./src/css/*.css')
		.pipe(sass())
		.pipe(postcss(processors))
		.pipe(gulp.dest('./dest/css'));
})
