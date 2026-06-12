import { Link, createFileRoute, useLoaderData } from '@tanstack/react-router';
import { listMemberships, type Membership } from '../lib/storage';
import { useBlobUrl } from '../lib/useBlobUrl';

export const Route = createFileRoute('/')({
  loader: () => listMemberships(),
  component: HomePage,
});

function HomePage() {
  const memberships = useLoaderData({ from: '/' });
  return (
    <>
      <div className="header">
        <h1>Rainbow Code</h1>
        <Link to="/add" className="btn btn-primary">+ Add</Link>
      </div>

      {memberships.length === 0 ? (
        <p className="muted">No memberships yet. Tap “Add” to create one.</p>
      ) : (
        memberships.map((m) => <Row key={m.id} membership={m} />)
      )}
    </>
  );
}

function Row({ membership }: { membership: Membership }) {
  const url = useBlobUrl(membership.iconBlob);
  return (
    <Link to="/m/$id" params={{ id: membership.id }} className="row">
      {url ? <img src={url} alt="" /> : <div className="row-placeholder" />}
      <span className="name">{membership.name}</span>
    </Link>
  );
}
