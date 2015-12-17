# 说好的永远呢——PostCSS #
前端变幻莫测，这刚刚玩上Gulp，耍上SCSS，这里又来了PostCSS，啊，心累~~
## 什么是PostCSS ##
> “PostCSS is a tool for transforming CSS with JS plugins. These plugins can support variables and mixins, transpile future CSS syntax, inline images, and more.“

以上是来自PostCSS在GitHub上的描述，大概意思就是：它是一个操控CSS的JS插件，能够对变量、宏和未来的CSS语法等进行转译变换。
感觉PostCSS像SCSS等预处理器，但又不限于此。
## Gulp设置 ##
不是太喜欢介绍技术本身，还是逼自己去动手吧。因为前面已经尝到了Gulp的方便，这里就将PostCSS配置到Gulp中去。
首先，切换到自己的项目路径中，使用
**npm init**
命令来**package.json**
文件的配置，一路跟着提示输入自定义内容就好，在最后**license**那项手动输入**MIT**，就好了。

接下来，在命令行中输入：

	npm install --save-dev gulp-postcss

当插件安装完成后，便开始编辑**gulpfile.js**文件，最简单的配置代码为：
	
	var gulp = require('gulp');
	var postcss	= require('gulp-postcss');

	gulp.task('css', function() {
	/*这个数组用来插入我们想使用的PostCSS插件*/
	var processors = [];
	return gulp.src('./src/css/*.css')
		//使用插入的PostCSS插件对css文件流进行处理
		.pipe(postcss(processors))
		//将PostCSS处理过的CSS写入到dest/css目录下
		.pipe(gulp.dest('./dest/css'));
	});
现在在**CSS**目录下新建一个**style.css**文件，填入一条简单的语句：
    
    body {
		background-color: red;
	}

