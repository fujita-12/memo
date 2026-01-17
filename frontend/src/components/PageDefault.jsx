export default function Section({ title, children, className }) {
  function formatTodayJa() {
    const now = new Date();

    const parts = new Intl.DateTimeFormat('ja-JP', {
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
      weekday: 'long',
    }).formatToParts(now);

    const year = parts.find((p) => p.type === 'year')?.value ?? '';
    const month = parts.find((p) => p.type === 'month')?.value ?? '';
    const day = parts.find((p) => p.type === 'day')?.value ?? '';
    const weekday = parts.find((p) => p.type === 'weekday')?.value ?? '';

    return `${year}年${month}月${day}日 ${weekday}`;
  }
  const dateTime = formatTodayJa();

  return (
    <div className={`page-default ${className}`}>
      <div className="titleArea">
        <h1>{title}</h1>
        <p className="date">{dateTime}</p>
      </div>
      
      {children}
    </div>
  );
}