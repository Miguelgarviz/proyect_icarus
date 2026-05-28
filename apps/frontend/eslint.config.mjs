import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import eslintConfigPrettier from "eslint-config-prettier"; // En el nuevo sistema se importa así

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  
  // Override default ignores of eslint-config-next.
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),

  // En Flat Config, las reglas de Prettier se añaden simplemente como un objeto al final
  eslintConfigPrettier, 
]);

export default eslintConfig;