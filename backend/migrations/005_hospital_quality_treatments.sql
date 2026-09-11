BEGIN;
-- Keep existing treatment IDs and content when this list is applied again.
DO $$
DECLARE entry record; speciality bigint;
BEGIN
FOR entry IN SELECT * FROM (VALUES
('Hip Replacement Surgery', 'hip-replacement-surgery', 'Orthopedics', 1),
('Spine Surgery (Slip Disc / Back Pain)', 'spine-surgery-slip-disc-back-pain', 'Orthopedics', 2),
('Ear Surgery (Tympanoplasty / Mastoidectomy)', 'ear-surgery-tympanoplasty-mastoidectomy', 'ENT (Ear, Nose, Throat)', 3),
('Bladder Disorder Treatment', 'bladder-disorder-treatment', 'Urology', 4),
('Urinary Tract Infection (UTI) Treatment', 'urinary-tract-infection-uti-treatment', 'Urology', 5),
('Hearing Loss Treatment', 'hearing-loss-treatment', 'ENT (Ear, Nose, Throat)', 6),
('Tonsil & Adenoid Surgery (Tonsillectomy)', 'tonsil-adenoid-surgery-tonsillectomy', 'ENT (Ear, Nose, Throat)', 7),
('Joint Pain & Arthritis Treatment', 'joint-pain-arthritis-treatment', 'Orthopedics', 8),
('Prostate Treatment', 'prostate-treatment', 'Urology', 9),
('Tooth Extraction', 'tooth-extraction', 'Dentistry', 10),
('Dental Filling', 'dental-filling', 'Dentistry', 11),
('Root Canal Treatment (RCT)', 'root-canal-treatment-rct', 'Dentistry', 12),
('Teeth Cleaning & Scaling', 'teeth-cleaning-scaling', 'Dentistry', 13),
('Heart Valve Replacement Surgery', 'heart-valve-replacement-surgery', 'Cardiology', 14),
('Angioplasty & Stent Placement', 'angioplasty-stent-placement', 'Cardiology', 15),
('General Emergency Stabilization', 'general-emergency-stabilization', 'Emergency Medicine', 16),
('Fracture Surgery', 'fracture-surgery', 'Orthopedics', 17),
('Breathing Emergency (Asthma / Respiratory Failure)', 'breathing-emergency-asthma-respiratory-failure', 'Emergency Medicine', 18),
('Poisoning / Drug Overdose Treatment', 'poisoning-drug-overdose-treatment', 'Emergency Medicine', 19),
('Severe Infection / Sepsis Management', 'severe-infection-sepsis-management', 'Emergency Medicine', 20),
('Stroke / Brain Emergency Management', 'stroke-brain-emergency-management', 'Emergency Medicine', 21),
('Pacemaker / ICD Implantation', 'pacemaker-icd-implantation', 'Cardiology', 22),
('Cardiac Emergency Care', 'cardiac-emergency-care', 'Cardiology', 23),
('Knee Replacement Surgery', 'knee-replacement-surgery', 'Orthopedics', 24),
('Kidney Stone Treatment (PCNL)', 'kidney-stone-treatment-pcnl', 'Urology', 25),
('Sinus Surgery', 'sinus-surgery', 'ENT (Ear, Nose, Throat)', 26),
('Coronary Artery Bypass Surgery', 'coronary-artery-bypass-surgery', 'Cardiology', 27)
) AS requested(name,slug,speciality_name,position)
LOOP
  SELECT id INTO speciality FROM specialities WHERE name_en=entry.speciality_name ORDER BY id LIMIT 1;
  IF speciality IS NULL THEN RAISE EXCEPTION 'Missing speciality: %', entry.speciality_name; END IF;
  IF EXISTS(SELECT 1 FROM treatments WHERE lower(trim(name))=lower(entry.name) OR slug=entry.slug) THEN
    UPDATE treatments SET specialty_id=COALESCE(specialty_id,speciality)
    WHERE lower(trim(name))=lower(entry.name) OR slug=entry.slug;
  ELSE
    INSERT INTO treatments(name,slug,specialty_id,comes_in,display_order)
    VALUES(entry.name,entry.slug,speciality,entry.speciality_name,entry.position);
  END IF;
END LOOP;
END $$;
COMMIT;

