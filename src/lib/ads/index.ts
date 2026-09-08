import "server-only";
import { DemoAdProvider } from "./demo-provider";
import type { AdProvider } from "./types";

export * from "./types";
export { DemoAdProvider, DEMO_AD_DURATION_SECONDS } from "./demo-provider";

/**
 * Provider registry. `AD_PROVIDER=demo` (development) uses the simulated
 * 30-second ad. To integrate a real compatible advertisement provider:
 *
 *  1. Create `RealAdProvider implements AdProvider` in this folder.
 *  2. Implement verification using that provider's server-to-server (S2S)
 *     reward callback or signed completion evidence — NOT client-declared state.
 *  3. Follow the ad network's integration and policy documentation for
 *     placements, durations, and disclosures; the 30-second demo flow makes no
 *     compliance claim for any network.
 *  4. Register it here and set AD_PROVIDER=<key> in the environment.
 */
const providers: Record<string, () => AdProvider> = {
  demo: () => new DemoAdProvider(),
};

let cached: AdProvider | null = null;

export function getAdProvider(): AdProvider {
  if (cached) return cached;
  const key = process.env.AD_PROVIDER ?? "demo";
  const factory = providers[key];
  if (!factory) {
    throw new Error(`Unknown AD_PROVIDER "${key}". Available: ${Object.keys(providers).join(", ")}`);
  }
  cached = factory();
  return cached;
}
