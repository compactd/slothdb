export default function(target: any, ...objects: any[]) {
  const res = Object.assign({}, target, ...objects)

  for (const obj in objects) {
    for (const name in Object.getOwnPropertyNames(obj)) {
      const desc = Object.getOwnPropertyDescriptor(obj, name)
      if (!desc) {
        return
      }
      res[name] = desc.value
    }
  }

  return res
}
