/* eslint import/no-extraneous-dependencies: 0 */

const { execSync } = require('child_process')
const rollup = require('rollup')
const babel = require('rollup-plugin-babel')
const { eslint } = require('rollup-plugin-eslint')
const resolve = require('rollup-plugin-node-resolve')
const commonjs = require('rollup-plugin-commonjs')
const { terser } = require('rollup-plugin-terser')
const string = require('rollup-plugin-string')
const json = require('rollup-plugin-json')
const builtins = require('rollup-plugin-node-builtins')

const defaultPlugins = [
  json({
    include: 'package.json'
  }),
  string({
    include: '**/*.css'
  }),
  resolve({
    jsnext: true,
    main: true,
    browser: true,
    preferBuiltins: false
  }),
  commonjs({
    include: 'node_modules/**',
    namedExports: {
      'node_modules/bluebird/js/browser/bluebird.js': ['promisify']
    }
  }),
  eslint({
    exclude: ['src/css/**', 'node_modules/**', 'lib/images/**']
  }),
  babel({
    exclude: 'node_modules/**',
    runtimeHelpers: true
  }),
  builtins()
]

// searches through node_modules and transfiles any non-es5 folders to es5
function transpileEs5NodeModules() {
  // get a list of es5 node_modules
  const output = execSync('node_modules/.bin/are-you-es5 check -r .', {
    encoding: 'utf8'
  }).toString()
  output
    .split('\n') // get each line of the output
    .filter(s => s.includes('is not ES5')) // filter the output for lines with non-es5 module names
    // transform all non-es5 modules to es5
    .forEach(s => {
      const name = s.split(' ')[1] // module name is between the first two spaces
      execSync(
        `node_modules/.bin/babel node_modules/${name} --out-dir node_modules/${name} --presets=@babel/preset-env`
      )
    })
}

const inputOptions = min => ({
  input: 'src/js/index.js',
  plugins: min ? [...defaultPlugins, terser()] : defaultPlugins
})

const outputOptions = min => ({
  format: 'umd',
  file: min ? 'lib/assist.min.js' : 'lib/assist.js',
  name: 'assist',
  globals: {
    bluebird: 'promisify',
    bowser: 'bowser'
  },
  sourceMap: 'inline'
})

async function build() {
  // transpile non-es5 node_modules
  transpileEs5NodeModules()

  // create a regular bundle
  const bundle = await rollup.rollup(inputOptions())
  await bundle.write(outputOptions())

  // create a minified bundle
  const minBundle = await rollup.rollup(inputOptions('min'))
  await minBundle.write(outputOptions('min'))
}

build()
