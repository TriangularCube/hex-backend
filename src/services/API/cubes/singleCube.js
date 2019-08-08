const idGen = require( 'simple-human-ids' );
let client, q;

module.exports.main = async ( event ) => {

    if (!client) {
        [client, q] = await require('./faunaClient')();
    }

    let result;
    //
    // try{
    //
    //     result = await client.query(
    //         q.Get(
    //             q.Match(
    //
    //             )
    //         )
    //     );
    //
    // } catch( e ){
    //
    //
    //
    // }

    // HACK Use test results for now
    result = [
        {
            name: idGen.new()
        },
        {
            name: idGen.new()
        }
    ];


    // TODO Change this into an actual result
    return {
        statusCode: 200,
        // headers: headers,
        body: JSON.stringify({
            list: result
        }, null, 2),
    };

};