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
            name: 'Lightning Bolt'
        },
        {
            name: 'Giant Growth'
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