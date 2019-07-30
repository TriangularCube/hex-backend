let client, q;

module.exports.main = async ( event ) => {

    if( !client ){
        [client, q] = await require( './faunaClient' )();
    }

    const userParam = event.pathParameters && event.pathParameters.user ? event.pathParameters.user : null;

    let result;

    try{

        result = await client.query(

            q.Paginate(
                q.Match(
                    q.Index( userParam === null ? 'all_cubes' : 'cubes_by_owner' ),
                    userParam
                )
            )

        )

    } catch( e ){

        console.error( e.message );
        console.error( "Error getting list of cubes" );
        result = 'None';

    }


    // TODO Change this into an actual result
    return {
        statusCode: 200,
        // headers: headers,
        body: JSON.stringify({
            message: 'The result is in',
            result: result
        }, null, 2),
    };

};