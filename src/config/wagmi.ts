import { http, createConfig } from 'wagmi'
import { sepolia } from 'wagmi/chains'
import { getDefaultConfig } from '@rainbow-me/rainbowkit'

export const config = createConfig(
  getDefaultConfig({
    appName: 'Performance Monitor',
    projectId: 'performance-monitor-app',
    chains: [sepolia],
    transports: {
      [sepolia.id]: http(),
    },
  })
)
