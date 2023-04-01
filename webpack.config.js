const webpack = require("webpack");
const path = require("path");
const fs = require("fs");
const HTMLWebpackPlugin = require("html-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const dotenv = require("dotenv");

module.exports = (env) => {
  const currentPath = path.join(__dirname);
  const basePath = currentPath + '/.env';
  const envPath = basePath + '.' + env.ENVIRONMENT;
  const finalPath = fs.existsSync(envPath) ? envPath : basePath;
  const fileEnv = dotenv.config({ path: finalPath }).parsed;
  const envKeys = Object.keys(fileEnv).reduce((prev, next) => {
    prev[`process.env.${next}`] = JSON.stringify(fileEnv[next]);
    return prev;
  }, {});

  return {
    entry: "./src/index.js",
    output: {
      path: path.join(__dirname, "/dist"),
      filename: "bundle.js",
      publicPath: "/",
      assetModuleFilename: "assets/img/[hash][ext][query]",
    },
    plugins: [
      new HTMLWebpackPlugin({
        template: "./src/index.html",
        favicon: "./src/assets/images/logo.svg",
        appName: process.env.APP_NAME,
      }),
      new MiniCssExtractPlugin(),
      new webpack.DefinePlugin(envKeys),
    ],
    module: {
      rules: [
        {
          test: /\.(png|jpe?g|gif|svg)$/i,
          type: "asset",
        },
        {
          test: /\.(s[ac]|c)ss$/i,
          use: [
            {
              loader: MiniCssExtractPlugin.loader,
              options: { publicPath: "" },
            },
            "css-loader",
            "postcss-loader",
            "sass-loader",
          ],
        },
        {
          test: /\.jsx?$/,
          exclude: /node_modules/,
          use: {
            loader: "babel-loader",
            options: {
              presets: [
                [
                  "@babel/preset-env",
                  {
                    targets: "defaults",
                    debug: true,
                    useBuiltIns: "usage",
                    corejs: 3,
                  },
                ],
                ["@babel/preset-react", { runtime: "automatic" }],
              ],
            },
          },
        },
      ],
    },
    devServer: {
      hot: true,
      port: 3000,
      open: true,
      historyApiFallback: true,
      historyApiFallback: {
        disableDotRule: true,
      },
      // proxy: {
      //   "/api": "http://localhost:8000",
      //   changeOrigin: true,
      // },
    },
  };
};
