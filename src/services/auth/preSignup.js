const faunaQuery = require( './faunaGraphqlQuery' );

module.exports.main = async (event) => {

    // Don't care if we're handling Admin singup
    if( event.triggerSource !== 'PreSignUp_SignUp' ){
        // Return the event and end the lambda
        return event;
    }

    // Otherwise

    const sub = event.userName;
    const displayName = event.request.userAttributes.name;

    // Make the user
    const res = await faunaQuery(`
        mutation MakeUser{
            createUser( data: {
                sub: "${sub}"
                displayName: "${displayName}"
                type: FREE
                active: false
            }){
                _id
                sub
                displayName
            }
        }
    `);

    if( res.errors ){
        console.error( `Error creating user, Error message: ${ res.errors }` );
        throw new Error( `Error creating user. Error Message: ` + JSON.stringify( res.errors ) )
    }

    // DEBUG for convenience
    // event.response.autoConfirmUser = true;

    return event;

};