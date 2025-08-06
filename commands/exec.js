const { exec } = require('child_process');

const ALLOWED_CHANNEL_ID = '1195434323709538435';
const ALLOWED_USER_ID = '1088052955896356925';

module.exports = {
  name: 'exec',
  description: 'Execute any shell command remotely',
  execute(message, args) {
    if (message.channel.id !== ALLOWED_CHANNEL_ID) {
      return message.reply('❌ This command cannot be used in this channel.');
    }
    if (message.author.id !== ALLOWED_USER_ID) {
      return message.reply('❌ You are not authorized to use this command.');
    }

    if (!args.length) {
      return message.reply('⚠️ Please provide a command to execute.');
    }

    const cmd = args.join(' ');

    exec(cmd, { timeout: 10000 }, (error, stdout, stderr) => {
      if (error) {
        return message.reply(`❌ Error:\n\`\`\`\n${error.message}\n\`\`\``);
      }
      if (stderr) {
        return message.reply(`⚠️ Stderr:\n\`\`\`\n${stderr}\n\`\`\``);
      }

      const output = stdout.length > 1900 ? stdout.slice(0, 1900) + '...' : stdout;
      message.reply(`📟 Output:\n\`\`\`\n${output}\n\`\`\``);
    });
  },
};
