const { MessageEmbed, Message } = require("discord.js");
const config = require("../../botconfig/config.json");
const ee = require("../../botconfig/embed.json");
const settings = require("../../botconfig/settings.json");
const { check_if_dj } = require("../../handlers/functions");
module.exports = {
  name: "playskip", //the command name for the Slash Command

  category: "Music",
  aliases: ["ps"],
  usage: "playskip <search query or link>",

  description: "Plays a song or playlist and skips the current song!", //the command description for Slash Command Overview
  cooldown: 2,
  requiredroles: [], //Only allow specific Users with a Role to execute a Command [OPTIONAL]
  alloweduserids: [], //Only allow specific Users to execute a Command [OPTIONAL]
  run: async (client, message, args) => {
    try {
      //things u can directly access in an interaction!
      const { member, channelId, guildId } = message;
      const { guild } = member;
      const { channel } = member.voice;
      if (!channel)
        return message.reply({
          embeds: [
            new MessageEmbed()
              .setColor(ee.wrongcolor)
              .setTitle(
                `${client.allEmojis.x} **Please join ${
                  guild.me.voice.channel ? "__my__" : "a"
                } voice channel first!**`
              ),
          ],
        });
      if (
        channel.userLimit != 0 &&
        channel.full &&
        !channel.guild.me.voice.channel
      )
        return message.reply({
          embeds: [
            new MessageEmbed()
              .setColor(ee.wrongcolor)
              .setFooter(ee.footertext, ee.footericon)
              .setTitle(
                `${client.allEmojis.x} Your voice channel is full, so I can't join!`
              ),
          ],
        });
      if (
        channel.guild.me.voice.channel &&
        channel.guild.me.voice.channel.id != channel.id
      ) {
        return message.reply({
          embeds: [
            new MessageEmbed()
              .setColor(ee.wrongcolor)
              .setFooter(ee.footertext, ee.footericon)
              .setTitle(
                `${client.allEmojis.x} I am already connected somewhere else.`
              ),
          ],
        });
      }
      if (!args[0]) {
        return message.reply({
          embeds: [
            new MessageEmbed()
              .setColor(ee.wrongcolor)
              .setFooter(ee.footertext, ee.footericon)
              .setTitle(
                `${client.allEmojis.x} **Please provide a search query or link!**`
              )
              .setDescription(
                `**Usage:**\n> \`${client.settings.get(
                  message.guild.id,
                  "prefix"
                )}playskip <search query or link>\``
              ),
          ],
        });
      }
      //let IntOption = options.getInteger("OPTIONNAME"); //same as in IntChoices //RETURNS NUMBER
      const Text = args.join(" "); //same as in StringChoices //RETURNS STRING
      //update it without a response!
      let newmsg = await message
        .reply({
          content: `🔍 Searching... \`\`\`${Text}\`\`\``,
        })
        .catch((e) => {
          console.log(e);
        });
      try {
        let queue = client.distube.getQueue(guildId);
        let options = {
          member: member,
          skip: true,
        };
        if (!queue) options.textChannel = guild.channels.cache.get(channelId);
        if (queue) {
          if (check_if_dj(client, member, queue.songs[0])) {
            return message.reply({
              embeds: [
                new MessageEmbed()
                  .setColor(ee.wrongcolor)
                  .setFooter(ee.footertext, ee.footericon)
                  .setTitle(
                    `${client.allEmojis.x} **You are not a DJ, nor the song requester!**`
                  )
                  .setDescription(
                    `**DJ roles:**\n> ${check_if_dj(
                      client,
                      member,
                      queue.songs[0]
                    )}`
                  ),
              ],
            });
          }
        }
        await client.distube.playVoiceChannel(channel, Text, options);
        //Edit the reply
        newmsg
          .edit({
            content: `${
              queue?.songs?.length > 0 ? "⏭ Skipping to" : "🎶 Now Playing"
            }: \`\`\`\n${Text}\n\`\`\``,
          })
          .catch((e) => {
            console.log(e);
          });
      } catch (e) {
        console.log(e.stack ? e.stack : e);
        message.reply({
          content: `${client.allEmojis.x} | Error: `,
          embeds: [
            new MessageEmbed()
              .setColor(ee.wrongcolor)
              .setDescription(`\`\`\`${e}\`\`\``),
          ],
        });
      }
    } catch (e) {
      console.log(String(e.stack).bgRed);
    }
  },
};
