import { ArrowUpRight, MapPin, Phone } from 'lucide-react'
import { Link } from 'react-router-dom'
import Logo from './Logo'

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-grid">
        <div className="footer-brand">
          <Logo inverse />
          <p>Showroom automobile à Marseille, spécialisé dans la sélection et l’export de véhicules de France vers l’Algérie.</p>
          <div className="footer-route"><span>Marseille</span><i>→</i><span>Algérie</span></div>
        </div>
        <div>
          <h4>Navigation</h4>
          <Link to="/">Accueil</Link>
          <Link to="/vehicules">Véhicules</Link>
          <Link to="/contact">Contact</Link>
        </div>
        <div>
          <h4>Nous contacter</h4>
          <a href="tel:+33618175911"><Phone size={17} /> 06 18 17 59 11</a>
          <span><MapPin size={17} /> Marseille, France</span>
          <a href="https://wa.me/33618175911" target="_blank" rel="noreferrer">WhatsApp <ArrowUpRight size={16}/></a>
        </div>
      </div>
      <div className="footer-bottom container"><span>© {new Date().getFullYear()} BY CARS. Tous droits réservés.</span><span>France → Algérie</span></div>
    </footer>
  )
}
