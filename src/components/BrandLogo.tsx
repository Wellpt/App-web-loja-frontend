export function BrandLogo({ variant = 'light' }: { variant?: 'light' | 'dark' | 'print' }) {
  return <img className="vtcell-logo" src={`${import.meta.env.BASE_URL}branding/vtcell-logo-${variant}.png`} alt="VTcell — Assistência técnica especializada" loading="eager" />
}
