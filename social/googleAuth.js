const dotenv = require('dotenv');
dotenv.config();
const CLIENT_ID = process.env.CLIENT_ID;
const {OAuth2Client} = require('google-auth-library');
const client = new OAuth2Client(CLIENT_ID);

let verify = async (token) => {
    
    const ticket = await client.verifyIdToken({
        idToken: token,
        audience: CLIENT_ID
    });
    const payload = ticket.getPayload();

  return {
      userid: payload['sub'],
      name: payload['name'], //profile name
      email_verified: payload['email_verified'], 
      email: payload['email']
    }
}

module.exports = verify;