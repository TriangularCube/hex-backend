'use strict';

const ssmModule = require( './util/ssm' ); // Import the SSM module
const ssm = new ssmModule( ["FaunaKey"] ); // Spin up a new instance with our list of keys

const faunadb = require( 'faunadb' );
const q = faunadb.query;
let client;


module.exports.main = async ( event ) => {

    // Make the client
    if( !client ){
        // Fetch the DB key
        const dbKey = await ssm.getParam( 'FaunaKey' );

        // Create a new client
        client = new faunadb.Client({ secret: dbKey });
    }

    const displayName = event.pathParameters.displayName;

    let result;

    try{

        result = await client.query(
            q.Get(
                q.Match(
                    q.Index( "user_by_displayName"),
                    displayName
                )
            )
        );

    } catch( e ){
        console.error( e.message );
        console.error( "Error was for display name: " + displayName );
        result = 'None';
    }


    const headers = {
        "Access-Control-Allow-Origin": "*"
    };

    return {
        statusCode: 200,
        headers: headers,
        body: JSON.stringify({
            message: 'The result is in',
            result: result
        }, null, 2),
    };

};
