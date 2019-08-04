let client, q;

module.exports.main = async ( event ) => {

    if( !client ){
        [client, q] = await require( './faunaClient' )();
    }

    let result;

    try{

        result = await client.query(
            q.Paginate(
                q.Join(
                    q.Match(
                        q.Index( 'user_ref_by_sub' ),
                        event.requestContext.authorizer.principalId
                    ),
                    q.Index( 'cubes_by_owner' )
                )
            )
        );

        console.log( result );

    } catch( e ){

        console.error( e.message );
        console.error( "Error fetching cube" );
        result = e;

    }

    // TODO Change this into an actual result
    return {
        statusCode: 200,
        // headers: headers,
        body: JSON.stringify({
            cubes: result.data
        }, null, 2),
    };

};