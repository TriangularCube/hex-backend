const idGen = require( 'simple-human-ids' );

let client, q;

module.exports.main = async ( event ) => {

    if( !client ){
        [client, q] = await require( './faunaClient' )();
    }

    let result;

    try{

        result = await client.query(
            q.Let(
                {
                    user: q.Select( 'ref', q.Get( q.Match( q.Index( 'user_by_sub' ), event.requestContext.authorizer.principalId ) ) )
                },
                q.Create(
                    q.Collection( 'cubes' ),
                    {
                        data: {
                            id: idGen.new(),
                            name: idGen.new(),
                            owner: q.Var( 'user' )
                        }
                    }
                )
            )
        )

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
            message: 'The result is in',
            result: result
        }, null, 2),
    };

};