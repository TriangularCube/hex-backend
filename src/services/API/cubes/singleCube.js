let faunaQuery = require( './faunaGraphqlQuery' );
const GenerateResponse = require ( './GenerateResponse' );

module.exports.main = async ( event ) => {

    const handle = event.pathParameters.handle;

    try{

        let res = await faunaQuery(`
            query GetCube {
                findCubeByHandle(
                    handle: "${ handle }"
                ) {
                    handle
                    name
                    cards {
                        cardId
                    }
                    workspace {
                        cardId
                    }
                    owner {
                        displayName
                    }
                }
            }
        `);

        const cube = res.data.findCubeByHandle;

        if( !cube ){
            return GenerateResponse( false, {
                error: 'Cube not found'
            });
        }

        return GenerateResponse( true, {
            cube
        });

    } catch( e ){

        console.error( e.message );
        console.error( "Error getting Cube: " + handle );

        return GenerateResponse.fetchError( e );

    }

};