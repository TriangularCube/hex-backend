const ssmModule = require( './ssm' ); // Import the SSM module
const faunaKeyName = `/fauna/FaunaKey-${process.env.STAGE}`;

console.log( faunaKeyName );

const ssm = new ssmModule( [faunaKeyName] ); // Spin up a new instance with our list of keys

module.exports = async () => await ssm.getParam( faunaKeyName );