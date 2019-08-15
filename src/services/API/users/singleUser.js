let faunaQuery = require( './faunaGraphqlQuery' );


module.exports.main = async ( event ) => {

    const displayName = event.pathParameters.displayName;

    let response = {
        success: false
    };

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

        response.success = true;
        response.user = result.data.findUserByDisplayName;

    } catch( e ){
        console.error( e.message );
        console.error( "Error was for display name: " + displayName );

        response.success = false;
        response.error = e.message;
        response.user = null;
    }


    // const headers = {
    //     "Access-Control-Allow-Origin": "*"
    // };

    // TODO Change this into an actual result
    return {
        statusCode: 200,
        // headers: headers,
        body: JSON.stringify({ response }, null, 2),
    };

};
