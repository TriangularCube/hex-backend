let GenerateResponse = ( success, data ) => {
    return {
        statusCode: 200,
        body: JSON.stringify({
            success,
            ...data
        }, null, 2),
    };
};

GenerateResponse.fetchError = ( err ) => {

    console.error( `There has been a fetch error, full error: ${ err }` );

    return {
        statusCode: 200,
        body: JSON.stringify({
            success: false,
            error: 'Fetch Error',
            errorMessage: err.message
        }, null, 2)
    }
};

module.exports = GenerateResponse;