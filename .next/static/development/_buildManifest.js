self.__BUILD_MANIFEST = {
  "/": [
    "./static/chunks/pages/index.js"
  ],
  "/[section]/[slug]": [
    "./static/chunks/pages/[section]/[slug].js"
  ],
  "/_error": [
    "./static/chunks/pages/_error.js"
  ],
  "__rewrites": {
    "afterFiles": [],
    "beforeFiles": [],
    "fallback": []
  },
  "sortedPages": [
    "/",
    "/_app",
    "/_error",
    "/api/hello",
    "/categories",
    "/categories/[category]",
    "/[section]/[slug]"
  ]
};self.__BUILD_MANIFEST_CB && self.__BUILD_MANIFEST_CB()