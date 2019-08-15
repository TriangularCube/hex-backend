const idGen = require( 'simple-human-ids' );

// let client, q;
const faunaQuery = require( './faunaGraphqlQuery' );

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

    const data = JSON.parse( event.body );

    // Reject badly formed JSON
    if( !validate( data ) ){
        return GenerateResponse( false,{
            error: 'Invalid JSON data',
            errorMessage: validate.errors
        });
    }

    // Fetch the User's Ref
    const res = await faunaQuery(`
        query GetUserID{
            findUserBySub(
                sub: "${ userSub }"
            ){
                _id
            }
        }
    `);

    const user = res.data.findUserBySub;
    if( user === null ){
        GenerateResponse( false,{
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
                        handle: "${ generatedID }"
                        name: "${ data.name }"
                        owner: {
                            connect: "${ user._id }"
                        }
                    }
                ) {

                    handle

                }
            }
        `);

        if( !res.errors ){
            foundUniqueID = true;
        }

    } while( !foundUniqueID );


    return GenerateResponse( true, {
        handle: generatedID
    });

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