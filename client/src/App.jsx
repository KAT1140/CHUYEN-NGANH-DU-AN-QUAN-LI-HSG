import React from 'react'
import { BrowserRouter } from 'react-router-dom'
import MainContent from './MainContent' // Import component mới

// Component App chỉ chịu trách nhiệm bọc Router
export default function App(){
  return (
    <BrowserRouter>
      <MainContent />
    </BrowserRouter>
  )
}