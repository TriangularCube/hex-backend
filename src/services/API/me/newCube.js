const idGen = require( 'simple-human-ids' );
const faunaClient = require( './faunaClient' );
const GenerateResponse = require( './GenerateResponse' );

const ajvImport = require( 'ajv' );
const ajv = new ajvImport({ allErrors: true });
const schema = {

    type: 'object',
    required: [ 'name' ],
    properties: {

        name: {

            type: 'string'

        }

    },
    additionalProperties: false

};
const validate = ajv.compile( schema );


const maxAttempts = 10;

module.exports.main = async ( event ) => {

    // Fetch the user's sub
    const userSub = event.requestContext.authorizer.principalId;

    // Reject unauthenticated users
    if( userSub === 'none' ){
        return GenerateResponse( false,{
            error: 'Unauthenticated users cannot create cubes'
        });
    }

    // Try to get the JSON body
    let cubeData;
    try {
        cubeData = JSON.parse( event.body );
    } catch( e ){
        return GenerateResponse( false, {
            error: 'The Body received cannot be parsed as a JSON'
        });
    }


    // Reject badly formed JSON
    if( !validate( cubeData ) ){
        return GenerateResponse( false, {
            error: validate.errors
        });
    }

    // Reject if name too short
    if( cubeData.name.length < 1 ){
        return GenerateResponse( false, {
            error: 'Name is too short'
        })
    }


    // Get the client
    const [client, q] = await faunaClient();

    // Get the user
    let userRef;
    try{
        const res = await client.query(
            q.Paginate(
                q.Match(
                    q.Index( 'user_by_sub' ),
                    userSub
                )
            )
        );

        // NOTE This is simply a sanity check, it shouldn't happen
        if( res.data.length < 1 ){
            return GenerateResponse( false, {
                error: 'Could not find user'
            })
        }

        userRef = res.data[0];
    } catch( e ){

        const errMsg = `Could not get User from FaunaDB. Error: ${e}`;

        console.error( errMsg );
        return GenerateResponse( false, {
            error: errMsg
        });

    }


    for( let i = 0; i < maxAttempts; i++ ){

        const id = idGen.new();

        try{

            const newCubeRes = await client.query(
                q.Create(
                    q.Collection( 'cubes' ),
                    {
                        data: {
                            owner: userRef,
                            name: cubeData.name,
                            handle: id,
                            lists: {
                                cube: [],
                                workspace: []
                            },
                            history: [
                                // First entry always for creation
                                {
                                    time: q.Time( 'now' )
                                }
                            ],
                            stash: []
                        }
                    }
                )
            );

            return GenerateResponse( true, {
                data: newCubeRes.data
            });

        } catch( e ){
            console.error( `Attempt #${i} failed with id: ${id}. Error Message : ${e}` );
        }

    }

    // If none of attempts succeed
    return GenerateResponse( false, {
        error: 'Cube could not be created'
    });


    /*
    // Fetch the User's Ref
    const res = await faunaQuery(`
        query GetUserID{
            findUserBySub(
                sub: "${userSub}"
            ){
                _id
            }
        }
    `);

    const user = res.data.findUserBySub;
    if (user === null) {
        GenerateResponse(false, {
            error: 'User Not Found',
            errorMessage: 'No user by this sub. THIS SHOULD NOT HAVE HAPPENED'
        })
    }


    let generatedID, foundUniqueID = false, tries = 0;

    do {

        generatedID = idGen.new();

        // Try to generate a name that has not yet been used
        const res = await faunaQuery(`
            mutation MakeNewCube{
                createCube(
                    data: {
                        handle: "${generatedID}"
                        name: "${data.name}"
                        owner: {
                            connect: "${user._id}"
                        }
                    }
                ) {

                    handle

                }
            }
        `);

        if (!res.errors) {
            foundUniqueID = true;
        } else {
            console.error( res.errors );
            tries += 1;
        }

    } while (!foundUniqueID && tries <= 10 );

    // If we tried 10 times and still could not generate a unique ID
    if( !foundUniqueID ){
        return GenerateResponse( false, {
            error: errorCodes.couldNotGenerateUniqueID
        });
    }

    // Finally return the response that creation was successful
    return GenerateResponse( true, {
        handle: generatedID
    });
    */



};