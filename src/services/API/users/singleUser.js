const faunaQuery = require( './faunaGraphqlQuery' );
const GenerateResponse = require ( './GenerateResponse' );


module.exports.main = async ( event ) => {

    const displayName = event.pathParameters.displayName;

    try{

        const result = await faunaQuery(`
            query GetUser{
                findUserByDisplayName( displayName: "${displayName}" ){
                    _id
                    displayName
                    type
                    cubes{
                        data{
                            _id
                            name
                        }
                    }
                }
            }
        `);

        // TODO deal with public/private profiles

        return GenerateResponse( true, {
            user: result.data.findUserByDisplayName
        });


    } catch( e ){
        return GenerateResponse.fetchError( e );
    }

};
