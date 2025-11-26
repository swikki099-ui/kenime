self.__BUILD_MANIFEST = {
  "__rewrites": {
    "afterFiles": [
      {
        "has": [
          {
            "type": "header",
            "key": "x-site-request"
          }
        ],
        "source": "/:username/:path*",
        "destination": "/sites/:username/:path*"
      }
    ],
    "beforeFiles": [],
    "fallback": []
  },
  "sortedPages": [
    "/_app",
    "/_error"
  ]
};self.__BUILD_MANIFEST_CB && self.__BUILD_MANIFEST_CB()