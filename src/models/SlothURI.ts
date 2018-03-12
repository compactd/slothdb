export default interface SlothURI<P> {
  parse: (str: string) => P
  stringify: (props: P) => string
}
