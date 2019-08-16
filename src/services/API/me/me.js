const faunaQuery = require( './faunaGraphqlQuery' );
const GenerateResponse = require( './GenerateResponse' );

module.exports.main = async ( event ) => {

    // Reject if not logged in
    if( event.requestContext.authorizer.principalId === 'none' ){
        return GenerateResponse( false, {
            error: 'Not logged in'
        });
    }

    try{

        const res = await faunaQuery(`
            
        `);

    } catch( e ){

        return GenerateResponse.fetchError( e );

    }

};

