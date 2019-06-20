const middy = require( 'middy' );
const { ssm } = require( 'middy/middlewares' );

const faunadb = require( 'faunadb' );
const q = faunadb.query;
const client = faunadb.Client({ secret: process.env.faunaKey });

const handler = async (event) => {

    // Check the trigger source
    if( event.triggerSource === 'PostConfirmation_ConfirmSignUp' ){

        // If this source came from confirming sign up

        const key = process.env.faunaKey;

        console.log( key );

        // Make a new user

        
    }

    return event;
};

module.exports.main = middy( handler ).use(
    // Using SSM middleware, will cache and decrypt for us
    ssm({
        cache: true,
        names: {
            faunaKey: 'FaunaKey'
        }
    })
);