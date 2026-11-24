/** Wraps an image source in a CSS `url()` (or `none` if missing). */
export const cssUrl = (source: string | undefined) => (source ? `url("${source}")` : 'none')