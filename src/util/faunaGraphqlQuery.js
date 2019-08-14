const ssmModule = require( './ssm' ); // Import the SSM module
const faunaKeyName = `/fauna/FaunaKey-${process.env.STAGE}`;

const ssm = new ssmModule( [faunaKeyName] ); // Spin up a new instance with our list of keys

const btoa = require( 'btoa' );

module.exports = async ( query ) => {

    let key = await ssm.getParam( faunaKeyName );
    key = key + ':';

    const res = await fetch( 'https://graphql.fauna.com/graphql', {
        method: 'POST',
        headers: {
            'Authorization': 'Bearer ' + btoa( key )
        },
        // MUST STRINGIFY BODY, THIS IS IN GRAPHQL SPECS
        body: JSON.stringify( {
            query: query
        } )
    });

    return await res.json();

};