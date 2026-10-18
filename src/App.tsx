import { FormEvent, useEffect, useRef, useState } from 'react';

type PageId = 'inicio' | 'sobre' | 'midia' | 'racing' | 'sports' | 'gaming' | 'contato';
type LinkKey = 'instagramPost' | 'youtube' | 'instagram' | 'youtubeChannel' | 'tiktok' | 'threads' | 'racing' | 'sports' | 'gaming';

type Page = { id: PageId; image: string; label: string };

const pages: Page[] = [
  { id: 'inicio', image: '/assets/pages/zisteam-1.png', label: 'Início' },
  { id: 'sobre', image: '/assets/pages/zisteam-2.png', label: 'Sobre a Zis' },
  { id: 'midia', image: '/assets/pages/zisteam-3.png', label: 'Conteúdo e redes sociais' },
  { id: 'racing', image: '/assets/pages/zisteam-4.png', label: 'Racing' },
  { id: 'sports', image: '/assets/pages/zisteam-5.png', label: 'Sports' },
  { id: 'gaming', image: '/assets/pages/zisteam-6.png', label: 'Gaming' },
  { id: 'contato', image: '/assets/pages/zisteam-7.png', label: 'Contato' },
];

const navigation: Array<{ label: string; target: PageId }> = [
  { label: 'Início', target: 'inicio' }, { label: 'Sobre a Zis', target: 'sobre' }, { label: 'Racing', target: 'racing' },
  { label: 'Sports', target: 'sports' }, { label: 'Gaming', target: 'gaming' }, { label: 'Contato', target: 'contato' },
];

// Preencha estas URLs quando os canais oficiais estiverem definidos.
const externalLinks: Record<LinkKey, string | undefined> = {
  instagramPost: undefined, youtube: undefined, instagram: undefined, youtubeChannel: undefined, tiktok: undefined,
  threads: undefined, racing: undefined, sports: undefined, gaming: undefined,
};

const navX = [49.3, 55.3, 64.8, 71.5, 77.9, 85.2];

function scrollToPage(target: PageId) {
  document.getElementById(target)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function ExternalHotspot({ label, linkKey, style, notify }: { label: string; linkKey: LinkKey; style: React.CSSProperties; notify: () => void }) {
  const url = externalLinks[linkKey];
  if (!url) return <button className="hotspot" type="button" aria-label={`${label} (em breve)`} style={style} onClick={notify} />;
  return <a className="hotspot" href={url} target="_blank" rel="noreferrer" aria-label={label} style={style} />;
}

function NavigationHotspots({ activePage }: { activePage: PageId }) {
  return (
    <nav className="art-navigation" aria-label="Navegação principal">
      {navigation.map((item, index) => (
        <button className="hotspot nav-hotspot" key={item.target} type="button" aria-label={item.label}
          aria-current={activePage === item.target ? 'page' : undefined}
          style={{ left: `${navX[index]}%`, top: '4.3%', width: index === 1 ? '8.8%' : '5.3%', height: '5.6%' }}
          onClick={() => scrollToPage(item.target)} />
      ))}
    </nav>
  );
}

function ContactForm({ notify }: { notify: (message: string) => void }) {
  const [submitting, setSubmitting] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (submitting) return;
    const form = new FormData(event.currentTarget);
    const name = String(form.get('name') ?? '').trim();
    const subject = String(form.get('subject') ?? '').trim();
    const message = String(form.get('message') ?? '').trim();
    if (!name || !subject || !message) return notify('Preencha nome, assunto e mensagem para enviar.');

    setSubmitting(true);
    try {
      const response = await fetch('/api/contact', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name, subject, message }) });
      const data = (await response.json().catch(() => ({}))) as { message?: string };
      if (!response.ok) throw new Error(data.message ?? 'Não foi possível enviar agora.');
      formRef.current?.reset();
      notify(data.message ?? 'Mensagem enviada com sucesso. Obrigado pelo contato!');
    } catch (error) {
      notify(error instanceof Error ? error.message : 'Não foi possível enviar agora.');
    } finally { setSubmitting(false); }
  };

  return (
    <form className="contact-form" ref={formRef} onSubmit={submit} aria-label="Formulário de contato">
      <input className="contact-input contact-name" name="name" aria-label="Nome" maxLength={120} />
      <input className="contact-input contact-subject" name="subject" aria-label="Assunto" maxLength={160} />
      <textarea className="contact-input contact-message" name="message" aria-label="Mensagem" maxLength={3000} />
      <button className="contact-submit" type="submit" aria-label="Enviar mensagem" disabled={submitting}><span className="sr-only">{submitting ? 'Enviando mensagem' : 'Enviar mensagem'}</span></button>
    </form>
  );
}

