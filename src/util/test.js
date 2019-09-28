const faunadb = require( "faunadb" );
const key = "fnADTYvYuRACAwAp_EcbYfN7bLQ9e-vlxgZApqpR";

const client = new faunadb.Client({ secret: key });
const q = faunadb.query;

const f = async () => {
    try{
        let res = await client.query(
            q.Get(q.Match(q.Index("user_by_displayName"), "bluntweapon"))
        );
        console.log(res.ref);
    } catch( e ){
        console.log( e );
    }
};

f();