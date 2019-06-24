'use strict';

const jose = require( 'node-jose' );

// Region and UserPoolId coming from environment variables

// URL to fetch the public keys from Cognito
//const keys_url =  'https://cognito-idp.us-west-2.amazonaws.com/us-west-2_Rnsjcsoms/.well-known/jwks.json';
//const keys_url = 'https://cognito-idp.' + process.env.Region + '.amazonaws.com/' + process.env.UserPoolId + '/.well-known/jwks.json';

// Going to try caching well known keys from cognito pool
// const keys = require( './keys' )['keys'];

module.exports.main = async ( event ) => {

    // this should get our source token
    const token = event.authorizationToken;

    // Non-authenticated user
    if( token === 'none' ){
        return generatePolicy( 'none', 'Allow', "*", null );
    }

    let sections;
    try{
        // Split the sections of the token
        sections = token.split('.' );
    } catch( e ) {
        let msg = 'Malformed token. e: ' + e.message;
        console.error( msg );
        throw new Error( msg );
    }

    // Get the KID from header
    let header = jose.util.base64url.decode( sections[0] );
    header = JSON.parse( header );
    const kid = header.kid;

    // No longer downloading public keys

    const keys = require( './keys.json' )['keys'];

    // Search for the kid in the downloaded public keys
    let key_index = -1;
    for( let i = 0; i < keys.length; i++ ){
        if( kid === keys[i].kid ){
            key_index = i;
            break;
        }
    }

    if( key_index === -1 ){
        // No matching key was found
        let msg = 'No matching public key found for user';
        console.error( msg );
        throw new Error( msg );
    }

    let jwkKey;
    try{
        // Construct public key
        jwkKey = await jose.JWK.asKey( keys[key_index] );
    } catch( e ) {
        let msg = 'Public key cannot be used as JWK Key. e: ' + e.message;
        console.error( msg );
        throw new Error( msg );
    }

    let verified;
    try{
        verified = await jose.JWS.createVerify( jwkKey ).verify( token );
    } catch( e ) {
        let msg = 'Could not use public key as JWK. e: ' + e.message;
        console.error( msg );
        throw new Error( msg );
    }

    // Now we can use the claims
    let claims = JSON.parse( verified.payload );

    // Can verify the expiration also
    const current_ts = Math.floor( new Date() / 1000 );
    if( current_ts > claims.exp ){
        console.error( 'Token is expired' );
        throw new Error( 'Token is expired' );
    }

    // Not going to verify the audience now (which is the app client id)

    // Passed all checks
    let contextData = {
        user: claims['cognito:username']
    };
    const authPolicy = generatePolicy( claims['cognito:username'], 'Allow', "*", contextData );

    return( authPolicy );

};

function generatePolicy( principalId, effect, resource, context ){

    const authResponse = {};

    authResponse.principalId = principalId;

    if( effect && resource ){
        let policyDocument = {};
        policyDocument.Version = '2012-10-17';
        policyDocument.Statement = [];

        let statementOne = {};
        statementOne.Action = 'execute-api:Invoke';
        statementOne.Effect = effect;
        statementOne.Resource = resource;
        policyDocument.Statement[0] = statementOne;
        authResponse.policyDocument = policyDocument;
    }

    if( context ){
        authResponse.context = context;
    }

    return authResponse;

}