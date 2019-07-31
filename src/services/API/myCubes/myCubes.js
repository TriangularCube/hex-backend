

module.exports.main = async ( event ) => {

    // TODO Change this into an actual result
    return {
        statusCode: 200,
        // headers: headers,
        body: JSON.stringify({
            message: 'The result is in',
            result: 'none'
        }, null, 2),
    };

};