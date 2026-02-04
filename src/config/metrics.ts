export const HEALTH_TYPE_MAP: Record<string, { readable: string; category: string; unit: string }> = {
  'HKQuantityTypeIdentifierStepCount': { readable: 'Steps', category: 'activity', unit: 'count' },
  'HKQuantityTypeIdentifierDistanceWalkingRunning': { readable: 'Walking/Running Distance', category: 'activity', unit: 'km' },
  'HKQuantityTypeIdentifierActiveEnergyBurned': { readable: 'Active Energy', category: 'activity', unit: 'kcal' },
  'HKQuantityTypeIdentifierBasalEnergyBurned': { readable: 'Basal Energy', category: 'activity', unit: 'kcal' },
  'HKQuantityTypeIdentifierAppleExerciseTime': { readable: 'Exercise Time', category: 'activity', unit: 'min' },
  'HKQuantityTypeIdentifierAppleStandTime': { readable: 'Stand Time', category: 'activity', unit: 'min' },
  'HKQuantityTypeIdentifierAppleMoveTime': { readable: 'Move Time', category: 'activity', unit: 'min' },
  'HKQuantityTypeIdentifierFlightsClimbed': { readable: 'Flights Climbed', category: 'activity', unit: 'count' },

  'HKQuantityTypeIdentifierHeartRate': { readable: 'Heart Rate', category: 'cardio', unit: 'bpm' },
  'HKQuantityTypeIdentifierRestingHeartRate': { readable: 'Resting Heart Rate', category: 'cardio', unit: 'bpm' },
  'HKQuantityTypeIdentifierWalkingHeartRateAverage': { readable: 'Walking Heart Rate', category: 'cardio', unit: 'bpm' },
  'HKQuantityTypeIdentifierHeartRateVariabilitySDNN': { readable: 'Heart Rate Variability', category: 'cardio', unit: 'ms' },
  'HKQuantityTypeIdentifierVO2Max': { readable: 'VO2 Max', category: 'cardio', unit: 'mL/min/kg' },
  'HKQuantityTypeIdentifierHeartRateRecoveryOneMinute': { readable: 'Heart Rate Recovery', category: 'cardio', unit: 'bpm' },

  'HKQuantityTypeIdentifierBodyMass': { readable: 'Weight', category: 'body', unit: 'kg' },
  'HKQuantityTypeIdentifierBodyFatPercentage': { readable: 'Body Fat', category: 'body', unit: '%' },
  'HKQuantityTypeIdentifierBodyMassIndex': { readable: 'BMI', category: 'body', unit: 'kg/m²' },
  'HKQuantityTypeIdentifierLeanBodyMass': { readable: 'Lean Body Mass', category: 'body', unit: 'kg' },
  'HKQuantityTypeIdentifierHeight': { readable: 'Height', category: 'body', unit: 'cm' },

  'HKCategoryTypeIdentifierSleepAnalysis': { readable: 'Sleep', category: 'recovery', unit: 'hr' },
  'HKQuantityTypeIdentifierRespiratoryRate': { readable: 'Respiratory Rate', category: 'recovery', unit: 'breaths/min' },
  'HKQuantityTypeIdentifierOxygenSaturation': { readable: 'Blood Oxygen', category: 'recovery', unit: '%' },
  'HKQuantityTypeIdentifierBloodPressureSystolic': { readable: 'Blood Pressure (Systolic)', category: 'body', unit: 'mmHg' },
  'HKQuantityTypeIdentifierBloodPressureDiastolic': { readable: 'Blood Pressure (Diastolic)', category: 'body', unit: 'mmHg' },
};

export const WORKOUT_TYPE_MAP: Record<string, string> = {
  'HKWorkoutActivityTypeRunning': 'Running',
  'HKWorkoutActivityTypeCycling': 'Cycling',
  'HKWorkoutActivityTypeWalking': 'Walking',
  'HKWorkoutActivityTypeSwimming': 'Swimming',
  'HKWorkoutActivityTypeHiking': 'Hiking',
  'HKWorkoutActivityTypeYoga': 'Yoga',
  'HKWorkoutActivityTypeFunctionalStrengthTraining': 'Strength Training',
  'HKWorkoutActivityTypeTraditionalStrengthTraining': 'Strength Training',
  'HKWorkoutActivityTypeHighIntensityIntervalTraining': 'HIIT',
  'HKWorkoutActivityTypeCoreTraining': 'Core Training',
  'HKWorkoutActivityTypeFlexibility': 'Flexibility',
  'HKWorkoutActivityTypeDance': 'Dance',
  'HKWorkoutActivityTypeCooldown': 'Cooldown',
  'HKWorkoutActivityTypeElliptical': 'Elliptical',
  'HKWorkoutActivityTypeRowing': 'Rowing',
  'HKWorkoutActivityTypeStairClimbing': 'Stair Climbing',
  'HKWorkoutActivityTypePilates': 'Pilates',
  'HKWorkoutActivityTypeTennis': 'Tennis',
  'HKWorkoutActivityTypeSoccer': 'Soccer',
  'HKWorkoutActivityTypeBasketball': 'Basketball',
  'HKWorkoutActivityTypeOther': 'Other',
};

export const SCORE_WEIGHTS = {
  cardio: 0.40,
  activity: 0.30,
  body: 0.15,
  recovery: 0.15,
};

export const SCORE_THRESHOLDS = {
  red: 50,
  yellow: 70,
};
