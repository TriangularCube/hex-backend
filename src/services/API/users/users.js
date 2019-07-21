'use strict'

let client, q;

module.exports.main = async ( event ) => {

    if( !client ){
        [client, q] = await require( './faunaClient' )();
    }

    let result;

    try{

        result = await client.query(
            q.Paginate(
                q.Match(
                    q.Index( "all_users")
                ),
                {
                    size: 1
                }
            )
        );

        console.log( result );

        console.log( result.hasOwnProperty( 'after' ) );

        console.log( result.after[0].id );

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