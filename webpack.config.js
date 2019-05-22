import slsw from "serverless-webpack";
import nodeExternals from "webpack-node-externals";

module.exports = {
    entry: slsw.lib.entries,
    target: "node",

    externals: [nodeExternals()]
};