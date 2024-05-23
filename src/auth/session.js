require("dotenv").config()

const jsforce = require("jsforce")
const getVersion = require("./api_version")

exports.store = (req) => {

  const auth_credentials = {
    sessionId: req.body.credentials.session_id,
    serverUrl: req.body.credentials.server_url,
    instanceUrl: req.body.credentials.server_url,
    version: process.env.API_VERSION
  }

  const sf_object = {
    auth_type: req.body.source
  }

  return new Promise((resolve, reject) => {

    const conn = new jsforce.Connection(auth_credentials);   
    sf_object.opened_date = new Date();

    conn.identity(async (err, res) => {
      if (!err) {
        let userId = '';

        // Check if userInfo.id is present and valid
        if (conn.userInfo && conn.userInfo.id) {
          userId = conn.userInfo.id;
        } 
        else {          
          //reject("Invalid user info received.");
          console.log("Invalid user info received - maybe due to SubstituteUser session type. Attempting to retrieve user info from Chatter API...");          
          const chatterRes = await conn.chatter.resource('/users/me');
          userId = chatterRes.id;
        }

        // Now I should have a user id properly set

        try {
          const relatedUser = await conn
            .sobject("User")
            .retrieve(userId);

          sf_object.opened_date = new Date();
          sf_object.api = await getVersion(conn);

          sf_object.auth_response = {
            id: userId,
            name: relatedUser.Name,
            username: relatedUser.Username,
            accessToken: conn.accessToken,
            instanceUrl: conn.instanceUrl,
          };

          resolve(sf_object);
        } 
        catch (retrieveErr) {
          console.error("Error retrieving user:", retrieveErr);
          reject("Error retrieving user: " + retrieveErr.message);
        }
      }
      else {
        console.error("Identity error:", err);
        reject("Could not authenticate with session information.");
      }
    });
  
  });

}
