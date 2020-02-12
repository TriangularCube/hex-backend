let GenerateResponse = ( success, data ) => {
    return {
        statusCode: 200,
        headers: {
            // TODO Change this to a more secure source
            'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({
            success,
            ...data
        }, null, 2),
    };
};

GenerateResponse.fetchError = ( err ) => {

    console.error( `There has been a fetch error, full error: ${ err }` );

    return GenerateResponse( false, {
        error: 'fetch error',
        errorMessage: err.message
    });

};

module.exports = GenerateResponse;
