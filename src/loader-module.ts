import ClientMonitor from './monitor'
import { init_as_module } from './posthog-core'
export { PostHog } from './posthog-core'
export * from './types'
export const sampleClient = ClientMonitor
export const sampleDE = init_as_module()
export default { sampleDE, ClientMonitor }