然后在命令终端输入**gulp css**回车执行，此时在**dest/css**会生成一个**style.css**文件，但该文件并没有任何区别，因为在上面的配置中没有插入任何的**PostCSS**插件。
## 添加PostCSS插件 ##
现在添加：
[autoprefixer](https://github.com/postcss/autoprefixer "autoprefixer")(处理浏览器私有前缀),
[cssnext](http://cssnext.io/ "cssnext")(使用CSS未来的语法),
[precss](https://github.com/jonathantneal/precss "precss")(类似Sass的函数)。
在项目目录下运行以下命令进行安装：

	npm install --save-dev autoprefixer cssnext precss

接下来在**gulpfile.js**中引入插件：
    
		var autoprefixer = require('autoprefixer');
		var cssnext = require('cssnext');
		var precss = require('precss');

这些插件根据需求放入`processors`数组中，

    var processors = [
	    autoprefixer,
		cssnext,
		precss
	];
以后运行`gulp css`时，便会依次使用对应的插件，现在重新编辑`style.css`文件：

    /* Testing autoprefixer */

	.autoprefixer {
	  display: flex;
	}
	
	/* Testing cssnext */
	
	.cssnext {
	  background: color(red alpha(-10%));
	}
	
	/* Testing precss */
	
	.precss {
	  @if 3 < 5 {
	    background: green;
	  }
	  @else {
	    background: blue;
	  }
	}

运行结果为：

    /* Testing autoprefixer */

	.autoprefixer {
	  display: -webkit-box;
	  display: -webkit-flex;
	  display: -ms-flexbox;
	  display: flex;
	}
	
	/* Testing cssnext */
	
	.cssnext {
	  background: rgba(255, 0, 0, 0.9);
	}
	
	/* Testing precss */
	
	.precss {
	  background: green
	}

## 插件配置 ##
当你想给插件加上一些配置项时，可以在`processors`中插件后面加上一对括号，在括号中填入你想做的配置，比如你想让`CSS`支持到`IE8`，配置如下：

    var processors = [ autoprefixer({browsers:'ie >= 8'}) ];

## 配合Sass ##
看到上面的`precss`插件，自然就让我联想到`Sass`了，既然他们语法类似，功能也类似，那为什么不直接使用`Sass`呢，所以接下来将`Sass`和`PostCSS`结合起来。
首先安装`gulp-sass`，在终端执行：

    npm install --save-dev gulp-sass
安装完成后更新`gulpfile.js`文件：

	...
    //引入gulp-sass插件
	var sass = require('gulp-sass');
	...
	gulp.task('css', function () {
	    var processors = [
	        autoprefixer,
			cssnext,
			css-mqpacker,
	        cssnano
	    ];
		//需要将要编译的源文件后缀改为scss
	    return gulp.src('./src/*.scss')
			//要确保sass在PostCSS之前处理文件
	        .pipe(sass())
	        .pipe(postcss(processors))
	        .pipe(gulp.dest('./dest'));
	});
	
修改完后重新运行`gulp css`，便可以看到`sass`和`PostCSS`配合使用的效果了。
## 浏览器兼容问题 ##
因为公司需要兼容到`IE8`(心好塞，让我静静先)，所以这个兼容新问题，是肯定避不开的，前面已经安装了`autoprefixer`了，那个是处理浏览器私有前缀问题的。
### will-change ###
`will-change`属性让浏览器提前知道哪些元素将运行动画，以便让浏览器优化动画渲染过程。根据[caniuse](http://caniuse.com/ "caniuse")给出的数据，目前`IE/Edge`,`,Safari`和`Opear Mini`均不支持。

因此便有了[postcss-will-change](https://github.com/postcss/postcss-will-change "postcss-will-change")插件。

在`style.css`文件中写上以下代码：

    .will-change {
		will-change: transform;
	}
编译后获得： 

	.will-change {
		//通过添加该属性，来出发GPU加速
		//这是对不支持will-change属性的一个回退写法
		backface-visibility: hidden;
    	will-change: transform;
	}
### rgba ###
`IE8`不支持`rgba()`T_T,这里可以用[postcss-color-rgba-fallback](https://github.com/postcss/postcss-color-rgba-fallback)插件。

在`style.css`中加入：

    .rgba {
		background: rgba(0,0,0,.5);
	}
编译后： 

    .rgba {
		//添加一个十六进制颜色作为降级
		background: #000000;
    	background: rgba(0,0,0,0.5);
	}
### opacity ###
啊，大`IE8`又不支持，于是有了对应的`postcss-opacity`插件。
在`style.css`中加入：

    .opacity {
	    opacity: 0.5;
	}
编译后：

    .opacity {
	    opacity: 0.5;
	    -ms-filter: "progid:DXImageTransform.Microsoft.Alpha(Opacity=50)";
	}
### :: ###
在CSS3中伪元素用`::`表示，伪类用`:`表示，然后我大`IE8`只支持`:`，所以有了[postcss-pseudoelements](https://github.com/axa-ch/postcss-pseudoelements)。

在`style.css`中加入：

    .pseudo-element::before {
	    content: '';
	}
编译后：

    .pseudo-element:before {
	    content: '';
	}
### rem ###
在对字体等进行控制时，经常会用到`rem`，但是`IE8`并不支持，而且在`IE9`和`IE10`中都不支持伪元素和`font`的缩写，故而有了[node-pixrem](https://github.com/robwierzbowski/node-pixrem)。

在`style.css`中加入：

    .rem {
	    height: 10rem;
	    font: 2rem Arial;
	}
	
	.rem::before {
	    content: '';
	    line-height: 1rem;
	}
编译后：

    .rem {
	    height: 160px;
	    height: 10rem;
	    font: 32px Arial;
	    font: 2rem Arial;
	}
	
	.rem:before {
	    content: '';
	    line-height: 16px;
	    line-height: 1rem;
	}
### vmin ###
在`IE9`中不支持`viewport`的相对单位`vmin`，可以用`vm`作为等效单位，[postcss-vmin](https://github.com/iamvdo/postcss-vmin)

在`style.css`中加入：

    .vm {
	    width: 50vmin;
	}
编译后：

    .vm {
	    width: 50vm;
	    width: 50vmin;
	}
