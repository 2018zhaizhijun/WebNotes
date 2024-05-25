import { getApiDocs } from '@/_lib/swagger';

import ReactSwagger from './react-swagger';
import './swagger.css';

export default async function IndexPage() {
  const spec = await getApiDocs();
  return (
    <section className="container">
      <ReactSwagger spec={spec} />
    </section>
  );
}
