import { gsap } from 'gsap'
import { onBeforeUnmount } from 'vue'

interface RevealOptions {
  y?: number
  opacity?: number
  duration?: number
  stagger?: number
  delay?: number
  start?: string
}

function wrapWordsInMask(el: HTMLElement) {
  const nodes = Array.from(el.childNodes)
  el.replaceChildren()

  for (const node of nodes) {
    if (node.nodeType === Node.TEXT_NODE) {
      const words = (node.textContent ?? '').split(/(\s+)/)
      for (const token of words) {
        if (token.trim() === '') {
          el.appendChild(document.createTextNode(token))
          continue
        }
        const mask = document.createElement('span')
        mask.className = 'reveal-word-mask'
        const word = document.createElement('span')
        word.className = 'reveal-word'
        word.textContent = token
        mask.appendChild(word)
        el.appendChild(mask)
      }
    } else {
      el.appendChild(node)
    }
  }

  return Array.from(el.querySelectorAll<HTMLElement>('.reveal-word'))
}

export function useScrollReveal() {
  const reducedMotion = usePrefersReducedMotion()
  const ctx = import.meta.client ? gsap.context(() => {}) : null

  function revealHeading(el: HTMLElement | null, start = 'top 85%') {
    if (!el || !import.meta.client) return
    const words = wrapWordsInMask(el)
    if (reducedMotion.value || words.length === 0) return

    ctx?.add(() => {
      gsap.from(words, {
        yPercent: 120,
        opacity: 0,
        duration: 0.8,
        ease: 'power3.out',
        stagger: 0.045,
        scrollTrigger: { trigger: el, start, once: true },
      })
    })
  }

  function reveal(el: HTMLElement | null, options: RevealOptions = {}) {
    if (!el || !import.meta.client || reducedMotion.value) return

    const {
      y = 36,
      opacity = 0,
      duration = 0.9,
      stagger = 0,
      delay = 0,
      start = 'top 85%',
    } = options

    ctx?.add(() => {
      gsap.from(el, {
        y,
        opacity,
        duration,
        delay,
        stagger,
        ease: 'power3.out',
        scrollTrigger: { trigger: el, start, once: true },
      })
    })
  }

  function revealGroup(els: Array<HTMLElement | null>, options: RevealOptions = {}) {
    const targets = els.filter((el): el is HTMLElement => el != null)
    if (targets.length === 0 || !import.meta.client || reducedMotion.value) return

    const { y = 24, opacity = 0, duration = 0.7, stagger = 0.1, start = 'top 85%' } =
      options

    ctx?.add(() => {
      gsap.from(targets, {
        y,
        opacity,
        duration,
        stagger,
        ease: 'power3.out',
        scrollTrigger: { trigger: targets[0], start, once: true },
      })
    })
  }

  onBeforeUnmount(() => ctx?.revert())

  return { revealHeading, reveal, revealGroup }
}
