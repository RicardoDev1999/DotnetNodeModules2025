### Modules

Uses React, Redux, Webpack and SWC.

### WebApp (Dotnet)

Uses Dotnet and Webpack to laod the modules.

### Missing Features

In modules: 
- Load Less
- Postcss?
- SWC or Esbuild
- Svelte, Vue?

In Webapp:
- Load Images from the modules
- Have a better abstraction for the usage of modules (create a singleton for the AssetHelper that will take care of preloading the module and defering the usage).
- Look at reducing unused css
- Webpack SplitChunksPlugin for to ensures React, Redux, and other common libs are only bundled once
- Tree Shaking
- Persistent Caching (Webpack 5+)

### Instructions:

```bash
cd "Modules/m-user-info" && npm install && npm run build
cd "../../WebAppDotnet/WebApplication1" && npm install && npm run build
```

Open VS an run the dotnet web application.