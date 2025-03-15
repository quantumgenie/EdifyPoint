import './App.css'
import axios from 'axios'

import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Home from './pages/Home'
import Login from './pages/Login'
import SignUp from './pages/SignUp'
import TeacherDashboard from './pages/TeacherDashboard'
import CreateLesson from './pages/CreateLesson'
import CreateReport from './pages/CreateReport'
import ViewLessons from './pages/ViewLessons'
import ViewReports from './pages/ViewReports'
import ProtectedRoute from './components/ProtectedRoute'
import CreateClassroom from './pages/CreateClassroom'
import ClassroomDetail from './pages/ClassroomDetail'



function App() {
  
  return (
      <Router>
        <Routes>
          {/* public route */}
          <Route path="/" element={<Home />}/>
          <Route path="/login" element={<Login />}/>
          <Route path="/signup" element={<SignUp />}/>
          {/* protected route */}
          <Route element={<ProtectedRoute/>}>
            <Route path="/dashboard" element={<TeacherDashboard />}/>
          </Route>
          <Route path="/create-lesson" element={<CreateLesson />} />
          <Route path="/create-report" element={<CreateReport />} />
          <Route path="/lessons" element={<ViewLessons />} />
          <Route path="/reports" element={<ViewReports />} />
          <Route path="/classroom/new" element={<CreateClassroom />} />
          <Route path="/classroom/:id" element={<ClassroomDetail />} />
          {/* fallback route */}
          <Route path="*" element={<Navigate to="/login" />}/>
        </Routes>  
      </Router>
  )
}

export default App
