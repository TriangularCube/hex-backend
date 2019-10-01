const faunaClient = require( './faunaClient' );
const GenerateResponse = require( './GenerateResponse' );

module.exports.main = async ( event ) => {

    // Reject if not logged in
    if( event.requestContext.authorizer.principalId === 'none' ){
        return GenerateResponse( false, {
            error: 'Not logged in'
        });
    }

    // Get the client
    const [client, q] = await faunaClient();

    const userSub = event.requestContext.authorizer.principalId;

    try{

        const user = await client.query(
            q.Get(
                q.Match(
                    q.Index( 'user_by_sub' ),
                    userSub
                )
            )
        );

        return GenerateResponse( true, {
            data: user.data
        });

    } catch( e ){

        return GenerateResponse.fetchError( e );

    }

};

