/**
 * Application entry point - renders the root App component into the DOM.
 */
import {createRoot} from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import {StrictMode} from "react";

// Mount React application to #root element with StrictMode for development checks
createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <App/>
    </StrictMode>,
)
