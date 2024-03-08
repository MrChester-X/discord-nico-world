import { registerAs } from '@nestjs/config';
import { DISCORD_INTENTS_ALL } from './discord.const';
import { NecordModuleOptions } from 'necord';

export default registerAs<NecordModuleOptions>('discord', () => {
  if (!process.env.BOT_TOKEN) {
    throw Error('You need to pass BOT_TOKEN into .env file');
  }

  return {
    token: process.env.BOT_TOKEN,
    intents: DISCORD_INTENTS_ALL,
  };
});
