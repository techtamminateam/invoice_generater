import pandas as pd
from datetime import datetime

def get_total_days_and_hours(df, hours_col):
    """
    Calculate total working days and hours from timesheet.
    Total days fixed at 22 for rate calculation; actual days counted separately.
    Returns (standard_days, actual_days, total_hours)
    """
    STANDARD_MONTH_DAYS = 22
    total_hours = 0
    actual_worked_days = 0

    for hours in df[hours_col]:
        if pd.notna(hours) and "hours" in str(hours):
            try:
                hours_value = int(str(hours).strip().split("hours")[0])
            except Exception:
                # fallback if value already numeric
                try:
                    hours_value = int(float(hours))
                except Exception:
                    hours_value = 0
            total_hours += hours_value
            if hours_value > 0:
                actual_worked_days += 1

    return STANDARD_MONTH_DAYS, actual_worked_days, total_hours


def calculate_hourly_amount(df, hours_col, rate, employee_name=None):
    standard_days, actual_days, total_worked_hours = get_total_days_and_hours(df, hours_col)
    total_amount = total_worked_hours * rate
    return {
        'employee_name': employee_name or (df.iloc[1,1] if (df.shape[0] > 1 and df.shape[1] > 1) else None),
        'standard_month_days': standard_days,
        'actual_worked_days': actual_days,
        'total_worked_hours': total_worked_hours,
        'hourly_rate': rate,
        'individual_amount': total_amount,
        'total_amount': total_amount,
        'calculation_type': 'hourly'
    }


def calculate_daily_amount(df, hours_col, total_budget, is_local_state=False, employee_name=None):
    standard_days, actual_days, total_worked_hours = get_total_days_and_hours(df, hours_col)
    per_day_budget = total_budget / standard_days if standard_days else 0
    individual_amount = per_day_budget * actual_days
    total_amount = individual_amount
    result = {
        'employee_name': employee_name or (df.iloc[1,1] if (df.shape[0] > 1 and df.shape[1] > 1) else None),
        'standard_month_days': standard_days,
        'actual_worked_days': actual_days,
        'total_worked_hours': total_worked_hours,
        'per_day_rate': per_day_budget,
        'monthly_budget': total_budget,
        'individual_amount': individual_amount,
        'total_amount': total_amount,
        'calculation_type': 'daily'
    }

    if is_local_state:
        # Same state: CGST + SGST
        cgst = total_amount * 0.09
        sgst = total_amount * 0.09
        result.update({'tax_type': 'CGST+SGST', 'tax_amount': cgst+sgst, 'sub_total': total_amount + cgst + sgst})
    else:
        # Other state: IGST
        igst = total_amount * 0.18
        result.update({'tax_type': 'IGST', 'tax_amount': igst, 'sub_total': total_amount + igst})

    return result


def process_timesheet(file_path, rate_type, rate=None, total_budget=None, is_local_state=False):
    """
    Read the excel file and compute amounts.
    rate_type: 'hour' or 'day'
    """
    # Read headerless to extract name at row 2 col 2 if present
    try:
        df_header = pd.read_excel(file_path, header=None)
        employee_name = None
        try:
            employee_name = df_header.iloc[1,1]
        except Exception:
            employee_name = None
    except Exception:
        df_header = None
        employee_name = None

    # Read timesheet starting after possible header rows
    try:
        df = pd.read_excel(file_path, skiprows=4)
    except Exception:
        # fallback: read whole sheet
        df = pd.read_excel(file_path)

    # try common hours column names
    candidates = ['Regular hours worked', 'Hours Worked', 'Hours']
    hours_col = None
    for c in candidates:
        if c in df.columns:
            hours_col = c
            break

    if hours_col is None:
        # try first numeric/text column
        hours_col = df.columns[-1]

    df = df.dropna(subset=[hours_col])

    if rate_type.lower() in ('hour','hours'):
        if rate is None:
            raise ValueError('Hourly rate required for hour-based calculation')
        return calculate_hourly_amount(df, hours_col, float(rate), employee_name)
    else:
        if total_budget is None:
            raise ValueError('Total budget required for day-based calculation')
        return calculate_daily_amount(df, hours_col, float(total_budget), is_local_state, employee_name)
