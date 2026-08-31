import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { sendInteractive } from '../../lib/sendInteractive.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// --------------------------------------------------
// CUSTOM BUTTON STORAGE
// --------------------------------------------------

const getButtonsFile = () => {
    const possibleFolders = [
        path.join(process.cwd(), 'database'),
        path.join(__dirname, '../../database'),
        path.join(__dirname, '../../../database')
    ];

    let databaseFolder = possibleFolders.find(folder => fs.existsSync(folder));

    if (!databaseFolder) {
        databaseFolder = path.join(process.cwd(), 'database');
        fs.mkdirSync(databaseFolder, { recursive: true });
    }

    return path.join(databaseFolder, 'custom_buttons.json');
};

const ensureButtonsFile = () => {
    const file = getButtonsFile();

    if (!fs.existsSync(file)) {
        fs.writeFileSync(file, '[]', 'utf8');
    }

    return file;
};

const loadButtons = () => {
    try {
        const file = ensureButtonsFile();
        const data = fs.readFileSync(file, 'utf8');

        if (!data.trim()) return [];

        const buttons = JSON.parse(data);

        return Array.isArray(buttons) ? buttons : [];
    } catch (error) {
        console.error('Custom buttons load error:', error);
        return [];
    }
};

const saveButtons = (buttons) => {
    try {
        const file = ensureButtonsFile();

        fs.writeFileSync(
            file,
            JSON.stringify(buttons, null, 2),
            'utf8'
        );

        return true;
    } catch (error) {
        console.error('Custom buttons save error:', error);
        return false;
    }
};

// --------------------------------------------------
// COMMAND
// --------------------------------------------------

export default {
    name: 'addbutton',

    aliases: [
        'addbtn',
        'buttonadd'
    ],

    description: 'Adds a custom button to the menu',

    run: async (context) => {
        const { client, m, args, prefix } = context;

        try {
            // ------------------------------------------
            // HELP
            // ------------------------------------------

            if (!args || args.length < 2) {
                await client.sendMessage(m.chat, {
                    react: {
                        text: '⌛',
                        key: m.reactKey || m.key
                    }
                }).catch(() => {});

                await sendInteractive(
                    client,
                    m,
                    `╭─❏ 「 𝐀𝐃𝐃 𝐁𝐔𝐓𝐓𝐎𝐍 」
│
│ Usage:
│ ${prefix}addbutton <name> <command>
│
│ Example:
│ ${prefix}addbutton test menu
│
│ This creates:
│ test → menu
│
│ Remove:
│ ${prefix}delbutton test
│
│ List:
│ ${prefix}buttons
│
╰───────────────
> ©️𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐆𝐞𝐬𝐭𝐨𝐧 𝐓𝐞𝐜𝐡`
                );

                return;
            }

            // ------------------------------------------
            // GET ARGUMENTS
            // ------------------------------------------

            const buttonName = args[0].trim();
            const command = args[1].trim();

            if (!buttonName || !command) {
                return;
            }

            // ------------------------------------------
            // LOAD EXISTING BUTTONS
            // ------------------------------------------

            const buttons = loadButtons();

            // ------------------------------------------
            // CHECK DUPLICATE
            // ------------------------------------------

            const existingIndex = buttons.findIndex(
                button =>
                    button.name.toLowerCase() === buttonName.toLowerCase()
            );

            const newButton = {
                name: buttonName,
                command: command,
                createdAt: new Date().toISOString()
            };

            // ------------------------------------------
            // UPDATE EXISTING BUTTON
            // ------------------------------------------

            if (existingIndex !== -1) {
                buttons[existingIndex] = {
                    ...buttons[existingIndex],
                    name: buttonName,
                    command: command,
                    updatedAt: new Date().toISOString()
                };
            }

            // ------------------------------------------
            // ADD NEW BUTTON
            // ------------------------------------------

            else {
                buttons.push(newButton);
            }

            // ------------------------------------------
            // SAVE
            // ------------------------------------------

            const saved = saveButtons(buttons);

            if (!saved) {
                throw new Error('Unable to save custom button');
            }

            // ------------------------------------------
            // SUCCESS REACTION
            // ------------------------------------------

            await client.sendMessage(m.chat, {
                react: {
                    text: '✅',
                    key: m.reactKey || m.key
                }
            }).catch(() => {});

            // ------------------------------------------
            // SUCCESS MESSAGE
            // ------------------------------------------

            await sendInteractive(
                client,
                m,
                `╭─❏ 「 𝐁𝐔𝐓𝐓𝐎𝐍 𝐀𝐃𝐃𝐄𝐃 」
│
│ Name: ${buttonName}
│ Command: ${command}
│
│ ${existingIndex !== -1
                    ? 'Button updated successfully.'
                    : 'Button saved successfully.'}
│
│ It will now appear in:
│ ${prefix}menu
│
╰───────────────
> ©️𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐆𝐞𝐬𝐭𝐨𝐧 𝐓𝐞𝐜𝐡`
            );

        } catch (error) {

            await client.sendMessage(m.chat, {
                react: {
                    text: '❌',
                    key: m.reactKey || m.key
                }
            }).catch(() => {});

            console.error(
                `AddButton error: ${error.stack || error}`
            );

            await sendInteractive(
                client,
                m,
                `╭─❏ 「 𝐄𝐑𝐑𝐎𝐑 」
│
│ Error adding custom button.
│
│ ${error.message || 'Unknown error'}
│
╰───────────────
> ©️𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐆𝐞𝐬𝐭𝐨𝐧 𝐓𝐞𝐜𝐡`
            ).catch(() => {});
        }
    }
};
