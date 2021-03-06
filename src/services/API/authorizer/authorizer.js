'use strict';

const jose = require( 'node-jose' );

// Backup
//const keys_url =  'https://cognito-idp.us-west-2.amazonaws.com/us-west-2_Rnsjcsoms/.well-known/jwks.json';

// Region and UserPoolId coming from environment variables

// URL to fetch the public keys from Cognito
const keys_url = 'https://cognito-idp.' + process.env.Region + '.amazonaws.com/' + process.env.UserPoolId + '/.well-known/jwks.json';

// Going to try caching well known keys from cognito pool
let keys;

module.exports.main = async ( event ) => {

    // this should get our source token
    const token = event.authorizationToken;

    // Non-authenticated user
    if( token === 'none' ){
        // TODO use an actual policy
        return generatePolicy( 'none', null );
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

    // Peek in cache
    if( !keys ){
        try{
            const fetch = require( 'node-fetch' );
            // Try to fetch public keys
            const res = await fetch( keys_url );

            // Set the keys to cached variable
            keys = (await res.json()).keys;
        } catch( e ) {

            // Throw an error if fetch rejects
            console.error( 'Fetching keys from ' + keys_url + ' failed' );
            console.error( e.message );
            throw new Error( 'Public keys failed to fetch, check logs' );
        }
    }

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
        // Verify the claims
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

    const authPolicy = generatePolicy( claims['cognito:username'], null );

    return( authPolicy );

};

function generatePolicy( principalId, context ){

    const authResponse = {};

    authResponse.principalId = principalId;

    authResponse.policyDocument = {
        Version: '2012-10-17',
        // Allow invoke API on all API Gateway endpoints in this AWS account in US-West-2
        Statement: [{
            Action: 'execute-api:Invoke',
            Effect: 'Allow',
            Resource: 'arn:aws:execute-api:us-west-2:852768116392:*'
        }]
    };

    if( context ){
        authResponse.context = context;
    }

    return authResponse;

}