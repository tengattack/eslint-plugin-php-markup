# eslint-plugin-php-markup

A eslint plugin to process PHP markup.

It can make us get rid of "Unexpected token <" errors in .php files.

## Principle

This plugin just replace every php markup `<? ... ?>` to `0`.

## Installation

```sh
npm install --save-dev eslint-plugin-php-markup
```

## Usage

Add `php-markup` to the `plugins` section of your `.eslintrc` configuration file.

BTW, it works like a charm together with [`eslint-plugin-html`](https://github.com/BenoitZugmeyer/eslint-plugin-html)!

```js
{
  // ...
  "plugins": [
    "html",
    "php-markup"
  ]
  // ...
}
```

License

MIT
