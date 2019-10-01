const faunaClient = require( './faunaClient' );
const GenerateResponse = require ( './GenerateResponse' );

module.exports.main = async ( event ) => {

    const handle = event.pathParameters.handle;

    // Get the client
    const [client, q] = await faunaClient();

    try{

        let res = await client.query(
            q.Get(
                q.Match(
                    q.Index( 'cube_by_handle' ),
                    handle
                )
            )
        );

        const owner = await client.query(
            q.Get(
                q.Ref( res.data.owner )
            )
        );

        res.data.owner = {
            displayName: owner.data.displayName
        };

        return GenerateResponse( true, {
            data: res.data
        });

    } catch( e ){

        console.error( e.message );
        console.error( "Error getting Cube: " + handle );

        return GenerateResponse.fetchError( e );

    }

};