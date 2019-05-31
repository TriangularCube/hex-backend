'use strict';

module.exports.main = async ( event, context ) => {

    const headers = {
        "Access-Control-Allow-Origin": "*"
    };

    return {
        statusCode: 200,
        headers: headers,
        body: JSON.stringify({
            message: 'Go Serverless v1.0! Your function executed successfully!',
            event: event
        }, null, 2),
    };

};
