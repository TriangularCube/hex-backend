const faunaClient = require( './faunaClient' );

module.exports.main = async (event) => {

    // If this source came from anything other than confirm sign up
    if (event.triggerSource !== 'PostConfirmation_ConfirmSignUp') {
        // Return the event and end the lambda
        return event;
    }

    // Get the client
    const [client, q] = await faunaClient();

    // Otherwise

    const sub = event.request.userAttributes.sub;

    let userRef;
    let displayName;

    try{

        let res = await client.query(
            q.Get(
                q.Match(
                    q.Index( 'user_by_sub' ),
                    sub
                )
            )
        );

        userRef = res.ref;
        displayName = res.data.displayName;

    } catch( e ){
        const errMsg = `Failed getting user from DB. Error: ${e.message}`;

        console.error( errMsg );
        throw new Error( errMsg );
    }

    try{

        let res = await client.query(
            q.Update(
                userRef,
                {
                    data: {
                        userType: 'FREE'
                    }
                }
            )
        );

        console.log( `User ${displayName} has been confirmed` );
        console.log( res );

    } catch( e ){
        const errMsg = `User ${displayName} could not be confirmed. DB Error`;

        console.error( errMsg );
        throw new Error( errMsg );
    }

    /*
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
     */


    // Finally we're done, so return the event unmodified, as the trigger doesn't require anything
    return event;
};