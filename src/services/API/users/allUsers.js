let faunaQuery = require( './faunaGraphqlQuery' );
const GenerateResponse = require ( './GenerateResponse' );

module.exports.main = async ( event ) => {

    let size = 20;
    if( event.queryStringParameters && event.queryStringParameters.size ){
        size = event.queryStringParameters.size;
    }

    try{

        const result = await faunaQuery(`
            query GetAllUsers{
                allUsers( _size: ${size} ){
                    data{
                        _id
                        displayName
                        cubes{
                            data{
                                _id
                            }
                        }
                    }
                    before
                    after
                }
            }
        `);

        // TODO deal with public/private profiles

        return GenerateResponse( true, {
            users: result.data.allUsers.data,
            before: result.data.allUsers.before,
            after: result.data.allUsers.after
        });

    } catch( e ){
        return GenerateResponse.fetchError( e );
    }

};