import { getI18n, getScopedI18n } from '../locales/server'


export default async function Home() {
    const t = await getI18n()
  const scopedT = await getScopedI18n('hello')
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
       <div>
      <p>{t('hello')}</p>
 
      {/* Both are equivalent: */}
      <p>{t('hello.world')}</p>
      <p>{scopedT('world')}</p>
 
      <p>{t('welcome', { name: 'John' })}</p>
      <p>{t('welcome', { name: <strong>John</strong> })}</p>
    </div>
    </main>
  );
}
