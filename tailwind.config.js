/** Colores y tipografías de la marca: cámbialos aquí y se actualiza todo el sitio. */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        brand: { 50: '#FEF2F3', 100: '#FDE3E5', 500: '#E0212F', 600: '#C9182A', 700: '#A81122' },
        navy: { 50: '#F1F5FB', 100: '#DCE8F7', 200: '#B9CDEA', 700: '#0B3A7A', 800: '#062F68', 900: '#00275B', 950: '#001B40' },
        ink: '#0F172A',
      },
      fontFamily: { sans: ['Manrope', 'system-ui', 'sans-serif'], display: ['Sora', 'Manrope', 'system-ui', 'sans-serif'] },
      boxShadow: { card: '0 1px 2px rgba(0,39,91,.06), 0 6px 20px rgba(0,39,91,.07)' },
    },
  },
  plugins: [],
};
