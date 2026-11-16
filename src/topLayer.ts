// Closing native dialogs and popovers with an exit animation.
//
// Chrome and Edge animate the exit in CSS alone (display and overlay transitions).
// Firefox and Safari drop the element from the top layer at once, so there we first set
// data-closing, which runs the same transition while it is still open, then close it.

let displayTransition: boolean | undefined

/** Whether the browser really transitions display (Firefox parses allow-discrete but does not). */
function canTransitionDisplay(): boolean {
  if (displayTransition !== undefined) return displayTransition
  if (!window.CSS?.supports?.('transition-behavior', 'allow-discrete') || !document.body) return (displayTransition = false)
  const probe = document.createElement('div')
  probe.style.cssText = 'transition: display 1s allow-discrete !important; display: block;'
  document.body.appendChild(probe)
  void getComputedStyle(probe).display
  probe.style.display = 'none'
  displayTransition = getComputedStyle(probe).display === 'block'
  probe.remove()
  return displayTransition
}

const supportsTopLayerExit = () => Boolean(window.CSS?.supports?.('overlay', 'auto')) && canTransitionDisplay()

/** Wait for the element's running transitions, at most two seconds. */
export async function settled(el: Element): Promise<void> {
  const running = el.getAnimations({ subtree: true })
  if (running.length === 0) return
  await Promise.race([Promise.allSettled(running.map((a) => a.finished)), new Promise((r) => setTimeout(r, 2000))])
}

/** Close a modal dialog or a popover, animating the exit in every browser. */
export async function closeTopLayer(el: HTMLDialogElement | HTMLElement): Promise<void> {
  if (!supportsTopLayerExit()) {
    el.setAttribute('data-closing', '')
    await settled(el)
    if (!el.hasAttribute('data-closing')) return
    el.removeAttribute('data-closing')
  }
  if (el instanceof HTMLDialogElement) el.close()
  else el.hidePopover()
}
