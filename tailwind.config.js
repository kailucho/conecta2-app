/** @type {import('tailwindcss').Config} */
// Los colores se leen desde variables CSS (definidas por tema en index.css),
// para que la misma clase de Tailwind cambie según el rol activo.
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // Colores semánticos que apuntan a tokens CSS del tema activo.
        fondo: 'var(--tema-bg-primary)',
        'fondo-2': 'var(--tema-bg-secondary)',
        tarjeta: 'var(--tema-card)',
        'tarjeta-hover': 'var(--tema-card-hover)',
        borde: 'var(--tema-border)',
        acento: 'var(--tema-acento)',
        'acento-fuerte': 'var(--tema-acento-fuerte)',
        'acento-suave': 'var(--tema-acento-suave)',
        brillo: 'var(--tema-brillo)',
        texto: 'var(--tema-text-primary)',
        'texto-2': 'var(--tema-text-secondary)',
        'texto-3': 'var(--tema-text-muted)',
        exito: 'var(--tema-success)',
        alerta: 'var(--tema-warning)',
        peligro: 'var(--tema-danger)',
      },
      fontFamily: {
        titulo: ['"Baloo 2"', 'system-ui', 'sans-serif'],
        cuerpo: ['Nunito', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        card: '1.25rem',
        pill: '999px',
      },
      minHeight: {
        touch: '44px',
      },
      minWidth: {
        touch: '44px',
      },
      keyframes: {
        'flotar-suave': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-6px)' },
        },
        'aparecer': {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'latido': {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.08)' },
        },
        'brillar': {
          '0%, 100%': { opacity: '0.5' },
          '50%': { opacity: '1' },
        },
        'saltar': {
          '0%, 100%': { transform: 'translateY(0)' },
          '30%': { transform: 'translateY(-12px)' },
          '50%': { transform: 'translateY(0)' },
          '60%': { transform: 'translateY(-6px)' },
        },
        'entrar-hoja': {
          '0%': { transform: 'translateY(100%)' },
          '100%': { transform: 'translateY(0)' },
        },
        'confeti-caer': {
          '0%': { transform: 'translateY(-10px) rotate(0deg)', opacity: '1' },
          '100%': { transform: 'translateY(120px) rotate(360deg)', opacity: '0' },
        },
      },
      animation: {
        'flotar-suave': 'flotar-suave 3s ease-in-out infinite',
        'aparecer': 'aparecer 0.35s ease-out',
        'latido': 'latido 1.2s ease-in-out infinite',
        'brillar': 'brillar 2s ease-in-out infinite',
        'saltar': 'saltar 1s ease-in-out',
        'entrar-hoja': 'entrar-hoja 0.3s ease-out',
      },
    },
  },
  plugins: [],
}
