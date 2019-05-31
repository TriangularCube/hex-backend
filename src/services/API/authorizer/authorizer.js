'use strict';

module.exports.main = async ( event, context ) => {

    // this should get our source token
    const token = event.authorizationToken;

    const authPolicy = generatePolicy( 'user', 'Allow', event.methodArn );
    authPolicy.context = {
        username: 'username'
    };

    context.succeed( authPolicy );

};

function generatePolicy( principalId, effect, resource ){

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

    return authResponse;

}