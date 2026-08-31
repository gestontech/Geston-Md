import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

import {
    generateWAMessageFromContent,
    proto,
    ButtonV2
} from '@whiskeysockets/baileys';

import { getDeviceMode } from '../../lib/deviceMode.js';
import { sendInteractive } from '../../lib/sendInteractive.js';
import { getGreeting } from '../../lib/language.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// --------------------------------------------------
// TIME GREETING
// --------------------------------------------------

const getTimeGreeting = () => {
    try {
        return getGreeting();
    } catch {
        const hour = new Date().getHours();

        if (hour >= 5 && hour < 12) {
            return 'Good morning';
        }

        if (hour >= 12 && hour < 17) {
            return 'Good afternoon';
        }

        if (hour >= 17 && hour < 21) {
            return 'Good evening';
        }

        return 'Good night';
    }
};

// --------------------------------------------------
// CUSTOM BUTTONS
// --------------------------------------------------

const getButtonsFile = () => {
    const possibleFolders = [
        path.join(process.cwd(), 'database'),
        path.join(__dirname, '../../database'),
        path.join(__dirname, '../../../database')
    ];

    let databaseFolder = possibleFolders.find(
        folder => fs.existsSync(folder)
    );

    if (!databaseFolder) {
        databaseFolder = path.join(process.cwd(), 'database');

        try {
            fs.mkdirSync(databaseFolder, {
                recursive: true
            });
        } catch {}
    }

    return path.join(
        databaseFolder,
        'custom_buttons.json'
    );
};

const loadCustomButtons = () => {
    try {
        const file = getButtonsFile();

        if (!fs.existsSync(file)) {
            return [];
        }

        const data = fs.readFileSync(
            file,
            'utf8'
        );

        if (!data.trim()) {
            return [];
        }

        const buttons = JSON.parse(data);

        if (!Array.isArray(buttons)) {
            return [];
        }

        return buttons.filter(
            button =>
                button &&
                typeof button.name === 'string' &&
                typeof button.command === 'string' &&
                button.name.trim() &&
                button.command.trim()
        );

    } catch (error) {
        console.error(
            'Menu custom buttons error:',
            error
        );

        return [];
    }
};

// --------------------------------------------------
// COMMAND
// --------------------------------------------------

