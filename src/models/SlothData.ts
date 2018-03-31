export default interface SlothData<S> {
  name: string
  props: Partial<S>
  updatedProps: Partial<S>
  docId?: string
}
