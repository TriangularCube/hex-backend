'use strict';

const faunadb = require( 'faunadb' );
const q = faunadb.query;
const client = new faunadb.Client({ secret: 'fnADRDqMRAACCXjBou0jxtqZPElE-8Dl-yIYPst7' });

module.exports.main = async ( event ) => {

    const res = await client.query(
        q.Create(
            q.Class( "users" ),
            { data: { id: 'c71607d2-6682-41b9-bf04-144973433b39', displayName: q.NewId() } }
        )
    );

    console.log( res );

    return null;

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
