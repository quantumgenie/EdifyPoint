import './App.css'
import axios from 'axios'

import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Home from './pages/Home'
import Login from './pages/Login'
import SignUp from './pages/SignUp'
import TeacherDashboard from './pages/TeacherDashboard'
import ProtectedRoute from './components/ProtectedRoute'
import ClassroomDetail from './pages/ClassroomDetail'

function App() {
  return (
    <Router>
      <Routes>
        {/* public routes */}
        <Route path="/" element={<Home />}/>
        <Route path="/login" element={<Login />}/>
        <Route path="/signup" element={<SignUp />}/>
        
        {/* protected routes */}
        <Route element={<ProtectedRoute/>}>
          <Route path="/dashboard" element={<TeacherDashboard />}/>
          <Route path="/classroom/:id" element={<ClassroomDetail />} />
        </Route>

        {/* fallback route */}
        <Route path="*" element={<Navigate to="/login" />}/>
      </Routes>  
    </Router>
  )
}

export default App
