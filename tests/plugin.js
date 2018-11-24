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
          'no-console': 'error',
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

function assertLineColumn(messages, linecols) {
  messages.length.should.be.exactly(linecols.length)
  for (var i = 0; i < messages.length; i++) {
    messages[i].line.should.be.exactly(linecols[i][0])
    messages[i].column.should.be.exactly(linecols[i][1])
    if (linecols[i][2]) {
      messages[i].ruleId.should.equal(linecols[i][2])
    }
  }
}

it('should work', () => {
  const messages = execute('simple.js.php')
  assertLineColumn(messages, [[4, 3], [6, 3]])
})

it('should work with html', () => {
  const messages = execute('html.php', { plugins: ['html'] })
  assertLineColumn(messages, [[7, 7], [11, 7]])
})

it('php-extension should be set', () => {
  const messages = execute('simple.js.php', {
    settings: {
      "php/php-extension": ['.php5'],
    },
  })
  // no check here
  assertLineColumn(messages, [])
})

it('markup-replacement should be set', () => {
  let messages = execute('html.php', {
    plugins: ['html'],
    settings: {
      'php/markup-replacement': { 'php': 'console.log(1);', '=': '0' },
    },
  })
  assertLineColumn(messages, [[7, 7], [8, 7], [10, 7], [11, 7]])

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
  assertLineColumn(messages, [[7, 7], [11, 7]])
})

it('remove-whitespace should work', () => {
  let messages = execute('html.php', {
    plugins: ['html'],
    settings: {
      'php/keep-eol': true,
    },
    rules: {
      'no-trailing-spaces': 'error',
    },
  })
  assertLineColumn(messages, [
    [7, 7],
    [8, 5, 'no-trailing-spaces'],
    [10, 5, 'no-trailing-spaces'],
    [11, 7],
  ])

  // remove empty line
  messages = execute('html.php', {
    plugins: ['html'],
    settings: {
      'php/keep-eol': true,
      'php/remove-whitespace': true,
    },
    rules: {
      'no-trailing-spaces': 'error',
    },
  })
  assertLineColumn(messages, [[7, 7], [11, 7]])

  messages = execute('html.php', {
    plugins: ['html'],
    settings: {
      'php/keep-eol': false,
      'php/remove-whitespace': true,
    },
    rules: {
      'no-trailing-spaces': 'error',
    },
  })
  assertLineColumn(messages, [[7, 7], [11, 7]])

  messages = execute('empty-line.php', {
    plugins: ['html'],
    settings: {
      'php/keep-eol': false,
      'php/remove-whitespace': true,
      'php/markup-replacement': { 'php': 'console.log(1);', '=': '0' },
    },
    rules: {
      'no-trailing-spaces': 'error',
    },
  })
  assertLineColumn(messages, [
    [7, 7], [8, 7], [8, 36], [9, 55], [11, 5], [12, 7],
  ])
})

it('remove-empty-line should work', () => {
  let messages = execute('empty-line.php', {
    plugins: ['html'],
    settings: {
      'php/remove-empty-line': true,
    },
  })
  // Parsing error
  messages.length.should.be.exactly(1)
  messages[0].message.should.startWith('Parsing error:')

  messages = execute('empty-line.php', {
    plugins: ['html'],
    settings: {
      'php/remove-empty-line': true,
      'php/markup-replacement': { 'php': 'console.log(1);', '=': '' },
    },
  })
  assertLineColumn(messages, [
    [7, 7], [8, 7], [8, 36], [9, 55], [12, 7],
  ])
})
