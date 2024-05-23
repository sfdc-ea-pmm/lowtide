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

    console.log("auth_credentials:");
    console.log(auth_credentials);

    const conn = new jsforce.Connection(auth_credentials)
    
    sf_object.opened_date = new Date()

    conn.identity(async (err, res) => {
      if (!err) {
        console.log("User Info:", conn.userInfo);

        // Check if userInfo.id is present and valid
        if (conn.userInfo && conn.userInfo.id) {
          try {
            const relatedUser = await conn
              .sobject("User")
              .retrieve(conn.userInfo.id);

            sf_object.opened_date = new Date();
            sf_object.api = await getVersion(conn);

            sf_object.auth_response = {
              id: conn.userInfo.id,
              name: relatedUser.Name,
              username: relatedUser.Username,
              accessToken: conn.accessToken,
              instanceUrl: conn.instanceUrl,
            };

            resolve(sf_object);
          } catch (retrieveErr) {
            console.error("Error retrieving user:", retrieveErr);
            reject("Error retrieving user: " + retrieveErr.message);
          }
        } else {          
          //reject("Invalid user info received.");
          console.error("Invalid user info received. Attempting to retrieve from Chatter API");
          
          const chatterRes = await conn.chatter.resource('/users/me');
          console.log(chatterRes);

          const relatedUser = await conn
              .sobject("User")
              .retrieve(chatterRes.id);

            sf_object.opened_date = new Date();
            sf_object.api = await getVersion(conn);

            sf_object.auth_response = {
              id: conn.userInfo.id,
              name: relatedUser.Name,
              username: relatedUser.Username,
              accessToken: conn.accessToken,
              instanceUrl: conn.instanceUrl,
            };

            resolve(sf_object);
        }
      } else {
        console.error("Identity error:", err);
        reject("Could not authenticate with session information.");
      }
    });
  
  });

}
