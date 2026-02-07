import xml.etree.ElementTree as ET

# Load and parse the XML file.
# (Optional): Load and parse the export_cda.xml file.
xml_path = "data/device-exported/export-07-02.xml"
tree = ET.parse(xml_path)
root = tree.getroot()

# Create a set to store unique @type values.
types_set = set()

# Iterate through the XML elements and extract @type attribute.
for record in root.findall('.//Record'):
    type_attribute = record.get('type')
    if type_attribute:
        types_set.add(type_attribute)

# Print all unique @type values.
print("printing all unique @type values: ")
for type_value in types_set:
    print(type_value)

workout_types = {w.get('workoutActivityType') for w in root.findall('.//Workout') if w.get('workoutActivityType')}
print("printing all unique workout activity types: ")
for wt in sorted(workout_types):
    print(wt)

# records = []

# for record in root.findall(".//Record[@type='HKQuantityTypeIdentifierBasalEnergyBurned']"):
#     records.append({
#         'start_date': record.get('startDate'),
#         'end_date': record.get('endDate'),
#         'value': record.get('value'),
#         'unit': record.get('unit'),
#     })

# print(records[:-1])