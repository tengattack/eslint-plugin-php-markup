'use strict'

require('should')

const path = require('path')
const CLIEngine = require('eslint').CLIEngine
const plugin = require('../lib')

function execute(file, baseConfig) {
  if (!baseConfig) baseConfig = {}

  const cli = new CLIEngine({
    extensions: ['php'],
    baseConfig: {
      settings: baseConfig.settings,
      rules: Object.assign(
        {
          "no-console": 2,
        },
        baseConfig.rules
      ),
      globals: baseConfig.globals,
      env: baseConfig.env,
      parserOptions: baseConfig.parserOptions,
    },
    plugins: baseConfig.plugins,
    ignore: false,
    useEslintrc: false,
    fix: baseConfig.fix,
  })
  cli.addPlugin('php-markup', plugin)
  const results = cli.executeOnFiles([path.join(__dirname, 'fixtures', file)])
    .results[0]
  return baseConfig.fix ? results : results && results.messages
}

it('should work', () => {
  const messages = execute('simple.js.php')
  messages.length.should.be.exactly(2)
})

it('should work with html', () => {
  const messages = execute('html.php', { plugins: ['html'] })
  messages.length.should.be.exactly(2)
})

it('php extension should be set', () => {
  const messages = execute('simple.js.php', {
    settings: {
      "php/php-extension": ['.php5'],
    },
  })
  // no check here
  messages.length.should.be.exactly(0)
})

it('markup replacement should be set', () => {
  let messages = execute('html.php', {
    plugins: ['html'],
    settings: {
      'php/markup-replacement': { 'php': 'console.log(1);', '=': '0' },
    },
  })
  messages.length.should.be.exactly(4)

  messages = execute('html.php', {
    plugins: ['html'],
    settings: {
      'php/markup-replacement': { 'php': '', '=': '' },
    },
  })
  // Parsing error
  messages.length.should.be.exactly(1)
  messages[0].message.should.startWith('Parsing error:')
})

it('keep-eol should work', () => {
  const messages = execute('html.php', {
    plugins: ['html'],
    settings: {
      'php/keep-eol': true,  // default: false
    },
  })
  messages.length.should.be.exactly(2)
})
