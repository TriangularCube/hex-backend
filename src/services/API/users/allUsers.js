let faunaQuery = require( './faunaGraphqlQuery' );

module.exports.main = async ( event ) => {

    let size = 20;
    if( event.queryStringParameters && event.queryStringParameters.size ){
        size = event.queryStringParameters.size;
    }

    // Default false message
    let response = {
        success: false
    };

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

        response.success = true;
        response.users = result;

    } catch( e ){
        console.error( e.message );
        console.error( "Error getting list of users" );

        response.success = false;
        response = null;
    }

    // const headers = {
    //     "Access-Control-Allow-Origin": "*"
    // };

    // TODO Change this into an actual result
    return {
        statusCode: 200,
        // headers: headers,
        body: JSON.stringify({ response }, null, 2)
    };

};