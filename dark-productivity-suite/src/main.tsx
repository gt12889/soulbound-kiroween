import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { AppProvider } from './contexts/AppContext'
import { NotesProvider } from './contexts/NotesContext'
import { TasksProvider } from './contexts/TasksContext'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppProvider>
      <NotesProvider>
        <TasksProvider>
          <App />
        </TasksProvider>
      </NotesProvider>
    </AppProvider>
  </StrictMode>,
)
