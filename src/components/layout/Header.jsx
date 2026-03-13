import { getTodayFormatted } from '../../utils';

export default function Header() {
  return (
    <header className="app-header">
      <div className="app-header__left">
        <div className="app-logo">E</div>
        <h1>Ethara HRMS</h1>
      </div>
      <div className="app-header__date">{getTodayFormatted()}</div>
    </header>
  );
}
