let client, q;

module.exports.main = async ( event ) => {

    // Reject if not logged in
    if( event.requestContext.authorizer.principalId === 'none' ){
        return {
            statusCode: 401,
            // headers: headers,
            body: JSON.stringify({
                error: 'User not logged in'
            }, null, 2),
        };
    }

    if (!client) {
        [client, q] = await require('./faunaClient')();
    }



    // TODO Return
    return {
        statusCode: 200,
        // headers: headers,
        body: JSON.stringify({
            data: 'Placeholder!'
        }, null, 2),
    };

};