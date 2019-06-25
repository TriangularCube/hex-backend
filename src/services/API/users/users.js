'use strict';

const ssmModule = require( './ssm' ); // Import the SSM module
const ssm = new ssmModule( ["FaunaKey"] ); // Spin up a new instance with our list of keys

const faunadb = require( 'faunadb' );
const q = faunadb.query;
let client;

module.exports.main = async () => {

    // Make the client
    if( !client ){
        // Fetch the DB key
        const dbKey = await ssm.getParam( 'FaunaKey' );

        // Create a new client
        client = new faunadb.Client({ secret: dbKey });
    }

    let result;

    try{

        result = await client.query(
            q.Paginate(
                q.Match(
                    q.Index( "all_users")
                )
            )
        );

    } catch( e ){
        console.error( e.message );
        console.error( "Error getting list of users" );
        result = 'None';
    }

    const headers = {
        "Access-Control-Allow-Origin": "*"
    };

    // TODO Change this into an actual result
    return {
        statusCode: 200,
        headers: headers,
        body: JSON.stringify({
            message: 'The result is in',
            result: result
        }, null, 2),
    };

};