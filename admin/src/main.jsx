import './index.css'
import App from './App.jsx'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import AdminContextProvider from "./context/AdminContext";
import PICContextProvider from "./context/PICContext";
import { SidebarProvider } from './context/SidebarContext.jsx';
import { DarkModeProvider } from './context/DarkModeContext.jsx';

ReactDOM.createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <DarkModeProvider>
      <SidebarProvider>
        <AdminContextProvider>
          <PICContextProvider>
            <App />
          </PICContextProvider>
        </AdminContextProvider>
      </SidebarProvider>
    </DarkModeProvider>
  </BrowserRouter>
)
