const {
  main: localdomain,
  api: localapidomain,
  streamingapi: localstreamingapidomain,
  port: localport = 8080,
  apiPort: localapiport = 3000,
  streamingApiPort: localstreamingapiport = 3001,
} = require("./localdomain");

const path = require("path");
const fs = require("fs");
const {
  DefinePlugin,
  SourceMapDevToolPlugin,
  sources,
  Compilation,
  NormalModuleReplacementPlugin,
} = require("webpack");
const CopyPlugin = require("copy-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const HtmlInlineScriptPlugin = require("html-inline-script-webpack-plugin");
let commitHash, fullCommitHash;
try {
  commitHash = require("child_process").execSync("git rev-parse --short HEAD").toString().trim();
  fullCommitHash = require("child_process").execSync("git rev-parse HEAD").toString().trim();
} catch {
  fullCommitHash = process.env.CODEBUILD_RESOLVED_SOURCE_VERSION || "unknown";
  commitHash = fullCommitHash.substring(0, 7);
}
const bundleVersionIos = 1;
const bundleVersionAndroid = 1;
const bundleVersionWatchIos = 1;
const bundleVersionWatchAndroid = 1;

const localapi = `https://${localapidomain}.liftosaur.com:${localapiport}/`;
const local = `https://${localdomain}.liftosaur.com:${localport}/`;
const vmrDevelopmentApi = process.env.VMR_API_URL || "https://localhost:7240";

const isDev = process.env.NODE_ENV !== "production";
const isVmrStandalone = process.env.VMR_STANDALONE === "1";
const assetVersion =
  process.env.VMR_ASSET_VERSION ||
  (isVmrStandalone ? `${commitHash}-${new Date().toISOString().replace(/[-:.TZ]/g, "")}` : commitHash);
const exerciseImageHost =
  process.env.VMR_EXERCISE_IMAGE_HOST || (isVmrStandalone ? "https://www.liftosaur.com" : "");
const developmentHost = isVmrStandalone ? `http://${localdomain}:${localport}` : local;
const developmentApiHost = isVmrStandalone ? "" : `https://${localapidomain}.liftosaur.com:${localapiport}`;
const developmentStreamingApiHost = isVmrStandalone
  ? ""
  : `https://${localstreamingapidomain}.liftosaur.com:${localstreamingapiport}`;
const productionHost = isVmrStandalone
  ? ""
  : process.env.STAGE
    ? "https://stage.liftosaur.com"
    : "https://www.liftosaur.com";
const productionApiHost = isVmrStandalone
  ? ""
  : process.env.STAGE
    ? "https://api3-dev.liftosaur.com"
    : "https://api3.liftosaur.com";
const productionStreamingApiHost = isVmrStandalone
  ? ""
  : process.env.STAGE
    ? "https://streaming-api-dev.liftosaur.com"
    : "https://streaming-api.liftosaur.com";

const uniwindRnRewrite = new NormalModuleReplacementPlugin(/^react-native$/, (resource) => {
  const issuer = (resource.contextInfo && resource.contextInfo.issuer) || resource.context || "";
  if (issuer.includes(`${require("path").sep}uniwind${require("path").sep}`)) {
    resource.request = "react-native-web";
  } else {
    resource.request = "uniwind/components";
  }
});

const uniwindStyleSheetRewrite = new NormalModuleReplacementPlugin(
  /createOrderedCSSStyleSheet$/,
  (resource) => {
    const issuer = (resource.contextInfo && resource.contextInfo.issuer) || resource.context || "";
    if (issuer.includes(`${require("path").sep}react-native-web${require("path").sep}dist${require("path").sep}exports${require("path").sep}StyleSheet${require("path").sep}`)) {
      resource.request = require("path").resolve(__dirname, "node_modules/uniwind/dist/module/components/web/createOrderedCSSStyleSheet.js");
    }
  }
);

const lftMarkerPlugin = {
  apply(compiler) {
    compiler.hooks.compilation.tap("LftMarkerPlugin", (compilation) => {
      compilation.hooks.processAssets.tap(
        { name: "LftMarkerPlugin", stage: Compilation.PROCESS_ASSETS_STAGE_DEV_TOOLING - 1 },
        (assets) => {
          for (const [name, source] of Object.entries(assets)) {
            if (/\.(js|css)$/.test(name) && !name.includes(".map")) {
              compilation.updateAsset(
                name,
                new sources.ConcatSource("/* LFTSTART */\n", source, "\n/* LFTEND */")
              );
            }
          }
        }
      );
    });
  },
};

const watchConfig = {
  entry: "./src/watch/index.ts",
  target: "node",
  output: {
    filename: "watch-bundle.js",
    path: path.resolve(__dirname, "dist"),
  },
  optimization: {
    splitChunks: false,
  },
  externals: {
    module: "var { createRequire: function() { return function() { return {} } } }",
    stream: "var {}",
  },
  devtool: false,
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: {
          loader: "esbuild-loader",
          options: {
            target: "es2020",
            jsx: "automatic",
          },
        },
      },
      {
        test: /\.m?js$/,
        include: /node_modules/,
        type: "javascript/auto",
        resolve: {
          fullySpecified: false,
        },
      },
    ],
  },
  resolve: {
    extensions: [".ts", ".tsx", ".js"],
    alias: {
      "uniwind/components$": path.resolve(__dirname, "node_modules/uniwind/dist/module/components/web/index.js"),
    },
  },
  plugins: [
    uniwindRnRewrite,
    uniwindStyleSheetRewrite,
    lftMarkerPlugin,
    new DefinePlugin({
      window: "globalThis",
      __BUNDLE_VERSION_WATCH_IOS__: bundleVersionWatchIos,
      __BUNDLE_VERSION_WATCH_ANDROID__: bundleVersionWatchAndroid,
      __COMMIT_HASH__: JSON.stringify(commitHash),
      __FULL_COMMIT_HASH__: JSON.stringify(fullCommitHash),
      __HOST__: JSON.stringify(
        process.env.NODE_ENV === "production" ? productionHost : developmentHost
      ),
      __EXERCISE_IMAGE_HOST__: JSON.stringify(exerciseImageHost),
      __ENV__: JSON.stringify(process.env.NODE_ENV === "production" ? "production" : "development"),
    }),
  ],
  mode: process.env.NODE_ENV === "production" ? "production" : "development",
};

