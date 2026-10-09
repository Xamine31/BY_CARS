import { Menu, X } from 'lucide-react'
import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import Logo from './Logo'

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const links = [
    ['/', 'Accueil'],
    ['/vehicules', 'Véhicules'],
    ['/contact', 'Contact'],
  ]

  return (
    <header className="site-header">
      <div className="nav-shell container">
        <NavLink to="/" aria-label="BY CARS accueil" className="nav-logo"><Logo /></NavLink>
        <nav className={open ? 'nav-links is-open' : 'nav-links'}>
          {links.map(([to, label]) => (
            <NavLink key={to} to={to} onClick={() => setOpen(false)} className={({ isActive }) => isActive ? 'active' : ''}>{label}</NavLink>
          ))}
          <NavLink to="/admin" className="btn btn-dark btn-sm" onClick={() => setOpen(false)}>Administration</NavLink>
        </nav>
        <button className="menu-btn" aria-label="Menu" onClick={() => setOpen(!open)}>
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>
    </header>
  )
}
