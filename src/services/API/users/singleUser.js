const faunaClient = require( './faunaClient' );
const GenerateResponse = require ( './GenerateResponse' );

module.exports.main = async ( event ) => {

    // Get the client

    const [client, q] = await faunaClient();

    const displayName = event.pathParameters.displayName;

    try{

        const res = await client.query(
            q.Get(
                q.Match(
                    q.Index( 'user_by_displayName' ),
                    displayName
                )
            )
        );

        return GenerateResponse( true, res.data );

    } catch( e ){
        return GenerateResponse.fetchError( e );
    }

};
