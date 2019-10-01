const faunaClient = require( './faunaClient' );
const GenerateResponse = require ( './GenerateResponse' );

module.exports.main = async ( event ) => {

    // TODO deal with private/shared cubes

    // DEBUG The following is used in case of an incoming parameter. This disabled at the moment
    // const userParam = event.pathParameters && event.pathParameters.user ? event.pathParameters.user : null;

    let size = 20;

    // Get the client
    const [client, q] = await faunaClient();

    try{

        const res = await client.query(
            q.Paginate(
                q.Match(
                    q.Index( 'all_cubes' )
                ),
                {
                    size
                }
            )
        );

        // TODO deal with private/public cubes

        return GenerateResponse( true, {
            ...res
        });

    } catch( e ){

        console.error( e.message );
        console.error( "Error getting list of cubes" );

        return GenerateResponse.fetchError( e );

    }

};