const faunaQuery = require('./faunaGraphqlQuery');

module.exports.main = async (event) => {

    // If this source came from anything other than confirm sign up
    if (event.triggerSource !== 'PostConfirmation_ConfirmSignUp') {
        // Return the event and end the lambda
        return event;
    }

    // Otherwise

    const sub = event.request.userAttributes.sub;

    let res = await faunaQuery(`
        query GetUser{
            findUserBySub( sub:"${sub}" ){
                _id
                sub
                displayName
                active
            }
        }
    `);

    const user = res.data.findUserBySub;

    if( user === null ){
        throw new Error( 'User no longer exists' );
    }

    res = await faunaQuery(`
        mutation ChangeUser{
            updateUser(
                id: ${user._id}
                data: {
                  sub: "${user.sub}"
                  displayName: "${user.displayName}"
                  type: FREE
                  active: true
                }
            ){
                active
            }
        }
    `);

    console.log( `Successfully activated user. Response object is: ${res}` );


    // Finally we're done, so return the event unmodified, as the trigger doesn't require anything
    return event;
};