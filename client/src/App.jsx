import React from 'react'
import { BrowserRouter } from 'react-router-dom'
import { ThemeProvider } from './contexts/ThemeContext'
import MainContent from './MainContent' // Import component mới

// Component App chỉ chịu trách nhiệm bọc Router và Theme
export default function App(){
  return (
    <BrowserRouter>
      <ThemeProvider>
        <MainContent />
      </ThemeProvider>
    </BrowserRouter>
  )
}