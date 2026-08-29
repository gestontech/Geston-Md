const session = process.env.SESSION || '';
const mycode = process.env.CODE || "243";
const botname = process.env.BOTNAME || 'Geston-MD';
const herokuAppName = process.env.HEROKU_APP_NAME || '';

function getHerokuApiKey() {
    return process.env.HEROKU_API_KEY || '';
}

export { session, mycode, botname, herokuAppName, getHerokuApiKey };
