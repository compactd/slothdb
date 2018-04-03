export default function delay(duration) {
  return new Promise(function(resolve, reject) {
    setTimeout(function() {
      resolve()
    }, duration)
  })
}
