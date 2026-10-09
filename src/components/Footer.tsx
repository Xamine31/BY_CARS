import { MapPin, Phone } from 'lucide-react'
import { Link } from 'react-router-dom'
import Logo from './Logo'

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-grid">
        <div>
          <Logo inverse />
          <p>Showroom automobile à Marseille, spécialisé export de la France vers l’Algérie.</p>
        </div>
        <div>
          <h4>Navigation</h4>
          <Link to="/vehicules">Véhicules</Link>
          <Link to="/contact">Contact</Link>
          <Link to="/admin">Administration</Link>
        </div>
        <div>
          <h4>Contact</h4>
          <a href="tel:+33618175911"><Phone size={17} /> 06 18 17 59 11</a>
          <span><MapPin size={17} /> Marseille, France</span>
        </div>
      </div>
      <div className="footer-bottom container">© {new Date().getFullYear()} BY CARS. Tous droits réservés.</div>
    </footer>
  )
}
