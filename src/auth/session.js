require("dotenv").config()

const jsforce = require("jsforce")
const getVersion = require("./api_version")

exports.store = (req) => {

  const auth_credentials = {
    sessionId: req.body.credentials.session_id,
    serverUrl: req.body.credentials.server_url,
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

    const resx = conn.identity(async (err, _) => {
      if (!err) {

        console.log(conn.userInfo);

        const relatedUser = await conn
          .sobject("User")
          .retrieve(conn.userInfo.id)

        sf_object.opened_date = new Date()
        sf_object.api = await getVersion(conn)

        sf_object.auth_response = {
          id: conn.userInfo.id,
          name: relatedUser.Name,
          username: relatedUser.Username,
          accessToken: conn.accessToken,
          instanceUrl: conn.instanceUrl
        }

        resolve(sf_object)

      } else {
        reject("Could not authenticate with session information.")
      }
    })

    console.log(`user ID: ${resx.user_id}`);
    console.log(`organization ID: ${resx.organization_id}`);
    console.log(`username: ${resx.username}`);
    console.log(`display name: ${resx.display_name}`);
  })

}
