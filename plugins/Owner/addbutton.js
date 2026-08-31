import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { sendInteractive } from '../../lib/sendInteractive.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const getButtonsFile = () => {
    const possiblePaths = [
        path.join(process.cwd(), 'database', 'custom_buttons.json'),
        path.join(__dirname, '../../database/custom_buttons.json'),
        path.join(__dirname, '../../../database/custom_buttons.json')
    ];

    for (const filePath of possiblePaths) {
        const folder = path.dirname(filePath);

        if (fs.existsSync(folder)) {
            return filePath;
        }
    }

    const fallback = path.join(process.cwd(), 'database', 'custom_buttons.json');
    fs.mkdirSync(path.dirname(fallback), { recursive: true });

    return fallback;
};

const loadButtons = () => {
    try {
        const file = getButtonsFile();

        if (!fs.existsSync(file)) {
            fs.writeFileSync(file, JSON.stringify([], null, 2));
            return [];
        }

        const data = fs.readFileSync(file, 'utf8').trim();

        if (!data) return [];

        const buttons = JSON.parse(data);

        return Array.isArray(buttons) ? buttons : [];
    } catch (error) {
        console.error('Load custom buttons error:', error);
        return [];
    }
};

const saveButtons = (buttons) => {
    const file = getButtonsFile();

    fs.mkdirSync(path.dirname(file), { recursive: true });

    fs.writeFileSync(
        file,
        JSON.stringify(buttons, null, 2),
        'utf8'
    );
};

export const getCustomButtons = () => {
    return loadButtons();
};

export default {
    name: 'addbutton',
    aliases: ['addbtn'],

    description: 'Adds a custom button to the menu',

    run: async (context) => {
        const { client, m, args, prefix = '.' } = context;

        try {
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
                    `╭─❏ 「 Uѕᴀɢᴇ 」\n` +
                    `│\n` +
                    `│ ${prefix}addbutton <button_name> <command>\n` +
                    `│\n` +
                    `│ Example:\n` +
                    `│ ${prefix}addbutton test menu\n` +
                    `│\n` +
                    `╰───────────────\n` +
                    `> ©️𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐆𝐞𝐬𝐭𝐨𝐧 𝐓𝐞𝐜𝐡`
                );

                return;
            }

            let buttonName = args[0].trim();
            let command = args[1].trim();

            // Remove prefix if the user writes .menu instead of menu
            command = command.replace(/^[.!#/]+/, '');

            if (!buttonName || !command) {
                throw new Error('Invalid button name or command');
            }

            // Avoid excessively long values
            buttonName = buttonName.slice(0, 50);
            command = command.slice(0, 50);

            const buttons = loadButtons();

            // Check whether the button already exists
            const existingIndex = buttons.findIndex(
                button =>
                    button.name.toLowerCase() === buttonName.toLowerCase()
            );

            const newButton = {
                name: buttonName,
                command: command,
                createdAt: new Date().toISOString()
            };

            if (existingIndex !== -1) {
                buttons[existingIndex] = newButton;
            } else {
                buttons.push(newButton);
            }

            saveButtons(buttons);

            await client.sendMessage(m.chat, {
                react: {
                    text: '✅',
                    key: m.reactKey || m.key
                }
            }).catch(() => {});

            await sendInteractive(
                client,
                m,
                `╭─❏ 「 Bᴜᴛᴛᴏɴ Sᴀᴠᴇᴅ 」\n` +
                `│\n` +
                `│ Name: ${buttonName}\n` +
                `│ Command: ${prefix}${command}\n` +
                `│\n` +
                `│ ${existingIndex !== -1 ? 'Button updated successfully.' : 'Button added successfully.'}\n` +
                `│\n` +
                `╰───────────────\n` +
                `> ©️𝐏𝐨𝐰ᴇʀᴇᴅ 𝐆𝐞𝐬ᴛᴏɴ 𝐓ᴇᴄʜ`
            );

        } catch (error) {
            console.error(`AddButton error: ${error.stack || error}`);

            await client.sendMessage(m.chat, {
                react: {
                    text: '❌',
                    key: m.reactKey || m.key
                }
            }).catch(() => {});

            await sendInteractive(
                client,
                m,
                `╭─❏ 「 Eʀʀᴏʀ 」\n` +
                `│\n` +
                `│ Error adding custom button.\n` +
                `│\n` +
                `│ ${error.message || 'Unknown error'}\n` +
                `│\n` +
                `╰───────────────\n` +
                `> ©️𝐏𝐨ᴡᴇʀᴇᴅ 𝐆ᴇsᴛᴏɴ 𝐓ᴇᴄʜ`
            ).catch(() => {});
        }
    }
};
