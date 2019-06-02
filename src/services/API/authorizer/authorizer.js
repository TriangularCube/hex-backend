'use strict';

const rp = require( 'request-promise-native' );
const jose = require( 'node-jose' );

// Region, UserPoolId, and AuthorizerClient coming from environment variables

// URL to fetch the public keys from Cognito
const keys_url = 'https://cognito-idp.' + process.env.Region + '.amazonaws.com/' + process.env.UserPoolId + '/.well-known/jwks.json';

module.exports.main = async ( event ) => {

    // this should get our source token
    const token = event.authorizationToken;

    // Non-authenticated user
    if( token === 'none' ){
        return generatePolicy( 'user', 'Allow', event.methodArn, null );
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
    const header = jose.util.base64url.decode( sections[0] );
    const kid = header.kid;

    // Download the public keys
    let body;
    try{
        body = await rp( keys_url );
    } catch( e ) {
        let msg = 'Cognito unreachable';
        console.error( msg );
        throw new Error( msg );
    }

    const keys = JSON.parse( body )[ 'keys' ];

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
        jwkKey = jose.JWK.asKey(keys[key_index]);
    } catch( e ) {
        let msg = 'Public key cannot be used as JWK Key. e: ' + e.message;
        console.error( msg );
        throw new Error( msg );
    }

    let verified;
    try{
        verified = jose.JWS.createVerify( jwkKey ).verify( token );
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

    // Also the audience
    if( claims.aud !== process.env.UserPoolId ){
        console.error( 'Token was not issued for this audience' );
        throw new Error( 'Token was not issued for this audience' );
    }

    // Passed all checks
    let contextData = {
        claims: claims
    };
    const authPolicy = generatePolicy( 'user', 'Allow', event.methodArn, contextData );

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