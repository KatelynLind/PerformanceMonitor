import { WagmiProvider } from 'wagmi'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { RainbowKitProvider } from '@rainbow-me/rainbowkit'
import { config } from './config/wagmi'
import '@rainbow-me/rainbowkit/styles.css'
import Dashboard from './components/Dashboard'
import { ToastProvider } from './components/ui/Toast'

const queryClient = new QueryClient()

function App() {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>
          <ToastProvider>
            <Dashboard />
          </ToastProvider>
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  )
}

export default App