const mainConfig = {
  ignoreWarnings: [
    {
      module: /@legendapp\/list/,
      message: /unstable_batchedUpdates/,
    },
  ],
  entry: {
    main: ["./src/main.tsx", "./src/index.css"],
    login: ["./src/login.tsx", "./src/index.css"],
    resetpassword: ["./src/resetPassword.tsx", "./src/index.css"],
    verifyemail: ["./src/verifyEmail.tsx", "./src/index.css"],
    exercise: ["./src/exercise.tsx", "./src/index.css"],
    repmax: ["./src/repmax.tsx", "./src/index.css"],
    allexercises: ["./src/allExercises.tsx", "./src/index.css"],
    alldocs: ["./src/allDocs.tsx", "./src/index.css"],
    docdetails: ["./src/docDetails.tsx", "./src/programDetails.css", "./src/index.css"],
    allprograms: ["./src/allPrograms.tsx", "./src/index.css"],
    app: ["./src/index.tsx", "./src/index.css"],
    admin: ["./src/admin.tsx", "./src/admin.css"],
    record: ["./src/record.tsx", "./src/record.css", "./src/index.css"],
    user: ["./src/user.tsx", "./src/user.css", "./src/index.css"],
    programdetails: ["./src/programDetails.tsx", "./src/programDetails.css", "./src/index.css"],
    programpreview: ["./src/programPreview.tsx", "./src/programDetails.css", "./src/index.css"],
    planner: ["./src/planner.tsx", "./src/planner.css", "./src/index.css"],
    program: ["./src/program.tsx", "./src/program.css", "./src/index.css"],
    programsList: ["./src/programsList.tsx", "./src/program.css", "./src/index.css"],
    editor: ["./src/editor.ts", "./src/editor.css"],
    affiliatedashboard: ["./src/affiliatedashboard.tsx", "./src/affiliatedashboard.css", "./src/index.css"],
    affiliates: ["./src/affiliates.tsx", "./src/page.css", "./src/index.css"],
    useraffiliates: ["./src/useraffiliates.tsx", "./src/page.css", "./src/index.css"],
    ai: ["./src/ai.tsx", "./src/page.css", "./src/index.css"],
    aiPrompt: ["./src/aiPrompt.tsx", "./src/page.css", "./src/index.css"],
    userdashboard: ["./src/userdashboard.tsx", "./src/page.css", "./src/index.css"],
    usersdashboard: ["./src/usersdashboard.tsx", "./src/page.css", "./src/index.css"],
    paymentsdashboard: ["./src/paymentsdashboard.tsx", "./src/page.css", "./src/index.css"],
    "webpushr-sw": "./src/webpushr-sw.ts",
    consent: "./src/consent/consentEntry.ts",
  },
  output: {
    filename: "[name].js",
    chunkFilename: "chunks/[name].[contenthash].js",
    publicPath: "/",
    path: path.resolve(__dirname, "dist"),
  },
  devtool: false,
  module: {
    rules: [
      {
        test: /\.css$/,
        use: [MiniCssExtractPlugin.loader, "css-loader", "postcss-loader"],
      },
      {
        test: /\.tsx?$/,
        loader: "babel-loader",
        options: {
          sourceMaps: true,
          compact: false,
          presets: [
            ["@babel/preset-typescript", { isTSX: true, allExtensions: true }],
            ["@babel/preset-react", { runtime: "automatic" }],
          ],
        },
      },
      {
        test: /\.m?js$/,
        include: /node_modules/,
        type: "javascript/auto",
        resolve: {
          fullySpecified: false,
        },
      },
      {
        test: /\.(png|jpe?g|gif|webp)$/,
        type: "asset/resource",
      },
    ],
  },
  optimization: {
    splitChunks: {
      cacheGroups: {
        vendors: {
          test: /[\\/]node_modules[\\/]/,
          name: "vendors",
          chunks: (chunk) => chunk.name === "app",
        },
      },
    },
  },
  resolve: {
    extensions: [".web.tsx", ".web.ts", ".web.js", ".tsx", ".ts", ".js", ".css"],
    alias: {
      "uniwind/components$": path.resolve(__dirname, "node_modules/uniwind/dist/module/components/web/index.js"),
    },
  },
  plugins: [
    uniwindRnRewrite,
    uniwindStyleSheetRewrite,
    lftMarkerPlugin,
    new SourceMapDevToolPlugin({
      append: `\n//# sourceMappingURL=[url]?version=${assetVersion}`,
      filename: "[file].map",
    }),
    new MiniCssExtractPlugin({ filename: "[name].css" }),
    new DefinePlugin({
      "process.env.JEST_WORKER_ID": "undefined",
      __DEV__: JSON.stringify(process.env.NODE_ENV !== "production"),
      __BUNDLE_VERSION_IOS__: bundleVersionIos,
      __BUNDLE_VERSION_ANDROID__: bundleVersionAndroid,
      __COMMIT_HASH__: JSON.stringify(commitHash),
      __FULL_COMMIT_HASH__: JSON.stringify(fullCommitHash),
      __API_HOST__: JSON.stringify(
        process.env.NODE_ENV === "production"
          ? productionApiHost
          : developmentApiHost
      ),
      __STREAMING_API_HOST__: JSON.stringify(
        process.env.NODE_ENV === "production"
          ? productionStreamingApiHost
          : developmentStreamingApiHost
      ),
      __ENV__: JSON.stringify(process.env.NODE_ENV === "production" ? "production" : "development"),
      __HOST__: JSON.stringify(
        process.env.NODE_ENV === "production"
          ? productionHost
          : developmentHost
      ),
      __EXERCISE_IMAGE_HOST__: JSON.stringify(exerciseImageHost),
    }),
    new CopyPlugin([
      {
        from: `src/index.html`,
        to: `app/index.html`,
        transform: (content) => {
          return content
            .toString()
            .replace(/\?version=xxxxxxxx/g, `?version=${assetVersion}`)
            .replace(/\?vendor=xxxxxxxx/g, `?vendor=${assetVersion}`);
        },
      },
      {
        from: process.env.STAGE ? "_redirects_staging" : "_redirects",
        to: "./_redirects",
        toType: "file",
      },
      {
        from: process.env.STAGE ? "robots_stage.txt" : "robots_prod.txt",
        to: "./robots.txt",
        toType: "file",
      },
      {
        from: "_headers",
        to: "",
      },
      {
        from: `src/editor.html`,
        to: `editor.html`,
      },
      {
        from: `docs`,
        to: `docs`,
      },
      {
        from: `src/googleauthcallback.html`,
        to: `googleauthcallback.html`,
      },
      {
        from: `src/googleauthcallback-web.html`,
        to: `googleauthcallback-web.html`,
      },
      {
        from: `src/liftosaur_example_csv.zip`,
        to: `liftosaur_example_csv.zip`,
      },
      {
        from: `src/privacy.html`,
        to: `privacy.html`,
      },
      {
        from: `src/healthconnectprivacypolicy.html`,
        to: `healthconnectprivacypolicy.html`,
      },
      {
        from: `src/terms.html`,
        to: `terms.html`,
      },
      {
        from: `src/support.html`,
        to: `support.html`,
      },
      {
        from: `src/licenses.html`,
        to: `licenses.html`,
      },
      {
        from: `src/sitemap.xml`,
        to: `sitemap.xml`,
      },
      {
        from: `src/notification.m4r`,
        to: `notification.m4r`,
      },
      {
        from: `src/set-timer-end.m4r`,
        to: `set-timer-end.m4r`,
      },
      {
        from: "icons",
        to: "icons",
      },
      {
        from: "fonts",
        to: "fonts",
      },
      {
        from: "images",
        to: "images",
      },
      {
        from: "programdata",
        to: "programdata",
      },
      {
        from: "manifest.webmanifest",
        to: "manifest.webmanifest",
      },
      {
        from: "assetlinks.json",
        to: ".well-known/assetlinks.json",
      },
      {
        from: "apple-app-site-association",
        to: ".well-known",
      },
      {
        from: "openai-apps-challenge",
        to: ".well-known/openai-apps-challenge",
        toType: "file",
      },
    ]),
  ],
  mode: process.env.NODE_ENV === "production" ? "production" : "development",
  watchOptions: {
    ignored: [
      path.join(__dirname, "worktrees", "**"),
      path.join(__dirname, ".claude", "worktrees", "**"),
      "**/node_modules/**",
    ],
  },
  devServer: {
    devMiddleware: {
      index: false, // specify to enable root proxying
    },
    setupMiddlewares: (middlewares, devServer) => {
      middlewares.unshift({
        name: "app-html",
        middleware: (req, res, next) => {
          const cleanUrl = req.url.split("?")[0];

          if (cleanUrl === "/app" || cleanUrl.startsWith("/app/")) {
            const html = fs
              .readFileSync(path.join(__dirname, "src", "index.html"), "utf8")
              .replace(/\?version=xxxxxxxx/g, `?version=${assetVersion}`)
              .replace(/\?vendor=xxxxxxxx/g, `?vendor=${assetVersion}`);
            res.type("html").send(html);
            return;
          }

          next();
        },
      });

      middlewares.unshift({
        name: "static-rewrite",
        middleware: (req, res, next) => {
          if (req.url.startsWith("/static/")) {
            req.url = req.url.replace(/^\/static/, "");
          }
          next();
        },
      });
      return middlewares;
    },
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, PATCH, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization, Cookie",
    },
    static: path.join(__dirname, "dist"),
    compress: true,
    ...(() => {
      const keyPath = path.join(process.env.HOME || "", `.secrets/live/${localdomain}.liftosaur.com/privkey.pem`);
      const certPath = path.join(process.env.HOME || "", `.secrets/live/${localdomain}.liftosaur.com/fullchain.pem`);
      if (fs.existsSync(keyPath) && fs.existsSync(certPath)) {
        return { https: { key: fs.readFileSync(keyPath), cert: fs.readFileSync(certPath) } };
      }
      return {};
    })(),
    hot: false,
    allowedHosts: "all",
    liveReload: false,
    host: "0.0.0.0",
    port: localport,
    proxy: [
      {
        context: ["/api"],
        target: vmrDevelopmentApi,
        secure: false,
        changeOrigin: true,
      },
    ],
  },
};

