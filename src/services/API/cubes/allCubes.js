let faunaQuery = require( './faunaGraphqlQuery' );
const GenerateResponse = require ( './GenerateResponse' );

module.exports.main = async ( event ) => {

    // TODO deal with private/shared cubes

    // DEBUG The following is used in case of an incoming parameter. This disabled at the moment
    // const userParam = event.pathParameters && event.pathParameters.user ? event.pathParameters.user : null;



    try{

        const res = await faunaQuery(`
            query GetAllCubes{
                allCubes {
                    data {
                        handle
                        name
                    }
                    before
                    after
                }
            }
        `);

        // TODO deal with private/public cubes

        return GenerateResponse( true, {
            cubes: res.data.allCubes.data,
            before: res.data.allCubes.before,
            after: res.data.allCubes.after
        });

    } catch( e ){

        console.error( e.message );
        console.error( "Error getting list of cubes" );

        return GenerateResponse.fetchError( e );

    }

};