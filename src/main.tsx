import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { TonConnectUIProvider } from '@tonconnect/ui-react';

// temp manifest by the course provider
const manifestUrl = 'https://rv-solomasov.github.io/second_ton_dapp/tonconnect-manifest.json';


ReactDOM.createRoot(document.getElementById('root')!).render(
  <TonConnectUIProvider manifestUrl={manifestUrl}>
    <App />
  </TonConnectUIProvider>
)
