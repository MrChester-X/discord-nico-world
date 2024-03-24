import { EmbedBuilder } from '@discordjs/builders';
import { Injectable } from '@nestjs/common';
import {
  BaseMessageOptions,
  ButtonInteraction,
  CommandInteraction,
  Guild,
  GuildMember,
  Message,
  TextBasedChannel,
} from 'discord.js';

// :green_circle: :red_circle:

@Injectable()
export class UtilsService {
  getSuccessMessage(text: string): BaseMessageOptions {
    const embed = new EmbedBuilder({
      title: `${text}`,
      color: 0x00cc66,
    });

    return {
      content: '',
      embeds: [embed],
      components: [],
    };
  }

  async replySuccessMessage(interaction: CommandInteraction | ButtonInteraction, text: string) {
    return interaction.editReply(this.getSuccessMessage(text));
  }

  getErrorMessage(text: string): BaseMessageOptions {
    const embed = new EmbedBuilder({
      title: `${text}`,
      color: 0xff3333,
    });

    return {
      content: '',
      embeds: [embed],
      components: [],
    };
  }

  async replyErrorMessage(interaction: CommandInteraction | ButtonInteraction, text: string) {
    return interaction.editReply(this.getErrorMessage(text));
  }

  async fetchSafeMessage(channel: TextBasedChannel, messageId: string): Promise<Message<true> | null> {
    try {
      const message = await channel.messages.fetch(messageId);
      if (!message.inGuild()) {
        return null;
      }

      return message;
    } catch (e) {}

    return null;
  }

  async fetchSafeMember(guild: Guild, memberId: string): Promise<GuildMember | null> {
    try {
      const message = await guild.members.fetch(memberId);

      return message;
    } catch (e) {}

    return null;
  }
}
