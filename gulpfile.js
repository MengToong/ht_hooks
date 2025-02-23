const gulp = require('gulp');
const babel = require('gulp-babel');
const ts = require('gulp-typescript');
const del = require('del');

gulp.task('clean', async function () {//#将上次构建产物都删掉
  await del('lib/**');
  await del('es/**');
  await del('dist/**');
});

gulp.task('es', function () {
  const tsProject = ts.createProject('tsconfig.pro.json', {
    module: 'ESNext',//#没处理文件呢还
  });
  return tsProject.src().pipe(tsProject()).pipe(babel()).pipe(gulp.dest('es/'));
  //#src()定义处理的文件，有resolve配置就是处理那里的文件，否则去config里的"rootDir": "src"定义了根目录，处理这里的ts文件
  //#tsProject()将ts编译为es5语法（tsconfig定义的）的es6+模块（上面module:esnext定义的）
  //#babel() 将es5语法的es6模块使用babel编译为es5语法的es6模块并输出到/es文件夹
});

gulp.task('cjs', function () {
  return gulp
    .src(['./es/**/*.js'])//#将es/文件夹中的es5语法的es6模块通过 Babel 转换为es5语法的 CommonJS 模块格式，并将转换后的文件输出到 lib/ 文件夹
    .pipe(
      babel({
        configFile: '../../.babelrc',
      }),
    )
    .pipe(gulp.dest('lib/'));
});

gulp.task('declaration', function () {//#通过 TypeScript 的编译器生成 .d.ts 文件。输出到es/和lib/
  const tsProject = ts.createProject('tsconfig.pro.json', {
    declaration: true,
    emitDeclarationOnly: true,
  });
  return tsProject.src().pipe(tsProject()).pipe(gulp.dest('es/')).pipe(gulp.dest('lib/'));
});

gulp.task('copyReadme', async function () {
  await gulp.src('../../README.md').pipe(gulp.dest('../../packages/hooks'));
});

exports.default = gulp.series('clean', 'es', 'cjs', 'declaration', 'copyReadme');
