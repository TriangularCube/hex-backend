const faunaClient = require( './faunaClient' );
const GenerateResponse = require( './GenerateResponse' );

module.exports.main = async ( event ) => {

    // Reject if not logged in
    if( event.requestContext.authorizer.principalId === 'none' ){
        return GenerateResponse( false, {
            error: 'User not logged in'
        });
    }

    // Get the client
    const [client, q] = await faunaClient();

    const userSub = event.requestContext.authorizer.principalId;

    try{

        const cubes = await client.query(
            q.Map(
                q.Match(
                    q.Index( 'user_ref_by_sub' ),
                    userSub
                ),
                q.Lambda( 'x',  )
            )
        );

        // TODO Get only specific properties from Cubes

        const res = await faunaQuery(`
            query GetMyCubes{
                findUserBySub( sub: "${ userSub }" ){
                    cubes {
                        data {
                            _id
                            handle
                            name
                        }
                        before
                        after
                    }
                }
            }
        `);

        if( res.errors ){
            GenerateResponse( false, {
                error: 'Fauna Query error',
                errorMessage: res.errors
            })
        }

        const obj = res.data.findUserBySub.cubes;

        return GenerateResponse( true, {
            cubes: obj.data,
            before: obj.before,
            after: obj.after
        });

    } catch( e ){

        // Catch Fetch errors
        return GenerateResponse.fetchError( e );

    }

};