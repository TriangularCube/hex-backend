'use strict'

let client, q;


module.exports.main = async ( event ) => {

    if( !client ){
        [client, q] = await require( './faunaClient' )();
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
