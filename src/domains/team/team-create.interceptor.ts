import { Injectable } from '@nestjs/common';
import { AutocompleteInterceptor } from 'necord';
import { AutocompleteInteraction } from 'discord.js';
import { DefaultTeams } from './team.const';

@Injectable()
export class TeamCreateAutocompleteInterceptor extends AutocompleteInterceptor {
    transformOptions(interaction: AutocompleteInteraction) {
        const focused = interaction.options.getFocused(true);
        let choices: string[] = [];

        if (focused.name === 'name') {
            choices = DefaultTeams.map((team) => team.name);
        }

        return interaction.respond(
            choices
                .filter((choice) => choice.startsWith(focused.value.toString()))
                .map((choice) => ({ name: choice, value: choice })),
        );
    }
}
