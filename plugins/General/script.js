import { generateWAMessageFromContent, proto } from '@whiskeysockets/baileys';
import { sendInteractive } from '../../lib/sendInteractive.js';

export default {
  name: 'script',
  aliases: ['repo', 'source', 'github', 'git', 'gh', 'src', 'code', 'sourcecode'],
  description: 'Show GitHub repository info for Geston-MD',
  run: async (context) => {
    const { client, m, botname, prefix = '' } = context;
    await client.sendMessage(m.chat, { react: { text: '⌛', key: m.reactKey } });

    try {
      const repoUrl = 'https://api.github.com/repos/gestontech/Geston-MD';
      const response = await fetch(repoUrl);
      const repoData = await response.json();

      if (!response.ok) {
        throw new Error('Failed to fetch repository data');
      }

      const repoInfo = {
        stars: repoData.stargazers_count,
        forks: repoData.forks_count,
        lastUpdate: repoData.updated_at,
        owner: repoData.owner.login,
        createdAt: repoData.created_at,
        htmlUrl: repoData.html_url
      };

      const createdDate = new Date(repoInfo.createdAt).toLocaleDateString('en-GB');
      const lastUpdateDate = new Date(repoInfo.lastUpdate).toLocaleDateString('en-GB');

      const replyText = `╭─❏ 「 Repository」
│ 🔗 GitHub:
│ https://github.com/gestontech/Geston-MD
│ 
│ 🌐 MainBot Site:
│ https://gestontech.online
│ 
│ ⭐ Stars : ${repoInfo.stars}
│ 🍴 Forks : ${repoInfo.forks}
│ 📅 Created : ${createdDate}
│ 🔄 Last Update : ${lastUpdateDate}
│ 👤 Owner : ${repoInfo.owner}
╰───────────────
> xD`;

      await client.sendMessage(m.chat, { react: { text: '✅', key: m.reactKey } });

      try {
        const msg = generateWAMessageFromContent(m.chat, proto.Message.fromObject({
          interactiveMessage: {
            body: { text: replyText },
            footer: { text: '©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐆𝐞𝐬𝐭𝐨𝐧 𝐓𝐞𝐜𝐡' },
            header: { hasMediaAttachment: false },
            contextInfo: {
              externalAdReply: {
                showAdAttribution: false,
                title: `${botname}`,
                body: `GestonTech🟩`,
                sourceUrl: `https://©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐆𝐞𝐬𝐭𝐨𝐧 𝐓𝐞𝐜𝐡`,
                mediaType: 1,
                renderLargerThumbnail: true
              }
            },
            nativeFlowMessage: {
              buttons: [
                {
                  name: 'cta_url',
                  buttonParamsJson: JSON.stringify({
                    display_text: 'GitHub Repo',
                    url: repoInfo.htmlUrl,
                    merchant_url: repoInfo.htmlUrl
                  })
                },
                {
                  name: 'cta_url',
                  buttonParamsJson: JSON.stringify({
                    display_text: 'GestonMD Site',
                    url: 'https://gestontech.online',
                    merchant_url: 'https://gestontech.online'
                  })
                }
              ]
            }
          }
        }), { userJid: client.user.id });
        await client.relayMessage(m.chat, msg.message, { messageId: msg.key.id });
      } catch {
        await client.sendMessage(m.chat, {
          text: replyText,
          viewOnce: true,
          contextInfo: {
            externalAdReply: {
              showAdAttribution: false,
              title: `${botname}`,
              body: `Geston-MD Site`,
              sourceUrl: `https://gestontech.online`,
              mediaType: 1,
              renderLargerThumbnail: true
            }
          }
        });
      }

    } catch (error) {
      await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } }).catch(() => {});
      await sendInteractive(client, m, `╭─❏ 「 Eʀʀᴏʀ」
│ Couldn't fetch repo data\n│ ${error.message}\n╰───────────────\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐆𝐞𝐬𝐭𝐨𝐧 𝐓𝐞𝐜𝐡`);
    }
  }
};