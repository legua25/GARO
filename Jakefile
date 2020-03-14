// Jakefile
const { task, desc } = require('jake');
const { ssh, fs, query, log } = require('@jake/utils');


desc(`Updates the contents of the advertisement database.`);
task('update-ads', async () => {
    // Obtain execution information
    const { path, password } = await query([
        {
            type: 'input', name: 'path', message: 'Location of ads database (ads.yml):',
            validate: text => fs.file(text.trim()) || `Provided path is invalid.`,
            filter: text => text.trim()
        },
        { type: 'password', name: 'password', message: 'Account password:' }
    ]);

    // Connect to server using SSH, upload file and run management command
    const auth = { type: 'password', password };
    await ssh('ssh://garoqro@garoqro.com', auth, async client => {
        await client.put(path, '/tmp/ads.yml');
        log(log.ok(`Copied "${path}" onto server...`));

        log(`Executing advertisement update...`);
        const cmd = [
            'docker cp /tmp/ads.yml server:/var/run/garoqro/ads.yml',
            'docker exec server python3 manage.py updateads /var/run/garoqro/ads.yml',
            'rm /tmp/ads.yml'
        ];
        await client.exec(cmd, { stdout: 'inherit', stderr: 'inherit' });
        log(log.ok(`Successfully updated advertisements.`));
    });
});
