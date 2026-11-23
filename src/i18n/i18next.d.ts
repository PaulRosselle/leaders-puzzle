import type { Resources } from './resources'

// Types the keys of `t()`: a typo in a key (or a missing one) fails to compile.
declare module 'i18next' {
  interface CustomTypeOptions {
    resources: Resources
  }
}
