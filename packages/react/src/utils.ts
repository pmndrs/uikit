export function useSignalEffect(fn: () => (() => void) | void, deps: Array<any>) {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const unsubscribe = useMemo(() => effect(fn), deps)
  useEffect(() => unsubscribe, [unsubscribe])
}

export function useResourceWithParams<P, R, A extends Array<unknown>>(
  fn: (param: P, ...additional: A) => Promise<R>,
  param: Signal<P> | P,
  ...additionals: A
): Signal<R | undefined> {
  const result = useMemo(() => signal<R | undefined>(undefined), [])
  useEffect(() => {
    if (!(param instanceof Signal)) {
      let canceled = false
      fn(param, ...additionals).then((value) => (canceled ? undefined : (result.value = value)))
      return () => (canceled = true)
    }
    return effect(() => {
      let canceled = false
      fn(param.value, ...additionals)
        .then((value) => (canceled ? undefined : (result.value = value)))
        .catch(console.error)
      return () => (canceled = true)
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [param, ...additionals])
  return result
}
