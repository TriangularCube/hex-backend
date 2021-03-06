const idGen = require( 'simple-human-ids' );
const faunaQuery = require( './faunaGraphqlQuery' );
const GenerateResponse = require( './GenerateResponse' );
const errorCodes = require( './errorCodes.json' );

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


module.exports.main = async ( event ) => {

    // Fetch the user's sub
    const userSub = event.requestContext.authorizer.principalId;

    // Reject unauthenticated users
    if( userSub === 'none' ){
        return GenerateResponse( false,{
            error: errorCodes.notLoggedIn,
            errorMessage: 'Unauthenticated users cannot create cubes'
        });
    }

    let data;

    try {
        data = JSON.parse( event.body );
    } catch( e ){
        return GenerateResponse( false, {
            error: errorCodes.badJsonBody,
            errorMessage: 'The Body received cannot be parsed as a JSON'
        });
    }


    // Reject badly formed JSON
    if( !validate( data ) ){
        return GenerateResponse( false,{
            error: errorCodes.invalidJSON,
            errorMessage: validate.errors
        });
    }


    try {

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


        let generatedID, foundUniqueID = false;

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
                console.error( res.errors )
            }

        } while (!foundUniqueID);


        // Finally return the response that creation was successful
        return GenerateResponse( true, {
            handle: generatedID
        });

    } catch ( e ) {

        // Catch all errors in Fetch
        return GenerateResponse.fetchError( e );

    }

};