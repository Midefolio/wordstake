import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { UserContextProvider } from './context/auth_context.tsx'
import { Provider } from 'react-redux'
import { store } from './states/index.ts'
import { WalletAppProvider } from './context/wallet_context.tsx'


createRoot(document.getElementById('root')!).render(
  // <StrictMode>
    <Provider store={store}>
      <UserContextProvider>
        <WalletAppProvider>
          <App />
        </WalletAppProvider>
      </UserContextProvider>
    </Provider>
  // </StrictMode>,
)
