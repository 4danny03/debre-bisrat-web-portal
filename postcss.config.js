/** @type {import('postcss').Config} */
export default {
  plugins: {
    "postcss-import": {},
    "tailwindcss/nesting": "postcss-nested",
    tailwindcss: {},
    autoprefixer: {},
  },
};
