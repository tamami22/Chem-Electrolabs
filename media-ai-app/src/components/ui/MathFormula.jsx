import { useMemo } from 'react'
import katex from 'katex'

/**
 * Inline mathematical formula component using KaTeX.
 * @param {{ math: string, className?: string }} props
 */
export function InlineMath({ math, className = '' }) {
  const html = useMemo(() => {
    try {
      return katex.renderToString(math, {
        throwOnError: false,
        displayMode: false,
      })
    } catch {
      return math
    }
  }, [math])

  return (
    <span
      className={`inline-math font-serif ${className}`}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  )
}

/**
 * Display/Block mathematical formula component using KaTeX.
 * @param {{ math: string, className?: string }} props
 */
export function BlockMath({ math, className = '' }) {
  const html = useMemo(() => {
    try {
      return katex.renderToString(math, {
        throwOnError: false,
        displayMode: true,
      })
    } catch {
      return math
    }
  }, [math])

  return (
    <div
      className={`overflow-x-auto py-2.5 text-center font-serif text-slate-100 ${className}`}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  )
}


