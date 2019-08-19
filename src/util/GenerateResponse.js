const errorCodes = require( './errorCodes' );

let GenerateResponse = ( success, data ) => {
    return {
        statusCode: 200,
        headers: {
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

    return {
        statusCode: 200,
        headers: {
            'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({
            success: false,
            error: errorCodes.fetchError,
            errorMessage: err.message
        }, null, 2)
    }
};

module.exports = GenerateResponse;