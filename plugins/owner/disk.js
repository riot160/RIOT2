// plugins/owner/disk.js
import { exec }      from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export default {
  command: ['disk', 'storage', 'diskusage'],
  desc: 'Show server disk / storage usage',
  category: 'owner',
  owner: true,
  run: async ({ reply }) => {
    try {
      const { stdout } = await execAsync('df -h / 2>/dev/null || df -h');
      const lines = stdout.trim().split('\n');
      const data  = lines[1]?.split(/\s+/) || [];
      const [, size, used, avail, usePct] = data;

      const mem    = process.memoryUsage();
      const ramMB  = (mem.heapUsed / 1024 / 1024).toFixed(1);
      const ramRSS = (mem.rss / 1024 / 1024).toFixed(1);

      await reply(
        `💾 *Server Resources*\n\n` +
        `📀 *Disk*\n` +
        `├ Total : ${size || '—'}\n` +
        `├ Used  : ${used || '—'}\n` +
        `├ Free  : ${avail || '—'}\n` +
        `└ Usage : ${usePct || '—'}\n\n` +
        `🧠 *Memory*\n` +
        `├ Heap  : ${ramMB} MB\n` +
        `└ Total : ${ramRSS} MB\n\n` +
        `🟢 Node.js : ${process.version}`
      );
    } catch (e) {
      // fallback — just show memory
      const mem = process.memoryUsage();
      await reply(
        `🧠 *Memory Usage*\n\n` +
        `Heap : ${(mem.heapUsed / 1024 / 1024).toFixed(1)} MB\n` +
        `RSS  : ${(mem.rss / 1024 / 1024).toFixed(1)} MB`
      );
    }
  },
};
