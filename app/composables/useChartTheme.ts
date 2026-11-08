export interface ChartTheme {
  palette: string[]
  text: string
  axis: string
  splitLine: string
  primary: string
  tooltipBg: string
  tooltipText: string
  tooltipBorder: string
}

const FALLBACK: ChartTheme = {
  palette: [
    'oklch(0.646 0.222 41.116)',
    'oklch(0.6 0.118 184.704)',
    'oklch(0.398 0.07 227.392)',
    'oklch(0.828 0.189 84.429)',
    'oklch(0.769 0.188 70.08)',
  ],
  text: 'oklch(0.556 0 0)',
  axis: 'oklch(0.922 0 0)',
  splitLine: 'oklch(0.922 0 0)',
  primary: 'oklch(0.205 0 0)',
  tooltipBg: 'oklch(1 0 0)',
  tooltipText: 'oklch(0.145 0 0)',
  tooltipBorder: 'oklch(0.922 0 0)',
}

export function useChartTheme() {
  const colorMode = useColorMode()
  const theme = ref<ChartTheme>({ ...FALLBACK })

  function resolve() {
    if (typeof document === 'undefined')
      return

    const styles = getComputedStyle(document.documentElement)
    const read = (name: string, fallback: string) =>
      styles.getPropertyValue(name).trim() || fallback

    theme.value = {
      palette: [
        read('--chart-1', FALLBACK.palette[0]!),
        read('--chart-2', FALLBACK.palette[1]!),
        read('--chart-3', FALLBACK.palette[2]!),
        read('--chart-4', FALLBACK.palette[3]!),
        read('--chart-5', FALLBACK.palette[4]!),
      ],
      text: read('--muted-foreground', FALLBACK.text),
      axis: read('--border', FALLBACK.axis),
      splitLine: read('--border', FALLBACK.splitLine),
      primary: read('--primary', FALLBACK.primary),
      tooltipBg: read('--popover', FALLBACK.tooltipBg),
      tooltipText: read('--popover-foreground', FALLBACK.tooltipText),
      tooltipBorder: read('--border', FALLBACK.tooltipBorder),
    }
  }

  onMounted(() => {
    resolve()
    watch(() => colorMode.value, () => nextTick(resolve))
  })

  return theme
}
