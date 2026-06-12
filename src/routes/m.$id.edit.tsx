import { Link, createFileRoute, useNavigate, notFound } from '@tanstack/react-router';
import { MembershipForm } from '../lib/MembershipForm';
import { getMembership } from '../lib/storage';

export const Route = createFileRoute('/m/$id/edit')({
  loader: async ({ params }) => {
    const m = await getMembership(params.id);
    if (!m) throw notFound();
    return m;
  },
  component: EditPage,
});

function EditPage() {
  const m = Route.useLoaderData();
  const navigate = useNavigate();
  return (
    <>
      <div className="header">
        <Link to="/m/$id" params={{ id: m.id }} className="btn">← Cancel</Link>
        <h1>Edit</h1>
      </div>
      <MembershipForm
        initial={m}
        onSaved={(id) => navigate({ to: '/m/$id', params: { id } })}
      />
    </>
  );
}
