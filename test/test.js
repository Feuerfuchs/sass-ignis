const path     = require("path");
const sassTrue = require("sass-true");

sassTrue.runSass({ file: path.join(__dirname, "test.scss") }, describe, it);
