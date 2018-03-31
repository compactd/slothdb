export default interface SlothData<S> {
  name: string
  props: Partial<S>
  updatedProps: Partial<S>
  docId?: string
  uris: {
    name: string
    prefix: string
    propsKeys: string[]
  }[]
  slug: (str: string) => string
}
