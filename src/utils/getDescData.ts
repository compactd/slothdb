import StaticData from '../models/StaticData'

export default function getDescData(obj: any) {
  const wrapped = obj as { desc: StaticData }

  if (!wrapped.desc) {
    wrapped.desc = {
      uris: []
    }
  }

  return wrapped.desc
}
