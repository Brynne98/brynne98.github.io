// Sample directory for the page. Hospital names are real (from data/hospitals.csv);
// every extension is made up, built from a hash so it stays the same on each load.
window.HSR = (() => {
  const hospitals = [
    'Addington Hospital Durban', 'Beaufort West Hospital', 'Caledon Provincial Hospital',
    'Cecilia Makiwane Hospital', 'Chris Hani Baragwanath Academic Hospital', 'Dora Nginza Hospital',
    'Edendale Hospital', 'Eerste River Hospital', 'False Bay Hospital', 'Frere Hospital',
    'George Regional Hospital', 'Groote Schuur Hospital', 'Helen Joseph Hospital',
    'Inkosi Albert Luthuli Central Hospital', 'Kalafong Hospital', 'Karl Bremer Hospital',
    'Khayelitsha District Hospital', 'King Edward VIII', 'Klerksdorp Hospital',
    'Livingstone Hospital', 'Mankweng Hospital', 'Mowbray Maternity Hospital',
    'Nelson Mandela Academic Hospital', 'New Somerset Hospital', 'Paarl Provincial Hospital',
    'Pelonomi Academic Hospital', 'Port Shepstone Regional Hospital',
    'Prince Mshiyeni Memorial Hospital', "Red Cross War Memorial Children's Hospital",
    'Rob Ferreira Hospital', 'Sebokeng Hospital', 'Tembisa Provincial Hospital',
    'Tygerberg Hospital', 'Universitas Academic Hospital', 'Victoria Hospital',
    'Witbank Hospital', 'Worcester Provincial Hospital',
  ];

  const departments = [
    'Casualty Reception', 'Emergency Unit', 'ICU', 'Neonatal ICU', 'Labour Ward',
    'Main Theatre', 'Radiology', 'CT Scanner', 'Blood Bank', 'Pharmacy', 'Dialysis Unit',
    'Burns Unit', 'Ward C3, Medicine', 'Ward J7, Surgery', 'Paediatric Ward',
    'Orthopaedic Clinic', 'Antenatal Clinic', 'Psychiatry', 'Day Ward',
  ];

  // Small string hash (FNV-1a) so each hospital and department gets a fixed extension.
  const hash = (s) => {
    let h = 2166136261;
    for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619);
    return h >>> 0;
  };

  const entries = [];
  for (const hospital of hospitals) {
    for (const dept of departments) {
      const ext = String(2000 + (hash(hospital + dept) % 7000));
      entries.push({ hospital, dept, ext, hay: `${dept} ${hospital}`.toLowerCase() });
    }
  }

  return { hospitals, entries };
})();
