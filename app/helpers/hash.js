const crypto = require('crypto')

function customHash(arr) {
  let text = arr.sort().join('')
  let hash = crypto.createHash('sha1').update(text)
  let d = hash.digest()
  let s = ''
  function chr(code) {
    return String.fromCharCode(code)
  }

  function ord(index) {
    return index.charCodeAt(0)
  }
  for (let i of [...Array(8).keys()]) {
    x = d[i] % 52
    if (x >= 26) {
      s += chr(ord('A') + x - 26)
    } else {
      s += chr(ord('a') + x)
    }
  }
  return s
}

module.exports = customHash