const editorWebviewConfig = {
  name: "editorWebview",
  entry: "./src/pages/planner/webviewEditor/editorWebviewEntry.ts",
  target: ["web", "es2017"],
  output: {
    filename: "editor-webview-bundle.js",
    path: path.resolve(__dirname, "assets/editorWebview"),
    clean: true,
  },
  devtool: false,
  module: {
    rules: [
      {
        test: /\.css$/,
        use: [
          { loader: "style-loader", options: { injectType: "styleTag" } },
          { loader: "css-loader", options: { importLoaders: 0 } },
        ],
      },
      {
        test: /\.woff2?$/,
        type: "asset/inline",
      },
      {
        test: /\.tsx?$/,
        exclude: /node_modules/,
        use: {
          loader: "esbuild-loader",
          options: {
            target: "es2017",
            tsconfigRaw: {
              compilerOptions: {
                target: "es2017",
                module: "esnext",
                moduleResolution: "node",
                jsx: "preserve",
                importsNotUsedAsValues: "remove",
              },
            },
          },
        },
      },
      {
        test: /\.m?js$/,
        include: /node_modules/,
        type: "javascript/auto",
        resolve: {
          fullySpecified: false,
        },
      },
    ],
  },
  resolve: {
    extensions: [".webview.ts", ".webview.tsx", ".ts", ".tsx", ".js"],
    mainFields: ["module", "browser", "main"],
    alias: {
      react: false,
      "react-dom": false,
      "react-native": false,
      "react-native-web": false,
      "@react-navigation/native": false,
      "@react-navigation/native-stack": false,
      uniwind: false,
      "react-native-reanimated": false,
      "react-native-gesture-handler": false,
      "react-native-mmkv": false,
      "react-native-webview": false,
    },
  },
  optimization: {
    minimize: process.env.NODE_ENV === "production",
    usedExports: true,
    sideEffects: true,
    providedExports: true,
    innerGraph: true,
    concatenateModules: true,
    splitChunks: false,
  },
  performance: {
    hints: false,
  },
  plugins: [
    new DefinePlugin({
      __COMMIT_HASH__: JSON.stringify(commitHash),
      __FULL_COMMIT_HASH__: JSON.stringify(fullCommitHash),
      __ENV__: JSON.stringify(process.env.NODE_ENV === "production" ? "production" : "development"),
      __HOST__: JSON.stringify(
        process.env.NODE_ENV === "production" ? productionHost : developmentHost
      ),
      __EXERCISE_IMAGE_HOST__: JSON.stringify(exerciseImageHost),
      __API_HOST__: JSON.stringify(
        process.env.NODE_ENV === "production"
          ? productionApiHost
          : developmentApiHost
      ),
      __STREAMING_API_HOST__: JSON.stringify(
        process.env.NODE_ENV === "production"
          ? productionStreamingApiHost
          : developmentStreamingApiHost
      ),
      __BUNDLE_VERSION_IOS__: bundleVersionIos,
      __BUNDLE_VERSION_ANDROID__: bundleVersionAndroid,
    }),
    new HtmlWebpackPlugin({
      template: "./src/pages/planner/webviewEditor/editorWebview.html",
      filename: "editor.html",
      inject: "body",
      minify:
        process.env.NODE_ENV === "production"
          ? { collapseWhitespace: true, removeComments: true, minifyJS: false, minifyCSS: false }
          : false,
    }),
    new HtmlInlineScriptPlugin(),
    {
      apply(compiler) {
        compiler.hooks.afterEmit.tap("EmitEditorHtmlTsModule", (compilation) => {
          const htmlPath = path.resolve(__dirname, "assets/editorWebview/editor.html");
          const outPath = path.resolve(__dirname, "src/pages/planner/webviewEditor/editorHtml.generated.ts");
          let html;
          try {
            html = fs.readFileSync(htmlPath, "utf8");
          } catch (e) {
            compilation.errors.push(new Error("EmitEditorHtmlTsModule: cannot read " + htmlPath + ": " + e.message));
            return;
          }
          const escaped = JSON.stringify(html);
          const out = "// AUTO-GENERATED BY webpack (editorWebviewConfig). Do not edit by hand.\n" +
            "export const EDITOR_HTML: string = " + escaped + ";\n";
          fs.mkdirSync(path.dirname(outPath), { recursive: true });
          fs.writeFileSync(outPath, out);
        });
      },
    },
  ],
  mode: process.env.NODE_ENV === "production" ? "production" : "development",
};

module.exports = [mainConfig, watchConfig, editorWebviewConfig];

