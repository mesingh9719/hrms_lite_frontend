import { getInitials } from '../../utils';

export default function SelectedEmployeeBox({
  employee,
  presentCount,
  absentCount,
}) {
  if (!employee) return null;

  return (
    <div className="selected-box">
      <div className="selected-box__info">
        <div className="emp-avatar">{getInitials(employee.full_name)}</div>
        <div>
          <div className="emp-name">{employee.full_name}</div>
          <div className="emp-email">{employee.email}</div>
        </div>
      </div>
      <div className="selected-box__stats">
        <div className="selected-box__stat">
          <div className="selected-box__num selected-box__num--green">{presentCount}</div>
          <div className="selected-box__lbl">Present</div>
        </div>
        <div className="selected-box__stat">
          <div className="selected-box__num selected-box__num--red">{absentCount}</div>
          <div className="selected-box__lbl">Absent</div>
        </div>
      </div>
    </div>
  );
}
