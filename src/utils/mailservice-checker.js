const axios = require('axios');
async function checkifmailexists(email) {
    // let userexist = false;
    const payload = {
        "email": email
    }
    const url = `${process.env.EMAIL_SERVICE_LOCAL_URL}/service/user_exists`;
    // console.log(payload);
    // console.log(url);
    let response;
    try {
        response = await axios.post(url, payload);
    } catch (err) {
        console.error(`❌ Error in user_exist api : `, err.message);
        return false;
    }

    if (response.data.exists) {
        return true;
    }
    return false;

}

module.exports = { checkifmailexists };