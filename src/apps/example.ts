import karin, { segment } from 'node-karin'

export const test = karin.command('test', async (ctx) => {
  const image = await karin.render('https://karinjs.com')

  await ctx.reply(segment.image(`base64://${image}`))
})