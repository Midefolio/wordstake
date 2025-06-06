import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { UserContextProvider } from './context/auth_context.tsx'
import { Provider } from 'react-redux'
import { store } from './states/index.ts'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Provider store={store}>
      <UserContextProvider>
      <App />
      </UserContextProvider>
    </Provider>
  </StrictMode>,
)
