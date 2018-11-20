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

  return {
    phpExtensions,
    markupReplacement,
    keepEOL,
    removeWhitespace,
  }
}

module.exports = {
  getSettings,
}
