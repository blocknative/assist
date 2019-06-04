module.exports = {
  presets: [
    [
      '@babel/preset-env',
      {
        useBuiltIns: 'entry',
        corejs: '2.0.0',
        modules: false,
        targets: '> 2%'
      }
    ]
  ],
  plugins: [
    [
      'babel-plugin-root-import',
      {
        rootPathSuffix: 'src'
      }
    ],
    [
      '@babel/plugin-transform-runtime',
      {
        corejs: false,
        helpers: true,
        regenerator: true,
        useESModules: false
      }
    ],
    ['@babel/plugin-proposal-object-rest-spread'],
    [
      'inline-import-data-uri',
      {
        extensions: ['.png', '.jpg']
      }
    ]
  ],
  env: {
    test: {
      presets: [['@babel/preset-env']]
    }
  }
}
