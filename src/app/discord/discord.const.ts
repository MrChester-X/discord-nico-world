import { GatewayIntentBits } from 'discord.js';

export const DISCORD_INTENTS_ALL =
  GatewayIntentBits.Guilds |
  GatewayIntentBits.GuildMembers |
  GatewayIntentBits.GuildModeration |
  // GatewayIntentBits.GuildBans |
  GatewayIntentBits.GuildEmojisAndStickers |
  GatewayIntentBits.GuildIntegrations |
  GatewayIntentBits.GuildWebhooks |
  GatewayIntentBits.GuildInvites |
  GatewayIntentBits.GuildVoiceStates |
  GatewayIntentBits.GuildPresences |
  GatewayIntentBits.GuildMessages |
  GatewayIntentBits.GuildMessageReactions |
  GatewayIntentBits.GuildMessageTyping |
  GatewayIntentBits.DirectMessages |
  GatewayIntentBits.DirectMessageReactions |
  GatewayIntentBits.DirectMessageTyping |
  GatewayIntentBits.MessageContent |
  GatewayIntentBits.GuildScheduledEvents |
  GatewayIntentBits.AutoModerationConfiguration |
  GatewayIntentBits.AutoModerationExecution;
