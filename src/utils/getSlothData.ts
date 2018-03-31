import SlothData from '../models/SlothData'

export default function getSlothData<S>(obj: object) {
  const wrapped = obj as { sloth: SlothData<S> }

  if (!wrapped.sloth) {
    throw new Error('Please use SlothEntity')
  }

  return wrapped.sloth
}
