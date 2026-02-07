import xml.etree.ElementTree as ET
from datetime import datetime, timedelta
from collections import defaultdict

# Load and parse the XML file.
xml_path = "data/device-exported/export-07-02.xml"
tree = ET.parse(xml_path)
root = tree.getroot()

# Create a set to store unique @type values.
types_set = set()
for record in root.findall('.//Record'):
    type_attribute = record.get('type')
    if type_attribute:
        types_set.add(type_attribute)

print("printing all unique @type values: ")
for type_value in types_set:
    print(type_value)

workout_types = {w.get('workoutActivityType') for w in root.findall('.//Workout') if w.get('workoutActivityType')}
print("printing all unique workout activity types: ")
for wt in sorted(workout_types):
    print(wt)


# --- Week-over-week: Running & FunctionalStrengthTraining ---
TARGET_TYPES = {
    "HKWorkoutActivityTypeRunning",
    "HKWorkoutActivityTypeFunctionalStrengthTraining",
}
# HealthKit date format: "2025-01-10 17:00:00 -0500"
DATE_FMT = "%Y-%m-%d %H:%M:%S %z"
DATE_FMT_NO_TZ = "%Y-%m-%d %H:%M:%S"


def parse_workout_date(s: str):
    s = (s or "").strip()
    if not s:
        return None
    for fmt in (DATE_FMT, DATE_FMT_NO_TZ, "%Y-%m-%d"):
        try:
            return datetime.strptime(s[:19], "%Y-%m-%d %H:%M:%S").date()
        except ValueError:
            continue
    try:
        return datetime.strptime(s[:10], "%Y-%m-%d").date()
    except ValueError:
        return None


def get_week_key(dt):
    if dt is None:
        return None
    return dt.isocalendar()[0], dt.isocalendar()[1]  # (year, week)


def workout_distance_km(w):
    dist = w.get("totalDistance")
    if dist is not None:
        try:
            return float(dist)
        except ValueError:
            pass
    for stat in w.findall("WorkoutStatistics"):
        if stat.get("type") == "HKQuantityTypeIdentifierDistanceWalkingRunning" and stat.get("sum"):
            try:
                return float(stat.get("sum"))
            except (ValueError, TypeError):
                pass
    return None


workouts_by_week = defaultdict(lambda: {"Running": {"count": 0, "km": 0.0}, "FunctionalStrengthTraining": {"count": 0, "km": 0.0}})

for w in root.findall(".//Workout"):
    wtype = w.get("workoutActivityType")
    if wtype not in TARGET_TYPES:
        continue
    start = parse_workout_date(w.get("startDate"))
    if start is None:
        continue
    key = get_week_key(start)
    if key is None:
        continue
    short_name = "Running" if wtype == "HKWorkoutActivityTypeRunning" else "FunctionalStrengthTraining"
    workouts_by_week[key][short_name]["count"] += 1
    if short_name == "Running":
        d = workout_distance_km(w)
        if d is not None:
            workouts_by_week[key][short_name]["km"] += d

today = datetime.now().date()
this_week = get_week_key(today)
last_week = get_week_key(today - timedelta(days=7))

def week_label(k):
    if k is None:
        return "?"
    return f"{k[0]}-W{k[1]:02d}"

print("\n--- Week-over-week: Running & FunctionalStrengthTraining ---")
print(f"This week: {week_label(this_week)}  |  Last week: {week_label(last_week)}\n")

_empty_week = {"Running": {"count": 0, "km": 0.0}, "FunctionalStrengthTraining": {"count": 0, "km": 0.0}}
for name in ("Running", "FunctionalStrengthTraining"):
    this = workouts_by_week.get(this_week, _empty_week).get(name, {"count": 0, "km": 0.0})
    last = workouts_by_week.get(last_week, _empty_week).get(name, {"count": 0, "km": 0.0})
    c_this, c_last = this["count"], last["count"]
    km_this, km_last = this["km"], last["km"]
    print(f"  {name}:")
    print(f"    Workouts: this week {c_this}  vs  last week {c_last}  →  {'more' if c_this > c_last else 'same' if c_this == c_last else 'fewer'} this week")
    if name == "Running":
        print(f"    Distance: this week {km_this:.2f} km  vs  last week {km_last:.2f} km  →  {'more' if km_this > km_last else 'same' if km_this == km_last else 'fewer'} km this week")
    print()