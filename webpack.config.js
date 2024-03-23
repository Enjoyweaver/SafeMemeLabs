const path = require("path")

module.exports = {
  mode: "development", // Set to 'production' for optimized build
  entry: "./src/index.js", // Replace with your entry point file
  output: {
    filename: "bundle.js",
    path: path.resolve(__dirname, "dist"), // Output directory
    clean: true, // Cleans the output directory on each build
  },
  module: {
    rules: [
      {
        test: /\.mp4$/, // Matches files ending with .mp4 extension
        use: "file-loader", // Uses the file loader for handling the mp4 file
        options: {
          name: "[name].[ext]", // Preserves the original filename
          outputPath: "images", // Output directory within the 'dist' folder
          publicPath: "images", // Public path for accessing the file in the browser
        },
      },
    ],
  },
  // Add any additional loaders or plugins you might need for your project
}
