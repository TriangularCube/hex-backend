'use strict'

const getFaunaKey = require( './faunaSSM' );

const faunadb = require( 'faunadb' );
const q = faunadb.query;
let client;


module.exports.main = async ( event ) => {

    // Make the client
    if( !client ){
        // Fetch the DB key
        const dbKey = await getFaunaKey();

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
