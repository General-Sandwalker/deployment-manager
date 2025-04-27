const config = {
  plugins: {
    '@tailwindcss/postcss': {
      content: [
        './src/**/*.{js,ts,jsx,tsx}',
      ],
      theme: {
        extend: {
          colors: {
            // This ensures Tailwind can purge our custom classes
            cosmic: {
              dark: 'var(--cosmic-dark)',
              blue: 'var(--cosmic-blue)',
              light: 'var(--cosmic-light)',
              accent: 'var(--cosmic-accent)',
              highlight: 'var(--cosmic-highlight)',
            },
            success: 'var(--success)',
            danger: 'var(--danger)',
            info: 'var(--info)',
          },
        },
      },
    },
  },
};

export default config;