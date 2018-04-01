import SlothData from '../models/SlothData'
import { inspect } from 'util'

export default function getSlothData<S>(obj: object) {
  // console.trace(obj);
  const wrapped = obj as { sloth: SlothData<S> }

  if (!wrapped.sloth) {
    throw new Error('Please use SlothEntity')
  }

  return wrapped.sloth
}
