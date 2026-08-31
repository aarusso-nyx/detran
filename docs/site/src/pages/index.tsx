import Link from '@docusaurus/Link';
import Layout from '@theme/Layout';

export default function Home(): JSX.Element {
  return (
    <Layout
      title="Governed runtime documentation"
      description="DETRAN architecture, contracts, operations, law, and adoption guidance."
    >
      <header className="hero hero--primary">
        <div className="container">
          <h1 className="hero__title">DETRAN</h1>
          <p className="hero__subtitle">
            Governed documentation for the consolidated traffic-department
            runtime.
          </p>
          <Link
            className="button button--secondary button--lg"
            to="/docs/start"
          >
            Start with the documentation
          </Link>
        </div>
      </header>
      <main className="container margin-vert--xl">
        <div className="row">
          <section className="col col--4">
            <h2>Framework</h2>
            <p>
              Architecture, schemas, generated contracts, and product
              boundaries.
            </p>
            <Link to="/docs/framework">Explore the framework</Link>
          </section>
          <section className="col col--4">
            <h2>Law</h2>
            <p>
              The exact DEVAI Constitution binding and DETRAN governance
              records.
            </p>
            <Link to="/docs/reference/law">Inspect the binding</Link>
          </section>
          <section className="col col--4">
            <h2>Operations</h2>
            <p>Engineering, security, deployment, and operational guidance.</p>
            <Link to="/docs/meta/ops">Open operations</Link>
          </section>
        </div>
      </main>
    </Layout>
  );
}
