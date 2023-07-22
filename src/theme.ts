import { extendTheme } from "@chakra-ui/react";

const breakpoints = {
  sm: "30em",
  md: "48em",
  lg: "62em",
  xl: "80em",
  "2xl": "96em",
};

export default extendTheme({
  breakpoints,
  fonts: {
    body: `"Inter",  system-ui, sans-serif`,
    heading: `"Inter", system-ui,  sans-serif`,
    mono: "Menlo, monospace",
  },
});
