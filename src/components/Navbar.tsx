import { MapPin, Menu, Phone, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import Logo from './Logo'

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const location = useLocation()
  const links = [
    ['/', 'Accueil'],
    ['/vehicules', 'Véhicules'],
    ['/contact', 'Contact'],
  ]

  useEffect(() => setOpen(false), [location.pathname])
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  return (
    <header className="site-header">
      <div className="nav-shell container">
        <NavLink to="/" aria-label="BY CARS accueil" className="nav-logo"><Logo /></NavLink>

        <nav className={open ? 'nav-links is-open' : 'nav-links'} aria-label="Navigation principale">
          <div className="mobile-nav-top">
            <span className="mobile-nav-label">Menu</span>
            <button className="mobile-nav-close" onClick={() => setOpen(false)} aria-label="Fermer le menu"><X size={22}/></button>
          </div>
          {links.map(([to, label]) => (
            <NavLink key={to} to={to} className={({ isActive }) => isActive ? 'active' : ''}>{label}</NavLink>
          ))}
          <div className="mobile-nav-contact">
            <span><MapPin size={16}/> Marseille, France</span>
            <a href="tel:+33618175911" className="btn btn-orange"><Phone size={17}/> 06 18 17 59 11</a>
          </div>
        </nav>

        <div className="nav-actions">
          <span className="nav-location"><MapPin size={15}/> Marseille</span>
          <a href="tel:+33618175911" className="nav-phone"><Phone size={16}/> 06 18 17 59 11</a>
          <button className="menu-btn" aria-label="Ouvrir le menu" onClick={() => setOpen(true)}><Menu size={24}/></button>
        </div>
      </div>
      {open && <button className="nav-backdrop" aria-label="Fermer le menu" onClick={() => setOpen(false)} />}
    </header>
  )
}
