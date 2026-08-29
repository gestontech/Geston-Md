import { c, cpp, node, python, java } from 'compile-run';
import { sendInteractive } from '../../lib/sendInteractive.js';
export default async (context) => {
    const { m } = context;
    await client.sendMessage(m.chat, { react: { text: '⌛', key: m.reactKey } });


    if (m.quoted && m.quoted.text) {
        const code = m.quoted.text;

async function runCode() {
  try {
    let result = await cpp.runSource(code);
    console.log(result);
    sendInteractive(client, m, `╭─❏ 「 C++ OUTPUT」
│ ${result.stdout || 'No output'}\n${result.stderr ? '│ stderr: ' + result.stderr + '\n' : ''}╰───────────────\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐆𝐞𝐬𝐭𝐨𝐧 𝐓𝐞𝐜𝐡`);
  } catch (err) {
    await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } }).catch(() => {});
    console.log(err);
    sendInteractive(client, m, `╭─❏ 「 C++ ERROR」
│ ${err.stderr || err.message}\n╰───────────────\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐆𝐞𝐬𝐭𝐨𝐧 𝐓𝐞𝐜𝐡`);
  }
}

runCode();

} else { 

sendInteractive(client, m, `╭─❏ 「 C++ COMPILER」
│ Quote a valid and short C++ code\n│ to compile, you absolute walnut.\n╰───────────────\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐆𝐞𝐬𝐭𝐨𝐧 𝐓𝐞𝐜𝐡`)

}

}