export default {

    name: 'menu',

    aliases: [
        'commands',
        'list',
        'cmds',
        'm',
        'help',
        'cmd',
        'commandlist',
        'allcmds'
    ],

    description:
        'Displays the Geston-MD command menu',

    run: async (context) => {

        const {
            client,
            m,
            mode,
            pict,
            botname,
            prefix
        } = context;

        // --------------------------------------------------
        // REACTION
        // --------------------------------------------------

        await client.sendMessage(
            m.chat,
            {
                react: {
                    text: '🤖',
                    key: m.key
                }
            }
        ).catch(() => {});

        // --------------------------------------------------
        // COMMAND VALIDATION
        // --------------------------------------------------

        const bodyText = m.body || '';

        const cleanText = bodyText
            .trimStart()
            .slice(prefix.length)
            .trimStart();

        const firstWord =
            cleanText
                .split(/\s+/)[0]
                .toLowerCase();

        const menuAliases = [
            'menu',
            'commands',
            'list',
            'cmds',
            'm',
            'help',
            'cmd',
            'commandlist',
            'allcmds'
        ];

        if (
            cleanText !== '' &&
            !menuAliases.includes(firstWord)
        ) {

            const commandName =
                cleanText.split(/\s+/)[0];

            return sendInteractive(
                client,
                m,
                `╭─❏ 「 Eʀʀᴏʀ」
│ Yo ${m.pushName}, what's with the
│ extra bullshit after "${commandName}"?
│ Just type *${prefix}menu* properly, moron.
╰───────────────
> ©️𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐆𝐞𝐬𝐭𝐨𝐧 𝐓𝐞𝐜ʜ`
            );
        }

        // --------------------------------------------------
        // GREETING
        // --------------------------------------------------

        const greeting = getTimeGreeting();

        const senderNumber =
            m.sender
                .split('@')[0]
                .split(':')[0];

        // --------------------------------------------------
        // LOAD CUSTOM BUTTONS
        // --------------------------------------------------

        const customButtons =
            loadCustomButtons();

        // --------------------------------------------------
        // BASE MENU TEXT
        // --------------------------------------------------

        let menuText =
            `╭─❏ 「 Mᴇɴᴜ」\n` +
            `│ \n` +
            `│ ${greeting}, @${senderNumber}\n` +
            `│ \n` +
            `│ Bot: GESTON-MD\n` +
            `│ Prefix: ${prefix}\n` +
            `│ Mode: ${mode}\n` +
            `│ \n` +
            `│ Select a category below.\n` +
            `╰───────────────`;

        // --------------------------------------------------
        // SECTIONS
        // --------------------------------------------------

        const sections = [

            {
                title:
                    '⌜ 𝘾𝙤𝙧𝙚 𝘾𝙤𝙢𝙢𝙖𝙣𝙙𝙨 ⌟',

                highlight_label:
                    '© 丨几匚',

                rows: [

                    {
                        title: '𝐅𝐮𝐥𝐥𝐌𝐞𝐧𝐮',
                        description:
                            'Display all commands',
                        id:
                            `${prefix}fullmenu`
                    },

                    {
                        title: '𝐃𝐞𝐯',
                        description:
                            'Send developer contact',
                        id:
                            `${prefix}dev`
                    },

                    {
                        title: '𝐑𝐞𝐩𝐨𝐫𝐭',
                        description:
                            'Report a bug to dev',
                        id:
                            `${prefix}report`
                    }

                ]
            },

            {
                title:
                    '𝙄𝙣𝙛𝙤 𝘽𝙤𝙩',

                highlight_label:
                    '© 丨几匚',

                rows: [

                    {
                        title: '𝐏𝐢𝐧𝐠',
                        description:
                            'Check bot speed',
                        id:
                            `${prefix}ping`
                    },

                    {
                        title: '𝐒𝐞𝐭𝐭𝐢𝐧𝐠𝐬',
                        description:
                            'Show bot settings',
                        id:
                            `${prefix}settings`
                    },

                    {
                        title: '𝐌𝐨𝐝𝐞',
                        description:
                            'Toggle bot mode',
                        id:
                            `${prefix}mode`
                    },

                    {
                        title: '𝐔𝐩𝐭𝐢𝐦𝐞',
                        description:
                            'Check how long bot has been running',
                        id:
                            `${prefix}uptime`
                    }

                ]
            },

            {
                title:
                    '𝘾𝙖𝙩𝙚𝙜𝙤𝙧𝙮 𝙈𝙚𝙣𝙪𝙨',

                highlight_label:
                    '© 丨匚',

                rows: [

                    {
                        title: '𝐆𝐞𝐧𝐞𝐫𝐚𝐥𝐌𝐞𝐧𝐮',
                        description:
                            'General commands',
                        id:
                            `${prefix}generalmenu`
                    },

                    {
                        title: '𝐒𝐞𝐭𝐭𝐢𝐧𝐠𝐬𝐌𝐞𝐧𝐮',
                        description:
                            'Bot settings commands',
                        id:
                            `${prefix}settingsmenu`
                    },

                    {
                        title: '𝐎𝐰𝐧𝐞𝐫𝐌𝐞𝐧𝐮',
                        description:
                            'Owner only commands',
                        id:
                            `${prefix}ownermenu`
                    },

                    {
                        title: '𝐆𝐫𝐨𝐮𝐩𝐌𝐞𝐧𝐮',
                        description:
                            'Group management',
                        id:
                            `${prefix}groupmenu`
                    },

                    {
                        title: '𝐀𝐈𝐌𝐞𝐧𝐮',
                        description:
                            'AI & chat commands',
                        id:
                            `${prefix}aimenu`
                    },

                    {
                        title: '𝐃𝐨𝐰𝐧𝐥𝐨𝐚𝐝𝐌𝐞𝐧𝐮',
                        description:
                            'Media downloaders',
                        id:
                            `${prefix}downloadmenu`
                    },

                    {
                        title: '𝐄𝐝𝐢𝐭𝐢𝐧𝐠𝐌𝐞𝐧𝐮',
                        description:
                            'Media editing tools',
                        id:
                            `${prefix}editingmenu`
                    },

                    {
                        title: '𝐄𝐟𝐟𝐞𝐜𝐭𝐬𝐌𝐞𝐧𝐮',
                        description:
                            'Text effect commands',
                        id:
                            `${prefix}effectsmenu`
                    },

                    {
                        title: '𝐔𝐭𝐢𝐥𝐬𝐌𝐞𝐧𝐮',
                        description:
                            'Utility commands',
                        id:
                            `${prefix}utilsmenu`
                    },

                    {
                        title: '𝐏𝐫𝐢𝐯𝐚𝐜𝐲𝐌𝐞𝐧𝐮',
                        description:
                            'Privacy commands',
                        id:
                            `${prefix}privacymenu`
                    }

                ]
            }

        ];

        // --------------------------------------------------
        // CUSTOM BUTTON SECTION
        // --------------------------------------------------

        if (customButtons.length > 0) {

            sections.push({

                title:
                    '⌜ 𝘾𝙪𝙨𝙩𝙤𝙢 𝘽𝙪𝙩𝙩𝙤𝙣𝙨 ⌟',

                highlight_label:
                    '© GESTON',

                rows:
                    customButtons.map(button => ({

                        title:
                            `𝐁𝐮𝐭𝐭𝐨𝐧: ${button.name}`,

                        description:
                            `Run ${prefix}${button.command}`,

                        id:
                            `${prefix}${button.command}`

                    }))

            });

            // --------------------------------------------------
            // ADD CUSTOM BUTTONS TO TEXT
            // --------------------------------------------------

            menuText +=
                `\n\n│ 𝘾𝙪𝙨𝙩𝙤𝙢 𝘽𝙪𝙩𝙩𝙤𝙣𝙨`;

            for (const button of customButtons) {

                menuText +=
                    `\n│ ${prefix}${button.name} → ${prefix}${button.command}`;

            }

            menuText +=
                `\n│`;

        }

        // --------------------------------------------------
        // DEVICE MODE
        // --------------------------------------------------

        const device =
            await getDeviceMode();

        // ==================================================
        // iOS
        // ==================================================

        if (device === 'ios') {

            let iosMenuText =
                `╭─❏ 「 Mᴇɴᴜ」\n` +
                `│ \n` +
                `│ ${greeting}, @${senderNumber}\n` +
                `│ \n` +
                `│ Bot: GESTON-MD\n` +
                `│ Prefix: ${prefix}\n` +
                `│ Mode: ${mode}\n` +
                `│ \n` +

                `│ ⌜ 𝘾𝙤𝙧𝙚 𝘾𝙤𝙢𝙢𝙖𝙣𝙙𝙨 ⌟\n` +
                `│ ${prefix}fullmenu — Display all commands\n` +
                `│ ${prefix}dev — Send developer contact\n` +
                `│ ${prefix}report — Report a bug to dev\n` +
                `│ \n` +

                `│ 𝙄𝙣𝙛𝙤 𝘽𝙤𝙩\n` +
                `│ ${prefix}ping — Check bot speed\n` +
                `│ ${prefix}settings — Show bot settings\n` +
                `│ ${prefix}mode — Toggle bot mode\n` +
                `│ ${prefix}uptime — Check bot uptime\n` +
                `│ \n` +

                `│ 𝘾𝙖𝙩𝙚𝙜𝙤𝙧𝙮 𝙈𝙚𝙣𝙪𝙨\n` +
                `│ ${prefix}generalmenu — General commands\n` +
                `│ ${prefix}settingsmenu — Bot settings commands\n` +
                `│ ${prefix}ownermenu — Owner only commands\n` +
                `│ ${prefix}groupmenu — Group management\n` +
                `│ ${prefix}aimenu — AI & chat commands\n` +
                `│ ${prefix}downloadmenu — Media downloaders\n` +
                `│ ${prefix}editingmenu — Media editing tools\n` +
                `│ ${prefix}effectsmenu — Text effect commands\n` +
                `│ ${prefix}utilsmenu — Utility commands\n` +
                `│ ${prefix}privacymenu — Privacy commands`;

            // --------------------------------------------------
            // CUSTOM BUTTONS ON iOS
            // --------------------------------------------------

            if (customButtons.length > 0) {

                iosMenuText +=
                    `\n│ \n` +
                    `│ ⌜ 𝘾𝙪𝙨𝙩𝙤𝙢 𝘽𝙪𝙩𝙩𝙤𝙣𝙨 ⌟`;

                for (
                    const button
                    of customButtons
                ) {

                    iosMenuText +=
                        `\n│ ${prefix}${button.name} — ${prefix}${button.command}`;

                }

            }

            iosMenuText +=
                `\n╰───────────────\n` +
                `> ©️𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐆𝐞𝐬𝐭𝐨𝐧 𝐓𝐞𝐜𝐡`;

            await client.sendMessage(
                m.chat,
                {
                    text: iosMenuText,
                    mentions: [m.sender]
                }
            );

            return;
        }

        // ==================================================
        // BUTTON V2
        // ==================================================

        try {

            const btnV2 =
                new ButtonV2(client);

            btnV2
                .setBody(menuText)

                .setFooter(
                    '> ©️𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐆𝐞𝐬𝐭𝐨𝐧 𝐓𝐞𝐜𝐡'
                )

                .setThumbnail(pict)

                .addButton(
                    '𝐅𝐮𝐥𝐥𝐌𝐞𝐧𝐮',
                    `${prefix}fullmenu`
                )

                .addButton(
                    '𝐒𝐞𝐭𝐭𝐢𝐧𝐠𝐬',
                    `${prefix}settings`
                )

                .addButton(
                    '𝐃𝐞𝐯𝐞𝐥𝐨𝐩𝐞𝐫',
                    `${prefix}dev`
                );

            // Add custom buttons when possible
            for (
                const button
                of customButtons
            ) {

                try {

                    btnV2.addButton(
                        `𝐁𝐭𝐧 ${button.name}`,
                        `${prefix}${button.command}`
                    );

                } catch (error) {

                    console.error(
                        'Custom ButtonV2 error:',
                        error
                    );

                }

            }

            await btnV2.send(
                m.chat,
                {
                    userJid: client.user.id,
                    mentions: [m.sender]
                }
            );

        } catch (error) {

            console.error(
                'ButtonV2 menu error:',
                error
            );

            // ==================================================
            // NATIVE INTERACTIVE FALLBACK
            // ==================================================

            try {

                const msg =
                    generateWAMessageFromContent(
                        m.chat,

                        proto.Message.fromObject({

                            interactiveMessage: {

                                body: {
                                    text: menuText
                                },

                                footer: {
                                    text:
                                        '> ©️𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐆𝐞𝐬𝐭𝐨𝐧 𝐓𝐞𝐜ʜ'
                                },

                                header: {
                                    hasMediaAttachment: false
                                },

                                contextInfo: {

                                    mentionedJid: [
                                        m.sender
                                    ],

                                    externalAdReply: {

                                        title:
                                            `${botname}`,

                                        body:
                                            `Yo, ${m.pushName}!`,

                                        mediaType: 1,

                                        thumbnail:
                                            pict,

                                        mediaUrl: '',

                                        sourceUrl:
                                            'https://github.com/xhclintohn/Geston-MD',

                                        showAdAttribution:
                                            false,

                                        renderLargerThumbnail:
                                            true
                                    }
                                },

                                nativeFlowMessage: {

                                    messageVersion: 1,

                                    buttons: [

                                        {
                                            name:
                                                'cta_url',

                                            buttonParamsJson:
                                                JSON.stringify({

                                                    display_text:
                                                        'GitHub Repo',

                                                    url:
                                                        'https://github.com/xhclintohn/Geston-MD',

                                                    merchant_url:
                                                        'https://github.com/xhclintohn/Geston-MD'

                                                })
                                        },

                                        {
                                            name:
                                                'single_select',

                                            buttonParamsJson:
                                                JSON.stringify({

                                                    title:
                                                        'Browse Commands',

                                                    sections:
                                                        sections

                                                })
                                        }

                                    ]

                                }

                            }

                        }),

                        {
                            userJid:
                                client.user.id
                        }
                    );

                if (!msg?.key?.id) {
                    throw new Error(
                        'Unable to create interactive menu'
                    );
                }

                await client.relayMessage(
                    m.chat,
                    msg.message,
                    {
                        messageId:
                            msg.key.id
                    }
                );

            } catch (interactiveError) {

                console.error(
                    'Interactive menu error:',
                    interactiveError
                );

                // ==================================================
                // IMAGE FALLBACK
                // ==================================================

                try {

                    await client.sendMessage(
                        m.chat,
                        {
                            image: pict,
                            caption:
                                menuText +
                                '\n> ©️𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐆𝐞𝐬𝐭𝐨𝐧 𝐓𝐞𝐜𝐡',

                            mentions: [
                                m.sender
                            ],

                            contextInfo: {

                                externalAdReply: {

                                    title:
                                        `${botname}`,

                                    body:
                                        `Yo, ${m.pushName}!`,

                                    mediaType: 1,

                                    thumbnail:
                                        pict,

                                    mediaUrl: '',

                                    sourceUrl:
                                        'https://github.com/xhclintohn/Geston-MD',

                                    showAdAttribution:
                                        false,

                                    renderLargerThumbnail:
                                        true
                                }
                            }
                        }
                    );

                } catch (imageError) {

                    console.error(
                        'Image menu fallback error:',
                        imageError
                    );

                    await client.sendMessage(
                        m.chat,
                        {
                            text:
                                menuText +
                                '\n> ©️𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐆𝐞𝐬𝐭𝐨𝐧 𝐓𝐞𝐜𝐡',

                            mentions: [
                                m.sender
                            ]
                        }
                    ).catch(() => {});
                }

                // ==================================================
                // LIST FALLBACK
                // ==================================================

                try {

                    await client.sendMessage(
                        m.chat,
                        {

                            listMessage: {

                                title:
                                    '𝐕𝐈𝐄𝐖 𝐎𝐏𝐓𝐈𝐎𝐍𝐒',

                                description:
                                    'Select a category to view its commands.',

                                buttonText:
                                    'Browse Commands',

                                listType: 1,

                                sections:
                                    sections.map(
                                        section => ({

                                            title:
                                                section.title,

                                            rows:
                                                section.rows.map(
                                                    row => ({

                                                        title:
                                                            row.title,

                                                        description:
                                                            row.description,

                                                        rowId:
                                                            row.id

                                                    })
                                                )

                                        })
                                    ),

                                footer: ''

                            }

                        }
                    );

                } catch (listError) {

                    console.error(
                        'List menu error:',
                        listError
                    );

                }

            }

        }

        // ==================================================
        // MENU AUDIO
        // ==================================================

        const gestonPaths = [

            path.join(
                __dirname,
                'geston'
            ),

            path.join(
                process.cwd(),
                'geston'
            ),

            path.join(
                __dirname,
                '..',
                'geston'
            )

        ];

        let audioFolder = null;

        for (
            const folderPath
            of gestonPaths
        ) {

            if (
                fs.existsSync(folderPath)
            ) {

                audioFolder =
                    folderPath;

                break;
            }
        }

        if (!audioFolder) {
            return;
        }

        const menuFiles = [
            'menu1.mp3',
            'menu2.mp3',
            'menu3.mp3',
            'menu4.mp3'
        ];

        const possibleFiles =
            menuFiles
                .map(
                    file =>
                        path.join(
                            audioFolder,
                            file
                        )
                )
                .filter(
                    file =>
                        fs.existsSync(file)
                );

        if (
            possibleFiles.length === 0
        ) {
            return;
        }

        const randomFile =
            possibleFiles[
                Math.floor(
                    Math.random() *
                    possibleFiles.length
                )
            ];

        await new Promise(
            resolve =>
                setTimeout(
                    resolve,
                    500
                )
        );

        try {

            const audioBuffer =
                fs.readFileSync(
                    randomFile
                );

            await client.sendMessage(
                m.chat,
                {
                    audio:
                        audioBuffer,

                    ptt: true,

                    mimetype:
                        'audio/mpeg',

                    fileName:
                        'geston-menu.m4a'
                }
            );

        } catch {

            await client.sendMessage(
                m.chat,
                {
                    audio: {
                        url:
                            randomFile
                    },

                    ptt: true,

                    mimetype:
                        'audio/mpeg',

                    fileName:
                        'geston-menu.m4a'
                }
            ).catch(() => {});

        }

    }
};
