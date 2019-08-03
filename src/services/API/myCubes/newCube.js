const idGen = require( 'simple-human-ids' );

let client, q;

// TODO Use AJV
const ajvImport = require( 'ajv' );
const ajv = new ajvImport({ allErrors: true });
const schema = require( './newCubeSchema' );
const validate = ajv.compile( schema );


module.exports.main = async ( event ) => {

    // Fetch the user's sub
    const userSub = event.requestContext.authorizer.principalId;

    // Reject unauthenticated users
    if( userSub === 'none' ){
        return {
            statusCode: 200,
            body: JSON.stringify({
                success: false,
                error: 'Unauthenticated users cannot create cubes'
            }, null, 2),
        };
    }

    const data = JSON.parse( event.body );

    // Reject badly formed JSON
    if( !validate( data ) ){
        return {
            statusCode: 200,
            body: JSON.stringify({
                success: false,
                error: 'Invalid JSON data',
                errorMessage: validate.errors
            })
        }
    }

    // Load the fauna client
    if( !client ){
        [client, q] = await require( './faunaClient' )();
    }


    let generatedID, foundUniqueID = false, result;

    do {

        generatedID = idGen.new();

        // Try to generate a name that has not yet been used
        try {

            let res = await client.query(
                q.Create(
                    q.Collection( 'cubes' ),
                    {
                        data: {
                            id: generatedID,
                            name: data.name,
                            owner: q.Get( q.Match( q.Index( 'user_ref_by_sub' ), userSub ) ),
                            private: true
                        }
                    }
                )
            );

            // FIXME Not really sure this is needed
            result = res;
            foundUniqueID = true;

        } catch (e) {
            // Do nothing here, and keep searching for a name that works
        }

    } while( !foundUniqueID );


    // let result;
    // try{
    //
    //     result = await client.query(
    //         q.Let(
    //             {
    //                 user: q.Select( 'ref', q.Get( q.Match( q.Index( 'user_by_sub' ), userSub ) ) )
    //             },
    //             q.Create(
    //                 q.Collection( 'cubes' ),
    //                 {
    //                     data: {
    //                         id: idGen.new(),
    //                         name: idGen.new(),
    //                         owner: q.Var( 'user' )
    //                     }
    //                 }
    //             )
    //         )
    //     )
    //
    // } catch( e ){
    //
    //     console.error( e.message );
    //     console.error( "Error creating cube" );
    //     result = e;
    //
    // }

    return {
        statusCode: 200,
        body: JSON.stringify({
            success: true,
            result // FIXME Don't really need this, just in here for debug purposes
        }, null, 2),
    };

};