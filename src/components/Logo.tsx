import logo from '../assets/bycars-logo.svg'

export default function Logo({ inverse = false }: { inverse?: boolean }) {
  return <img className={inverse ? 'brand-logo brand-logo--inverse' : 'brand-logo'} src={logo} alt="BY CARS" />
}
