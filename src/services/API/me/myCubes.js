const faunaClient = require( './faunaClient' );
const GenerateResponse = require( './GenerateResponse' );

module.exports.main = async ( event ) => {

    // Reject if not logged in
    if( event.requestContext.authorizer.principalId === 'none' ){
        return GenerateResponse( false, {
            error: 'User not logged in'
        });
    }

    // Get the client
    const [client, q] = await faunaClient();

    const userSub = event.requestContext.authorizer.principalId;

    try{

        const cubes = await client.query(
            q.Paginate(
                q.Join(
                    q.Match( q.Index( 'user_by_sub' ), userSub ),
                    q.Index( 'cubes_by_owner' )
                )
            )
        );

        // TODO Get only specific properties from Cubes

        return GenerateResponse( true, {
            ...cubes
        });

    } catch( e ){

        // Catch Fetch errors
        return GenerateResponse.fetchError( e );

    }

};