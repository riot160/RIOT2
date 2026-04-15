// plugins/tools/lorem.js
const WORDS = ['lorem','ipsum','dolor','sit','amet','consectetur','adipiscing','elit','sed','do','eiusmod','tempor','incididunt','ut','labore','et','dolore','magna','aliqua','enim','ad','minim','veniam','quis','nostrud','exercitation','ullamco','laboris','nisi','aliquip','ex','ea','commodo','consequat','duis','aute','irure','in','reprehenderit','voluptate','velit','esse','cillum','eu','fugiat','nulla','pariatur','excepteur','sint','occaecat','cupidatat','non','proident','sunt','culpa','qui','officia','deserunt','mollit','anim','est','laborum'];
const rand = () => WORDS[Math.floor(Math.random() * WORDS.length)];
const sentence = () => {
  const len   = Math.floor(Math.random() * 10) + 6;
  const words = Array.from({ length: len }, rand);
  words[0] = words[0].charAt(0).toUpperCase() + words[0].slice(1);
  return words.join(' ') + '.';
};
export default {
  command: ['lorem', 'placeholder', 'loremipsum'],
  desc: 'Generate Lorem Ipsum placeholder text — .lorem 3',
  category: 'tools',
  run: async ({ args, reply }) => {
    const count = Math.min(parseInt(args[0]) || 1, 10);
    const text  = Array.from({ length: count }, sentence).join(' ');
    await reply(`📝 *Lorem Ipsum (${count} sentence${count > 1 ? 's' : ''})*\n\n${text}`);
  },
};
