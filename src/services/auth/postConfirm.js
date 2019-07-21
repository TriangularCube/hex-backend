let client, q;

module.exports.main = async (event) => {

    // If this source came from anything other than confirm sign up
    if( event.triggerSource !== 'PostConfirmation_ConfirmSignUp' ){
        // Return the event and end the lambda
        return event;
    }

    // Otherwise

    // If there is no DB client already
    if( !client ){
        [client, q] = await require( './faunaClient' )();
    }

    // Fetch the user SUB, the unique Cognito User Pool ID
    const sub = event.request.userAttributes.sub;

    try{

        // Make a new user
        const res = await client.query(
            q.Create(
                q.Collection( "users" ),
                { data: { sub: sub, displayName: q.NewId() } }
            )
        );

        // Log the result for record keeping
        console.log( "Result from creating a new User: " + res );

    } catch( e ) {
        // Log the error for CloudWatch. This will probably be Instance not unique or something, but that should be caught earlier already
        console.error( "Error message from trying to create new user: " + e.message );
        console.error( "User SUB: " + sub );
    }

    // Finally we're done, so return the event unmodified, as the trigger doesn't require anything
    return event;
};