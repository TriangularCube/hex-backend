const idGen = require( 'simple-human-ids' );
const faunaQuery = require( './faunaGraphqlQuery' );
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


module.exports.main = async ( event ) => {

    // Fetch the user's sub
    const userSub = event.requestContext.authorizer.principalId;

    // Reject unauthenticated users
    if( userSub === 'none' ){
        return GenerateResponse( false,{
            error: 'Unauthenticated users cannot create cubes'
        });
    }

    let data;

    try {
        data = JSON.parse( event.body );
    } catch( e ){
        return GenerateResponse( false, {
            error: 'Badly formed JSON body'
        });
    }


    // Reject badly formed JSON
    if( !validate( data ) ){
        return GenerateResponse( false,{
            error: 'Invalid JSON data',
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
                error: 'No user by this sub. THIS SHOULD NOT HAVE HAPPENED'
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