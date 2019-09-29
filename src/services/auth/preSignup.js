const faunaClient = require( './faunaClient' );

module.exports.main = async (event) => {

    // Don't care if we're handling Admin sign up
    if( event.triggerSource !== 'PreSignUp_SignUp' ){
        // Return the event and end the lambda
        return event;
    }

    // Get the client
    const [client, q] = await faunaClient();


    // Otherwise

    console.log( event.request );

    try{
        // Make the user
        let res = await client.query(
            q.Create(
                q.Collection( "users" ),
                {
                    data: {
                        sub: event.userName,
                        displayName: event.request.userAttributes.name,
                        userType: 'UNCONFIRMED',
                        profile: {
                            email: event.request.userAttributes.email
                        }
                    }
                }
            )
        );

        console.log( `Created user. Response: ${res}` );

    } catch( e ){
        console.error( `Error creating user, Error message: ${ e.message }` );
        throw new Error( `Error creating user. Error Message: ${e.message}` );
    }

    // DEBUG for convenience
    event.response.autoConfirmUser = true;

    return event;

};