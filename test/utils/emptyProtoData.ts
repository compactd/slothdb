import ProtoData from '../../src/models/ProtoData'

export default function emptyProtoData(proto: Partial<ProtoData>) {
  const base: ProtoData = {
    uris: [],
    fields: [],
    rels: [],
    views: []
  }
  return Object.assign({}, base, proto)
}
