import postcssNested from "postcss-nested";

/** @type {import('postcss').Config} */
export default {
  plugins: {
    "postcss-import": {},
    "tailwindcss/nesting": postcssNested,
    tailwindcss: {},
    autoprefixer: {},
  },
};
