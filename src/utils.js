require("dotenv").config()

const fs = require("fs")
const path = require("path")

exports.timestamp = () => {
  return new Date().toLocaleTimeString()
}

exports.logAuth = (conn, userInfo) => {
  console.log("Successful Authorization:", conn.instanceUrl)
  console.log("User ID:", userInfo.id)
  console.log("Org ID:", userInfo.organizationId)
  console.log("Access Token: " + conn.accessToken)
}

exports.scheduleDelete = (date, folder_id) => {

}

exports.stayAwake = () => {

}

exports.clearStaging = () => {

  const cwd = path.join(__dirname, '..')
  const staging_directory = cwd + process.env.STAGING_DIR

  if (fs.existsSync(staging_directory)){
    console.log("Found tmp directory. Reinitializing.")
    fs.rmdirSync(staging_directory, { recursive: true })
  }

  fs.mkdir(staging_directory, (err) => {

      if (err)
        return console.error(err);

      console.log('Staging Directory created successfully!');

  })

}
