const faunaQuery = require( './faunaGraphqlQuery' );
const GenerateResponse = require( './GenerateResponse' );

module.exports.main = async ( event ) => {

    // Reject if not logged in
    if( event.requestContext.authorizer.principalId === 'none' ){
        return GenerateResponse( false, {
            error: 'Not logged in'
        });
    }

    const userSub = event.requestContext.authorizer.principalId;

    try{

        const res = await faunaQuery(`
            query GetUser{
                findUserBySub( sub: "${ userSub }" ){
                    displayName
                    type
                    cubes{
                        data {
                            handle
                            name
                        }
                    }
                }
            }
        `);

        if( !!res.errors ){
            return GenerateResponse( false, {
                error: 'Fauna Query Error',
                errorMessage: res.errors
            })
        }

        return GenerateResponse( true, {
            user: res.data.findUserBySub
        });

    } catch( e ){

        return GenerateResponse.fetchError( e );

    }

};

