const ssmModule = require( './ssm' ); // Import the SSM module
const faunaKeyName = `/fauna/FaunaKey-${process.env.STAGE}`;

const ssm = new ssmModule( [faunaKeyName] ); // Spin up a new instance with our list of keys

const faunadb = require( 'faunadb' );
const q = faunadb.query;
let client;

module.exports = async () => {

    if( ! client ){
        const key = await ssm.getParam( faunaKeyName );

        // Create a new client
        client = new faunadb.Client({ secret: key });
    }

    return [
        client, q
    ]

};