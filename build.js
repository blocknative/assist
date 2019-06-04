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

function transpileEs5NodeModules() {
  // specify any non-es5 modules here
  const nonEs5Modules = ['ow', 'punycode']
  nonEs5Modules.forEach(m =>
    execSync(
      `node_modules/.bin/babel node_modules/${m} --out-dir node_modules/${m} --presets=@babel/preset-env`
    )
  )
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
