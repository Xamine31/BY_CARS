import { HashRouter, Route, Routes, useLocation } from 'react-router-dom'
import Footer from './components/Footer'
import Navbar from './components/Navbar'
import Admin from './pages/Admin'
import Contact from './pages/Contact'
import Home from './pages/Home'
import VehicleDetail from './pages/VehicleDetail'
import Vehicles from './pages/Vehicles'

function PublicLayout() {
  const location = useLocation()
  const isAdmin = location.pathname.startsWith('/admin')
  if (isAdmin) return <Routes><Route path="/admin" element={<Admin/>}/></Routes>
  return <><Navbar/><Routes><Route path="/" element={<Home/>}/><Route path="/vehicules" element={<Vehicles/>}/><Route path="/vehicules/:id" element={<VehicleDetail/>}/><Route path="/contact" element={<Contact/>}/><Route path="*" element={<Home/>}/></Routes><Footer/></>
}

export default function App() { return <HashRouter><PublicLayout/></HashRouter> }