export default function App() {
  const [activePage, setActivePage] = useState<PageId>('inicio');
  const [notice, setNotice] = useState('');
  const notify = (message = 'Este canal será adicionado em breve.') => setNotice(message);

  useEffect(() => {
    const observers = pages.map(({ id }) => {
      const element = document.getElementById(id);
      if (!element) return undefined;
      const observer = new IntersectionObserver(([entry]) => { if (entry.isIntersecting) setActivePage(id); }, { threshold: 0.55 });
      observer.observe(element);
      return observer;
    });
    return () => observers.forEach((observer) => observer?.disconnect());
  }, []);

  return (
    <main className="landing" aria-label="ZisTeam">
      {pages.map((page) => (
        <section className="screen" id={page.id} key={page.id} aria-label={page.label}>
          <div className="artboard">
            <img className="art" src={page.image} alt="" draggable={false} />
            <NavigationHotspots activePage={activePage} />
            {page.id === 'midia' && <>
              <ExternalHotspot label="Publicação no Instagram" linkKey="instagramPost" notify={notify} style={{ left: '8%', top: '29.5%', width: '27.6%', height: '63.8%' }} />
              <ExternalHotspot label="Vídeo no YouTube" linkKey="youtube" notify={notify} style={{ left: '44%', top: '29.1%', width: '48.1%', height: '42.5%' }} />
              <ExternalHotspot label="Instagram da ZisTeam" linkKey="instagram" notify={notify} style={{ left: '76.3%', top: '76.4%', width: '3.4%', height: '8%' }} />
              <ExternalHotspot label="YouTube da ZisTeam" linkKey="youtubeChannel" notify={notify} style={{ left: '80.7%', top: '76.4%', width: '3.7%', height: '8%' }} />
              <ExternalHotspot label="TikTok da ZisTeam" linkKey="tiktok" notify={notify} style={{ left: '85.4%', top: '76.4%', width: '3.3%', height: '8%' }} />
              <ExternalHotspot label="Threads da ZisTeam" linkKey="threads" notify={notify} style={{ left: '89.6%', top: '76.4%', width: '3.5%', height: '8%' }} />
            </>}
            {page.id === 'racing' && <ExternalHotspot label="Conheça o Racing" linkKey="racing" notify={notify} style={{ left: '7.2%', top: '57%', width: '85%', height: '30%' }} />}
            {page.id === 'sports' && <ExternalHotspot label="Conheça o Sports" linkKey="sports" notify={notify} style={{ left: '7.2%', top: '68%', width: '38%', height: '16%' }} />}
            {page.id === 'gaming' && <ExternalHotspot label="Conheça o Gaming" linkKey="gaming" notify={notify} style={{ left: '7.2%', top: '68%', width: '38%', height: '16%' }} />}
            {page.id === 'contato' && <>
              <ContactForm notify={notify} />
              <a className="hotspot" href="tel:+5532984741460" aria-label="Ligar para +55 32 9 8474-1460" style={{ left: '55.2%', top: '63%', width: '19%', height: '4%' }} />
              <a className="hotspot" href="mailto:contato@zisteam.com" aria-label="Enviar e-mail para contato@zisteam.com" style={{ left: '55.2%', top: '67%', width: '21%', height: '4%' }} />
            </>}
          </div>
        </section>
      ))}
      {notice && <div className="notice" role="status"><span>{notice}</span><button type="button" onClick={() => setNotice('')} aria-label="Fechar aviso">×</button></div>}
    </main>
  );
}
