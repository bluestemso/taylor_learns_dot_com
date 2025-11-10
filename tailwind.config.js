/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./templates/**/*.html",
    "./static/**/*.js",
    // Add your Django template paths here
  ],
  theme: {
    extend: {
      // Custom Colors
      colors: {
        // Primary brand colors
        'newgreen': '#02AD28',        // Primary green for links, accents
        'bright-green': '#00ff00',    // Bright green for borders, highlights
        'newgreen-light': '#e6f4ea',  // Light green background
        
        // Text colors
        'tcblack': '#212121',         // Primary text black
        
        // Background colors
        'bg-white': '#fffff8',        // Off-white page background
        'near-white': '#f3f3f3',      // Navigation background, light gray
        
        // Semantic colors
        'black-50': 'rgba(0, 0, 0, 0.5)',  // Secondary text, dates
        'black-10': 'rgba(0, 0, 0, 0.1)',  // Subtle borders
        'black-20': 'rgba(0, 0, 0, 0.2)',  // Form borders
        'black-90': 'rgba(0, 0, 0, 0.9)',  // Dark text
        
        // Sidenote color
        'sidenote-blue': '#03a9f4',
      },
      
      // Font Families
      fontFamily: {
        'sans': ['"Libre Franklin"', 'sans-serif'],
        'serif': ['Palatino', '"Palatino Linotype"', '"Palatino LT STD"', '"Book Antiqua"', 'Georgia', 'serif'],
        'mono': ['"IBM Plex Mono"', 'monospace'],
        'mono-alt': ['Inconsolata', 'monospace'],
        'code': ['Consolas', '"Liberation Mono"', 'Menlo', 'Courier', 'monospace'],
        'ibmplexmono': ['"IBM Plex Mono"', 'monospace'],
      },
      
      // Font Sizes (matching Tachyons scale approximately)
      fontSize: {
        // Base: 15px (0.9375rem)
        'base': ['15px', { lineHeight: '1.5' }],
        // Body text: 1.1rem
        'body': ['1.1rem', { lineHeight: '1.6' }],
        // Tachyons f1-f7 equivalents
        'f1': ['3rem', { lineHeight: '1' }],      // ~48px
        'f2': ['2.25rem', { lineHeight: '1' }],   // ~36px (h1)
        'f3': ['1.5rem', { lineHeight: '1.2' }],  // ~24px (h2)
        'f4': ['1.25rem', { lineHeight: '1.5' }], // ~20px (h3, body)
        'f5': ['1rem', { lineHeight: '1.5' }],    // ~16px
        'f6': ['0.875rem', { lineHeight: '1.5' }], // ~14px (dates, small)
        'f7': ['0.75rem', { lineHeight: '1.5' }],  // ~12px (smallest)
      },
      
      // Font Weights
      fontWeight: {
        'light': '300',
        'normal': '400',
        'medium': '600',
        'semibold': '600',
        'bold': '700',
        'extrabold': '800',
        // Tachyons equivalents
        'fw3': '300',
        'fw4': '400',
        'fw8': '800',
      },
      
      // Line Heights
      lineHeight: {
        'solid': '1',
        'copy': '1.6',
        'tight': '1.2',
      },
      
      // Spacing (custom values for sidebar, etc.)
      spacing: {
        'sidebar': '223px',           // Sidebar width
        'two-thirds': '66.666667%',    // Content width
      },
      
      // Max Widths
      maxWidth: {
        'mw8': '64rem',                // 1024px - max content width
        'content': '1024px',
      },
      
      // Border Widths
      borderWidth: {
        '1': '1px',
        '2': '2px',
        '4': '4px',
        '8': '8px',
      },
      
      // Border Radius
      borderRadius: {
        'br2': '0.25rem',
        'br3': '0.375rem',
        'br-100': '100%',
      },
      
      // Custom Utilities
      boxShadow: {
        'link-hover': 'inset 0 -24px 0 rgba(0,255,0,0.4)',
      },
      
      // Transitions
      transitionDuration: {
        'fast': '50ms',
      },
      
      transitionTimingFunction: {
        'ease-in-fast': 'ease-in',
      },
    },
  },
  plugins: [
    // Custom plugin for link hover effect
    function({ addUtilities, theme }) {
      const newUtilities = {
        '.link-hover-green': {
          '&:hover': {
            'box-shadow': theme('boxShadow.link-hover'),
          },
        },
        // Tachyons-like utilities
        '.ttu': {
          'text-transform': 'uppercase',
        },
        '.tracked': {
          'letter-spacing': '0.1em',
        },
        '.lh-solid': {
          'line-height': '1',
        },
        '.lh-copy': {
          'line-height': '1.6',
        },
        // Display utilities
        '.db': {
          'display': 'block',
        },
        '.dn': {
          'display': 'none',
        },
        // Post container styles
        '.postcontainer': {
          'word-wrap': 'break-word',
          '& h2, & h3': {
            'padding-top': '2rem',
            'margin-bottom': '0',
          },
          '& p, & li, & blockquote': {
            'line-height': '1.6em !important',
            'font-size': '1.1rem',
          },
          '& li': {
            'padding': '5px',
          },
          '& p img': {
            'max-width': '100%',
            'padding-top': '30px',
            'padding-bottom': '30px',
          },
        },
        // Blockquote styles
        '.blockquote-custom': {
          'border-left': '1px solid #02AD28',
          'padding-left': '10px',
          'margin-left': '10px',
          'font-style': 'italic',
        },
        // Code block styles
        '.code-block': {
          'background-color': 'black',
          'color': 'white',
          'overflow': 'scroll',
          'font-size': '12px',
        },
        // Green dot utility
        '.greendot': {
          'height': '10px',
          'width': '10px',
          'background-color': '#02AD28',
          'border-radius': '50%',
          'display': 'inline-block',
          'margin-top': '7px',
        },
      };
      addUtilities(newUtilities);
    },
  ],
  // Custom breakpoint (1024px is the key breakpoint)
  screens: {
    'sm': '640px',
    'md': '768px',
    'lg': '1024px',  // Desktop breakpoint (matches original)
    'xl': '1280px',
    '2xl': '1536px',
    // Custom breakpoint for mobile-first approach
    'mobile': {'max': '1023px'},  // Mobile: max-width 1023px
    'desktop': '1024px',           // Desktop: min-width 1024px
  },
}

