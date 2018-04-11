'use strict'

function remapMessages(ctx, messages, code) {
  var ms = []
  var startPosition = ctx.filtered[0].start.position
  var start
  for (var i = 0; i < messages.length; i++) {
    var message = messages[i]
    if (!start) {
      var position = getPosition(message, code.lineStartIndices)
      if (position > startPosition) {
        start = true
      }
    }
    if (start) {
      var loc = getOriginalLocation(ctx, message)
      message.line = loc.line
      message.column = loc.column

      // Map fix range
      if (message.fix && message.fix.range) {
        message.fix.range = [
          getOriginalPosition(ctx, message.fix.range[0]),
          // The range end is exclusive, meaning it should replace all characters with indexes from
          // start to end - 1. We have to get the original index of the last targeted character.
          getOriginalPosition(ctx, message.fix.range[1] - 1) + 1,
        ]
      }

      // Map end location
      if (message.endLine && message.endColumn) {
        loc = getOriginalLocation(ctx, {
          line: message.endLine,
          column: message.endColumn
        }, code.lineStartIndices)
        message.endLine = loc.line
        message.endColumn = loc.column
      }
    }
  }
}

function getLineStartIndices(text) {
  return text.split('\n').map(s => s.length).reduce((prev, current) => {
    prev.push(prev[prev.length - 1] + current + 1)
    return prev
  }, [0])
}

function getLocation(position, lineStartIndices) {
  var i
  for (i = 1; i < lineStartIndices.length; i++) {
    if (position >= lineStartIndices[i - 1] && position < lineStartIndices[i]) {
      break
    }
  }
  return {
    line: i,
    column: position - lineStartIndices[i - 1] + 1
  }
}

function getPosition(loc, lineStartIndices) {
  return lineStartIndices[loc.line - 1] + loc.column - 1
}

function getOriginalPosition(ctx, position) {
  for (var i = 0; i < ctx.filtered.length; i++) {
    var f = ctx.filtered[i]
    if (position > f.start.position) {
      // remove the length of replaced text
      position = position + (f.end.position - f.start.position) - REPLACE_TEXT.length
    }
  }
  return position
}

function getOriginalLocation(ctx, loc) {
  var position = getPosition(loc, ctx.code.lineStartIndices)
  for (var i = 0; i < ctx.filtered.length; i++) {
    var f = ctx.filtered[i]
    if (position > f.start.position) {
      // remove the length of replaced text
      position = position + (f.end.position - f.start.position) - REPLACE_TEXT.length
    }
  }
  return getLocation(position, ctx.originalLineStartIndices)
}

var _messages = []
var PHP_MARKUP = /<\?[\s\S]*?\?>(\r?\n)?/g
var REPLACE_TEXT = '0'
var ctxIndex = -1
var processor = {
  preprocess: (text, filename) => {
    if (typeof text === 'string') {
      var m, found = false, ms = []
      var filteredText = ''
      var originalLineStartIndices
      // reset match position
      PHP_MARKUP.lastIndex = 0
      do {
        var lastIndex = PHP_MARKUP.lastIndex
        m = PHP_MARKUP.exec(text)
        if (m) {
          if (!found) {
            found = true
            originalLineStartIndices = getLineStartIndices(text)
          }
          var startLoc = getLocation(m.index, originalLineStartIndices)
          startLoc.position = m.index
          var endLoc = getLocation(PHP_MARKUP.lastIndex, originalLineStartIndices)
          endLoc.position = PHP_MARKUP.lastIndex
          ms.push({
            start: startLoc,
            end: endLoc,
          })
          filteredText += text.substr(lastIndex, m.index - lastIndex) + REPLACE_TEXT
        } else {
          filteredText += text.substr(lastIndex)
        }
      } while (m)
      _messages.push({
        source: text,
        filtered: ms,
        originalLineStartIndices: originalLineStartIndices
      })
      return [filteredText]
    } else {
      ctxIndex++
      _messages[ctxIndex].code = text
      return [text]
    }
  },
  postprocess: (messages, filename) => {
    if (ctxIndex >= 0 && _messages[ctxIndex].filtered.length > 0) {
      var m = _messages[ctxIndex]
      remapMessages(m, messages[0], m.code)
    }
    return messages[0]
  },
  supportsAutofix: true
}

module.exports = {
  processors: {
    '.php': processor
  }
}

