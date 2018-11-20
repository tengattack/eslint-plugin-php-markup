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
  const removeEmptyLine = getSetting(settings, "remove-empty-line") || false

  return {
    phpExtensions,
    markupReplacement,
    keepEOL,
    removeEmptyLine,
  }
}

module.exports = {
  getSettings,
}
