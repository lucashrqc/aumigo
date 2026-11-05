// @ts-check
import withNuxt from './.nuxt/eslint.config.mjs'

export default withNuxt({
  rules: {
    'vue/multi-word-component-names': 'off',
    '@typescript-eslint/no-explicit-any': 'warn',
  },
}).append({
  ignores: ['server/database/migrations/**', '.nuxt/**', '.output/**', 'dist/**'],
})
