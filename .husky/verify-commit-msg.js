const msgPath = process.env.HUSKY_GIT_PARAMS || process.argv[2]
const msg = require('fs').readFileSync(msgPath, 'utf-8').trim()

const commitRE = /^Merge.+|(revert: )?(ci|chore|feat|improve|doc|build|perf|revert|style|fix|refactor|test)(\(.+\))?: .{1,50}/

if (!commitRE.test(msg)) {
    console.error(
        `ERROR: Invalid commit message format.\n\n` +
            `Proper commit message format is required for automated changelog generation. Examples:\n\n` +
            `   feat(inventory): add weapons\n` +
            `   fix(browser/tablet): add wanted list for police\n\n` +
            `See git/COMMIT_CONVENTION.md for more details.\n`
    )
    process.exit(1)
}
