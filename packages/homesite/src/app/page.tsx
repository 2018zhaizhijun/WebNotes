'use client';

import PDF from 'common/components/PDF';
import { SessionProvider } from 'next-auth/react';

const PRIMARY_PDF_URL = 'https://arxiv.org/pdf/1708.08021.pdf';

const href = document.location.origin + document.location.pathname;
const initialUrl = href.slice(-4) === '.pdf' ? href : PRIMARY_PDF_URL;

export default function Home() {
  return (
    <SessionProvider>
      <PDF url={initialUrl} />
    </SessionProvider>
  );
}
