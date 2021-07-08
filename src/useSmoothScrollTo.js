import {useEffect, useRef} from "react";

export const useSmoothScrollTo = (id, eventName = 'hashchange') => {
  const ref = useRef(null)
  useEffect(() => {
    const listener = e => {
      if (ref.current) {
        ref.current.scrollIntoView({behavior: 'smooth'})
      }
    }
    window.addEventListener(eventName, listener, true)
    return () => {
      window.removeEventListener(eventName, listener)
    }
  }, [id, eventName])
  return ref
}
