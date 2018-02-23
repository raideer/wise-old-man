const Command = require('../Command');
const _ = require('underscore');
const { RichEmbed } = require('discord.js');

module.exports = class ClueCommand extends Command {
    constructor() {
        super('clue', {
            aliases: ['clue'],
            args: [
                {
                    id: 'query',
                    match: 'rest'
                }
            ]
        });
    }

    _getAnagramAnswer(result) {
        let answer = '';

        if (result.answer != '') {
            answer += result.answer;

            if (result.puzzle || result.lightbox) {
                answer += ' or';
            }
        } else if (!result.puzzle && !result.lightbox) {
            answer = 'None';
        }

        if (result.puzzle) {
            answer += ' **Puzzle box**';

            if (result.lightbox) {
                answer += ' or';
            }
        }

        if (result.lightbox) {
            answer += ' **Light box**';
        }

        return answer;
    }

    buildEmbed(result, resultType) {
        const embed = new RichEmbed();

        console.log('Building embed for', resultType, result);

        switch (resultType) {
        case 'anagrams':
            embed.setTitle(`ANAGRAM: ${result.anagram}`);
            embed.setColor('#3472F7');
            embed.addField('Solution', result.solution, true);
            embed.addField('Answer', this._getAnagramAnswer(result), true);
            if (result.wilderness) {
                embed.setFooter(`Location: ${result.location} - In Wilderness`, 'https://i.imgur.com/iAN4kc0.png');
            } else {
                embed.setFooter(`Location: ${result.location}`, 'https://i.imgur.com/yN1ypDq.png');
            }

            break;
        case 'emotes':
            embed.setTitle(`EMOTE: ${result.emote}`);
            embed.setColor('#05AE0E');
            embed.addField('Clue', result.clue);

            embed.addField('Required items', result.req_items.map(item => item.name).join(', '));

            if (result.wilderness) {
                embed.setFooter('In Wilderness', 'https://i.imgur.com/iAN4kc0.png');
            }

            break;
        case 'lyrics':
            embed.setTitle('Falo The Bard lyrics');
            embed.setColor('#FF3B30');
            embed.addField('Lyrics', result.lyric);
            embed.addField('Required item', result.item.name);
            break;
        case 'coords':
            embed.setTitle(`Coordinate: ${result.deg}`);
            embed.setColor('#FF9500');
            embed.addField('Notes', result.notes);
            if (result.fight) {
                embed.addField('Enemies', result.enemies.map(enemy => enemy.enemy_name).join(', '));
            }
            break;
        case 'cryptic':
            embed.setTitle('Cypric clue');
            embed.setColor('#2CA8FF');
            embed.addField('Clue', result.clue);
            embed.addField('Notes', result.notes);
            embed.addField('Task', result.task);
            break;
        }

        return embed;
    }

    async exec(message, args) {
        const results = await this.client.cluez.searchAll(args.query);
        const resultCount = Object.keys(results).reduce((acc, engine) => {
            return acc + results[engine].length;
        }, 0);

        if (resultCount == 1) {
            const type = Object.keys(results).find(engine => results[engine].length === 1);
            const result = _.first(results[type]);

            return message.util.sendEmbed(this.buildEmbed(result, type));
        } else {
            return message.util.reply(`Sorry. Didn't find anything for \`${args.query}\``);
        }
    }
};