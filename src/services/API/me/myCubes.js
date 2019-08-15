const faunaQuery = require( './faunaGraphqlQuery' );

module.exports.main = async ( event ) => {

    // Reject if not logged in
    if( event.requestContext.authorizer.principalId === 'none' ){
        return GenerateResponse( false, {
            error: 'User not logged in'
        });
    }

    const userSub = event.requestContext.authorizer.principalId;

    try{

        const res = await faunaQuery(`
            query GetMyCubes{
                findUserBySub( sub: "${ userSub }" ){
                    cubes {
                        data {
                            _id
                            handle
                            name
                        }
                    }
                }
            }
        `);

        return GenerateResponse( true, {
            cubes: res.data.findUserBySub.cubes.data
        });

    } catch( e ){

        // Catch Fetch errors
        return GenerateResponse( false, {
            error: 'Error Fetching',
            errorMessage: e.message
        })

    }

};

function GenerateResponse( success, data ) {
    return {
        statusCode: 200,
        body: JSON.stringify({
            success,
            ...data
        }, null, 2),
    };
}