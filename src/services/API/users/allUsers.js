const faunaClient = require( './faunaClient' );
const GenerateResponse = require ( './GenerateResponse' );

module.exports.main = async ( event ) => {

    // Get the client
    const [client, q] = await faunaClient();

    let size = 20;
    if( event.queryStringParameters && event.queryStringParameters.size ){
        size = event.queryStringParameters.size;
    }

    try{

        const res = await client.query(
            q.Map(
                q.Paginate(
                    q.Match(
                        q.Index( 'all_users' )
                    ),
                    {
                        size
                    }
                ),
                q.Lambda( 'x', q.Select( 'data', q.Get( q.Var( 'x' ) ) ) )
            )
        );

        return GenerateResponse( true, res );

    } catch( e ){
        return GenerateResponse.fetchError( e );
    }

};