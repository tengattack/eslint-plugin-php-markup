'use strict'

const defaultPHPExtensions = [
  ".php",
]

const defaultPHPMarkupReplacement = { "php": "", "=": "0" }

function getSetting(settings, name) {
  if (typeof settings.html === "object" && name in settings.html) {
    return settings.html[name]
  }
  return settings[`php/${name}`]
}

function getSettings(settings) {
  const phpExtensions =
    getSetting(settings, "php-extensions") || defaultPHPExtensions
  const markupReplacement =
    getSetting(settings, "markup-replacement") || defaultPHPMarkupReplacement
  const keepEOL = getSetting(settings, "keep-eol") || false
  const removeWhitespace = getSetting(settings, "remove-whitespace") || false
  const removeEmptyLine = getSetting(settings, "remove-empty-line") || false
  const removePHPLint = getSetting(settings, "remove-php-lint") || false

  return {
    phpExtensions,
    markupReplacement,
    keepEOL,
    removeWhitespace,
    removeEmptyLine,
    removePHPLint,
  }
}

module.exports = {
  getSettings,
}
