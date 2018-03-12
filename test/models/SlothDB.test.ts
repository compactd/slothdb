import SlothDB from '../../src/models/SlothDB'
import DocURI from '../../src/helpers/DocURI'
import * as Joi from 'joi'

test('defaults slug with rfc3986', () => {
  const db = new SlothDB({
    name: 'foo',
    schema: Joi.object(),
    uri: new DocURI('foos/:bar')
  })

  const slug = db.opts.slug

  expect(slug('I love Bananas')).toEqual('i-love-bananas')
})
