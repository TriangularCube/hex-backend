'use strict';

module.exports.hello = async (event) => {

    const headers = {
        "Access-Control-Allow-Origin": "*"
    };

    return {
        statusCode: 200,
        headers: headers,
        body: JSON.stringify({
            message: 'Go Serverless v1.0! Your function executed successfully!',
            input: event,
        }, null, 2),
    };

};
