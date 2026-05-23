export default function SidePanel({ title, children, tight = false }) {
  return (
    <section className="panel">
      <div className="panel-head">{title}</div>
      <div className={tight ? 'panel-body tight' : 'panel-body'}>{children}</div>
    </section>
  );
}
